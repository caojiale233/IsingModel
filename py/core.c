#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <math.h>

/*编译命令
gcc -o core.so -shared -fPIC core.c
*/

/*README:

·   CreateModel(char ID[5],float kT,float J,float guB)return (struct IsingModel *)；
        输入模型ID(4位16进制的字符串)和模型参数kT,J,guB，此方法将分配一块内存用于缓存模型，
        模型内容将从“.\Models\[ID]\0.IsingModel”文件中读取，在初始化完成后，返回结构体的指针。
        该指针是唯一控制该模型的途径，包括已分配内存的回收。

·   AddTask(struct IsingModel *im,int t)return void;
        此方法用于向已创建的模型添加分段任务，由于任务量未知，任务使用链表形式储存。

·   LoadTask(struct IsingModel *im)return int;
        读取指定模型任务链表中的第一个任务的值，读取后回收内存，可用于手动清空任务。

·   ResetRand()return void;
        更新随机数种子，在执行任务(ExecuteTasks)前至少需要重置一次，之后可视情况手动重置。

·   ExecuteTasks_SSFD(char * result,struct IsingModel * im,int mode)return void;
        使用Single-Spin-Flip Dynamics（单自旋翻转动态模拟）；
        mode=0时，用任务链表中第一个任务，进行指定次数的随机抽样，
        当mode!=0时，不使用任务链表，直接模拟mode次；
        同时输入一个长度足够的空字符串，用于返回储存有统计项的字符串。
        此任务结束后的模型将从内存中写入储存“.\Models\[ID]\[计数].IsingModel”。

·   ExecuteTasks_CFD(char * result,struct IsingModel * im,int mode)return void;
        使用Cluster-Flip Dynamics（集群翻转动态模拟）；
        mode=0时，用任务链表中第一个任务，进行指定次数的随机抽样，
        当mode!=0时，不使用任务链表，直接模拟mode次；
        同时输入一个长度足够的空字符串，用于返回储存有统计项的字符串。
        此任务结束后的模型将从内存中写入储存“.\Models\[ID]\[计数].IsingModel”。

·   PrintData(struct IsingModel * im)return void;
        在终端中打印模型，适用于模型较小时调试结果，模型过大或任务数较多时不建议使用。

*/

