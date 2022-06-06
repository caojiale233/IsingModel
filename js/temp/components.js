import _regeneratorRuntime from 'babel-runtime/regenerator';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export { Project, MergeArea, Tasks, DrawOption, MoreWindows, App };

/* 方法集
    window.Utils=new Utils()
 */
(function () {
    var Utils = function () {
        function Utils() {
            _classCallCheck(this, Utils);
        }

        _createClass(Utils, [{
            key: 'openProj',
            value: function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(name) {
                    return _regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    return _context.abrupt('return', fetch('./projects/' + name + '/state.json', {}, 'GET', 'xhr').then(function (response) {
                                        if (response.ok) return response.json();else {
                                            console.error('打开文件失败\n请尝试创建文件');
                                            throw 'open file failed';
                                        }
                                    }).then(function (v) {
                                        window.project = v;return v;
                                    }));

                                case 1:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, this);
                }));

                function openProj(_x) {
                    return _ref.apply(this, arguments);
                }

                return openProj;
            }()
        }, {
            key: 'createProj',
            value: function createProj(name, size1, size2, J) {
                return new Promise(function (resolve, reject) {
                    if (!name || !J || size1 <= 0 || size2 <= 0) {
                        reject('invalid input value');return;
                    }
                    fetch('./execute', { method: 'POST', body: '{"method": "readProj", "arguments": {"projName": "' + name + '", "size": [' + Math.ceil(size1 / 8) * 8 + ', ' + Math.ceil(size2 / 8) * 8 + '], "J": ' + J + '}}' }).then(function (response) {
                        return response.ok ? response.json() : {};
                    }).then(function (v) {
                        window.project = v;return v;
                    }).then(resolve).catch(console.error);
                });
            }
        }, {
            key: 'drawStateMap',
            value: function drawStateMap(kT, kT_done, uB, uB_done, doing) {
                var data = [],
                    option = {
                    xAxis: {
                        data: uB.concat(uB_done)
                    },
                    yAxis: {
                        data: kT.concat(kT_done)
                    },
                    dataset: { source: data }
                };
                option.xAxis.data.sort(function (i, j) {
                    return i - j;
                }), option.yAxis.data.sort(function (i, j) {
                    return i - j;
                });
                kT_done.forEach(function (x) {
                    return uB_done.forEach(function (y) {
                        return data.push([String(x), String(y), 1, '已完成']);
                    });
                });
                if (doing !== '') data.push([].concat(_toConsumableArray(doing.map(String)), [2, '正在计算']));
                return option;
            }
        }, {
            key: 'addTask',
            value: function addTask(kT, uB) {
                function toArr(str) {
                    if (str.indexOf(':') !== -1) {
                        var _str$split$map$map = str.split(':').map(Number).map(function (i) {
                            return i * 1E6;
                        }),
                            _str$split$map$map2 = _slicedToArray(_str$split$map$map, 3),
                            i = _str$split$map$map2[0],
                            s = _str$split$map$map2[1],
                            m = _str$split$map$map2[2],
                            arr = [];

                        while (i <= m) {
                            arr.push(i / 1E6);
                            i += s;
                        }
                        return arr;
                    }
                    if (str.indexOf(' ') !== -1) return str.split(' ').map(Number);
                    if (str.length === 0) return [];
                    return [Number(str)];
                }
                return new Promise(function (resolve, reject) {
                    kT = toArr(kT), uB = toArr(uB);
                    if (kT.map(function (i) {
                        return isNaN(i);
                    }).reduce(function (prev, curr) {
                        return prev || curr;
                    }, false) || uB.map(function (i) {
                        return isNaN(i);
                    }).reduce(function (prev, curr) {
                        return prev || curr;
                    }, false)) {
                        reject('输入的不是数字');return;
                    };
                    if (!window.project.projName.length) {
                        reject('还没有打开了的项目，先打开一个');return;
                    }
                    fetch('./execute', { method: 'POST', body: '{"method": "addQueue", "arguments": {"projName": "' + window.project.projName + '", "kT": [' + kT.join(', ') + '], "uB": [' + uB.join(', ') + ']}}' }).then(function (res) {
                        return res.text();
                    }).then(resolve).catch(function (msg) {
                        console.error(msg);reject(msg);
                    });
                });
            }
        }, {
            key: 'runTask',
            value: function runTask(step, count, accuracy, algorithm, savemode) {
                return new Promise(function (resolve, reject) {
                    if (!step || !count || !accuracy) {
                        reject('必要参数不全');return;
                    }
                    if (!window.project.projName.length) {
                        reject('还没有打开了的项目，先打开一个');return;
                    }
                    fetch('./execute', { method: 'POST', body: '{"method": "runProj", "arguments": {"projName": "' + window.project.projName + '", "step": ' + step + ', "count": ' + count + ', "accuracy": ' + accuracy + ', "algorithm": "' + algorithm + '", "savemode": ' + savemode + '}}' }).then(function (res) {
                        return res.text();
                    }).then(resolve).catch(function (msg) {
                        console.error(msg);reject(msg);
                    });
                });
            }
        }]);

        return Utils;
    }();

    var Dataset = function () {
        function Dataset() {
            _classCallCheck(this, Dataset);

            //['kT','uB','取样成功率','单粒子内能','单粒子磁化强度','单粒子热容','单粒子熵','偏移单粒子内能','偏移单粒子热容','偏移单粒子熵','能量平方','能量与广义力之积','偏移EM积']
            this.source = null;
            this.config = new Map([
            /*min=max时表示自适应，min max为保留小数位数
              candidate<0，则无备用数据索引
            ['graphy',[value,index,candidate,min,max]]*/
            ['e', ['单粒子内能', 3, 7, 0, 0]], ['m', ['单粒子磁化强度', 4, -1, 0, 1]], ['c', ['单粒子热容', 5, 8, 0, 0]], ['s', ['单粒子熵', 6, 9, 2, 2]], ['ee', ['能量平方', 10, -1, 0, 0]], ['em', ['能量与广义力之积', 11, 12, -1, -1]]]);
            this.setData = this.setData.bind(this);
        }

        _createClass(Dataset, [{
            key: 'setData',
            value: function setData(source) {
                var N = window.project.size[0] * window.project.size[1],
                    L = window.project.kT_done.length;
                function integral(s, i) {
                    var ss = s[i],
                        s1 = i % L ? s[i - 1] : [0, ss[1], 0, 0, 0, 0, 0];
                    var path2 = (s1[9] || 0) + (s1[5] / (s1[0] || 1) + ss[5] / ss[0]) / 2 * (ss[0] - s1[0]);

                    if (i < L) return path2;
                    var s2 = s[i - L],
                        path1 = s2[9] + (ss[6] + s2[6] - N * (ss[3] * ss[4] + s2[3] * s2[4])) / (2 * Math.pow(ss[0], 2)) * (ss[1] - s2[1]);
                    return (path1 + path2) / 2;
                };
                /*
                function integral2(s,i){
                    if(i<L)return integral(s,i);
                    const v=s[i],v0=i%L?s[i-1-L]:[0,s[i-1][1],0,0,0,0,0];
                    const res=(v0[9]||0)+(v0[5]/(v0[0]||1)+v[5]/v[0])/2*(v[0]-v0[0])+(v0[6]+v[6]-N*(v0[3]*v0[4]+v[3]*v[4]))/((v[0]+v0[0])**2/2)*(v[1]-v0[1]);
                    return res;
                }*/

                source.pop();
                source.sort(function (a, b) {
                    return a[1] - b[1] || a[0] - b[0];
                });
                source.forEach(function (v, i, self) {
                    self[i][10] = self[i][5], self[i][11] = self[i][6];
                    self[i][5] = Number(((v[5] - Math.pow(v[3], 2) * N) / Math.pow(v[0], 2)).toFixed(4));
                    self[i][9] = Number(integral(self, i).toFixed(4));
                });
                source.forEach(function (v, i, self) {
                    return self[i][6] = v[9];
                });
                this.source = source;
            }
        }, {
            key: 'getData',
            value: function getData(drawType, graphy) {
                /* heatmap/bar3D, e/m/c/s */
                var _config$get = this.config.get(graphy),
                    _config$get2 = _slicedToArray(_config$get, 5),
                    value = _config$get2[0],
                    index = _config$get2[1],
                    candidate = _config$get2[2],
                    min = _config$get2[3],
                    max = _config$get2[4];

                drawType = drawType === 'heatmap';

                if (min === max) {
                    var rate = Math.pow(10, max);
                    max = min = this.source[0][index];
                    this.source.forEach(function (v) {
                        max = v[index] > max ? v[index] : max;
                        min = v[index] < min ? v[index] : min;
                    });
                    max = Math.ceil(max * rate) / rate;
                    min = Math.floor(min * rate) / rate;
                }

                var option = {
                    dataset: { source: this.source },
                    series: { encode: { value: value, tooltip: [0, 1, value, 2] } }
                };
                if (drawType) {
                    var _option$visualMap;

                    option.visualMap = (_option$visualMap = { min: min, max: max }, _defineProperty(_option$visualMap, 'max', max), _defineProperty(_option$visualMap, 'dimension', value), _option$visualMap);
                } else {
                    //option.series.encode.tooltip=[value,2];
                    option.zAxis3D = { name: value };
                    if (candidate >= 0) {
                        this.source.forEach(function (v, i, self) {
                            self[i][candidate] = (v[index] * 1E6 - min * 1E6) / 1E6;
                        });
                        value = candidate;
                        option.zAxis3D.axisLabel = { formatter: function (min) {
                                return function (i) {
                                    return (i * 1E6 + min * 1E6) / 1E6;
                                };
                            }(min) };
                    }
                    option.series.encode.z = value;
                }
                //debugger;
                return option;
            }
        }]);

        return Dataset;
    }();

    window.Utils = new Utils();
    window.Dataset = Dataset;
    window.Method = {};
})();

