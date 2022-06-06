export { Project, MergeArea, Tasks, DrawOption, MoreWindows , App }

/* 方法集
    window.Utils=new Utils()
 */
(function(){
    class Utils{
        async openProj(name){
            return fetch(`./projects/${name}/state.json`,{},'GET','xhr')
            .then(response=>{
                if(response.ok)
                    return response.json();
                else{
                    console.error('打开文件失败\n请尝试创建文件');
                    throw 'open file failed';
                }
            }).then(
                v=>{window.project=v;return v;}
            )
        }
        createProj(name,size1,size2,J){
            return new Promise((resolve,reject)=>{
                if(!name || !J || size1<=0 ||size2<=0){reject('invalid input value');return;}
                fetch('./execute',{method: 'POST',body: `{"method": "readProj", "arguments": {"projName": "${name}", "size": [${Math.ceil(size1/8)*8}, ${Math.ceil(size2/8)*8}], "J": ${J}}}`})
                .then(response=>response.ok?response.json():{})
                .then(v=>{window.project=v;return v;})
                .then(resolve)
                .catch(console.error)
            })
        }
        drawStateMap(kT,kT_done,uB,uB_done,doing){
            const data=[],option={
                xAxis: {
                    data: uB.concat(uB_done)
                },
                yAxis: {
                    data: kT.concat(kT_done)
                },
                dataset: {source: data}
            }
            option.xAxis.data.sort((i,j)=>i-j),option.yAxis.data.sort((i,j)=>i-j);
            kT_done.forEach(x=>uB_done.forEach(y=>data.push([String(x),String(y),1,'已完成'])));
            if(doing!=='')data.push([...doing.map(String),2,'正在计算']);
            return option;
        }
        addTask(kT,uB){
            function toArr(str){
                if(str.indexOf(':')!==-1){
                    let [i,s,m]=str.split(':').map(Number).map(i=>i*1E6),arr=[];
                    while(i<=m){
                        arr.push(i/1E6);
                        i+=s;
                    }
                    return arr;
                }
                if(str.indexOf(' ')!==-1)
                    return str.split(' ').map(Number);
                if(str.length===0)
                    return[];
                return [Number(str)];
            }
            return new Promise((resolve,reject)=>{
                kT=toArr(kT),uB=toArr(uB);
                if(kT.map(i=>isNaN(i)).reduce((prev,curr)=>prev||curr,false)||uB.map(i=>isNaN(i)).reduce((prev,curr)=>prev||curr,false)){reject('输入的不是数字');return};
                if(!window.project.projName.length){reject('还没有打开了的项目，先打开一个');return;}
                fetch('./execute',{method:'POST',body:`{"method": "addQueue", "arguments": {"projName": "${window.project.projName}", "kT": [${kT.join(', ')}], "uB": [${uB.join(', ')}]}}`})
                .then(res=>res.text())
                .then(resolve)
                .catch(msg=>{console.error(msg);reject(msg);});
            });
        }
        runTask(step,count,accuracy,algorithm,savemode){
            return new Promise((resolve,reject)=>{
                if(!step||!count||!accuracy){reject('必要参数不全');return;}
                if(!window.project.projName.length){reject('还没有打开了的项目，先打开一个');return;}
                fetch('./execute',{method:'POST',body:`{"method": "runProj", "arguments": {"projName": "${window.project.projName}", "step": ${step}, "count": ${count}, "accuracy": ${accuracy}, "algorithm": "${algorithm}", "savemode": ${savemode}}}`})
                .then(res=>res.text())
                .then(resolve)
                .catch(msg=>{console.error(msg);reject(msg);});
            });
        }
    }
    class Dataset{
        constructor(){
            //['kT','uB','取样成功率','单粒子内能','单粒子磁化强度','单粒子热容','单粒子熵','偏移单粒子内能','偏移单粒子热容','偏移单粒子熵','能量平方','能量与广义力之积','偏移EM积']
            this.source=null;
            this.config=new Map([
                /*min=max时表示自适应，min max为保留小数位数
                  candidate<0，则无备用数据索引
                ['graphy',[value,index,candidate,min,max]]*/
                ['e',['单粒子内能',3,7,0,0]],
                ['m',['单粒子磁化强度',4,-1,0,1]],
                ['c',['单粒子热容',5,8,0,0]],
                ['s',['单粒子熵',6,9,2,2]],
                ['ee',['能量平方',10,-1,0,0]],
                ['em',['能量与广义力之积',11,12,-1,-1]],
            ]);
            this.setData=this.setData.bind(this);
        }
        setData(source){
            const N=window.project.size[0]*window.project.size[1],L=window.project.kT_done.length;
            function integral(s,i){
                const ss=s[i],s1=i%L?s[i-1]:[0,ss[1],0,0,0,0,0];
                const path2=(s1[9]||0)+(s1[5]/(s1[0]||1)+ss[5]/ss[0])/2*(ss[0]-s1[0]);

                if(i<L)return path2;
                const s2=s[i-L],path1=s2[9]+(ss[6]+s2[6]-N*(ss[3]*ss[4]+s2[3]*s2[4]))/(2*ss[0]**2)*(ss[1]-s2[1]);
                return (path1+path2)/2;
            };
            /*
            function integral2(s,i){
                if(i<L)return integral(s,i);
                const v=s[i],v0=i%L?s[i-1-L]:[0,s[i-1][1],0,0,0,0,0];
                const res=(v0[9]||0)+(v0[5]/(v0[0]||1)+v[5]/v[0])/2*(v[0]-v0[0])+(v0[6]+v[6]-N*(v0[3]*v0[4]+v[3]*v[4]))/((v[0]+v0[0])**2/2)*(v[1]-v0[1]);
                return res;
            }*/
            
            source.pop();
            source.sort((a,b)=>((a[1]-b[1]) || (a[0]-b[0])));
            source.forEach((v,i,self)=>{
                self[i][10]=self[i][5],self[i][11]=self[i][6];
                self[i][5]=Number(((v[5]-v[3]**2*N)/v[0]**2).toFixed(4));
                self[i][9]=Number(integral(self,i).toFixed(4));
            });
            source.forEach((v,i,self)=>self[i][6]=v[9]);
            this.source=source;
        }
        getData(drawType,graphy){/* heatmap/bar3D, e/m/c/s */
            let [value,index,candidate,min,max]=this.config.get(graphy);
            drawType=drawType==='heatmap';

            if(min===max){
                const rate=10**max;
                max=min=this.source[0][index];
                this.source.forEach(v=>{
                    max=v[index]>max?v[index]:max;
                    min=v[index]<min?v[index]:min;
                });
                max=Math.ceil(max*rate)/rate;
                min=Math.floor(min*rate)/rate;
            }

            const option={
                dataset: {source: this.source},
                series: {encode: {value: value, tooltip:[0,1,value,2]}},
            }
            if(drawType){
                option.visualMap={min:min,max,max,dimension:value};
            }else{
                //option.series.encode.tooltip=[value,2];
                option.zAxis3D={name: value};
                if(candidate>=0){
                    this.source.forEach((v,i,self)=>{
                        self[i][candidate]=(v[index]*1E6-min*1E6)/1E6;
                    });
                    value=candidate;
                    option.zAxis3D.axisLabel={formatter:(function (min){return i=>(i*1E6+min*1E6)/1E6})(min)};
                }
                option.series.encode.z=value;
            }
            //debugger;
            return option;
        }
    }
    window.Utils=new Utils();
    window.Dataset=Dataset;
    window.Method={};
})();