struct task{/*结构体：任务*/
    int value;
    struct task *next;
};
struct IsingModel{/*结构体：模型*/
    float kT;
    float J;
    float guB;
    unsigned char **value;
    char ID[5];
    int count;
    unsigned short size[2];
    int energy;
    int magnet;
    struct task *firstTask;
    struct task *lastTask;
};
void AddTask(struct IsingModel *im,int t){/*方法：为模型添加任务*/
    if(im->firstTask==NULL)
    im->lastTask=im->firstTask=(struct task *)malloc(sizeof(struct task));
    else
    im->lastTask=im->lastTask->next=(struct task *)malloc(sizeof(struct task));
    im->lastTask->value=t;
    im->lastTask->next=NULL;
}
int LoadTask(struct IsingModel *im){/*方法：读取任务队列*/
    struct task *tempAddr=im->firstTask;
    int tempValue=tempAddr->value;
    im->firstTask=tempAddr->next;
    free(tempAddr);
    return tempValue;
}
unsigned char ** LoadFile(char ID[],struct IsingModel * im){/*方法：加载模型文件，返回二维数组的指针*/
    char *file=(char *)malloc(64);
    sprintf(file,"Models\\%s\\0.IsingModel",ID);
    FILE *fi=fopen(file,"rb");
    free(file);
    unsigned short size[2]={0};
    fread(size,2,2,fi);
    size[0]*=8,size[1]*=8;
    im->size[0]=size[0],im->size[1]=size[1];
    unsigned char ** tempAddr=(unsigned char **)malloc(sizeof(char *)*size[0]);
    tempAddr[0]=(unsigned char *)malloc(sizeof(char *)*size[0]*size[1]);
    for(int i=1;i<size[0];i++)
        tempAddr[i]=tempAddr[i-1]+size[1];
    for(int i=0;i<size[0];i++){
        unsigned char tempData[size[1]/8];
        fread(tempData,1,size[1]/8,fi);
        for(int j=0,m=size[1]/8;j<m;j++){
            for(int k=7;k>=0;k--){
                tempAddr[i][8*j+k]=tempData[j]%2;
                tempData[j]/=2;
            }
        }
    }
    fclose(fi);
    for(int j=0;j<size[0];j++){
        for(int k=0;k<size[1];k++){
            im->energy+=(tempAddr[j][k]^tempAddr[(j+1)%size[0]][k]?1:-1)+(tempAddr[j][k]^tempAddr[j][(k+1)%size[1]]?1:-1);
            im->magnet+=tempAddr[j][k];
        }
    }
    return tempAddr;
}
void SaveFile(struct IsingModel * im){/*保存模型文件*/
    unsigned char **value=im->value;
    char *file=(char *)malloc(64);
    sprintf(file,"Models\\%s\\%d.IsingModel",im->ID,im->count);
    FILE *fo=fopen(file,"wb");
    unsigned short size[2];
    size[0]=im->size[0]/8,size[1]=im->size[1]/8;
    fwrite(size,2,2,fo);
    size[0]*=8;
    for(int i=0;i<size[0];i++)
        for(int j=0;j<size[1];j++){
            char count=im->value[i][j*8];
            for(int k=1;k<8;k++){
                count<<=1;
                count+=value[i][j*8+k];
            }
            fwrite(&count,1,1,fo);
        }
    free(file);
    fclose(fo);
}
struct IsingModel * CreateModel(char ID[5],float kT,float J,float guB){/*方法：创建新模型，返回模型结构体指针*/
    struct IsingModel *tempAddr=(struct IsingModel *)malloc(sizeof(struct IsingModel));
    tempAddr->kT=kT,tempAddr->J=J,tempAddr->guB=guB;
    strcpy(tempAddr->ID,ID);
    tempAddr->count=0;
    tempAddr->firstTask=NULL;
    tempAddr->lastTask=NULL;
    tempAddr->energy=0;
    tempAddr->magnet=0;
    tempAddr->value=LoadFile(ID,tempAddr);
    return tempAddr;
}
void DeleteModel(struct IsingModel * im){
    free(im->value[0]);
    free(im->value);
    while(im->firstTask!=NULL)LoadTask(im);
    free(im);
}
/*Single-Spin-Flip Dynamics*/
void ExecuteTasks_SSFD(char * result,struct IsingModel * im,int mode){/*执行任务*/
    if(im->firstTask==NULL && mode==0){strcpy(result,"no more task");return;}
    int times=mode?mode:LoadTask(im),m=im->size[0],n=im->size[1],N=m*n,Magnet=0;
    float averageE=0.0,averageE2=0.0,averageM=0.0,averageEM=0.0,rate=1.0,Energy=0.0;
    for(int i=0,ii=0,imax=times*100;i<times;i++){
        int j=rand()%m;
        int k=rand()%n;
        char value=im->value[j][k];

        /*---Metropolis接受准则---Start---*/
        short SiSj=im->value[j==m-1?0:j+1][k]+im->value[j==0?m-1:j-1][k]+im->value[j][k==n-1?0:k+1]+im->value[j][k==0?n-1:k-1];/*周期性边界条件下，临近自旋向上格点数*/
        SiSj=2*(value?SiSj:4-SiSj)-4;
        if(im->J*SiSj+im->guB*(value?1:-1)<=0 ||
         ((float)rand()/RAND_MAX) < exp((float)-2*(im->J*SiSj+im->guB*(value?1:-1))/(im->kT))){/*翻转判定*/
        /*---Metropolis接受准则---end---*/

            im->value[j][k]^=1;/*翻转磁矩*/
            im->energy+=2*SiSj;/*累加能量*/
            im->magnet-=1-2*im->value[j][k];/*累加：向上自旋数*/
            Magnet=im->magnet*2-N;
            Energy=(float)im->J*im->energy-im->guB*Magnet;
            averageE+=Energy/times;/*能量均值*/
            averageE2+=pow(Energy,2)/times;/*能量平方均值*/
            averageM+=(float)abs(Magnet)/times;/*自旋和均值*/
            averageEM+=abs(Magnet)*Energy/times;/*E*Y均值*/
        }else{
            i--;
            ii++;
        }
        if(ii<imax)continue;
        if(++i){
            rate=(float)i/times;
            averageE/=rate;
            averageE2/=rate;
            averageM/=rate;
            averageEM/=rate;
        }else{
            rate=0;
            averageM=im->magnet*2-N;
            averageE=(float)im->J*im->energy-im->guB*averageM;
            averageE2=averageE*averageE;
            averageM=abs(averageM);
            averageEM=averageM*averageE;
        }
        im->count+=i-times;
        break;
    }
    im->count+=times;
    /*返回计次,取样率,平均能量,平均磁化强度，能量平方均值,能量*自旋和均值*/
    sprintf(result,"%d,%.6f,%.4f,%.4f,%.4f,%.4f",im->count,rate,averageE/N,averageM/N,averageE2/N,averageEM/N);
    //SaveFile(im);
}