/* 导航组件 */

var Navigation = function (_React$Component) {
    _inherits(Navigation, _React$Component);

    function Navigation() {
        _classCallCheck(this, Navigation);

        return _possibleConstructorReturn(this, (Navigation.__proto__ || Object.getPrototypeOf(Navigation)).apply(this, arguments));
    }

    _createClass(Navigation, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { id: 'Nav', className: 'shadow' },
                React.createElement('img', { id: 'logoMobile', src: 'img/menu.svg' }),
                React.createElement('img', { id: 'logo', src: 'img/logo.png' }),
                window.menu.map(function (i) {
                    return React.createElement(
                        'a',
                        { className: 'Nav', key: i.text, onClick: i.click },
                        React.createElement('img', { className: 'Nav', src: i.img }),
                        i.text
                    );
                })
            );
        }
    }]);

    return Navigation;
}(React.Component);

/* 弹窗组件 
    window.Method.Popups=this.show 
*/


var Popups = function (_React$Component2) {
    _inherits(Popups, _React$Component2);

    function Popups(props) {
        _classCallCheck(this, Popups);

        //console.log(this);
        var _this2 = _possibleConstructorReturn(this, (Popups.__proto__ || Object.getPrototypeOf(Popups)).call(this, props));

        _this2.state = { display: _this2.props.defaultVal };

        _this2.hide = _this2.hide.bind(_this2);
        window.Method.Popups = _this2.show.bind(_this2);
        return _this2;
    }

    _createClass(Popups, [{
        key: 'hide',
        value: function hide(e) {
            //console.log(e.target);
            e.target.id === 'Popups' && this.setState({ display: null });
        }
    }, {
        key: 'show',
        value: function show(v) {
            this.setState({ display: v });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.Method.Popups = null;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return this.state.display !== null && React.createElement(
                'div',
                { id: 'Popups', onClick: function onClick(e) {
                        return _this3.hide(e);
                    } },
                React.createElement(
                    'div',
                    { className: 'PopupsContain shadow' },
                    this.props.value.get(this.state.display)
                )
            );
        }
    }]);

    return Popups;
}(React.Component);