/* 导航组件 */
class Navigation extends React.Component{
    render(){
        return(
            <div id='Nav' className='shadow' >
                <img id='logoMobile' src='img/menu.svg' />
                <img id='logo' src='img/logo.png' />
                {window.menu.map(i=>(<a className='Nav' key={i.text} onClick={i.click} ><img className='Nav' src={i.img} />{i.text}</a>))}
            </div>
        );
    }
}

/* 弹窗组件 
    window.Method.Popups=this.show 
*/
class Popups extends React.Component{
    constructor(props){
        super(props);
        //console.log(this);
        this.state={display: this.props.defaultVal};

        this.hide=this.hide.bind(this);
        window.Method.Popups=this.show.bind(this);
    }
    hide(e){
        //console.log(e.target);
        e.target.id==='Popups'&&
        this.setState({display: null});
    }
    show(v){
        this.setState({display: v});
    }
    componentWillUnmount(){
        window.Method.Popups=null;
    }
    render(){
        return this.state.display!==null && (<div id='Popups' onClick={e=>this.hide(e)}>
            <div className='PopupsContain shadow'>{this.props.value.get(this.state.display)}</div>
        </div>)
    }
}

/* 多窗口组件
    window.Method.Wins=this.show
*/
class Wins extends React.Component{
    constructor(props){
        super(props);
        this.state={display: this.props.defaultVal}
        window.Method.Wins=this.show.bind(this);
    }
    show(v){
        this.setState({display: v});
    }
    componentWillUnmount(){
        window.Method.Wins=null;
    }
    render(){
        return (<div id='Wins'>
            {this.props.value.get(this.state.display)}
        </div>)
    }
}

