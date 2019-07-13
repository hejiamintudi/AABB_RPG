"use strict";

// var cc = {};

// dyl = dyl ? dyl : {};
// if (!window.dyl) {
//     window.dyl = {};
// }

// cc.Class({
//     extends: cc.Component,

//     properties: {
//     },

//     __preload () {
//         this.dylInit();
//         // let data = dyl.data.enData[name];
//         // this.node.hp = Number(data.hp);
//         // this.node.def = Number(data.def);
//         // this.node.atk = Number(data.atk);
//         // this.node.atkFun = data.atkFun;
//         // this.node.defFun = data.defFun;
//     },


function _toConsumableArray3(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

function _toConsumableArray2(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

var updateFunArr = [];

cc.director.on(cc.Director.EVENT_AFTER_UPDATE, function () {
    var dt = cc.director.getDeltaTime();
    // cc.log(dt, "end");
    for (var i = updateFunArr.length - 1; i >= 0; i--) {
        var fun = updateFunArr[i];
        if (!fun.isRun) {
            continue;
        }
        if (!fun.nowFun(dt)) {
            if (!fun.nowFun.nextFun) {
                fun._dylIsDel = true;   
                updateFunArr[i] = updateFunArr[updateFunArr.length - 1];
                updateFunArr[i].id = i;
                updateFunArr.length--; 
            }
            else {
                fun.nowFun = fun.nowFun.nextFun;
            }
        }
        // if (!updateFunArr[i](dt)) {
        //     updateFunArr[i]._dylIsDel = true;
        //     updateFunArr[i] = updateFunArr[updateFunArr.length - 1];
        //     updateFunArr[i].id = i;
        //     updateFunArr.length--;
        // }
    }
});

cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, function () {
    updateFunArr = [];
    // dyl.setRand((Math.random() * 10000 + 23) >> 0);
    // if (window.dyl) {
    //     window.dyl.setRand(Math.random() * 10000 + 23 >> 0);
    // }
});

window.initDylFun = function (cryptoJS) {
    window.dyl = window.dyl || {};
    window.dyl.__debug = {};
    Object.defineProperty(dyl, "debug", {
        get: function get() {
            return this.__debug["default"];
        },
        set: function set(str) {
            var arr = str.split(" ");
            this.__debug[arr[0]] = arr[arr.length - 1];
            this.__debug["default"] = arr[arr.length - 1];
            cc.log("scene name = ", cc.director.getScene().name);
            cc.director.loadScene(cc.director.getScene().name);
        }
    });

    dyl.getSize = function (node) {
        node = node.node ? node.node : node;
        var size = node.getContentSize();
        var w = size.width;
        var h = size.height;

        return cc.v2(w, h);
    };

    dyl.addMap = function (w, h, fun) {
        var map = [];
        for (var y = 0; y < h; y++) {
            // map[y] = [];
            var arr = [];
            for (var x = 0; x < w; x++) {
                // map[y][x] = fun ? fun(cc.v2(x, y)) : null;
                // cc.log(x, y, map[y][x]);
                var val = fun ? fun(cc.v2(x, y)) : null;
                arr.push(val);
            }

            // map[y].push(arr);
            map.push(arr);
        }
        map.w = w;
        map.h = h;
        map.get = function (p, name) {
            if (!p) {
                return false;
            }
            if (p.x < 0 || p.y < 0 || p.x >= this.w || p.y >= this.h) {
                return false;
            }
            if (!name) {
                return this[p.y][p.x];
            }
            if (this[p.y][p.x]) {
                return this[p.y][p.x][name];
            }
            return this[p.y][p.x];
        };
        map.set = function (p, value) {
            if (!p) {
                return false;
            }
            if (value && value.__classname__ === "cc.Vec2") {
                //交换位置
                var value1 = this.get(p);
                var value2 = this.get(value);
                if (value1 === false || value2 === false) {
                    return cc.warn("有无效的位置");
                }
                this.set(p, value2);
                this.set(value, value1);
                return true;
            }
            if (p.x < 0 || p.y < 0 || p.x >= this.w || p.y >= this.h) {
                // cc.log(p, this.w, this.h);
                cc.warn("p不在地图上");
                return false;
            }
            var ans = map[p.y][p.x];
            map[p.y][p.x] = value;
            return ans;
        };
        map.find = function (value) {
            var ansArr = [];
            if (typeof value === "function") {
                var fun = value;
                for (var y = 0; y < this.h; y++) {
                    for (var x = 0; x < this.w; x++) {
                        if (this[y][x] && fun(this[y][x])) {
                            ansArr.push(cc.v2(x, y));
                        }
                    }
                }
            } else {
                for (var y = 0; y < this.h; y++) {
                    for (var x = 0; x < this.w; x++) {
                        if (this[y][x] === value) {
                            ansArr.push(cc.v2(x, y));
                        }
                    }
                }
            }
            if (!ansArr.length) {
                return null;
            }
            return ansArr;
        };
        map.run = function (fun) {
            if (typeof fun !== "function") {
                var tmpSelf = this;
                var value = fun;
                fun = function fun(p) {
                    if (tmpSelf[p.y][p.x] === value) {
                        return p;
                    }
                };
            }
            var arr = [];
            for (var y = 0; y < this.h; y++) {
                for (var x = 0; x < this.w; x++) {
                    var p = fun(cc.v2(x, y));
                    // (p || p === 0) && arr.push(p);
                    if (p !== undefined) {
                        arr.push(p);
                    }
                }
            }
            return arr;
        };
        return map;
    };

    dyl.addMapLayer = function (w, h, d) {
        var x = (1 - w) * d / 2;
        var y = (1 - h) * d / 2;
        var ori = cc.v2(x, y);
        // cc.log("ori", ori.x, ori.y, w, h, d);
        var fun = function fun(p) {
            //创建函数
            var v = ori.add(p.mul(d));
            // cc.log(v.x, v.y);
            return v;
        };
        var map = this.addMap(w, h, fun);
        map.ori = ori.sub(cc.v2(d / 2, d / 2)); //最左下角
        //map.w = w;
        //map.h = h;
        map.d = d;
        var checkIn = function checkIn(p) {
            var maxX = map.w * map.d / 2;
            var maxY = map.h * map.d / 2;

            return p.x >= -maxX && p.y >= -maxY && p.x < maxX && p.y < maxY;
        };
        map.find = function (p) {
            if (!checkIn(p)) {
                return false;
            }
            p = cc.v2(p.x, p.y);
            p.subSelf(this.ori);
            p.mulSelf(1 / d);
            p.x = Math.floor(p.x);
            p.y = Math.floor(p.y);
            return p;
        };
        map.set = function (nodeMap) {
            var self = this;
            this.run(function (p) {
                var x = p.x;
                var y = p.y;
                if (nodeMap[y][x]) {
                    nodeMap[y][x].setPosition(self[y][x]);
                }
            });
        };
        return map;
    };

    var __randNum = Math.random() * 10000 + 23 >> 0;
    dyl.setRand = function (num) {
        cc.log("seed", num);
        __randNum = num;
    };
    dyl.rand = function (num) {
        // Math.random();
        if (typeof this.__randNum !== "number") {
            this.__randNum = 1;
        }
        var maxNum = 9987618;
        __randNum = (59341 * __randNum + 6541) % maxNum;
        var randNum = __randNum / maxNum;
        if (num) {
            return Math.floor(randNum * num);
        }
        return randNum;
    };

    // dyl.rand.set = function (num) {
    //     __randNum = num;
    // };


    var __encryptFun = function __encryptFun(word) {
        word = String(word);
        var key = cryptoJS.enc.Utf8.parse("woaihejiamin");
        var iv = cryptoJS.enc.Utf8.parse("nihaijidewoma");
        var encrypted = cryptoJS.AES.encrypt(word, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        return cryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    };

    var __decryptFun = function __decryptFun(word) {
        var key = cryptoJS.enc.Utf8.parse("woaihejiamin");
        var iv = cryptoJS.enc.Utf8.parse("nihaijidewoma");
        var decrypt = cryptoJS.AES.decrypt(word, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        var uncrypted = decrypt.toString(cryptoJS.enc.Utf8).toString();
        var uncryptedNum = parseInt(uncrypted);
        if (uncryptedNum == 0 || uncryptedNum) {
            uncrypted = uncryptedNum;
        }
        return uncrypted;
    };

    dyl.save = function (name, data) {
        if (data === 0 || data) {
            // if (name[0] === "_") {
            //     var str = JSON.stringify(data);
            //     cc.sys.localStorage.setItem(name, __encryptFun(str));
            // } else {
            //     cc.sys.localStorage.setItem(name, __encryptFun(data));
            // }
            cc.sys.localStorage.setItem(name, __encryptFun(data));
        } else {
            //删除数据
            cc.sys.localStorage.removeItem(name);
        }
    };
    dyl.read = function (name) {
        // if (name[0] === "_") {
        //     var data = cc.sys.localStorage.getItem(name);
        //     if (!data) {
        //         return data;
        //     }
        //     var str = __decryptFun(data);
        //     return JSON.parse(str);
        // }
        var data1 = cc.sys.localStorage.getItem(name);
        if (!data1) {
            return data1;
        }
        return __decryptFun(data1);
    };
    dyl.key = function (data) {
        var keyOnData = {};
        var keyUpData = {};
        if (data.dir) {
            data.w = function (isOn) {
                return data.dir(isOn, cc.v2(0, 1));
            };
            data.s = function (isOn) {
                return data.dir(isOn, cc.v2(0, -1));
            };
            data.a = function (isOn) {
                return data.dir(isOn, cc.v2(-1, 0));
            };
            data.d = function (isOn) {
                return data.dir(isOn, cc.v2(1, 0));
            };

            data.up = function (isOn) {
                return data.dir(isOn, cc.v2(0, 1));
            };
            data.down = function (isOn) {
                return data.dir(isOn, cc.v2(0, -1));
            };
            data.left = function (isOn) {
                return data.dir(isOn, cc.v2(-1, 0));
            };
            data.right = function (isOn) {
                return data.dir(isOn, cc.v2(1, 0));
            };
        }
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        if (keyOnData[i] === keyUpData[i]) {
                            data[i](true);
                            keyOnData[i] = !keyOnData[i];
                        }
                        return;
                    }
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        data[i](false);
                        keyUpData[i] = keyOnData[i];
                        return;
                    }
                }
            }
        }, cc.director.getScene().getChildren()[0]);
    };

    dyl.keyOn = function (data) {
        var keyOnData = {};
        var keyUpData = {};
        if (data.dir) {
            data.w = function () {
                return data.dir(cc.v2(0, 1));
            };
            data.s = function () {
                return data.dir(cc.v2(0, -1));
            };
            data.a = function () {
                return data.dir(cc.v2(-1, 0));
            };
            data.d = function () {
                return data.dir(cc.v2(1, 0));
            };

            data.up = function () {
                return data.dir(cc.v2(0, 1));
            };
            data.down = function () {
                return data.dir(cc.v2(0, -1));
            };
            data.left = function () {
                return data.dir(cc.v2(-1, 0));
            };
            data.right = function () {
                return data.dir(cc.v2(1, 0));
            };
        }
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        if (keyOnData[i] === keyUpData[i]) {
                            data[i]();
                            keyOnData[i] = !keyOnData[i];
                        }
                        return;
                    }
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        // data[i](false);
                        keyUpData[i] = keyOnData[i];
                        return;
                    }
                }
            }
        }, cc.director.getScene().getChildren()[0]);
    };

    dyl.keyUp = function (data) {
        var keyOnData = {};
        var keyUpData = {};
        if (data.dir) {
            data.w = function () {
                return data.dir(cc.v2(0, 1));
            };
            data.s = function () {
                return data.dir(cc.v2(0, -1));
            };
            data.a = function () {
                return data.dir(cc.v2(-1, 0));
            };
            data.d = function () {
                return data.dir(cc.v2(1, 0));
            };

            data.up = function () {
                return data.dir(cc.v2(0, 1));
            };
            data.down = function () {
                return data.dir(cc.v2(0, -1));
            };
            data.left = function () {
                return data.dir(cc.v2(-1, 0));
            };
            data.right = function () {
                return data.dir(cc.v2(1, 0));
            };
        }
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        if (keyOnData[i] === keyUpData[i]) {
                            // data[i]();
                            keyOnData[i] = !keyOnData[i];
                        }
                        return;
                    }
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        data[i]();
                        keyUpData[i] = keyOnData[i];
                        return;
                    }
                }
            }
        }, cc.director.getScene().getChildren()[0]);
    };

    dyl.addDirArr = function (p) {
        // 499 5479 
        // p = p ? p : cc.v2(0, 0);
        var x = p ? p.x : 0;
        var y = p ? p.y : 0;
        var arr = [cc.v2(x, y + 1), cc.v2(x, y - 1), cc.v2(x + 1, y), cc.v2(x - 1, y)];
        arr.sort(function () {
            return 0.5 - dyl.rand();
        });
        return arr;
    };

    // dyl.run = function () {
    //     var self = this;
    //     // this.node.run = function () {
    //     var root = function root() {};
    //     var node0 = arguments[0];
    //     var endId = 0;
    //     if (node0.parent && node0.getChildren) {
    //         if (!node0.active) {
    //             cc.warn("dyl.run node的active不是true");
    //         }
    //         endId = 0;
    //     } else {
    //         node0 = cc.director.getScene().getChildren()[0];
    //         endId = -1;
    //     }
    //     var createFun = function createFun(act, endFun) {
    //         // let fun = endFun;
    //         var fun = function fun() {
    //             act();
    //             endFun();
    //         };
    //         return fun;
    //     };
    //     var createLogFun = function createLogFun(act, endFun) {
    //         // let fun = endFun;
    //         var fun = function fun() {
    //             // self.node.js[act]();
    //             cc.log(act);
    //             endFun();
    //         };
    //         return fun;
    //     };
    //     var createArr = function createArr(act, endFun) {
    //         var fun = function fun() {
    //             // let counter = dyl.counter(endFun);
    //             var arr = act;
    //             arr.push(function () {
    //                 return null;
    //             });
    //             var counterNum = arr.length;
    //             var delFun = function delFun() {
    //                 counterNum--;
    //                 if (counterNum <= 0) {
    //                     endFun();
    //                 }
    //             };
    //             for (var i = 0; i < arr.length; i++) {
    //                 create(arr[i], function () {
    //                     // counter.del();
    //                     delFun();
    //                 })();
    //             }
    //         };
    //         return fun;
    //     };
    //     var createOther = function createOther(act, endFun) {
    //         // cc.log("createOther", act.node);
    //         var fun = function fun() {
    //             var node = act.node;
    //             if (node.node) {
    //                 node = node.node;
    //                 if (!node.active) {
    //                     cc.warn("dylPre run createOther node active is", node.active);
    //                 }
    //             }
    //             if (act.add && act.add > 0) {
    //                 act.easing(cc.easeIn(act.add));
    //             } else if (act.add && act.add < 0) {
    //                 var inout = cc.easeInOut(-act.add);
    //                 // cc.log("iiiiii", -act.add, inout);
    //                 act.easing(cc.easeInOut(-act.add));
    //             }
    //             var cfun = cc.callFunc(function () {
    //                 endFun();
    //             });
    //             var seq = cc.sequence(act, cfun);
    //             node.runAction(seq);
    //         };
    //         return fun;
    //     };
    //     var createMove = function createMove(act, endFun) {
    //         var fun = function fun() {
    //             var node = node0;
    //             if (node.node) {
    //                 node = node.node;
    //             }
    //             if (act.add && act.add > 0) {
    //                 act.easing(cc.easeIn(act.add));
    //             } else if (act.add && act.add < 0) {
    //                 var inout = cc.easeInOut(-act.add);
    //                 // cc.log("iiiiii", -act.add, inout);
    //                 act.easing(cc.easeInOut(-act.add));
    //             }
    //             var cfun = cc.callFunc(endFun);
    //             var seq = cc.sequence(act, cfun);
    //             node.runAction(seq);
    //         };
    //         return fun;
    //     };
    //     var createDelay = function createDelay(act, endFun) {
    //         var fun = function fun() {
    //             var node = node0;
    //             if (node.node) {
    //                 node = node.node;
    //             }
    //             var delay = cc.delayTime(act);
    //             var cfun = cc.callFunc(endFun);
    //             var seq = cc.sequence(delay, cfun);
    //             node.runAction(seq);
    //         };
    //         return fun;
    //     };
    //     var create = function create(act, endFun) {
    //         // cc.log(act, act.node);
    //         if (typeof act === "function") {
    //             return createFun(act, endFun);
    //         } else if (typeof act === "number") {
    //             return createDelay(act, endFun);
    //         }  else if (Array.isArray(act)) {
    //             return createArr(act, endFun);
    //         } else if (act.node) {
    //             return createOther(act, endFun);
    //         } else if (typeof act === "string") {
    //             return createLogFun(act, endFun);
    //         } else {
    //             return createMove(act, endFun);
    //         }

    //     };
    //     for (var i = arguments.length - 1; i > endId; i--) {
    //         // cc.log("arg", i);
    //         var act = arguments[i];
    //         root = create(act, root);
    //     }
    //     // cc.log("root", root);
    //     root();
    // };

    // 现在改为直接输出原版的复制，包括把 _data的内容也赋值过来了
    dyl.data = function (key, node) {
        var arr = key.split(".");
        var data = dyl._data[arr[0]][arr[1]];
        if (!data) {
            return cc.error("没有这个数据", key);
        }
        // cc.log("data", data, node);
        var ans = {};
        if (node) {
            for (var i in data) {
                if (i !== "_data") {
                    // cc.log(i, data[i]);
                    node[i] = data[i];
                    ans[i] = data[i];
                }
            }
        }
        else {
            for (var i in data) {
                if (i !== "_data") {
                    ans[i] = data[i];
                }
            }

        }
        var _data = data._data;
        for (var i in _data) {
            ans[i] = _data[i];
        }
        // return data._data;
        return ans;
    };

    dyl.process = function (js, arr, isLog) {
        // var isLog = Math.floor(Math.random() * 100) + 4;
        // var isLog = false;
        // isLog = true;

        // 这是给主流程end的一次性包装
        var oneFun = function oneFun(end, funName) {
            var hasRun = false; // 是否已经运行过了
            var fun = function fun() {
                if ((arguments.length <= 0 ? undefined : arguments[0]) === undefined || typeof (arguments.length <= 0 ? undefined : arguments[0]) === "number" || typeof (arguments.length <= 0 ? undefined : arguments[0]) === "string") {
                    if (hasRun) {
                        // 已经运行过了
                        return cc.warn("函数" + funName + "的end 已经用过了，不能再用");
                    }
                    hasRun = true;
                    end.apply(undefined, arguments);
                } else {
                    if (hasRun) {
                        // 已经运行过了
                        return cc.warn("函数" + funName + "的end 已经用过了，不能再用");
                    }
                    end.apply(undefined, arguments);
                }
            };
            return fun;
        };

        // 这是给子程序包装的一次性end
        var once = function (fn, funName) {
            let result = null;
            return  function() { 
                if(fn) {
                    result = fn.apply(this, arguments);
                    fn = null;
                }
                else {
                    cc.warn("子程函数" + funName + "的end 只能使用一次");
                }
                return result;
            };
        }
        // var oneFun = function (end) {
        //     var hasRun = false; // 是否已经运行过了
        //     var fun = function (...arr) {
        //         if (arr[0] === undefined || typeof arr[0] === "number" || typeof arr[0] === "string") {
        //             if (hasRun) { // 已经运行过了
        //                 return cc.warn("这个函数的end 已经用过了，不能再用");
        //             }
        //             hasRun = true;
        //             end(...arr);
        //         }
        //         else {
        //             if (hasRun) { // 已经运行过了
        //                 return cc.warn("这个函数的end 已经用过了，不能再用");
        //             }
        //             end(...arr);
        //         }
        //     }
        //     return fun;
        // }

        var log = function (arr1, arr2) {
            if (cc.sys.isMobile || DylIsFinal) {
                cc.log(arr1, arr2);
                return null;
            }
            var colorTab = {
                流程:   "color:#AD1500;font-weight:bold;",
                子程: "color:#FD9A28;font-weight:bold;",
                读档:   "color:#268AFF;font-weight:bold;",
                存档:   "color:#37DC94;font-weight:bold;",
            }
            var color = colorTab[arr1[1]];
            if (arr1[0] === true) {
                arr1.splice(0,1);
            }
            var argumentArr = [];
            console.log("%c" + String(arr1) + " %c" + String(arr2), "color:#37DC94;font-weight:bold;", color);
            // cc.log(...arr1, arr2);
        }

        var tab = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var counterId = 0;
        var counterArr = [];
        var nextArr = arr;
        var counter = null;

        //用来保存存档数据的，index代表第几个数字的存档，{arr:nextArr, id:存档点在nextArr的index}
        var saveDataArr = [];

        var runChild = function runChild(arg) {
            var i = 0;
            var childCounter = function childCounter() {
                var data = counterArr[i++];
                if (!data) {
                    counterArr.length = 0;
                    return counter(arg);
                }
                if (isLog) {
                    // log([isLog, "childCounter",], data);
                    log([isLog, "子程",], data.name);
                }
                var childJs = data.childJs,
                    name = data.name,
                    arrr = data.arrr;

                // childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
                if (typeof name === "function") {
                    name.apply(undefined, [once(childCounter, "匿名")].concat(_toConsumableArray2(arrr)));
                } else if (typeof name === "string") {
                    childJs[name].apply(childJs, [once(childCounter, name)].concat(_toConsumableArray(arrr)));
                } else {
                    cc.warn("dyl process 子进程的函数参数出错了，不是函数，也不是字符串");
                }
            };
            childCounter();
        };

        var run = function run(branch) {
            //行动
            if (counterArr.length > 0) {
                return runChild(branch);
            }
            var name = nextArr[counterId++];

            //先判断是否要去存档点
            if (typeof branch === "number") {
                if (isLog) {
                    log([isLog, "读档"], branch);
                }

                var id = branch;
                var saveData = saveDataArr[id];
                // cc.log("read", branch, saveData);
                if (!saveData) {
                    return cc.warn("没有这个存档点", id);
                }
                nextArr = saveData.arr;
                counterId = saveData.id;
                return counter();
            }

            if (isLog) {
                if (typeof name === "number" && name > 0) {
                    log([isLog, "存档"], name);
                }
                else if (typeof name === "number" && name < 0) {
                    log([isLog, "读档"], name);
                }
                else {
                    log([isLog, "流程"], name);
                }
            }

            if (!name) {
                //结束了
                return;
            }

            // 正数代表存档，负数代表读档（读正数的档)
            if (typeof name === "number") {
                if (name < 0) {
                    return run(-name);
                }

                var saveData = {
                    arr: nextArr,
                    id: counterId
                };
                saveDataArr[name] = saveData;
                // cc.log("save", name, saveData);
                return counter();
            } else if (typeof name === "string") {
                if (branch) {
                    return cc.error("正常的运行，应该没有分支才对，是不是哪里逻辑出问题了");
                }
                //代表函数
                if (!js[name]) {
                    //如果没有那就跳到下一个函数，有时候用来分支而已，未必是函数
                    return counter();
                }
                return js[name](oneFun(counter, name));
            } else if (typeof name === "function") {
                if (branch) {
                    return cc.error("正常的运行，应该没有分支才对，是不是哪里逻辑出问题了");
                }
                return name(oneFun(counter, "匿名"));
            }

            //下面是数组，代表分支
            if (!branch) {
                return cc.error("数组是分支，这里应该有一个表示分支的参数");
            }
            for (var i = counterId - 1; i < nextArr.length; i++) {
                var arr = nextArr[i];
                if (!Array.isArray(arr)) {
                    return cc.error("dyl.process 这里是分支内容，后面的参数应该都是数组，这里参数不对");
                }
                if (arr[0] === branch) {
                    nextArr = arr;
                    counterId = 0;
                    return counter();
                }
            }
            // ///下面是子对象了
            // for (var i in name) {
            //     var next = js[i](counter);
            //     nextArr = name[i][next];
            //     if (!nextArr) {
            //         //找不到了，就是相当于结束流程
            //         return;
            //     }
            //     counterId = 0;
            //     counter();
            // }
        };

        var addChild = function addChild(childJs, name, arrr) {
            counterArr.push({
                childJs: childJs,
                name: name,
                arrr: arrr
            });
        };

        counter = function counter(childJs, name) {
            if (!childJs) {
                run();
            } else if (typeof childJs === "function") {
                run();
            } else if (typeof childJs === "string" || typeof childJs === "number") {
                run(childJs);
            } else {
                for (var _len = arguments.length, arrr = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                    arrr[_key - 2] = arguments[_key];
                }

                addChild(childJs, name, arrr);
            }
        };
        for (var i in tab) {
            counter[i] = tab[i];
        }

        counter();
        return counter;
    };

    // dyl.process = function (js, arr) {
    //     // var isLog = Math.floor(Math.random() * 100) + 4;
    //     var isLog = false;

    //     var tab = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    //     var counterId = 0;
    //     var counterArr = [];
    //     var nextArr = arr;
    //     var counter = null;

    //     var runChild = function runChild() {
    //         var i = 0;
    //         var childCounter = function childCounter() {
    //             var data = counterArr[i++];
    //             if (isLog) {
    //                 cc.log(isLog, "childCounter", data);
    //             }
    //             if (!data) {
    //                 counterArr.length = 0;
    //                 return counter();
    //             }
    //             var childJs = data.childJs,
    //                 name = data.name,
    //                 arrr = data.arrr;

    //             // childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
    //             if (typeof name === "function") {
    //                 name.apply(undefined, [childCounter].concat(_toConsumableArray2(arrr)));
    //             } else if (typeof name === "string") {
    //                 childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
    //             } else {
    //                 cc.warn("dyl process 子进程的函数参数出错了，不是函数，也不是字符串");
    //             }
    //         };
    //         childCounter();
    //     };

    //     var run = function run() {
    //         //行动
    //         if (counterArr.length > 0) {
    //             return runChild();
    //         }
    //         var name = nextArr[counterId++];
    //         if (isLog) {
    //             cc.log(isLog, "counter", name);
    //         }
    //         if (!name) {
    //             //结束了
    //             return;
    //         }
    //         if (typeof name === "string") {
    //             //代表函数
    //             return js[name](counter);
    //         }
    //         else if (typeof name === "function") {
    //             return name(counter);
    //         }

    //         ///下面是子对象了
    //         for (var i in name) {
    //             var next = js[i](counter);
    //             nextArr = name[i][next];
    //             if (!nextArr) {
    //                 //找不到了，就是相当于结束流程
    //                 return;
    //             }
    //             counterId = 0;
    //             counter();
    //         }
    //     };

    //     var addChild = function addChild(childJs, name, arrr) {
    //         counterArr.push({
    //             childJs: childJs,
    //             name: name,
    //             arrr: arrr
    //         });
    //     };

    //     counter = function counter(childJs, name) {
    //         if (!childJs) {
    //             run();
    //         } else {
    //             for (var _len = arguments.length, arrr = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    //                 arrr[_key - 2] = arguments[_key];
    //             }

    //             addChild(childJs, name, arrr);
    //         }
    //     };
    //     for (var i in tab) {
    //         counter[i] = tab[i];
    //     }

    //     counter();
    // };

    // 参数 空 函数 函数数组：如果函数不是被迫结束，那函数结束时会执行下一个函数
    // 返回函数 参数 空：停止 函数：替换 函数数组：在后面添加
    // fun nowFun:当前update运行的函数 nextFun:nowFun完了就要进入的下一个函数 endFun:最后一个fun
    dyl.update = function (arg) {
        var fun = null;
        if (arg && (typeof arg === "function")) {
            fun = arg;
            fun.nowFun = fun;
            fun.endFun = fun;

            fun.isRun = true;

            fun.id = updateFunArr.length;
            updateFunArr.push(fun);
        }
        else if (arg && (Array.isArray(arg)) && (arg.length > 0)) {
            var arr = arg;
            fun = arr[0];
            fun.nowFun = fun;
            fun.endFun = arr[arr.length - 1];

            fun.isRun = true;

            for (var i = 0; i < arr.length - 1; i++) {
                arr[i].nextFun = arr[i + 1];
            }

            fun.id = updateFunArr.length;
            updateFunArr.push(fun);
        }
        var delFun = function delFun(newFun) {
            var isRun = true; // 以fun为标准，如果fun为空，那就用这个代替
            if (typeof newFun === "boolean") { // 是否在update里面运行
                if (fun) {
                    fun.isRun = newFun;
                }
                else {
                    isRun = newFun;
                }
                return;
            }
            else if (newFun === null) { // 是否要跳过当前函数
                if (!fun) {
                    return;
                }
                if (!fun.nowFun.nextFun) {
                    fun._dylIsDel = true;   
                    var tmpId = fun.id;
                    updateFunArr[tmpId] = updateFunArr[updateFunArr.length - 1];
                    updateFunArr[tmpId].id = tmpId;
                    updateFunArr.length--; 
                }
                else {
                    fun.nowFun = fun.nowFun.nextFun;
                }
                return;
            }


///////////////////////////////
            if (fun && fun._dylIsDel) {
                isRun = fun.isRun;
                fun = null;
            }


            // 参数是数组
            if (Array.isArray(newFun)) {
                var arr = newFun;
                var id = 0;
                if (!fun) {
                    id++;
                    fun = arr[0];
                    fun.nowFun = fun;
                    fun.endFun = fun;

                    fun.isRun = isRun;

                    fun.id = updateFunArr.length;
                    updateFunArr.push(fun);
                }
                var endFun = fun.endFun;
                for (var i = id; i < arr.length; i++) {
                    endFun.nextFun = arr[i];
                    endFun = arr[i];
                }
                fun.endFun = arr[arr.length - 1];
                return;
            }

            // 参数为空
            if (!newFun) {
                if (fun) {
                    var id = fun.id;
                    updateFunArr[id] = updateFunArr[updateFunArr.length - 1];
                    updateFunArr[id].id = id;
                    updateFunArr.length--;
                    fun = null;
                }
                return;
            }

            // 参数为函数
            if (fun) {
                var id = fun.id;
                updateFunArr[id] = newFun;
                fun = newFun;
                fun.id = id;
                fun.endFun = fun;
                fun.nowFun = fun;
                return;
            }
            else {
                fun = newFun;
                fun.id = updateFunArr.length;
                updateFunArr.push(fun);
                fun.endFun = fun;
                fun.nowFun = fun;

                fun.isRun = isRun;
                return;
            }
            // else if (!fun || fun._dylIsDel) {
            //     // 已经被删除了
            //     fun = null;
            //     return;
            // }
            // // fun._dylIsDel = true;
            // var id = fun.id;
            // updateFunArr[id] = updateFunArr[updateFunArr.length - 1];
            // updateFunArr[id].id = id;
            // updateFunArr.length--;
            // fun = null;
        };
        return delFun;
    };

    dyl.button = function (js, jsNode) {
        jsNode = jsNode ? jsNode : js.node;
        var setButton = function setButton(name, node) {
            var _scale = node.getScale();
            node.on('touchstart', function (event) {
                node.setScale(0.92 * _scale);
            });
            node.on('touchend', function (event) {
                node.setScale(_scale);
                js[name]();
            });
            node.on('touchcancel', function (event) {
                node.setScale(_scale);
            });
        };
        var arr = jsNode.getChildren();
        for (var i = arr.length - 1; i >= 0; i--) {
            var name = arr[i].name;
            var nameArr = name.split("_");
            for (var j = nameArr.length - 1; j >= 0; j--) {
                name = nameArr[j];
                if (typeof js[name] === "function") {
                    setButton(name, arr[i]);
                }
            }
        }
    };

    dyl.load = function () {
        for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            arg[_key2] = arguments[_key2];
        }

        //动态加载节点，参数方式 path arr fun ：path fun ：arr fun
        var getPath = function getPath(str) {
            str = str.split(' ').join('/');
            str = str.split('.').join('/');
            str = str.split('_').join('/');
            str = str.split('-').join('/');
            str = str.split(',').join('/');
            return str;
        };
        if (arg.length === 2 && typeof arg[0] === "string" && typeof arg[1] === "function") {
            var path = getPath(arg[0]);
            cc.loader.loadRes(path, function (err, prefab) {
                if (err) {
                    cc.error(err);
                }
                arg[1](cc.instantiate(prefab));
            });
            return;
        }
        var pathArr = null;
        var fun = null;
        if (arg.length === 2 && Array.isArray(arg[0]) && typeof arg[1] === "function") {
            fun = arg[1];
            pathArr = arg[0];
        } else if (arg.length === 3 && typeof arg[0] === "string" && Array.isArray(arg[1]) && typeof arg[2] === "function") {
            fun = arg[2];
            pathArr = arg[1];
            for (var i = pathArr.length - 1; i >= 0; i--) {
                pathArr[i] = arg[0] + "/" + pathArr[i];
            }
        } else {
            return cc.error("dyl.load 参数有错");
        }
        var nodeArr = [];
        var num = pathArr.length;
        var loadFun = function loadFun(i) {
            var path = getPath(pathArr[i]);
            var id = i;
            cc.loader.loadRes(path, function (err, prefab) {
                if (err) {
                    cc.error(err);
                }
                nodeArr[id] = cc.instantiate(prefab);
                cc.log(id, nodeArr[id]);
                if (! --num) {
                    arg[2](nodeArr);
                }
            });
        };
        for (var i = pathArr.length - 1; i >= 0; i--) {
            loadFun(i);
        }
    };

    // //100 * 100  的物体 dyl.shake(2, 5, 5, hjm._tz);
    // dyl.shake = function (time, w, h, node) {
    //     var x = dyl.rand() * 50 + 30;
    //     var y = dyl.rand() * 50 + 30;
    //     cc.log(x, y);
    //     var t = 0;
    //     var fun = function fun(dt) {
    //         node.setPosition(w * Math.sin(x * t), h * Math.sin(y * t));
    //         t += dt;
    //         if (t >= time) {
    //             node.setPosition(0, 0);
    //             return false;
    //         }
    //         return true;
    //     };
    //     dyl.update(fun);
    // };

    //这是操作缓冲类，主要处理那种，上一个动作还没有做完，就出现下一个输入的情况。这时候可以把这个输入保存，等做完动作再运行
    dyl.buffer = function (actFun, time) {
        // if (typeof actFun !== "function") {
        //     return cc.error("dyl.buffer 参数有错");
        // }
        if (!time) {
            time = 0;
        }
        time = 1000 * time;
        //data 有三种状态 "ing": 正在运行中并且没有新动作加入 null：空闲中 其他：保存的动作
        var buffer = { data: null };
        var id = 0; //这个是唯一标记，防止重复执行的
        buffer.add = function (data) {
            if (!this.data) {
                //空闲中，可以直接执行，不用保存动作
                this.data = "ing";
                return actFun(data);
            }
            this.data = data;
            var i = ++id;
            setTimeout(function () {
                if (i !== id) {
                    return;
                }
                buffer.data = null;
            }, time);
        };

        buffer.del = function (str) {
            ++id;
            // cc.log("del", str);
            if (this.data === "ing") {
                this.data = null;
            } else if (this.data) {
                var tmpData = this.data;
                this.data = "ing";
                actFun(tmpData);
            }
        };

        return buffer;
    };