/* 多窗口组件
    window.Method.Wins=this.show
*/


var Wins = function (_React$Component3) {
    _inherits(Wins, _React$Component3);

    function Wins(props) {
        _classCallCheck(this, Wins);

        var _this4 = _possibleConstructorReturn(this, (Wins.__proto__ || Object.getPrototypeOf(Wins)).call(this, props));

        _this4.state = { display: _this4.props.defaultVal };
        window.Method.Wins = _this4.show.bind(_this4);
        return _this4;
    }

    _createClass(Wins, [{
        key: 'show',
        value: function show(v) {
            this.setState({ display: v });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.Method.Wins = null;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { id: 'Wins' },
                this.props.value.get(this.state.display)
            );
        }
    }]);

    return Wins;
}(React.Component);

/* 更多窗口组件 */


var MoreWindows = function (_React$Component4) {
    _inherits(MoreWindows, _React$Component4);

    function MoreWindows(props) {
        _classCallCheck(this, MoreWindows);

        var _this5 = _possibleConstructorReturn(this, (MoreWindows.__proto__ || Object.getPrototypeOf(MoreWindows)).call(this, props));

        _this5.state = { wins: window.wins };
        return _this5;
    }

    _createClass(MoreWindows, [{
        key: 'render',
        value: function render() {
            var _this6 = this;

            var elem = [],
                iterator = window.wins.keys(),
                key = void 0;
            iterator.next();
            iterator.next();
            while (key = iterator.next().value) {
                elem.push(React.createElement(
                    List,
                    { key: key, label: key },
                    React.createElement(
                        'button',
                        { 'data-key': key, className: 'imgBtn shadow', onClick: function onClick(e) {
                                window.wins.delete(e.target.getAttribute('data-key'));_this6.setState({ wins: window.wins });
                            }, style: { backgroundColor: '#f44336' } },
                        React.createElement('img', { 'data-key': key, className: 'imgBtn', src: 'img/trashBin_white.svg' })
                    ),
                    React.createElement(
                        'button',
                        { 'data-key': key, className: 'imgBtn shadow', onClick: function onClick(e) {
                                window.Method.Wins(e.target.getAttribute('data-key'));window.Method.Popups(null);
                            }, style: { backgroundColor: window.Theme } },
                        React.createElement('img', { 'data-key': key, className: 'imgBtn', src: 'img/view_white.svg' })
                    )
                ));
            }return React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    { style: { fontWeight: 'bold', margin: '0.1rem 0.5rem' } },
                    '\u66F4\u591A\u7A97\u53E3\u5217\u8868'
                ),
                elem.length ? elem : React.createElement(List, { label: '\u6CA1\u6709\u5DF2\u7ED8\u5236\u7684\u56FE\u8868\u53EF\u7528' })
            );
        }
    }]);

    return MoreWindows;
}(React.Component);

