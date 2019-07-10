"use strict";
// 曾棠 何嘉敏 还记得我吗？
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// cc.Class({
//     extends: cc.Component,

//     properties: {
//     },

//     __preload () {

// cc.log("hjm") 
window.ai = {};

window._hjm = null;
window.hjm = null;
(function () {
    window._hjm1 = null; // 变量提前，防止出意外

///////////////.... 
    var _dylDefaultTab = {}; // name: value
    var _dylDefaultGroup = { _dylAll: [[], [], [], []] }; // groupName: [直接赋值名字数组，对象名字数组，数组名字数组，假对象名字数组]


    var _dylCopyArrFun = function (arr) {
        var newArr = [];
        for (var i = 0; i < arr.length; i++) {
            newArr.push(arr[i]);
        }
        return newArr;
    }

    var _dylCopyTabFun = function (tab) {
        var newTab = {};
        for (var i in tab) {
            newTab[i] = tab[i];
        }
        return newTab;
    }

    var _dylPushDefaultToGroupFun = function (groupName, name, arrId) {
        if (!_dylDefaultGroup[groupName]) {
            _dylDefaultGroup[groupName] = [[], [], [], []];
        }
        _dylDefaultGroup[groupName][arrId].push(name);
    }

    var _dylResetDefaultFun = function (arr) {
        var arr0 = arr[0];
        var arr1 = arr[1];
        var arr2 = arr[2];
        var arr3 = arr[3];

        // 直接赋值
        for (var i = arr0.length - 1; i >= 0; i--) {
            var name = arr0[i];
            _hjm[name] = _dylDefaultTab[name];
        }

        // 直接赋值对象， 复制对象
        for (var i = arr1.length - 1; i >= 0; i--) {
            var name = arr1[i];
            _hjm[name] = _dylDefaultTab[name];
            _dylDefaultTab[name] = _dylCopyTabFun(_dylDefaultTab[name]);
        }

        // 直接赋值数组， 复制数组
        for (var i = arr2.length - 1; i >= 0; i--) {
            var name = arr2[i]
            _hjm[name] = _dylDefaultTab[name];
            _dylDefaultTab[name] = _dylCopyArrFun(_dylDefaultTab[name]);    
        }

        // 这是假对象， 不需要复制对象的
        for (var i = arr3.length - 1; i >= 0; i--) {
            var name = arr3[i];
            var tmpTab = _dylDefaultTab[name];
            for (var id in tmpTab) {
                _hjm[name][id] = tmpTab[id];
            }
        }
    }

/////////////..............

    var tab = {};
    var hasTab = {}; // 只是保存
    var pngRes = {};

    var arrTab = {}; // 保存数组类型的
    var objTab = {}; // 保存对象类型

    var getLab = function getLab(node) {
        // let lab = node.getComponent(cc.Label);
        var name = node.name;
        if (name[0] === "_") {
            tab[node.name] = node;
            hasTab[node.name] = true;
        } else {
            var stringArr = name.split("_");
            if (stringArr[0] === "hjm" && stringArr.length !== 1) {
                var tmpLab = node.getComponent(cc.Label);
                tab[stringArr[1]].labArr.push(tmpLab);
                tmpLab.string = String(tab[stringArr[1]].get());
            }
        }
        var arr = node.getChildren();
        for (var i = arr.length - 1; i >= 0; i--) {
            getLab(arr[i]);
        }
    };

    var removeLab = function removeLab() {
        for (var i in tab) {
            // 把前一个场景保存的节点删了
            if (i[0] === "_") {
                tab[i] = null;
                hasTab[i] = false;
            }
            else if (tab[i].labArr){
                tab[i].labArr = [];
            }
        }
    };

    var hjmInit = function hjmInit() {
        removeLab();
        var node = cc.director.getScene().getChildren()[0];
        getLab(node);
        // if (isNaN(Number(node.name))) {
        //     let tmp = Math.floor(Math.random() * 9987617);
        //     // cc.log("rand number is ", tmp);
        //     dyl.setRand(tmp);
        // }
        // else {
        //     dyl.rand.set(Number(node.name));
        // }
    };

    var loadEnd = function loadEnd() {
        for (var i in pngRes) {
            cc.loader.releaseRes(i, cc.SpriteFrame);
            // if (pngRes[i]) {
            //     cc.loader.releaseRes(i, cc.SpriteFrame);
            //     // delete pngRes[i];
            // } else {
            //     pngRes[i] = true;
            // }
        }
        pngRes = {};
    };

    var _hjm1Fun = function (arg1, arg2) {
        if (arg2 !== undefined) {
            return cc.error("这里我本来只是用来重置hjm的默认值而已，不是设置, 不应该有第二个参数的");
        }
        if (arg1 === undefined) {
            return _dylResetDefaultFun(_dylDefaultGroup._dylAll);
        }
        else {
            return _dylResetDefaultFun(_dylDefaultGroup[arg1]);
        }
    };
    window._hjm1 = new Proxy(_hjm1Fun, {
        get: function get(target, id) {
            hjm = _hjm;
            hjmInit();
            return _hjm[id];
        },

        set: function set(target, id, value) {
            hjm = _hjm;
            hjmInit();
            _hjm[id] = value;
            return true;
        }
    });
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, function () {
        hjm = _hjm1;
        var tmp = Math.floor(Math.random() * 9987617);
        dyl.setRand(tmp);
    });

    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
        // loadEnd();
        if (hjm === _hjm1) {
            hjm = _hjm;
            hjmInit();
        }
    });

    window.initHjmFun = function () {
        // cc.log("initHjmFun");
        // let fun = cc.director.runSceneImmediate;
        // cc.director._l_o_a_d_S_c_e_n_e_ = fun;


        // cc.director.runSceneImmediate = function (...arr) {
        //     this._l_o_a_d_S_c_e_n_e_(arr[0], arr[1], function () {
        //         if (arr[2]) {
        //             arr[2]();
        //         }
        //         removeLab();
        //         var node = cc.director.getScene().getChildren()[0];
        //         getLab(node);
        //         if (isNaN(Number(node.name))) {
        //             let tmp = Math.floor(Math.random() * 9987617);
        //             cc.log("rand number is ", tmp);
        //             dyl.rand.set(tmp);
        //         }
        //         else {
         //             dyl.rand.set(Number(node.name));
        //         }
        //     });
        // };

        var createFun = function createFun(name, defaultValue, groupName) {
            if (defaultValue === undefined) {
                if (name === undefined) {
                    return _dylResetDefaultFun(_dylDefaultGroup._dylAll);
                }
                else {
                    return _dylResetDefaultFun(_dylDefaultGroup[name]);
                }
                return;
            }

            hasTab[name] = true;
            if (Array.isArray(defaultValue)) {
                // 数组包对象，代表是可变对象
                var tmp0 = defaultValue[0];
                if (tmp0 && (typeof tmp0 === "object")) {
                    var data = JSON.parse(dyl.read(name));
                    if (!data) {
                        data = tmp0;
                    }
                    objTab[name] = data;


                    _dylDefaultTab[name] = _dylCopyTabFun(data);
                    if (groupName === undefined) {
                        _dylPushDefaultToGroupFun("_dylAll", name, 1);
                    }
                    else {
                        _dylPushDefaultToGroupFun("_dylAll", name, 1);    
                        _dylPushDefaultToGroupFun(groupName, name, 1);
                    }
                }
                else { // 这个是纯数组
                    var data = JSON.parse(dyl.read(name));
                    if (!data) {
                        data = defaultValue;
                    }
                    arrTab[name] = data;    

                    _dylDefaultTab[name] = _dylCopyArrFun(data);
                    if (groupName === undefined) {
                        _dylPushDefaultToGroupFun("_dylAll", name, 2);
                    }
                    else {
                        _dylPushDefaultToGroupFun("_dylAll", name, 2);    
                        _dylPushDefaultToGroupFun(groupName, name, 2);
                    }
                }
                return;
                // var data = JSON.parse(dyl.read(name));
                // if (!data) {
                //     data = defaultValue;
                // }
                // var newProxy = new Proxy(data, {
                //     set: function set(target, id, value) {
                //         target[id] = value;
                //         dyl.save(name, JSON.stringify(target));
                //         return true;
                //     },
                //     get: function get(target, id) {
                //         return target[id];
                //     }
                // });
                // var _set = function _set(value) {
                //     return cc.error("hjm 无法直接改变原有保存的变量");
                //     // data = value;
                //     // dyl.save("_" + name);
                // };
                // var _get = function _get() {
                //     return newProxy;
                // };
                // tab[name] = {
                //     set: _set,
                //     get: _get
                // };
                // return;
            }
            else if (defaultValue && (typeof defaultValue === "undefined" ? "undefined" : _typeof(defaultValue)) === "object") {
                // var data = JSON.parse(dyl.read(name));
                var data = {};
                var objStr = "_" + name + "_";
                if (dyl.read(objStr)) { // 这个对象曾经保存过了
                    for (var objIndex in defaultValue) {
                        if (typeof defaultValue[objIndex] === "boolean") {
                            data[objIndex] = (dyl.read(objStr + objIndex) > 0);
                        }
                        else {
                            data[objIndex] = dyl.read(objStr + objIndex);
                        }
                        // cc.log(objStr, objIndex, data[objIndex]);
                    }
                }
                else {
                    data = _dylCopyTabFun(defaultValue);
                    // data = defaultValue;
                    for (var objIndex in defaultValue) {
                        if (typeof defaultValue[objIndex] === "boolean") {
                            dyl.save(objStr + objIndex, data[objIndex] ? 1 : 0);
                        }
                        else {
                            dyl.save(objStr + objIndex, data[objIndex]);
                        }
                    }
                    dyl.save(objStr, 1);
                }
                // 给一个函数嵌套，防止局部变量被污染了
                var fun = function () {
                    // 这是保存是否有这个变量的对象，防止赋值错误
                    var varTab = {};
                    for (var i in defaultValue) {
                        varTab[i] = true;
                    }

                    var tmpObjStr = objStr; // 这里保存一份，不然感觉会被污染
                    var newProxy = new Proxy(data, {
                        set: function set(target, id, value) {
                            if (!varTab[id]) {
                                return cc.error(name + " 这个对象并没有", id, "这个变量");
                            }
                            target[id] = value;
                            // dyl.save(name, JSON.stringify(target));
                            if (typeof defaultValue[id] == "boolean") {
                                dyl.save(tmpObjStr + id, value ? 1 : 0);
                            }
                            else {
                                dyl.save(tmpObjStr + id, value);
                            }
                            return true;
                        },
                        get: function get(target, id) {
                            return target[id];
                        }
                    });
                    var _set = function _set(value) {
                        return cc.error("hjm 无法直接改变原有保存的变量");
                        // data = value;
                        // dyl.save("_" + name);
                    };
                    var _get = function _get() {
                        return newProxy;
                    };
                    tab[name] = {
                        set: _set,
                        get: _get
                    };
                };
                fun();

                _dylDefaultTab[name] = defaultValue;
                if (groupName === undefined) {
                    _dylPushDefaultToGroupFun("_dylAll", name, 3);
                }
                else {
                    _dylPushDefaultToGroupFun("_dylAll", name, 3);    
                    _dylPushDefaultToGroupFun(groupName, name, 3);
                }
                return;
            } else if (typeof defaultValue === "boolean") {
                var str = dyl.read(name);
                if (typeof str !== "number") {
                    str = defaultValue;
                }
                else {
                    str = (str > 0);
                }
                var _set3 = function _set3(value) {
                    // if (typeof value === "function") {
                    //     tab[name].notify = value;
                    //     return;
                    // }
                    if (typeof value !== "boolean") {
                        return cc.warn("hjm", name, "这个变量应该是bool类型，而你的设置是", value);
                    }
                    dyl.save(name, value ? 1 : 0);
                    var oldValue = str;
                    str = value;
                    for (var i = tab[name].labArr.length - 1; i >= 0; i--) {
                        tab[name].labArr[i].string = String(value);
                    }
                    tab[name].notify(value, oldValue, tab[name].labArr);
                    for (var i = tab[name].funArr.length - 1; i >= 0; i--) {
                        tab[name].funArr[i](value, oldValue, tab[name].labArr);
                    }
                };
                var _get3 = function _get3() {
                    return str;
                };
                tab[name] = {
                    set: _set3,
                    get: _get3,
                    labArr: [],
                    notify: function (newValue, oldValue, labArr) {},
                    funArr: [] // 这是notify的数组形式，只给个人库的代码使用
                };

                _dylDefaultTab[name] = defaultValue;
                if (groupName === undefined) {
                    _dylPushDefaultToGroupFun("_dylAll", name, 0);
                }
                else {
                    _dylPushDefaultToGroupFun("_dylAll", name, 0);    
                    _dylPushDefaultToGroupFun(groupName, name, 0);
                }
                return;
            } else if (typeof defaultValue === "string") {
                var str = dyl.read(name);
                if (typeof str !== "string") {
                    str = defaultValue;
                }
                var _set2 = function _set2(value) {
                    // if (typeof value === "function") {
                    //     tab[name].notify = value;
                    //     return;
                    // }

                    dyl.save(name, value);
                    var oldValue = str;
                    str = value;
                    for (var i = tab[name].labArr.length - 1; i >= 0; i--) {
                        tab[name].labArr[i].string = String(value);
                    }
                    tab[name].notify(value, oldValue, tab[name].labArr);
                    for (var i = tab[name].funArr.length - 1; i >= 0; i--) {
                        tab[name].funArr[i](value, oldValue, tab[name].labArr);
                    }
                };
                var _get2 = function _get2() {
                    return str;
                };
                tab[name] = {
                    set: _set2,
                    get: _get2,
                    labArr: [],
                    notify: function (newValue, oldValue, labArr) {},
                    funArr: [] // 这是notify的数组形式，只给个人库的代码使用
                };

                _dylDefaultTab[name] = defaultValue;
                if (groupName === undefined) {
                    _dylPushDefaultToGroupFun("_dylAll", name, 0);
                }
                else {
                    _dylPushDefaultToGroupFun("_dylAll", name, 0);    
                    _dylPushDefaultToGroupFun(groupName, name, 0);
                }
                return;
            }

            var num = dyl.read(name);
            if (typeof num !== "number") {
                num = defaultValue;
            } else {
                num = Number(num);
            }
            var tmpArr = [Math.random() + 0.1, -Math.random() - 0.1, Math.random() + 0.1, Math.random() + 0.1, -Math.random() - 0.1];
            var id = 0;
            var data1 = null;
            var data2 = null;
            var data3 = null;
            var rand1 = 0.1;
            var rand2 = 0.1;

            // var oldValue = num;
            var set = function set(value) {
                // if (typeof value === "function") {
                //     tab[name].notify = value;
                //     return;
                // }
                id++;
                // tab[id].num = value;
                //     dyl.save(id, value);
                //     if (tab[id].lab) {
                //         tab[id].lab.string = String(value);
                //     }
                rand1 = Math.random() + 0.1;
                rand2 = Math.random() + 0.1;
                data1 = value + rand1 * 13 + rand2 * 1000;
                // data2 = value * 3.1 * rand1 + 1573 * rand2;
                // data3 = value * 7.3 * rand2 + 1629 * rand3;
                var i = id % 5;
                data2 = value * tmpArr[i] * rand1 * 13.3 + 31.7;
                i = 4 - (id + 2) % 5;
                data3 = value * tmpArr[i] * rand2 * 51.1 + 91.3;

                var oldValue = num;
                num = value;
                dyl.save(name, value);
                // if (tab[name].lab) {
                //     tab[name].lab.string = String(value);
                // }
                for (var i = tab[name].labArr.length - 1; i >= 0; i--) {
                    tab[name].labArr[i].string = String(value);
                }
                tab[name].notify(num, oldValue, tab[name].labArr);
                for (var i = tab[name].funArr.length - 1; i >= 0; i--) {
                    tab[name].funArr[i](num, oldValue, tab[name].labArr);
                }
            };
            var get = function get() {
                var num1 = data1 - (rand1 * 13 + rand2 * 1000);
                var i = id % 5;
                var num2 = (data2 - 31.7) / (tmpArr[i] * rand1 * 13.3);
                i = 4 - (id + 2) % 5;
                var num3 = (data3 - 91.3) / (tmpArr[i] * rand2 * 51.1);
                if (Math.abs(num1 - num2) > 0.001) {
                    return cc.error("数据1出现异常");
                }
                if (Math.abs(num1 - num3) > 0.001) {
                    return cc.error("数据2出现异常");
                }
                return num;
            };
            tab[name] = {
                get: get,
                set: set,
                labArr: [], // 这次改为多个，可能不只是一个地方有这个数字
                notify: function (newValue, oldValue, labArr) {},
                funArr: []
            };
            set(num);

            _dylDefaultTab[name] = defaultValue;
            if (groupName === undefined) {
                _dylPushDefaultToGroupFun("_dylAll", name, 0);
            }
            else {
                _dylPushDefaultToGroupFun("_dylAll", name, 0);    
                _dylPushDefaultToGroupFun(groupName, name, 0);
            }
        };

        _hjm = new Proxy(createFun, {
            get: function get(target, id) {
                if (arrTab[id]) {
                    return arrTab[id];
                }
                if (objTab[id]) {
                    return objTab[id];
                }

                if (!hasTab[id]) {
                    cc.warn("hjm 没有", id, "这个属性");
                    return;
                }
                if (id[0] === "_") {
                    // if (!tab[id]) {
                    //     cc.warn("没有", id, "这个节点");
                    // }
                    return tab[id];
                }
                // return tab[id].num;
                // cc.log("id", id);
                return tab[id].get();
            },

            set: function set(target, id, value) {
                var type = typeof value === "undefined" ? "undefined" : _typeof(value);
                if (type === "number" || type === "string" || type === "boolean") {
                    if (!hasTab[id]) {
                        cc.warn("hjm 没有", id, "这个属性");
                        return true;
                    }
                    if (id[0] === "_") {
                        cc.warn("hjm 这是保存节点的", id);
                        return true;
                    }
                    // tab[id].num = value;
                    // dyl.save(id, value);
                    // if (tab[id].lab) {
                    //     tab[id].lab.string = String(value);
                    // }
                    tab[id].set(value);
                } else if (typeof value === "function") {
                    if (tab[id] && tab[id].notify) {
                        tab[id].notify = value;
                    }
                    else {
                        cc.warn("hjm 这个属性不存在或不能设置函数", id);
                    }
                    return true;
                } else if (typeof value.getChildren === "function"){
                    var node = value;
                    // cc.log(type, id, node);
                    // var mylog = function (logstr) {
                    //     if (id === "polarBear") {
                    //         cc.log(logstr);
                    //     }
                    // }
                    let pathStr = node.dylSpriteNodeName ? node.dylSpriteNodeName : node.name;
                    pngRes[pathStr + "/" + id] = true;
                    // if (pngRes[node.name + "/" + id]) {
                    //     mylog(2222222);
                    //     pngRes[node.name + "/" + id] = false; //这代表是当前场景用到上个场景的图片,不能被删除
                    //     mylog(333333);
                    // } else {
                    //     mylog(4444);
                    //     pngRes[node.name + "/" + id] = true; //这代表只是上个场景要用到，当前场景不要了
                    //     mylog(55555);
                    // }
                    // mylog(666666);
                    cc.loader.loadRes(pathStr + "/" + id, cc.SpriteFrame, function (err, spr) {
                        if (!cc.isValid(node)) {
                            return true;
                        }
                        if (err) {
                            cc.log("err", err);    
                        }
                        // cc.log("err", err);
                        var sprite = node.getComponent(cc.Sprite);
                        sprite.spriteFrame = spr;
                    });
                } else if (Array.isArray(value)) {

                    // 节点 数组赋值法
                    if (id[0] === "_" && tab[id]) {
                        if (Array.isArray(value)) {
                            var tmpNode = tab[id];
                            for (var i = 0; i < value.length; i++) {
                                var tmpValue = value[i];
                                if (typeof tmpValue === "number") { // 透明度
                                    tmpNode.opacity = tmpValue;
                                }
                                else if (typeof tmpValue === "boolean") {
                                    tmpNode.active = tmpValue;
                                }
                                else if (Array.isArray(tmpValue)) {
                                    if (tmpValue.length > 1) { // [n1, n2] 缩放
                                        tmpNode.scale = cc.v2(tmpValue[0], tmpValue[1]);
                                    }
                                    else { // [num] 旋转角度
                                        tmpNode.rotation = tmpValue[0];
                                    }
                                }
                                else if (cc.js.getClassName(tmpValue) === "cc.Vec2") { // 位置
                                    tmpNode.position = tmpValue;
                                }
                                else if (cc.js.getClassName(tmpValue) === "cc.Color") {
                                    tmpNode.color = tmpValue;
                                }
                                else {
                                    cc.error("这个参数类型没有考虑过", tmpValue);
                                }
                            }
                        }
                        return true;
                    }

                    if (!arrTab[id]) {
                       return cc.warn("hjm 的arrTab没有定义过这个属性", id);
                    }
                    dyl.save(id, JSON.stringify(value));
                    arrTab[id] = value;
                } 
                else { // 这个是纯对象的
                    if (!objTab[id]) {
                       return cc.warn("hjm 的objTab没有定义过这个属性", id);
                    }
                    dyl.save(id, JSON.stringify(value));
                    objTab[id] = value;
                }
                return true;
            }
        });
    };
})();

window._hjmAddArrFun = function (name, fun) {
    tab[name].funArr.push(fun);
};

window._hjmDelArrFun = function (name, fun) {
    var index = tab[name].funArr.indexOf(fun);
    if (index === -1) {
        return cc.error("没有这个函数");
    }
    tab[name].funArr.splice(index, 1);
};

if (window.initHjmDataFun && window.isCryptoJS && window.initDylFun) {
    cc.log("init hjm");
    window.initDylFun(window.isCryptoJS);
    window.initHjmFun();
    var ___ttt = hjm;
    hjm = _hjm;
    window.initHjmDataFun();
    hjm = ___ttt;
}

// },
// });