// 字符串（str + 1变量）： split 切割 (str, str1)
// 字符串 （str + 2 num）： slice (str, start, end)
// 字符串（str + 变量 + 字符串变量））： replace 替换  （str, regexp/substr,replacement）
// 数组（arr +  2 num）: slice (str, start, end)
// 数组（arr + value）：indexOf
// 数组（arr + str + value）： 获得arr里面是对象，并且str属性的值等于value的 id
// 对象 普通获取
// 其他，直接输出原对象

    dyl.get = function (obj, ...arr) {
        if (typeof obj === "string") {
            if (arr.length === 0) {
                return cc.error("后面没有参数，不知道对字符串怎么处理");
            }
            if (arr.length === 1) {
                return obj.split(arr[0]);
            }
            else if (typeof arr[1] === "number") {
                return obj.slice(...arr);
            }
            else {
                return obj.replace(...arr);
            }
        }
        else if (Array.isArray(obj)) {
            if (arr.length === 1) {
                return obj.indexOf(arr[0]);
            }
            else if (typeof arr[0] === "string") {
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i] && (typeof obj[i] === "object") && (obj[i][arr[0]] === arr[1])) {
                        return i;
                    }
                }
                return -1;
            }
            else {
                return obj.slice(...arr);
            }
        }
        else if (obj && (typeof obj === "object")) {
            return obj[arr[0]];
        }
        return obj;
    };