/* 列表元素组件 */


var List = function (_React$Component5) {
    _inherits(List, _React$Component5);

    function List() {
        _classCallCheck(this, List);

        return _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).apply(this, arguments));
    }

    _createClass(List, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'li',
                { className: 'list' },
                this.props.label,
                React.createElement(
                    'div',
                    { className: 'listValue' },
                    this.props.children
                )
            );
        }
    }]);

    return List;
}(React.Component);

/* 任务面板 */


var Tasks = function (_React$Component6) {
    _inherits(Tasks, _React$Component6);

    function Tasks(props) {
        _classCallCheck(this, Tasks);

        var _this8 = _possibleConstructorReturn(this, (Tasks.__proto__ || Object.getPrototypeOf(Tasks)).call(this, props));

        _this8.state = { kT: '', uB: '', step: window.project.size[0] * window.project.size[1] * 10, count: 5, accuracy: 1E-2, algorithm: 'SSFD', savemode: 'false' };

        _this8.addTask = _this8.addTask.bind(_this8);
        _this8.runTask = _this8.runTask.bind(_this8);
        return _this8;
    }

    _createClass(Tasks, [{
        key: 'addTask',
        value: function addTask() {
            window.Utils.addTask(this.state.kT.replaceAll('：', ':'), this.state.uB.replaceAll('：', ':')).then(console.log).then(window.Method.refresh);
        }
    }, {
        key: 'runTask',
        value: function runTask() {
            window.Utils.runTask(this.state.step, this.state.count, this.state.accuracy, this.state.algorithm, this.state.savemode).then(console.log).then(window.Method.refresh);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this9 = this;

            var addEl = [{ lab: 'kT', val: React.createElement('input', { className: 'pure', type: 'text', value: this.state.kT, onChange: function onChange(e) {
                        _this9.setState({ kT: e.target.value });
                    } }) }, { lab: 'μB', val: React.createElement('input', { className: 'pure', type: 'text', value: this.state.uB, onChange: function onChange(e) {
                        _this9.setState({ uB: e.target.value });
                    } }) }];
            var runEl = [{ lab: '取样步长', val: React.createElement('input', { className: 'pure', value: this.state.step, onChange: function onChange(e) {
                        _this9.setState({ step: e.target.value });
                    }, type: 'number', step: '1', min: '1' }) }, { lab: '取样步数', val: React.createElement('input', { className: 'pure', value: this.state.count, onChange: function onChange(e) {
                        _this9.setState({ count: e.target.value });
                    }, type: 'number', step: '1', min: '1' }) }, { lab: '收敛精度', val: React.createElement('input', { className: 'pure', value: this.state.accuracy, onChange: function onChange(e) {
                        _this9.setState({ accuracy: e.target.value });
                    }, type: 'number', step: '0.001', min: '0' }) }, { lab: 'MCMC算法', val: React.createElement(
                    'select',
                    { className: 'pure', value: this.state.algorithm, onChange: function onChange(e) {
                            _this9.setState({ algorithm: e.target.value });
                        } },
                    React.createElement(
                        'option',
                        { value: 'SSFD' },
                        '\u5355\u81EA\u65CB\u7FFB\u8F6C\u52A8\u529B\u5B66(Single-Spin-Flip Dynamics)'
                    ),
                    React.createElement(
                        'option',
                        { value: 'CFD' },
                        '\u96C6\u7FA4\u7FFB\u8F6C\u52A8\u529B\u5B66(Cluster-Flip Dynamics)'
                    )
                ) }, { lab: '节约储存', val: React.createElement(
                    'select',
                    { className: 'pure', value: this.state.savemode, onChange: function onChange(e) {
                            _this9.setState({ savemode: e.target.value });
                        } },
                    React.createElement(
                        'option',
                        { value: 'true' },
                        '\u542F\u7528'
                    ),
                    React.createElement(
                        'option',
                        { value: 'false' },
                        '\u7981\u7528'
                    )
                ) }];
            return React.createElement(
                'div',
                { id: 'Tasks' },
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        { style: { fontWeight: 'bold', margin: '0.1rem 0.5rem' } },
                        '\u6DFB\u52A0\u4EFB\u52A1'
                    ),
                    React.createElement(
                        'li',
                        { style: { maxWidth: '20rem' } },
                        React.createElement(
                            'p',
                            null,
                            '\u8F93\u5165\u5185\u5BB9\u53EF\u4EE5\u4E3A\uFF1A\u5355\u4E2A\u6570\u5B57\uFF1B\u591A\u4E2A\u7A7A\u683C\u9694\u5F00\u7684\u6570\u5B57\uFF1B\u521D\u503C:\u6B65\u957F:\u6700\u5927\u503C\u3002'
                        ),
                        React.createElement(
                            'p',
                            null,
                            '\u5982\uFF1A1\u62161 2 3\u62161:0.2:2'
                        ),
                        React.createElement(
                            'p',
                            null,
                            '\u5176\u4E2D1:0.2:2\u8868\u793A\u4ECE1\u5F00\u59CB\u95F4\u96940.2\u53D6\u503C\uFF0C\u6700\u5927\u503C\u4E3A2'
                        ),
                        React.createElement('hr', null)
                    ),
                    addEl.map(function (v, i) {
                        return React.createElement(
                            List,
                            { key: i, label: v.lab },
                            v.val
                        );
                    }),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(Btn, { bg: '#F44336', value: '\u91CD\u7F6E', click: function click() {
                                _this9.setState({ kT: '', uB: '' });
                            } }),
                        React.createElement(Btn, { R: true, bg: window.Theme, value: '\u6DFB\u52A0', click: this.addTask })
                    )
                ),
                React.createElement('div', { className: 'hrPlus' }),
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        { style: { fontWeight: 'bold', margin: '0.1rem 0.5rem' } },
                        '\u6267\u884C\u4EFB\u52A1'
                    ),
                    runEl.map(function (v, i) {
                        return React.createElement(
                            List,
                            { key: i, label: v.lab },
                            v.val
                        );
                    }),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(Btn, { bg: '#F44336', value: '\u91CD\u7F6E', click: function click() {
                                _this9.setState({ step: 10240, count: 5, accuracy: 1E-2, algorithm: 'SSFD', savemode: 'false' });
                            } }),
                        React.createElement(Btn, { R: true, bg: window.Theme, value: '\u7ACB\u5373\u6267\u884C', click: this.runTask })
                    )
                )
            );
        }
    }]);

    return Tasks;
}(React.Component);
/* 图表元素 */