/*Cluster-Flip Dynamics*/
struct Queue{
    int x;
    int y;
    struct Queue *next;
};
void ExecuteTasks_CFD(char * result,struct IsingModel * im,int mode){/*执行任务*/
    if(im->firstTask==NULL && mode==0){strcpy(result,"no more task");return;}
    int times=mode?mode:LoadTask(im),m=im->size[0],n=im->size[1],N=m*n,fail=0,Magnet=0;
    float averageE=0.0,averageE2=0.0,averageM=0.0,averageEM=0.0,rate=1.0,Padd=(float)1-exp(-2*im->J/im->kT),Energy=0.0;
    for(int ii=0,failMax=times*10;ii<times;ii++){
        struct Queue *clusterStart=(struct Queue *)malloc(sizeof(struct Queue));
        struct Queue *index=clusterStart;
        struct Queue *clusterEnd=clusterStart;
        clusterStart->x=rand()%m;
        clusterStart->y=rand()%n;
        clusterStart->next=NULL;
        char value=im->value[clusterStart->x][clusterStart->y];
        im->value[clusterStart->x][clusterStart->y]=2;
        int count=1;
        /*---Wolff---start---*/
        /*生成cluster*/
        while(index!=NULL){
            int x[4]={index->x,0,index->x,0},y[4]={0,index->y,0,index->y};
            y[0]=(y[1]-1+n)%n;
            y[2]=(y[1]+1)%n;
            x[1]=(x[0]+1)%m;
            x[3]=(x[0]-1+m)%m;
            for(int i=0;i<4;i++){
                if(im->value[x[i]][y[i]]!=value)continue;
                if((float)rand()/RAND_MAX<Padd){
                    clusterEnd->next=(struct Queue *)malloc(sizeof(struct Queue));
                    clusterEnd=clusterEnd->next;
                    clusterEnd->x=x[i],clusterEnd->y=y[i],clusterEnd->next=NULL;
                    im->value[x[i]][y[i]]=2;
                    count++;
                }
            }
            index=index->next;
        }
        /*判断是否接受*/
        if(im->guB && (im->guB>0?value:!value))
        if((float)rand()/RAND_MAX>exp((float)-2*count*(value?1:-1)*im->guB/im->kT)){
            ii--;
            index=clusterStart;
            while(index!=NULL){
                im->value[index->x][index->y]=value;
                index=index->next;
                free(clusterStart);
                clusterStart=index;
            }
            if(++fail<failMax)continue;
            if(ii++>=0){
                rate=(float)(ii)/times;
                averageE/=rate;
                averageE2/=rate;
                averageM/=rate;
                averageEM/=rate;
            }
            else{
                rate=0;
                averageM=im->magnet*2-N;
                averageE=im->J*im->energy-im->guB*averageM;
                averageE2=averageE*averageE;
                averageM=abs(averageM);
                averageEM=averageE*averageM;
            }
            im->count+=ii-times;
            break;
        }
        /*遍历cluster*/
        index=clusterStart;
        while(index!=NULL){
            int x[4]={index->x,0,index->x,0},y[4]={0,index->y,0,index->y};
            y[0]=(y[1]-1+n)%n;
            y[2]=(y[1]+1)%n;
            x[1]=(x[0]+1)%m;
            x[3]=(x[0]-1+m)%m;
            for(int i=0;i<4;i++){
                if(im->value[x[i]][y[i]]==2)continue;
                im->energy+=im->value[x[i]][y[i]]^value?-2:2;/*累加能量*/
            }
            im->magnet+=1-2*value;/*累加：向上自旋数*/
            index=index->next;
        }
        /*翻转cluster*/
        index=clusterStart;
        value^=1;
        while(index!=NULL){
            im->value[index->x][index->y]=value;
            index=index->next;
            free(clusterStart);
            clusterStart=index;
        }
        /*---Wolff---end---*/
        
        //统计项
        Magnet=im->magnet*2-N;
        Energy=im->J*im->energy-im->guB*Magnet;
        averageE+=Energy/times;/*能量均值*/
        averageE2+=pow(Energy,2)/times;/*能量平方均值*/
        averageM+=(float)abs(Magnet)/times;/*自旋和均值*/
        averageEM+=abs(Magnet)*Energy/times;/*E*Y均值*/
    }
    im->count+=times;
    /*返回计次,取样率,平均能量,平均磁化强度，能量平方均值,能量*自旋和均值*/
    sprintf(result,"%d,%.6f,%.4f,%.4f,%.4f,%.4f",im->count,rate,averageE/N,averageM/N,averageE2/N,averageEM/N);
    //SaveFile(im);
}

void ResetRand(){srand(time(NULL));}

void PrintData(struct IsingModel * im){/*方法：打印模型数据*/
    for(int i=0;i<im->size[0];i++){
        for(int j=0;j<im->size[1];j++){
            printf("%d,",im->value[i][j]);
        }
        printf("\b \n");
    }
}
void printEnergy(struct IsingModel * im){
    int energy=0;
    unsigned char **tempAddr=im->value;
    for(int j=0,m=im->size[0];j<m;j++){
        for(int k=0,n=im->size[1];k<n;k++)
            energy+=(tempAddr[j][k]^tempAddr[(j+1)%m][k]?1:-1)+(tempAddr[j][k]^tempAddr[j][(k+1)%n]?1:-1);
    }
    printf("%d\n",energy);
}

/*
void main(){
    struct IsingModel * model_1=CreateModel("0001",0.001,1,0.5);//创建模型
    ResetRand();//更新随机数种子
    for(int i=0;i<10;i++){
        char result[48];//新建字符串用于打印执行结果
        ExecuteTasks_CFD(result,model_1,10);//执行5次任务，并将结果返回到result字符串中
        printf("%s\n",result);//打印执行结果
        //printEnergy(model_1);//打印模型能量
        //PrintData(model_1);//可选项，在控制台打印模型（模型过大时不推荐使用）
    }
    DeleteModel(model_1);//删除模型
}
*/