// 数组：splice 替换  （arr, startId, howMany, ...otherArr）
// 对象：直接设置，没有特别地方 (obj, index, value）
    dyl.set = function (obj, ...arr) {
        if (Array.isArray(obj)) {
            obj.splice(...arr);
        }
        else if (obj && typeof obj === "object") {
            obj[arr[0]] = arr[1];
        }
    };

    // dyl.set = function (...arr) {
    //     if (arr.length < 2) {
    //         return cc.error("参数太少了，至少需要两个");
    //     }
    //     let value = arr.pop();
    //     let lastVar = arr.pop();
    //     let data = dyl.get(...arr);
    //     if (!data) {
    //         return;
    //     }
    //     data[lastVar] = value;
    // };

    dyl.notify = function (node, varName, notifyFun) {
        if (typeof varName !== "string") {
            return cc.error("这个属性名不是字符串", varName);
        }
        var value = node[varName];
        Object.defineProperty(node, varName, {
            get: function get() {
                return value;
            },
            set: function set(data) {
                value = notifyFun(data, value);
            }
        });
    };

    // 计数器
    // function (fun, num = 0)
    // 返回函数 count(add = -1)
    // 如果count后num为0，执行fun。如果执行过fun，那再count就会报错
    dyl.counter = function (fun) {
        var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        if (typeof fun !== "function") {
            return cc.warn("counter的参数fun 不是函数", fun);
        } else if (typeof num !== "number") {
            return cc.warn("counter的参数num 不是数字", num);
        }
        var isEnd = false;
        var count = function count() {
            var add = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

            // 因为某些时候，这个add参数为endFun，所以要忽略它，改为默认参数 -1
            if (typeof add !== "number") {
                add = -1;
            }

            if (isEnd) {
                return cc.warn("已经执行完了，不能再算了");
            }
            num += add;
            if (num === 0) {
                isEnd = true;
                fun();
            }
        };
        return count;
    };

    // 操作寄存器,可以存储操作，让动作结束后，才进行下一个操作
    // 返回函数 run (data), data为null，代表动作结束, 否则是添加动作
    dyl.register = function (fun) {
        if (typeof fun !== "function") {
            return console.log("没有执行函数", fun);
        }
        var saveData = null;
        var run = function run(data) {
            if (data === false) {
                return cc.warn("不能保存false的操作");
            }

            // 立马执行下一个动作
            if (!data) {
                if (saveData === null) {
                    return;
                } else if (saveData === false) {
                    saveData = null;
                    return;
                } else {
                    var tmp = saveData;
                    saveData = false;
                    return fun(tmp);
                }
            } else {
                if (saveData === null) {
                    saveData = false;
                    return fun(data);
                } else {
                    saveData = data;
                    return;
                }
            }
        };
        return run;
    };

    dyl.shake = function (node, duration) {
        node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.02, cc.v2(5, 7)), cc.moveTo(0.02, cc.v2(-6, 7)), cc.moveTo(0.02, cc.v2(-13, 3)), cc.moveTo(0.02, cc.v2(3, -6)), cc.moveTo(0.02, cc.v2(-5, 5)), cc.moveTo(0.02, cc.v2(2, -8)), cc.moveTo(0.02, cc.v2(-8, -10)), cc.moveTo(0.02, cc.v2(3, 10)), cc.moveTo(0.02, cc.v2(0, 0)))));

        setTimeout(function () {
            node.stopAllActions();
            node.setPosition(0, 0);
        }, duration * 1000);
    };