/* 更多窗口组件 */
class MoreWindows extends React.Component{
    constructor(props){
        super(props);
        this.state={wins:window.wins};
    }
    render(){
        let elem=[],iterator=window.wins.keys(),key;
        iterator.next();
        iterator.next();
        while(key=iterator.next().value)
            elem.push(<List key={key} label={key} >
                <button data-key={key} className='imgBtn shadow' onClick={e=>{window.wins.delete(e.target.getAttribute('data-key'));this.setState({wins:window.wins})}} style={{backgroundColor: '#f44336'}} ><img data-key={key} className='imgBtn' src='img/trashBin_white.svg' /></button>
                <button data-key={key} className='imgBtn shadow' onClick={e=>{window.Method.Wins(e.target.getAttribute('data-key'));window.Method.Popups(null);}} style={{backgroundColor: window.Theme}} ><img data-key={key} className='imgBtn' src='img/view_white.svg' /></button>
            </List>);
        return(<ul>
            <li style={{fontWeight: 'bold',margin:'0.1rem 0.5rem'}}>更多窗口列表</li>
            {elem.length?elem:<List label='没有已绘制的图表可用'/>}
        </ul>);
    }
}

/* 列表元素组件 */
class List extends React.Component{
    render(){
        return (<li className='list'>
            {this.props.label}
            <div className='listValue'>
                {this.props.children}
            </div>
        </li>)
    }
}