var Graphics = function (_React$Component7) {
    _inherits(Graphics, _React$Component7);

    function Graphics() {
        _classCallCheck(this, Graphics);

        return _possibleConstructorReturn(this, (Graphics.__proto__ || Object.getPrototypeOf(Graphics)).apply(this, arguments));
    }

    _createClass(Graphics, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.chart = echarts.init(this.el);
            this.chart.setOption(this.props.defaultVal);
            this.chart.setOption(this.props.data);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.chart.dispose();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            return React.createElement('div', { ref: function ref(el) {
                    return _this11.el = el;
                }, className: 'Graphics' });
        }
    }]);

    return Graphics;
}(React.Component);

/* 绘图选项卡 */


var DrawOption = function (_React$Component8) {
    _inherits(DrawOption, _React$Component8);

    function DrawOption(props) {
        _classCallCheck(this, DrawOption);

        var _this12 = _possibleConstructorReturn(this, (DrawOption.__proto__ || Object.getPrototypeOf(DrawOption)).call(this, props));

        _this12.draw = _this12.draw.bind(_this12);
        return _this12;
    }

    _createClass(DrawOption, [{
        key: 'draw',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(e) {
                var dataset;
                return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                e.preventDefault();

                                if (window.project.projName.length) {
                                    _context2.next = 3;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 3:
                                dataset = new window.Dataset();
                                _context2.next = 6;
                                return fetch('./projects/' + window.project.projName + '/statistics.csv', {}, 'GET', 'xhr').then(function (res) {
                                    return res.text();
                                }).then(function (text) {
                                    if (text.length) return text;else throw 'Empty Response';
                                }).then(function (str) {
                                    return str.split('\n').map(function (v) {
                                        return v.split(',').map(Number);
                                    });
                                }).then(dataset.setData).catch(console.error);

                            case 6:
                                window.dataset = dataset;

                                new FormData(this.el).forEach(function (v, i) {
                                    window.wins.set(window.project.projName + ':' + v + '(' + i + ')', React.createElement(Graphics, { key: window.project.projName + ':' + v + '(' + i + ')', defaultVal: window[v + 'Option'], data: dataset.getData(v, i) }));
                                });
                                window.Method.Popups('more');

                            case 9:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function draw(_x2) {
                return _ref2.apply(this, arguments);
            }

            return draw;
        }()
    }, {
        key: 'render',
        value: function render() {
            var _this13 = this;

            var drawEl = [{ lab: '单粒子内能', val: 'e' }, { lab: '单粒子磁化强度', val: 'm' }, { lab: '单粒子熵增', val: 's' }, { lab: '单粒子定磁场热容', val: 'c' }, { lab: 'E^2/N', val: 'ee' }, { lab: 'EM/N', val: 'em' }];
            return React.createElement(
                'form',
                { ref: function ref(el) {
                        return _this13.el = el;
                    } },
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        { style: { fontWeight: 'bold', margin: '0.1rem 0.5rem' } },
                        '\u56FE\u8868\u7ED8\u5236'
                    ),
                    drawEl.map(function (v, i) {
                        return React.createElement(
                            List,
                            { key: i, label: v.lab },
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: v.val, value: 'heatmap' }),
                                '\u70ED\u529B\u56FE'
                            ),
                            React.createElement(
                                'label',
                                null,
                                React.createElement('input', { type: 'checkbox', name: v.val, value: 'bar3D' }),
                                '3D\u67F1\u72B6\u56FE'
                            )
                        );
                    }),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'button',
                            { style: { background: '#f44336' }, className: 'Btn shadow', type: 'reset' },
                            '\u91CD\u7F6E'
                        ),
                        React.createElement(Btn, { R: true, bg: window.Theme, value: '\u7ED8\u5236', click: this.draw })
                    )
                )
            );
        }
    }]);

    return DrawOption;
}(React.Component);

