# -*- coding: UTF-8 -*-
import json
import os
import ctypes


class Libs:
    def calModel(self,ID,size,kT,J,uB,args):
        print((ID,size,kT,J,uB))
        step=args['step']
        if args['algorithm']=="SSFD":
            ExecuteTasks=Core.ExecuteTasks_SSFD
        else:
            ExecuteTasks=Core.ExecuteTasks_CFD
        path=["Models/%s/" % ID[0], "Models/%s/" % ID[1]]
        print(path)
        sizeStr=[bytes(chr(size[0]%0x100//8)+chr(size[0]//0x100)+chr(size[1]%0x100//8)+chr(size[1]//0x100),'ASCII'),b'\x55',b'\xaa',b'\xff']
        # 生成模型
        if not os.path.exists(path[0]):
            os.makedirs(path[0])
        path[0]+="0.IsingModel"
        if not os.path.exists(path[0]):
            fo=open(path[0],'wb')
            fo.write(sizeStr[0])
            for i in range((size[0])//2):
                for j in range(size[1]//8):
                    fo.write(sizeStr[1])
                for j in range(size[1]//8):
                    fo.write(sizeStr[2])
            fo.close()
        if not os.path.exists(path[1]):
            os.makedirs(path[1])
        path[1]+="0.IsingModel"
        if not os.path.exists(path[1]):
            fo=open(path[1],'wb')
            fo.write(sizeStr[0])
            for i in range((size[0]*size[1])//8):
                fo.write(sizeStr[3])
            fo.close()
        # 共用输出文件
        if args['savemode']:
            path=["Models/%s/record..csv" % ID[0], "Models/%s/record.csv" % ID[1]]
        else:
            path=["Models/%s/(%s,%s,%s).csv" % (ID[0],args['projName'],kT,uB), "Models/%s/(%s,%s,%s).csv" % (ID[1],args['projName'],kT,uB)]
        #创建模型
        kT=ctypes.c_float(kT)
        J=ctypes.c_float(J)
        uB=ctypes.c_float(uB)
        model=[Core.CreateModel(bytes(ID[0],'ASCII'),kT,J,uB),Core.CreateModel(bytes(ID[1],'ASCII'),kT,J,uB)]
        str=[ctypes.c_char_p(b''),ctypes.c_char_p(b' ')]
        fo=[open(path[0],'ab'),open(path[1],'ab')]
        # 重置随机数种子
        Core.ResetRand()
        # 执行循环
        ExecuteTasks(str[0],model[0],step)
        ExecuteTasks(str[1],model[1],step)
        fo[0].write(str[0].value+b'\n')
        fo[1].write(str[1].value+b'\n')
        i=step
        max=size[0]*size[1] * 1000;
        # str[0/1]='count,rate,U/N,m/guN'
        while  abs(float(str[0].value.split(b',')[2])-float(str[1].value.split(b',')[2])) > args['accuracy']:
            if i > max:
                return [-1,-2,0,size[0]*size[1]*4,0]
            i+=step
            ExecuteTasks(str[0],model[0],step)
            ExecuteTasks(str[1],model[1],step)
            fo[0].write(str[0].value+b'\n')
            fo[1].write(str[1].value+b'\n')
        # 速写统计函数[SucessRate<%.6f>,Energy<%.4f>,Magent<%.4f>,E^2<%.4f>,EM<%.4f>]
        # x1: [rate, E, M, E^2, EM]; x2: [count, rate, U/N, m/guN, U^2/N, Um/guN];
        add = lambda x1,x2:[x1[0]+float(x2[1]),x1[1]+float(x2[2]),x1[2]+float(x2[3]),x1[3]+float(x2[4]),x1[4]+float(x2[5])]
        statistics = [0,0,0,0,0]
        for j in range(args['count']):
            print(j,end=' ')
            ExecuteTasks(str[0],model[0],step)
            ExecuteTasks(str[1],model[1],step)
            fo[0].write(str[0].value+b'\n')
            fo[1].write(str[1].value+b'\n')
            statistics = add(add(statistics, str[0].value.decode('ASCII').split(',')), str[1].value.decode('ASCII').split(','))
        print('')
        fo[0].close()
        fo[1].close()
        Core.DeleteModel(model[0])
        Core.DeleteModel(model[1])
        for j in range(len(statistics)):
            statistics[j]/=args['count']*2
        return statistics

    # 读取工程文件
    def readProj(self, args):
        """
        request_body example:
        '{"方法": "readProj", "参数": {"工程名": "<string>", "尺寸": [<int>, <int>], "相互作用能J": <float>}}'
        '{"method": "readProj", "arguments": {"projName": "<string>", "size": [<int>, <int>], "J": <float>}}'
        """
        # 检查文件
        if not args.get("projName", False):
            return "Error args: %s" % args
        try:
            # 读取文件
            fi=open("projects/%s/state.json" % args['projName'],'r')
            fistr=fi.readline()
        except FileNotFoundError:
            if not args.get("size", False) or not args.get("J", False):
                return "Error args: %s" % args
            # 创建文件
            os.makedirs("projects/%s/" % args['projName'])
            fi=open("projects/%s/state.json" % args['projName'],'w')
            fistr='{"projName": "%s", "size": %s, "J": %f, "kT": [], "kT_done": [], "uB": [], "uB_done": [],"doing": ""}' % (args['projName'],args['size'],args['J'])
            fi.write(fistr)
        fi.close()
        return fistr
    
    # 添加任务队列
    def addQueue(self, args):
        """
        request_body example:
        '{"方法": "addQueue", "参数": {"工程名": "<string>", "温度": <array>, "磁场强度": <array>}}'
        '{"method": "addQueue", "arguments": {"projName": "<string>", "kT": <array>, "uB": <array>}}'
        """
        try:
            fi=open("projects/%s/state.json" % args['projName'],'r')
            project=json.load(fi)
            fi.close()
        except FileNotFoundError:
            return "工程尚未被创建"
        except json.JSONDecodeError:
            return "状态文件state.json解析失败"
        if project["doing"] != "":
            return "任务添加失败，有任务正在运行中"
        for i in args.get("kT",[]):
            if(i==0):
                i+=0.01
            if i not in project['kT_done']:
                project["kT"].append(i)
        project["kT"].sort()
        for i in args.get("uB",[]):
            if i not in project['uB_done']:
                project["uB"].append(i)
        project["uB"].sort()
        fo=open("projects/%s/state.json" % args['projName'],'w')
        json.dump(project,fo)
        fo.close()
        return "任务添加成功"
        

    # 执行任务
    def runProj(self,args):
        """
        request_body example:
        '{"方法": "runProj", "参数": {"工程名": "<string>", "取样间隔": <int>, "取样次数": <int>, "收敛精度": <int>, "算法": "<SSFD/CFD>", "节约模式": <Boolean>}}'
        '{"method": "runProj", "arguments": {"projName": "<string>", "step": <int>, "count": <int>, "accuracy": <int>, "algorithm": "<SSFD/CFD>", "savemode": <Boolean>}}'
        """
        try:
            fi=open("projects/%s/state.json" % args['projName'],'r')
            project=json.load(fi)
            fi.close()
        except FileNotFoundError:
            return "工程尚未被创建"
        except json.JSONDecodeError:
            return "状态文件state.json解析失败"
        if project["doing"] != "":
            return "任务添加失败，有任务正在运行中"
        # 赋予ID
        ID=[int(project['size'][0]/8)>>4,int(project['size'][0]/8)%16,int(project['size'][1]/8)>>4,int(project['size'][1]/8)%16]
        project['ID']=ID=['%02X%02X'%tuple(project['size']), '%c%c%c%c'%(90-ID[0],90-ID[1],90-ID[2],90-ID[3])]
        # functions
        def doit(i,j,J):
            project['doing']=[i,j]
            fo=open("projects/%s/state.json" % args['projName'],'w')
            json.dump(project,fo)
            fo.close()
            statistics=self.calModel(ID,project['size'],i,J,j,args)
            fo=open("projects/%s/statistics.csv" % args['projName'],'a')
            # [kT<%.3f>,uB<%.3f>,probability<%d>,Energy<%.4f>,Magent<%.4f>,Energy^2<%.4f>,Energy*Magnet<%.4f>...]
            fo.write("%.3f,%.3f,"%(i,j)+"%.6f,%.4f,%.4f,%.4f,%.4f\n"%tuple(statistics))
            fo.close()
        # 遍历kT
        while len(project['kT']):
            i = project['kT'].pop()
            project['kT_done'].append(i)
            for j in project['uB_done']:
                doit(i,j,project['J'])
        # 遍历uB
        while len(project['uB']):
            i = project['uB'].pop()
            project['uB_done'].append(i)
            for j in project['kT_done']:
                doit(j,i,project['J'])
        print('done')
        project['doing'] = ""
        project['kT_done'].sort()
        project['uB_done'].sort()
        fo=open("projects/%s/state.json" % args['projName'],'w')
        json.dump(project,fo)
        fo.close()
        return "任务队列已清空"

    # 列出所有工程文件
    def listAll(self, args):
        return ",".join(os.listdir('./projects/'))

    # 打印结果
    def printRes(self, args):
        pass
    
    def mergeProj(self, args):
        """
        request_body example:
        '{"方法": "mergeProj", "参数": {"源文件": <array>, "目标文件": "<string>"}}'
        '{"method": "mergeProj", "arguments": {"source": <array>, "target": "<string>"}}'
        """
        project=json.loads(self.readProj({'projName': args['source'][0]}))
        self.readProj({'projName': args['target'], 'size': project['size'], 'J': project['J']})
        fo=open("projects/%s/statistics.csv" % args['target'],'ab')
        for i in range(1,len(args['source'])):
            fi=open("projects/%s/state.json" % args['source'][i],'r')
            index=json.load(fi)
            for j in ["kT", "kT_done", "uB", "uB_done"]:
                project[j]+=index[j]
            fi.close()
            fi=open("projects/%s/statistics.csv" % args['source'][i],'rb')
            fo.write(fi.read())
            fi.close()
        fi=open("projects/%s/statistics.csv" % args['source'][0],'rb')
        fo.write(fi.read())
        fi.close()
        fo.close()
        fo=open("projects/%s/state.json" % args['target'],'w')
        for i in ["kT", "kT_done", "uB", "uB_done"]:
            project[i]=list(set(project[i]))
            project[i].sort()
        project["projName"]=args['target']
        result=json.dumps(project)
        fo.write(result)
        fo.close()
        return result

    # 删除工程文件
    def delProj(self, args):
        pass

# ctypes设置
Core=ctypes.cdll.LoadLibrary("./py/core.so")  
class Model(ctypes.Structure):
    pass
Model._fields_=[("attr",ctypes.POINTER(Model))]
Core.CreateModel.restype=ctypes.POINTER(Model)
Core.AddTask.restype=None
Core.ExecuteTasks_SSFD.restype=None
Core.ExecuteTasks_CFD.restype=None
Core.ResetRand.restype=None
Core.DeleteModel.restype=None
Core.SaveFile.restype=None