/* 任务面板 */
class Tasks extends React.Component{
    constructor(props){
        super(props);
        this.state={kT:'',uB:'',step:window.project.size[0]*window.project.size[1]*10,count:5,accuracy:1E-2,algorithm:'SSFD',savemode:'false'};

        this.addTask=this.addTask.bind(this);
        this.runTask=this.runTask.bind(this);
    }
    addTask(){
        window.Utils.addTask(this.state.kT.replaceAll('：',':'),this.state.uB.replaceAll('：',':'))
        .then(console.log)
        .then(window.Method.refresh);
    }
    runTask(){
        window.Utils.runTask(this.state.step,this.state.count,this.state.accuracy,this.state.algorithm,this.state.savemode)
        .then(console.log)
        .then(window.Method.refresh);
    }
    render(){
        const addEl=[
            {lab:'kT',val:<input className='pure' type='text' value={this.state.kT} onChange={(e)=>{this.setState({kT:e.target.value})}} />},
            {lab:'μB',val:<input className='pure' type='text' value={this.state.uB} onChange={(e)=>{this.setState({uB:e.target.value})}} />}
        ];
        const runEl=[
            {lab:'取样步长',val:<input className='pure' value={this.state.step} onChange={(e)=>{this.setState({step:e.target.value})}} type='number' step='1' min='1' />},
            {lab:'取样步数',val:<input className='pure' value={this.state.count} onChange={(e)=>{this.setState({count:e.target.value})}} type='number' step='1' min='1' />},
            {lab:'收敛精度',val:<input className='pure' value={this.state.accuracy} onChange={(e)=>{this.setState({accuracy:e.target.value})}} type='number' step='0.001' min='0' />},
            {lab:'MCMC算法',val:<select className='pure' value={this.state.algorithm} onChange={(e)=>{this.setState({algorithm:e.target.value})}}><option value='SSFD'>单自旋翻转动力学(Single-Spin-Flip Dynamics)</option><option value='CFD'>集群翻转动力学(Cluster-Flip Dynamics)</option></select>},
            {lab:'节约储存',val:<select className='pure' value={this.state.savemode} onChange={(e)=>{this.setState({savemode:e.target.value})}}><option value='true'>启用</option><option value='false'>禁用</option></select>},
        ];
        return (<div id='Tasks'>
            <ul>
                <li style={{fontWeight: 'bold',margin:'0.1rem 0.5rem'}}>添加任务</li>
                <li style={{maxWidth:'20rem'}}><p>输入内容可以为：单个数字；多个空格隔开的数字；初值:步长:最大值。</p><p>如：1或1 2 3或1:0.2:2</p><p>其中1:0.2:2表示从1开始间隔0.2取值，最大值为2</p><hr /></li>
                {addEl.map((v,i)=><List key={i} label={v.lab}>{v.val}</List>)}
                <li><Btn bg='#F44336' value='重置' click={()=>{this.setState({kT:'',uB:''})}} /><Btn R={true} bg={window.Theme} value='添加' click={this.addTask} /></li>
            </ul>
            <div className='hrPlus' />
            <ul>
                <li style={{fontWeight: 'bold',margin:'0.1rem 0.5rem'}}>执行任务</li>
                {runEl.map((v,i)=><List key={i} label={v.lab}>{v.val}</List>)}
                <li><Btn bg='#F44336' value='重置' click={()=>{this.setState({step:10240,count:5,accuracy:1E-2,algorithm:'SSFD',savemode:'false'})}} /><Btn R={true} bg={window.Theme} value='立即执行' click={this.runTask} /></li>
            </ul>
        </div>)
    }
}
/* 图表元素 */
class Graphics extends React.Component{
    componentDidMount(){
        this.chart=echarts.init(this.el);
        this.chart.setOption(this.props.defaultVal);
        this.chart.setOption(this.props.data);
    }
    componentWillUnmount(){
        this.chart.dispose();
    }
    render(){
        return <div ref={el=>this.el=el} className='Graphics' />
    }
}

/* 绘图选项卡 */
class DrawOption extends React.Component{
    constructor(props){
        super(props);

        this.draw=this.draw.bind(this);
    }
    async draw(e){
        e.preventDefault();
        if(!window.project.projName.length)return;
        let dataset=new window.Dataset();
        await fetch(`./projects/${window.project.projName}/statistics.csv`,{},'GET','xhr')
        .then(res=>res.text())
        .then(text=>{if(text.length)return text;else throw 'Empty Response'})
        .then(
            str=>str.split('\n').map(v=>v.split(',').map(Number))
        ).then(dataset.setData)
        .catch(console.error)
        window.dataset=dataset;
        
        new FormData(this.el).forEach((v,i)=>{
            window.wins.set(`${window.project.projName}:${v}(${i})`,<Graphics key={`${window.project.projName}:${v}(${i})`} defaultVal={window[v+'Option']} data={dataset.getData(v,i)} />);
        });
        window.Method.Popups('more');
    }
    render(){
        const drawEl=[
            {lab:'单粒子内能',val:'e'},
            {lab:'单粒子磁化强度',val:'m'},
            {lab:'单粒子熵增',val:'s'},
            {lab:'单粒子定磁场热容',val:'c'},
            {lab:'E^2/N',val:'ee'},
            {lab:'EM/N',val:'em'}
        ];
        return (<form ref={el => this.el = el}><ul>
            <li style={{fontWeight: 'bold',margin:'0.1rem 0.5rem'}}>图表绘制</li>
            {drawEl.map(
                (v,i)=>(<List key={i} label={v.lab}>
                    <label><input type='checkbox' name={v.val} value='heatmap' />热力图</label>
                    <label><input type='checkbox' name={v.val} value='bar3D' />3D柱状图</label>
                </List>)
            )}
            <li><button style={{background:'#f44336'}} className='Btn shadow' type='reset' >重置</button><Btn R={true} bg={window.Theme} value='绘制' click={this.draw} /></li>
        </ul></form>)
    }
}