/* 合并项目 */


var MergeArea = function (_React$Component9) {
    _inherits(MergeArea, _React$Component9);

    function MergeArea(props) {
        _classCallCheck(this, MergeArea);

        var _this14 = _possibleConstructorReturn(this, (MergeArea.__proto__ || Object.getPrototypeOf(MergeArea)).call(this, props));

        _this14.state = { list: [] };

        _this14.preview = _this14.preview.bind(_this14);
        _this14.add = _this14.add.bind(_this14);
        _this14.merge = _this14.merge.bind(_this14);
        return _this14;
    }

    _createClass(MergeArea, [{
        key: 'preview',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(e) {
                var res, data;
                return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (e.target.value) {
                                    _context3.next = 2;
                                    break;
                                }

                                return _context3.abrupt('return');

                            case 2:
                                _context3.next = 4;
                                return fetch('./projects/' + e.target.value + '/state.json', {}, 'GET', 'xhr').then(function (res) {
                                    return res.json();
                                });

                            case 4:
                                res = _context3.sent;
                                data = [['kT', 'uB', 'value', '状态']];

                                res.kT_done.map(String).forEach(function (kT) {
                                    return res.uB_done.map(String).forEach(function (uB) {
                                        return data.push([kT, uB, 1, '已完成']);
                                    });
                                });
                                this.chart1.setOption({
                                    xAxis: {
                                        data: res.uB_done.map(String)
                                    },
                                    yAxis: {
                                        data: res.kT_done.map(String)
                                    },
                                    dataset: { source: data }
                                });

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function preview(_x3) {
                return _ref3.apply(this, arguments);
            }

            return preview;
        }()
    }, {
        key: 'add',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(str) {
                var data, res;
                return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                str = this.el3.value;

                                if (str) {
                                    _context4.next = 3;
                                    break;
                                }

                                return _context4.abrupt('return');

                            case 3:
                                this.setState({ list: this.state.list.concat([str]) });
                                data = this.chart2._data_;
                                _context4.next = 7;
                                return fetch('./projects/' + str + '/state.json', {}, 'GET', 'xhr').then(function (res) {
                                    return res.json();
                                });

                            case 7:
                                res = _context4.sent;

                                res.kT_done.map(String).forEach(function (kT) {
                                    return res.uB_done.map(String).forEach(function (uB) {
                                        return data.push([kT, uB, 1, '已完成']);
                                    });
                                });
                                data.sort(function (a, b) {
                                    return a[1] - b[1] || a[0] - b[0];
                                });
                                this.chart2.setOption({ dataset: { source: data } });

                            case 11:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function add(_x4) {
                return _ref4.apply(this, arguments);
            }

            return add;
        }()
    }, {
        key: 'merge',
        value: function merge(tar) {
            tar = this.el4.value;
            if (!tar || !this.state.list.length) return;
            fetch('./execute', { method: 'POST', body: '{"method": "mergeProj", "arguments": {"source": ["' + this.state.list.join('","') + '"], "target": "' + tar + '"}}' }).then(function (response) {
                return response.ok ? response.json() : {};
            }).then(function (v) {
                window.project = v;return v;
            }).catch(console.error);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.chart1 = window.echarts.init(this.el1);
            this.chart2 = window.echarts.init(this.el2);
            this.chart1.setOption(window.StateMapOption);
            this.chart2.setOption(window.StateMapOption);
            this.chart2._data_ = [];
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.chart1.dispose();
            this.chart2.dispose();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this15 = this;

            return React.createElement(
                'div',
                { id: 'MergeArea' },
                React.createElement(
                    'div',
                    { style: { width: '40vw', textAlign: 'center' } },
                    '\u9884\u89C8\u9879\u76EE\uFF1A',
                    React.createElement(
                        'select',
                        { className: 'pure', onChange: this.preview },
                        React.createElement('option', null),
                        window.projectList.map(function (v, i) {
                            return React.createElement(
                                'option',
                                { key: i },
                                v
                            );
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { style: { width: '40vw' } },
                    '\u6E90\u6587\u4EF6\uFF1A',
                    this.state.list.map(function (v, i) {
                        return React.createElement(
                            'div',
                            { className: 'inline', key: i },
                            v
                        );
                    }),
                    React.createElement('br', null),
                    '\u6DFB\u52A0\u6587\u4EF6',
                    React.createElement('input', { className: 'pure', ref: function ref(el) {
                            return _this15.el3 = el;
                        } }),
                    React.createElement(Btn, { R: 'R', bg: window.Theme, value: '\u6DFB\u52A0', click: this.add }),
                    React.createElement('br', null),
                    '\u8F93\u51FA\u6587\u4EF6',
                    React.createElement('input', { className: 'pure', ref: function ref(el) {
                            return _this15.el4 = el;
                        } }),
                    React.createElement(Btn, { R: 'R', bg: window.Theme, value: '\u5408\u5E76', click: this.merge })
                ),
                React.createElement('div', { id: 'mergePre', ref: function ref(el) {
                        return _this15.el1 = el;
                    } }),
                React.createElement('div', { id: 'StateMap', ref: function ref(el) {
                        return _this15.el2 = el;
                    } })
            );
        }
    }]);

    return MergeArea;
}(React.Component);

/* 按钮组件 */


var Btn = function (_React$Component10) {
    _inherits(Btn, _React$Component10);

    function Btn() {
        _classCallCheck(this, Btn);

        return _possibleConstructorReturn(this, (Btn.__proto__ || Object.getPrototypeOf(Btn)).apply(this, arguments));
    }

    _createClass(Btn, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'button',
                { style: { background: this.props.bg }, className: 'Btn shadow' + (!this.props.R ? '' : ' BtnR'), onClick: this.props.click },
                this.props.value
            );
        }
    }]);

    return Btn;
}(React.Component);