// arr (nodeArr, ...arr)
// num:透明度
// [num]: 旋转角度
// [num1, num2]: 缩放
// color, vec2
// bool: active
// {index: value}: 直接修改节点上的某个元素
// fun(id, node) ： 返回值会影响后面的变量
// 函数返回值：上面的参数类型； null：删除当前节点； 节点数组 / 节点：替代当前节点
    dyl.arr = function (nodeArr, ...arr) {
        var tab = {
            funArr: []
        };

        var i = 0;
        // let customTab = {}; // 自定义变量
        for (i = 0; i < arr.length; i++) {
            var value = arr[i];
            var className = null;
            if (value && (typeof value === "object") && (!value.getChildren) && (value.x !== undefined) && (value.y !== undefined)) {
                className = "cc.Vec2";
            }
            else {
                className = cc.js.getClassName(value);
            }

            if (typeof value === "number") { // 透明度
                tab.opacity = value;
            }
            else if (typeof value === "boolean") {
                tab.active = value;
            }
            else if (Array.isArray(value)) {
                if (value.length > 1) { // [n1, n2] 缩放
                    tab.scale = cc.v2(value[0], value[1]);
                }
                else { // [num] 旋转角度
                    tab.rotation = value[0];
                }
            }
            else if (className === "cc.Vec2") { // 位置
                tab.position = value;
            }
            else if (className === "cc.Color") {
                tab.color = value;
            }
            else if (typeof value === "function") {
                tab.funArr.push(value);
            }
            else if (typeof value === "object") {
                for (let id in value) {
                    tab[id] = value[id];
                }
            }
            else {
                cc.error("dyl.arr 这个参数类型没有考虑过", value);
            }

        }
        for (i = 0; i < nodeArr.length; i++) {
            var node = nodeArr[i];
    // 遇到删除，或者替代操作，那就不应该进行下面的赋值操作; 替代删除只能进行一次
            // var isContinue = false; 
            var isDel = false;
            for (var j = 0; j < tab.funArr.length; j++) {
                var value = tab.funArr[j](i, nodeArr[i]);
                var className = null;
                if (value && (typeof value === "object") && (!value.getChildren) && (value.x !== undefined) && (value.y !== undefined)) {
                    className = "cc.Vec2";
                }
                else {
                    className = cc.js.getClassName(value);
                }

                if (typeof value === "number") { // 透明度
                    if (tab.opacity === undefined && i > 0) {
                        return cc.error("之前并没有定义过number，函数返回不能是number, 除非位置是从0开始");
                    }
                    tab.opacity = value;
                }
                else if (typeof value === "boolean") {
                    if (tab.active === undefined && i > 0) {
                        return cc.error("之前并没有定义过bool，函数返回不能是bool, 除非位置是从0开始");
                    }
                    tab.active = value;
                }
                else if (Array.isArray(value) && (typeof value[0] === "number")) {
                    if (value.length > 1) { // [n1, n2] 缩放
                        if (tab.scale === undefined && i > 0) {
                            return cc.error("之前并没有定义过[num1, num2]，函数返回不能是[num1, num2], 除非位置是从0开始");
                        }
                        tab.scale = cc.v2(value[0], value[1]);;
                    }
                    else { // [num] 旋转角度
                        if (tab.rotation === undefined && i > 0) {
                            return cc.error("之前并没有定义过[num]，函数返回不能是[num], 除非位置是从0开始");
                        }
                        tab.rotation = value[0];
                    }
                }
                else if (Array.isArray(value)) {  // 删除并在当前位置补充节点数组
                    // if (isContinue) {
                    //     return cc.error("已经删除过了，不能再删除替代了");
                    // }
                    nodeArr.splice(i, 1, ...value);
                    isDel = true;
                    break;
                    // if (nodeArr.length <= i) { // 已经全部删除了
                    //     return true;
                    // }
                    // node = nodeArr[i];
                }
                else if (value === null) { // 只是删除而已
                    // if (isContinue) {
                    //     return cc.error("已经删除过了，不能再删除替代了");
                    // }
                    nodeArr.splice(i, 1);
                    isDel = true;
                    break;
                    // if (nodeArr.length <= i) { // 已经全部删除了
                    //     return true;
                    // }
                    // node = nodeArr[i];
                }
                else if (className === "cc.Vec2") { // 位置
                    if (tab.position === undefined && i > 0) {
                        return cc.error("之前并没有定义过cc.Vec2，函数返回不能是cc.Vec2, 除非位置是从0开始");
                    }
                    tab.position = value;
                }
                else if (className === "cc.Color") {
                    if (tab.color === undefined && i > 0) {
                        return cc.error("之前并没有定义过cc.Color，函数返回不能是cc.Color, 除非位置是从0开始");
                    }
                    tab.color = value;
                }
                else if (typeof value === "object") {
                    // cc.log("object");
                    for (let id in value) {
                        if (tab[id] === undefined && i > 0) {
                            return cc.error("之前并没有定义过这个id, 除非位置是从0开始", id);
                        }
                        tab[id] = value[id];
                        // cc.log(id, value[id], tab[id]);
                    }
                }
                else if (value === undefined) {
                    continue;
                }
                else {
                    cc.error("dyl.arr 000 这个参数类型没有考虑过", value);
                }
            }

            if (isDel) {
                i--;
                continue;
            }
            // if (isContinue) {
            //     continue;
            // }
            for (var id in tab) {
                // cc.log(id, tab[id])
                if (id === "position") {
                    var x = (tab[id].x === true) ? node.x : tab[id].x;
                    var y = (tab[id].y === true) ? node.y : tab[id].y;
                    node.setPosition(x, y);
                }
                else {
                    // cc.log("node", node, id, tab);
                    node[id] = tab[id];
                }
            }
        }
    };

    // dyl.act = function (node, type, ...arr) {
    //     var resetArg = function (str) { //把变量统一变回对象
    //         if (arr.length < 2) {
    //             return arr[0];
    //         }
    //         return cc[str](...arr);
    //     }
    //     var t1 = 0.1;
    //     var t2 = 0.2;
    //     var act1 = null;
    //     var act2 = null;
    //     if (type === "moveTo") {
    //         var ori = node.getPosition();
    //         act1 = cc.moveTo(t1, resetArg("p"));
    //         act2 = cc.moveTo(t2, ori);
    //     }
    //     else if (type === "fadeTo") {
    //         var ori = node.opacity;
    //         act1 = cc.fadeTo(t1, arr[0]);
    //         act2 = cc.fadeTo(t2, ori);
    //     }
    //     else if (type === "tintTo") {
    //         var ori = node.color;
    //         act1 = cc.tintTo(t1, resetArg("color"));
    //         act2 = cc.tintTo(t2, ori);
    //     }
    //     else if (type === "scaleTo") {
    //         var oriX = node.scaleX;
    //         var oriY = node.scaleY;
    //         act1 = cc.scaleTo(t1, ...arr);
    //         act2 = cc.scaleTo(t2, oriX, oriY);
    //     }
    //     else {
    //         cc.error("dyl.act 这种动作特效，还没有定义", type);
    //     }
    //     var seq = cc.sequence(act1, act2);
    //     node.runAction(seq);
    // };
};

if (window.initHjmDataFun && window.initHjmFun && window.isCryptoJS) {
    cc.log("init dylPre");
    window.initDylFun(window.isCryptoJS);
    window.initHjmFun();
    var ___ttt = hjm;
    hjm = _hjm;
    window.initHjmDataFun();
    hjm = ___ttt;
}

// });