/* 合并项目 */
class MergeArea extends React.Component{
    constructor(props){
        super(props);
        this.state={list:[]}

        this.preview=this.preview.bind(this);
        this.add=this.add.bind(this);
        this.merge=this.merge.bind(this);
    }
    async preview(e){
        if(!e.target.value)return;
        const res=await fetch(`./projects/${e.target.value}/state.json`,{},'GET','xhr')
        .then(res=>res.json());
        const data=[['kT','uB','value','状态']];
        res.kT_done.map(String).forEach(kT=>res.uB_done.map(String).forEach(uB=>data.push([kT,uB,1,'已完成'])))
        this.chart1.setOption({
            xAxis: {
                data: res.uB_done.map(String)
            },
            yAxis: {
                data: res.kT_done.map(String)
            },
            dataset: {source: data}
        });
    }
    async add(str){
        str=this.el3.value;
        if(!str)return;
        this.setState({list:this.state.list.concat([str])});
        const data=this.chart2._data_;
        const res=await fetch(`./projects/${str}/state.json`,{},'GET','xhr')
        .then(res=>res.json());
        res.kT_done.map(String).forEach(kT=>res.uB_done.map(String).forEach(uB=>data.push([kT,uB,1,'已完成'])));
        data.sort((a,b)=>((a[1]-b[1])|| (a[0]-b[0])))
        this.chart2.setOption({dataset: {source: data}});
    }
    merge(tar){
        tar=this.el4.value;
        if(!tar || !this.state.list.length)return;
        fetch('./execute',{method: 'POST',body: `{"method": "mergeProj", "arguments": {"source": ["${this.state.list.join('","')}"], "target": "${tar}"}}`})
                .then(response=>response.ok?response.json():{})
                .then(v=>{window.project=v;return v;})
                .catch(console.error)
    }
    componentDidMount(){
        this.chart1=window.echarts.init(this.el1);
        this.chart2=window.echarts.init(this.el2);
        this.chart1.setOption(window.StateMapOption);
        this.chart2.setOption(window.StateMapOption);
        this.chart2._data_=[];
    }
    componentWillUnmount(){
        this.chart1.dispose();
        this.chart2.dispose();
    }
    render(){
        return (<div id='MergeArea'>
            <div style={{width:'40vw',textAlign:'center'}}>预览项目：<select className='pure' onChange={this.preview}>
                <option></option>
                {window.projectList.map((v,i)=><option key={i}>{v}</option>)}
                </select></div>
            <div style={{width:'40vw'}}>
                源文件：{this.state.list.map((v,i)=><div className='inline' key={i}>{v}</div>)}<br />
                添加文件<input className='pure' ref={el => this.el3 = el} /><Btn R='R' bg={window.Theme} value='添加' click={this.add} /><br/>
                输出文件<input className='pure' ref={el => this.el4 = el} /><Btn R='R' bg={window.Theme} value='合并' click={this.merge} /></div>
            <div id='mergePre' ref={el => this.el1 = el}></div>
            <div id='StateMap' ref={el => this.el2 = el}></div>
        </div>);
    }
}


/* 按钮组件 */
class Btn extends React.Component{
    render(){
        return <button style={{background:this.props.bg}} className={`Btn shadow${!this.props.R?'':' BtnR'}`} onClick={this.props.click} >{this.props.value}</button>
    }
}

/* 任务状态热力图 */
class StateMap extends React.Component{
    componentDidMount(){
        this.chart=window.echarts.init(this.el);
        this.chart.setOption(window.StateMapOption);
        this.chart.setOption(window.Utils.drawStateMap(...this.props.value));
    }
    componentWillUnmount(){
        this.chart.dispose();
    }
    componentDidUpdate(preProps){
        if(this.props.value.map((v,i)=>preProps.value[i]===v).reduce((prev,cur)=>prev&&cur,true))return;
        this.chart.setOption(window.Utils.drawStateMap(...this.props.value));
    }
    render(){
        return <div>
            <div id='StateMap' ref={el => this.el = el} />
        </div>
    }
}

