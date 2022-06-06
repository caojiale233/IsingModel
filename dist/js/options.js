import _regeneratorRuntime from 'babel-runtime/regenerator';

var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Theme = '#4CAF50';

window.project = { "projName": '', "size": [0, 0], "J": '——', "kT": [1, 1.5, 2, 2.5], "kT_done": [], "uB": [0, 1, 2, 3, 4], "uB_done": [], "doing": '', "ID": ["——", "——"] };

window.projectList = [];

var menu = [{ text: '项目状态', img: './img/file_white.svg',
    click: function click() {
        window.Method.Wins('project');
    } }, { text: '计算任务', img: './img/browser.svg',
    click: function click() {
        window.Method.Popups('task');
    } }, { text: '图表绘制', img: './img/graph.svg',
    click: function click() {
        window.Method.Popups('draw');
    } }, { text: '任务合并', img: './img/merge.svg',
    click: function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
            return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return fetch('./execute', { method: 'POST', body: '{"method": "listAll", "arguments": {}}' }).then(function (res) {
                                return res.text();
                            }).then(function (text) {
                                return text.replace('\r\n', '').split(',');
                            });

                        case 2:
                            window.projectList = _context.sent;

                            window.Method.Wins('merge');
                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        function click() {
            return _ref.apply(this, arguments);
        }

        return click;
    }() }, { text: '更多窗口', img: './img/more_white.svg',
    click: function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
            return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            window.Method.Popups('more');
                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this);
        }));

        function click() {
            return _ref2.apply(this, arguments);
        }

        return click;
    }() }];

var wins = new Map([['project', React.createElement(Project, null)], ['merge', React.createElement(MergeArea, null)]]);

var popups = new Map([['task', React.createElement(Tasks, null)], ['draw', React.createElement(DrawOption, null)], ['more', React.createElement(MoreWindows, null)]]);
var dims = ['kT', 'uB', '取样成功率', '单粒子内能', '单粒子磁化强度', '单粒子热容', '单粒子熵', '偏移单粒子内能', '偏移单粒子热容', '偏移单粒子熵', '能量平方', '能量与广义力之积', '偏移EM积'];
var StateMapOption = {
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
    tooltip: { formatter: function formatter(params) {
            var str = [0, 1, 3].map(function (v) {
                return [params.dimensionNames[v], params.data[v]];
            });
            return str.map(function (v) {
                return '' + params.marker + v[0] + ':<strong style="margin-left:1rem;">' + v[1] + '</strong><br>';
            }).join('');
        } },
    series: [{
        name: '',
        dimensions: ['kT', 'uB', 'value', '状态'],
        type: 'heatmap',
        encode: { x: 'uB', y: 'kT' },
        emphasis: {
            itemStyle: {
                borderColor: '#333',
                borderWidth: 1
            }
        },
        progressive: 1000,
        animation: false
    }]
};
var tooltipForm = function tooltipForm(params) {
    return [0, 1, (params.encode.value || params.encode.z)[0], 2].map(function (v) {
        return '' + params.marker + dims[v] + ':<strong style="margin-left:1rem;">' + params.data[v] + '</strong><br>';
    }).join('');
};
var heatmapOption = {
    dataset: { sourceHeader: false, dimensions: dims, source: [] },
    grid: {
        left: '20%',
        right: '10%',
        top: '10%',
        bottom: '20%'
    },
    tooltip: { formatter: tooltipForm },
    xAxis: { type: 'category', name: 'μB (J)' },
    yAxis: { type: 'category', name: 'kT (J)' },
    visualMap: {
        type: 'continuous', //连续类型
        precision: 1, //小数点
        calculable: true, //拖动
        realtime: false, //实时更新
        inRange: { color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'] }
    },
    series: { type: 'heatmap', encode: { x: 'uB', y: 'kT' }, name: '', progressive: 1000 }
};

var bar3DOption = {
    dataset: { sourceHeader: false, dimensions: dims, source: [] },
    backgroundColor: '#100C2A',
    tooltip: { position: ['2.8%', '5%'], formatter: tooltipForm },
    grid3D: {
        axisLine: { lineStyle: { color: '#fff' } },
        axisPointer: { lineStyle: { color: '#fff' } },
        light: { main: { shadow: true, quality: 'medium', intensity: 1, alpha: 60, beta: 135 } }
    },
    xAxis3D: { type: 'category', name: 'μB (J)' },
    yAxis3D: { type: 'category', name: 'kT (J)' },
    zAxis3D: { type: 'value' },
    visualMap: { dimension: 2, precision: 2, min: 0, max: 1, textStyle: { color: '#ffffff' }, color: [window.Theme, '#F44336'] },
    series: { type: 'bar3D', encode: { x: 'uB', y: 'kT' }, shading: 'lambert', name: '', progressive: 1000 }
};

ReactDOM.render(React.createElement(
    React.StrictMode,
    null,
    React.createElement(App, null)
), document.getElementById('root'));