import { Project, MergeArea, Tasks, DrawOption, MoreWindows , App } from './components.js'
window.Theme='#4CAF50';

window.project={"projName": '', "size": [0, 0], "J": '——', "kT": [1,1.5,2,2.5], "kT_done": [], "uB": [0,1,2,3,4], "uB_done": [], "doing": '', "ID": ["——", "——"]};

window.projectList=[];

window.menu=[
    {text: '项目状态',img: './img/file_white.svg',
        click: ()=>{window.Method.Wins('project')}},
    {text: '计算任务',img: './img/browser.svg',
        click: ()=>{window.Method.Popups('task')}},
    {text: '图表绘制',img: './img/graph.svg',
        click: ()=>{window.Method.Popups('draw')}},
    {text: '任务合并',img: './img/merge.svg',
        click: async ()=>{
        window.projectList=await fetch('./execute',{method:'POST',body:`{"method": "listAll", "arguments": {}}`})
        .then(res=>res.text())
        .then(text=>text.replace('\r\n','').split(','))
        window.Method.Wins('merge')}},
    {text: '更多窗口',img: './img/more_white.svg',
        click: async ()=>{window.Method.Popups('more');}}
];

window.wins=new Map([
    ['project',<Project />],
    ['merge',<MergeArea />]
]);

window.popups=new Map([
    ['task',<Tasks />],
    ['draw',<DrawOption />],
    ['more',<MoreWindows />]
]);
const dims=['kT','uB','取样成功率','单粒子内能','单粒子磁化强度','单粒子热容','单粒子熵','偏移单粒子内能','偏移单粒子热容','偏移单粒子熵','能量平方','能量与广义力之积','偏移EM积'];
window.StateMapOption={
    grid: {
      right: 100,
      top: 65,
      bottom: 65
    },
    xAxis: {
      type: 'category',
      name: 'μB (J)'
    },
    yAxis: {
      type: 'category',
      name: 'kT (J)'
    },
    visualMap: {
      type: 'piecewise',
      left: 'right',
      top: 'center',
      categories: ['正在计算', '已完成'],
      color: [window.Theme, '#E91E63']
    },
    tooltip:{formatter:(params)=>{
      let str=[0,1,3].map(v=>[params.dimensionNames[v],params.data[v]]);
      return str.map(v=>`${params.marker}${v[0]}:<strong style="margin-left:1rem;">${v[1]}</strong><br>`).join('');
    }},
    series: [
    {
        name:'',
        dimensions: ['kT','uB','value','状态'],
        type: 'heatmap',
        encode: {x:'uB', y:'kT'},
        emphasis: {
          itemStyle: {
            borderColor: '#333',
            borderWidth: 1
          }
        },
        progressive: 1000,
        animation: false
    }
    ]
};
const tooltipForm=(params=>[0,1,(params.encode.value||params.encode.z)[0],2].map(v=>`${params.marker}${dims[v]}:<strong style="margin-left:1rem;">${params.data[v]}</strong><br>`).join(''));
window.heatmapOption={
    dataset: {sourceHeader: false, dimensions:dims,source:[]},
    grid: {
      left: '20%',
      right: '10%',
      top: '10%',
      bottom: '20%'
    },
    tooltip:{formatter:tooltipForm},
    xAxis: {type:'category',name:'μB (J)'},
    yAxis: {type:'category',name:'kT (J)'},
    visualMap:{
        type: 'continuous',//连续类型
        precision:1,//小数点
        calculable: true,//拖动
        realtime: false,//实时更新
        inRange: {color:['#313695','#4575b4','#74add1','#abd9e9','#e0f3f8','#ffffbf','#fee090','#fdae61','#f46d43','#d73027','#a50026']}
    },
    series: {type: 'heatmap', encode: {x: 'uB', y: 'kT'}, name:'', progressive: 1000}
};

window.bar3DOption={
    dataset: {sourceHeader: false, dimensions:dims,source:[]},
    backgroundColor:'#100C2A',
    tooltip:{position:['2.8%','5%'],formatter:tooltipForm},
    grid3D: {
        axisLine: {lineStyle: { color: '#fff' }},
        axisPointer: {lineStyle: { color: '#fff' }},
        light: {main: {shadow: true,quality: 'medium',intensity: 1, alpha: 60, beta: 135}}
    },
    xAxis3D: {type: 'category',name:'μB (J)'},
    yAxis3D: {type: 'category',name:'kT (J)'},
    zAxis3D: {type: 'value'},
    visualMap: {dimension: 2,precision: 2,min: 0,max: 1, textStyle: {color: '#ffffff'}, color: [window.Theme, '#F44336']},
    series: {type: 'bar3D', encode:{x: 'uB', y: 'kT'},shading: 'lambert', name:'', progressive: 1000}
}


ReactDOM.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
            document.getElementById('root')
        );