/* 任务状态热力图 */


var StateMap = function (_React$Component11) {
    _inherits(StateMap, _React$Component11);

    function StateMap() {
        _classCallCheck(this, StateMap);

        return _possibleConstructorReturn(this, (StateMap.__proto__ || Object.getPrototypeOf(StateMap)).apply(this, arguments));
    }

    _createClass(StateMap, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _window$Utils;

            this.chart = window.echarts.init(this.el);
            this.chart.setOption(window.StateMapOption);
            this.chart.setOption((_window$Utils = window.Utils).drawStateMap.apply(_window$Utils, _toConsumableArray(this.props.value)));
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.chart.dispose();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(preProps) {
            var _window$Utils2;

            if (this.props.value.map(function (v, i) {
                return preProps.value[i] === v;
            }).reduce(function (prev, cur) {
                return prev && cur;
            }, true)) return;
            this.chart.setOption((_window$Utils2 = window.Utils).drawStateMap.apply(_window$Utils2, _toConsumableArray(this.props.value)));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this18 = this;

            return React.createElement(
                'div',
                null,
                React.createElement('div', { id: 'StateMap', ref: function ref(el) {
                        return _this18.el = el;
                    } })
            );
        }
    }]);

    return StateMap;
}(React.Component);

/* 项目组件 交互核心 
    window.Method.refresh=this.refresh
*/