/* 项目组件 交互核心 
    window.Method.refresh=this.refresh
*/
class Project extends React.Component{
    constructor(props){
        super(props);
        //console.log(this);
        this.state=window.project;
        this.state.mode='view';
        this.state.formProjName='Untitled';
        this.state.formSize1=8;
        this.state.formSize2=8;
        this.state.formJ=1;

        this.openProj=this.openProj.bind(this);
        this.createProj=this.createProj.bind(this);
        window.Method.refresh=this.refresh=this.refresh.bind(this);
    }
    openProj(){
        window.Utils.openProj(this.state.formProjName)
        .then(v=>{
            this.setState(v);
            this.setState({mode:'view'});
        });
    }
    createProj(){
        window.Utils.createProj(this.state.formProjName,this.state.formSize1,this.state.formSize2,this.state.formJ)
        .then(v=>{
            this.setState(v);
            this.setState({mode:'view'});
        })
    }
    auto(tar){
        let delay=tar.value;
        window.clearInterval(this.timer);
        delay=Number(delay);
        if(delay>0)
            this.timer=window.setInterval(this.refresh,delay);
        if(delay===-2){
            this.refresh();
            tar.value='-1';
        }
    }
    refresh(){
        window.Utils.openProj(this.state.projName)
            .then(v=>this.setState(v))
    }
    componentWillUnmount(){
        window.clearInterval(this.timer);
    }
    render(){
        let ui={
            list:[
                ['项目名: ',<input className='pure' value={this.state.formProjName} onChange={e=>this.setState({formProjName:e.target.value})} />],
                ['模型尺寸: ',this.state.size.join('x')],
                ['相互作用能 J: ',this.state.J]
            ],
            btn:[['取消',()=>{this.setState({mode:'view'})},'#f44336']]
        };
        switch(this.state.mode){
            case 'view':
                ui.title='项目状态';
                ui.list[0][1]=this.state.projName || '——';
                ui.list.push(['模型ID: ',this.state.ID.join(' , ')]);
                this.state.projName.length>0 && (ui.list.push(['自动刷新: ',<select className='pure' defaultValue='-1' onChange={e=>this.auto(e.target)}><option value='-1'>关</option><option value='-2'>立即刷新</option><option value='10000'>10s</option><option value='5000'>5s</option><option value='3000'>3s</option></select>]));
                ui.btn=[['创建项目',()=>{this.setState({mode:'create'})},window.Theme],['打开项目',()=>{this.setState({mode:'open'})},window.Theme]];break;
            case 'open':
                ui.title='打开项目';
                ui.list=[ui.list[0]];
                ui.btn.push(['确定',this.openProj,window.Theme]);break;
            case 'create':
                ui.title='创建项目';
                ui.list[1][1]=[<input className='pure' value={this.state.formSize1} type='number' step='8' min='8' key='0' onChange={e=>{this.setState({formSize1:Number(e.target.value)})}} />,'x',
                            <input className='pure' value={this.state.formSize2} type='number' step='8' min='8' key='1' onChange={e=>this.setState({formSize2:Number(e.target.value)})} />];
                ui.list[2][1]=<input className='pure' value={this.state.formJ} type='number' onChange={e=>this.setState({formJ:Number(e.target.value)})} />;
                ui.btn.push(['确定',this.createProj,window.Theme]);break;
        }
        return (<div id='Project'>
            <ul className='shadow'>
                <li style={{fontWeight: 'bold',margin:'0.1rem 0.5rem'}}>{ui.title}</li>
                {ui.list.map((v,i)=><List key={i} label={v[0]} >{v[1]}</List>)}
                <li style={{textAlign: 'center'}}>{ui.btn.map((v,i)=><Btn R={i===1} key={i} bg={v[2]} click={v[1]}  value={v[0]} />)}</li>
            </ul>
            <StateMap value={[this.state.kT,this.state.kT_done,this.state.uB,this.state.uB_done,this.state.doing]} />
        </div>)
    }
}

/* App */
class App extends React.Component{
    render(){
        return <div id='App'>
            <Navigation />
            <Wins defaultVal='project' value={window.wins} />
            <Popups defaultVal={null} value={window.popups} />
        </div>
    }
}