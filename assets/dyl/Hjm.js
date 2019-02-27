"use strict";
// 谭珍
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
var tab = {};
var hasTab = {}; // 只是保存
var pngRes = {};
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

window._hjm1 = new Proxy({}, {
    get: function get(target, id) {
        hjm = _hjm;
        hjmInit();
        return _hjm[id];
    },

    set: function set(target, id, value) {
        hjm = _hjm;
        hjmInit();
        _hjm[id] = value;
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

    var createFun = function createFun(name, defaultValue) {
        hasTab[name] = true;
        if (Array.isArray(defaultValue)) {
            var data = JSON.parse(dyl.read(name));
            if (!data) {
                data = defaultValue;
            }
            var newProxy = new Proxy(data, {
                set: function set(target, id, value) {
                    target[id] = value;
                    dyl.save(name, JSON.stringify(target));
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
            return;
        }
        else if (defaultValue && (typeof defaultValue === "undefined" ? "undefined" : _typeof(defaultValue)) === "object") {
            // var data = JSON.parse(dyl.read(name));
            var data = {};
            var objStr = "_" + name + "_";
            if (dyl.read(objStr)) {
                for (var objIndex in defaultValue) {
                    data[objIndex] = dyl.read(objStr + objIndex);
                    // cc.log(objStr, objIndex, data[objIndex]);
                }
            }
            else {
                data = defaultValue;
                for (var objIndex in defaultValue) {
                     dyl.save(objStr + objIndex, data[objIndex]);
                }
                dyl.save(objStr, true);
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
                        dyl.save(tmpObjStr + id, value);
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
            };
            var _get2 = function _get2() {
                return str;
            };
            tab[name] = {
                set: _set2,
                get: _get2,
                labArr: [],
                notify: function (newValue, oldValue, labArr) {}
            };
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
            notify: function (newValue, oldValue, labArr) {}
        };
        set(num);
    };

    _hjm = new Proxy(createFun, {
        get: function get(target, id) {
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
            if (type === "number" || type === "string") {
                if (!hasTab[id]) {
                    cc.warn("hjm 没有", id, "这个属性");
                    return;
                }
                if (id[0] === "_") {
                    cc.warn("hjm 这是保存节点的", id);
                    return;
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
                return;
            }
            else {
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
            }
            return true;
        }
    });
};

if (window.initHjmDataFun && window.isCryptoJS && window.initDylFun) {
    cc.log("init hjm");
    window.initDylFun(window.isCryptoJS);
    window.initHjmFun();
    window.initHjmDataFun();
}

// },
// });