var Project = function (_React$Component12) {
    _inherits(Project, _React$Component12);

    function Project(props) {
        _classCallCheck(this, Project);

        //console.log(this);
        var _this19 = _possibleConstructorReturn(this, (Project.__proto__ || Object.getPrototypeOf(Project)).call(this, props));

        _this19.state = window.project;
        _this19.state.mode = 'view';
        _this19.state.formProjName = 'Untitled';
        _this19.state.formSize1 = 8;
        _this19.state.formSize2 = 8;
        _this19.state.formJ = 1;

        _this19.openProj = _this19.openProj.bind(_this19);
        _this19.createProj = _this19.createProj.bind(_this19);
        window.Method.refresh = _this19.refresh = _this19.refresh.bind(_this19);
        return _this19;
    }

    _createClass(Project, [{
        key: 'openProj',
        value: function openProj() {
            var _this20 = this;

            window.Utils.openProj(this.state.formProjName).then(function (v) {
                _this20.setState(v);
                _this20.setState({ mode: 'view' });
            });
        }
    }, {
        key: 'createProj',
        value: function createProj() {
            var _this21 = this;

            window.Utils.createProj(this.state.formProjName, this.state.formSize1, this.state.formSize2, this.state.formJ).then(function (v) {
                _this21.setState(v);
                _this21.setState({ mode: 'view' });
            });
        }
    }, {
        key: 'auto',
        value: function auto(tar) {
            var delay = tar.value;
            window.clearInterval(this.timer);
            delay = Number(delay);
            if (delay > 0) this.timer = window.setInterval(this.refresh, delay);
            if (delay === -2) {
                this.refresh();
                tar.value = '-1';
            }
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var _this22 = this;

            window.Utils.openProj(this.state.projName).then(function (v) {
                return _this22.setState(v);
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.clearInterval(this.timer);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this23 = this;

            var ui = {
                list: [['项目名: ', React.createElement('input', { className: 'pure', value: this.state.formProjName, onChange: function onChange(e) {
                        return _this23.setState({ formProjName: e.target.value });
                    } })], ['模型尺寸: ', this.state.size.join('x')], ['相互作用能 J: ', this.state.J]],
                btn: [['取消', function () {
                    _this23.setState({ mode: 'view' });
                }, '#f44336']]
            };
            switch (this.state.mode) {
                case 'view':
                    ui.title = '项目状态';
                    ui.list[0][1] = this.state.projName || '——';
                    ui.list.push(['模型ID: ', this.state.ID.join(' , ')]);
                    this.state.projName.length > 0 && ui.list.push(['自动刷新: ', React.createElement(
                        'select',
                        { className: 'pure', defaultValue: '-1', onChange: function onChange(e) {
                                return _this23.auto(e.target);
                            } },
                        React.createElement(
                            'option',
                            { value: '-1' },
                            '\u5173'
                        ),
                        React.createElement(
                            'option',
                            { value: '-2' },
                            '\u7ACB\u5373\u5237\u65B0'
                        ),
                        React.createElement(
                            'option',
                            { value: '10000' },
                            '10s'
                        ),
                        React.createElement(
                            'option',
                            { value: '5000' },
                            '5s'
                        ),
                        React.createElement(
                            'option',
                            { value: '3000' },
                            '3s'
                        )
                    )]);
                    ui.btn = [['创建项目', function () {
                        _this23.setState({ mode: 'create' });
                    }, window.Theme], ['打开项目', function () {
                        _this23.setState({ mode: 'open' });
                    }, window.Theme]];break;
                case 'open':
                    ui.title = '打开项目';
                    ui.list = [ui.list[0]];
                    ui.btn.push(['确定', this.openProj, window.Theme]);break;
                case 'create':
                    ui.title = '创建项目';
                    ui.list[1][1] = [React.createElement('input', { className: 'pure', value: this.state.formSize1, type: 'number', step: '8', min: '8', key: '0', onChange: function onChange(e) {
                            _this23.setState({ formSize1: Number(e.target.value) });
                        } }), 'x', React.createElement('input', { className: 'pure', value: this.state.formSize2, type: 'number', step: '8', min: '8', key: '1', onChange: function onChange(e) {
                            return _this23.setState({ formSize2: Number(e.target.value) });
                        } })];
                    ui.list[2][1] = React.createElement('input', { className: 'pure', value: this.state.formJ, type: 'number', onChange: function onChange(e) {
                            return _this23.setState({ formJ: Number(e.target.value) });
                        } });
                    ui.btn.push(['确定', this.createProj, window.Theme]);break;
            }
            return React.createElement(
                'div',
                { id: 'Project' },
                React.createElement(
                    'ul',
                    { className: 'shadow' },
                    React.createElement(
                        'li',
                        { style: { fontWeight: 'bold', margin: '0.1rem 0.5rem' } },
                        ui.title
                    ),
                    ui.list.map(function (v, i) {
                        return React.createElement(
                            List,
                            { key: i, label: v[0] },
                            v[1]
                        );
                    }),
                    React.createElement(
                        'li',
                        { style: { textAlign: 'center' } },
                        ui.btn.map(function (v, i) {
                            return React.createElement(Btn, { R: i === 1, key: i, bg: v[2], click: v[1], value: v[0] });
                        })
                    )
                ),
                React.createElement(StateMap, { value: [this.state.kT, this.state.kT_done, this.state.uB, this.state.uB_done, this.state.doing] })
            );
        }
    }]);

    return Project;
}(React.Component);

/* App */


var App = function (_React$Component13) {
    _inherits(App, _React$Component13);

    function App() {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { id: 'App' },
                React.createElement(Navigation, null),
                React.createElement(Wins, { defaultVal: 'project', value: window.wins }),
                React.createElement(Popups, { defaultVal: null, value: window.popups })
            );
        }
    }]);

    return App;
}(React.Component);