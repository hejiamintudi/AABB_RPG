let Effect = cc.Enum({
    Null: 0,
    SmallBig: 1,
    Red: 2,
    Shake: 3,
});

// let LoadData = cc.Class({
//     name: "LoadData",
//     properties: {
//         path: "",
//         loadArrName: "",
//         parent: cc.Node,
//         callBack: {
//             default: function() {
//                 return new cc.Component.EventHandler;
//             },
//             type: cc.Component.EventHandler,
//         }
//     }
// });


cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/☢ 主逻辑",
        executeInEditMode: true,
        inspector: 'packages://dyl-main/DylMain.js'
    },
    properties: {
        // rand: 0,
        // isBindNode: false,
        touch: "", 
        // run: false,
        // act: {
        //     default: Effect.Null,
        //     type: cc.Enum(Effect)
        // },
        isPhysics: {
            default: false,
            displayName: "物理"
        },
        isShowDebug: {
            default: false,
            displayName: "调试"
        },
        gravity: {
            default: cc.v2(0, -320),
            displayName: "重力"
        },

        // isLoad: {
        //     default: false,
        //     notify() {
        //         this._refresh();
        //     },
        //     visible: false
        // },

        // loadDataArr: { // 是dyl 后面的变量，一个数组，代表要加载的内容
        //     default: [],
        //     type: LoadData,
        //     visible: false,
        //     notify(){
        //         for (let i = 0; i < this.loadDataArr.length; i++) {
        //             let callBack = this.loadDataArr[i].callBack;
        //             if (!callBack.target) {
        //                 callBack.target = this.node;
        //             }
        //         }
        //     }
        // },

        // loadDataCallBack: { //加载完后的函数，一般是启动函数
        //     default: function() {
        //         return new cc.Component.EventHandler;
        //     },
        //     type: cc.Component.EventHandler,
        //     visible: false
        // }, 

    },

    _refresh: function () {
        return;
        if (CC_EDITOR) {
            cc.Class.Attr.setClassAttr(this, 'isShowDebug', 'visible', this.isPhysics);
            // cc.log(2);
            cc.Class.Attr.setClassAttr(this, 'gravity', 'visible', this.isPhysics);
            // cc.log(3);
            // cc.Class.Attr.setClassAttr(this, 'loadData', 'visible', this.isLoad);
            // cc.log(4);
            // cc.Class.Attr.setClassAttr(this, 'loadAfterFun', 'visible', this.isLoad);
            // cc.log(5);
            // cc.Class.Attr.setClassAttr(this, 'loadDataArr', 'visible', this.isLoad);
            // cc.log(6);
            // cc.Class.Attr.setClassAttr(this, 'loadDataCallBack', 'visible', this.isLoad);
            // cc.log("_refresh");
        }
    },

    __preload: function () {
        // dyl.dyl = ["sprs"];
        // dyl.hjm = ["lab1", "lab2", "lab3"];
        if (CC_EDITOR) {
            // setTimeout(()=>this._refresh(), 100);
            // if (!this.loadDataCallBack.target) {
            //     this.loadDataCallBack.target = this.node;
            // }
            // this._refresh();
        }
        else {
            this.myInit();
        }
    },

    // emitCallBack: function(callBack, data) {
    //     let js = callBack.target.getComponent(callBack.component);
    //     js && js[callBack.handler] && js[callBack.handler](data);
    // },

    onEnable: function () {
    },
 
    initPhysics: function () {
        if (!this.isPhysics) {
            return;
        }
        cc.director.getPhysicsManager().enabled = true;
        if (this.isShowDebug) {
            cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
                cc.PhysicsManager.DrawBits.e_pairBit |
                cc.PhysicsManager.DrawBits.e_centerOfMassBit |
                cc.PhysicsManager.DrawBits.e_jointBit |
                cc.PhysicsManager.DrawBits.e_shapeBit;
        }
        else {
            cc.director.getPhysicsManager().debugDrawFlags = 0;
        }
        cc.director.getPhysicsManager().gravity = this.gravity;
    },

    myInit: function () {
        // if (this.isLoad) {
        //     this.setLoad();
        // }
        this.initPhysics();
        // if (this.act !== Effect.Null) {
        //     this.setAct();
        // }
        // if (this.isBindNode) {
        //     this.bindNode(cc.director.getScene().getChildren()[0]);
        // }
        if (this.touch !== "") {
            this.setTouch();
        }
        // if (this.run) {
        //     this.setRun();
        // }
        // if (this.rand) {
        //  this.setRand();
        // }
    },

    // loadArr: function(path, loadArrName, parent, callBack, endFun) {
    //     let arr = dyl[loadArrName];
    //     let ansArr = [];
    //     if (arr.length === 0) {
    //         // callBack(ansArr);
    //         this.emitCallBack(callBack, ansArr);
    //         return;
    //     }
    //     let num = arr.length;
    //     for (let i = arr.length - 1; i >= 0; i--) {
    //         let name = arr[i];
    //         if (path !== "") {
    //             name = path + "/" + name;

    //         }
    //         cc.loader.loadRes(name, (err, prefab)=>{
    //             let node = cc.instantiate(prefab);
    //             ansArr[i] = node;
    //             node.parent = parent;
    //             num--;
    //             if (num === 0) {
    //                 this.emitCallBack(callBack, ansArr);
    //                 endFun();
    //             }
    //         });
    //     }
    // },

    // setLoad: function() {
    //     let num = this.loadDataArr.length;
    //     for (let i = 0; i < this.loadDataArr.length; i++) {
    //         let {path, loadArrName, parent, callBack} = this.loadDataArr[i];
    //         this.loadArr(path, loadArrName, parent, callBack, ()=>{
    //             num--;
    //             if (num === 0) {
    //                 this.emitCallBack(this.loadDataCallBack, null);
    //             }
    //         })
    //     }
    // },


    // setLoad: function () {
    //  this.__loadEnd = false;
    //     let arr = dyl[this.loadData];
    //     let data = {};
    //     let ans = [];
    //     let num = arr.length;

    //     let loadFunArr = [];

    //     this.node.load = (fun)=>{
    //      if (this.__loadEnd) {
    //          return fun(ans);
    //      }
    //      else {
    //          loadFunArr.push(fun);
    //      }
    //      return;
    //     }

    //     let endLoad = ()=>{
    //         for (let i = loadFunArr.length - 1; i >= 0; i--) {
    //             loadFunArr[i](ans);
    //         }
    //         if (this.loadAfterFun && (this.loadAfterFun.handler !== '')) {
    //             this.loadAfterFun.emit();
    //         }
    //     }

    //     for (let i = arr.length - 1; i >= 0; i--) {
    //         let name = arr[i];
    //         if (data[name]) {
    //             let node = cc.instantiate(data[name]);
    //             ans[i] = node;
    //             num--;
    //             if (num === 0) {
    //                 endLoad();
    //             }
    //         }
    //         else {
    //             cc.loader.loadRes(name, (err, prefab)=>{
    //                 data[name] = prefab;
    //                 let node = cc.instantiate(prefab);
    //                 ans[i] = node;
    //                 num--;
    //                 if (num === 0) {
    //                     this.scheduleOnce(endLoad, 0);
    //                 }
    //             });
    //         }
    //     }

    //     this.__loadData = data;
    // },

    onDestroy: function () {    
        let data = this.__loadData;
        for (let i in data) {
            cc.loader.releaseRes(i);
        }
    },

    // bindNode: function (node) {
    //     if (node.name[0] === "_") {
    //         this.node[node.name] = node;
    //     }
    //     let arr = node.getChildren();
    //     for (var i = arr.length - 1; i >= 0; i--) {
    //         this.bindNode(arr[i]);
    //     }
    // },

    setTouch: function () {
        let node = this.node;

        let dylTouchState = this.node.touch;
        let dylTouchArgArr = [];
        Object.defineProperty(this.node, "touch", {
            get: function () {
                return dylTouchState;
            },
            set: function (data) {
                if (Array.isArray(data)) {
                    [dylTouchState, ...dylTouchArgArr] = data;
                }
                else {
                    dylTouchState = data;
                    dylTouchArgArr = [];
                }
                if (typeof dylTouchState !== "string") {
                    cc.warn("touch的状态应该是字符串，这里却不是", typeof dylTouchState, dylTouchState);
                }
            }
        })

        if (!this.node.touch) {
            this.node.touch = "touch";
        }
        let js = this.node.getComponent(this.touch);
        let nowTouchState = this.node.touch;

        let fun = function (event){
            let pos = event.getLocation();
            pos = cc.v2(node.convertToNodeSpace(pos));
            let size = node.getContentSize();
            let [w, h] = [size.width, size.height];
            [w, h] = [w / 2, h / 2];
            pos.subSelf(cc.v2(w, h));

            pos.in = function () { //判断当前节点是否在node里面
                let {x, y} = this;
                let checkIn = function (node) {
                    if (!node) {
                        return null;
                    }
                    node = node.node ? node.node : node;
                    let [nx, ny] = [node.x, node.y];
                    let size = node.getContentSize();
                    let [w, h] = [size.width, size.height];
                    [w, h] = [w / 2, h / 2];
                    w = Math.abs(node.scaleX * w);
                    h = Math.abs(node.scaleY * h);
                    // cc.log(x, y, nx, ny, w, h);
                    return (x >= (nx - w) && x < (nx + w) && y >= (ny - h) && y < (ny + h));
                };
                let len = arguments.length;
                for (let i = 0; i < len; i++) {
                    if (checkIn(arguments[i])) {
                        return arguments[i];
                    }
                }
                return null;
            };
            return pos;
        };

        let data = true;
        let checkData = (tmpName, tmpData)=>{
            if (tmpData && tmpData !== true && !Array.isArray(tmpData)) {
                return cc.warn("touch" + tmpName + "return data 不是true，不是否，也不是数组", dylTouchState, tmpData);
            }
            if (Array.isArray(tmpData)) {
                dylTouchArgArr = tmpData;
            }
        }

        // 添加 LongOn LongUp LongOut LongEnd
        let lastPos_1 = null; // 最后显示的位置, 后面的_1是为了防止跟其他变量重复
        let isHasLong = false; // 是否存在长按操作的函数
        let longId = 0; // 这是查看当前的长按是否存在
        let isOnLong = false; // 是否触发了长按操作
 
        this.node.on("touchstart", function (event) {
            if (!node.touch) {
                data = null;
                return null;
            }
            nowTouchState = node.touch;
            let pos = fun(event);

            longId++;
            lastPos_1 = pos;
            isOnLong = false;
            // 检查是否有长按操作的函数，如果没有就没有必要添加定时器
            isHasLong = js[node.touch + "LongOn"] || js[node.touch + "LongUp"] || js[node.touch + "LongOut"] || js[node.touch + "LongEnd"];
            // let tmpLongId = ++longId;
            if (isHasLong) {
                let tmpLongId = longId;
                setTimeout(()=>{
                    // 如果不是同一个触摸事件，取消
                    if (tmpLongId !== longId) {
                        return;
                    }
                    if (nowTouchState !== node.touch) {
                        return null;
                    }
                    isOnLong = true;
                    if (js[node.touch + "LongOn"]) {
                        data = js[node.touch + "LongOn"](lastPos_1, ...dylTouchArgArr);
                    }
                    else {
                        data = true;
                    }
                    checkData("on", data);
                }, 500);
            }

            if (js[node.touch + "On"]) {
                data = js[node.touch + "On"](pos, ...dylTouchArgArr);
            }
            else {
                data = true;
            }
            // if (data && data !== true && !Array.isArray(data)) {
            //     return cc.warn("touchOn return data 不是true，不是否，也不是数组", dylTouchState, data);
            // }
            // if (Array.isArray(data)) {
            //     dylTouchArgArr = data;
            // }
            checkData("on", data);
        })

        this.node.on ("touchmove", function (event) {
            if (!data) {
                return null;
            }
            if (nowTouchState !== node.touch) {
                return null;
            }
            let pos = fun(event);
            lastPos_1 = pos; // 这是给长按用的

            if (js[node.touch + "Move"]) {
                data = js[node.touch + "Move"](pos, ...dylTouchArgArr);
            }
            else {
                data = true;
            }
            // if (data && data !== true && !Array.isArray(data)) {
            //     return cc.warn("touchMove return data 不是true，不是否，也不是数组", dylTouchState, data);
            // }
            // if (Array.isArray(data)) {
            //     dylTouchArgArr = data;
            // }
            checkData("move", data);
        }, this);

        this.node.on ("touchend", function (event) {
            longId++;
            if (!data) {
                return null;
            }
            if (nowTouchState !== node.touch) {
                return null;
            }
            let pos = fun(event);

            // 长按操作会覆盖短按操作
            if (js[node.touch + "LongEnd"] && isOnLong) {
                data = js[node.touch + "LongEnd"](pos, ...dylTouchArgArr);
                checkData("longEnd", data);
                return;
            }
            if (js[node.touch + "LongUp"] && isOnLong) {
                data = js[node.touch + "LongUp"](pos, ...dylTouchArgArr);
                checkData("longUp", data);
                return;
            }

            if (js[node.touch + "End"]) {
                data = js[node.touch + "End"](pos, ...dylTouchArgArr);
                checkData("end", data);
                return;
            }
            if (js[node.touch + "Up"]) {
                data = js[node.touch + "Up"](pos, ...dylTouchArgArr);
                checkData("up", data);
            }
            else {
                data = true;
            }
        }, this);

        this.node.on ("touchcancel", function (event) {
            longId++;
            if (!data) {
                return null;
            }
            if (nowTouchState !== node.touch) {
                return null;
            }
            let pos = fun(event);

            // 长按操作会覆盖短按操作
            if (js[node.touch + "LongEnd"] && isOnLong) {
                data = js[node.touch + "LongEnd"](pos, ...dylTouchArgArr);
                checkData("longEnd", data);
                return;
            }
            if (js[node.touch + "LongOut"] && isOnLong) {
                data = js[node.touch + "LongOut"](pos, ...dylTouchArgArr);
                checkData("longOut", data);
                return;
            }

            if (js[node.touch + "End"]) {
                data = js[node.touch + "End"](pos, data);
                checkData("end", data);
                return;
            }
            if (js[node.touch + "Out"]) {
                data = js[node.touch + "Out"](pos, data);
                checkData("out", data);
            }
            else {
                data = true;
            }
        }, this);
    },

    setRun: function () {
        let self = this;
        this.node.run = function () {
            let root = function (){};
            let node0 = arguments[0];
            let createFun = function (act, endFun) {
                // let fun = endFun;
                let fun = function () {
                    act();
                    endFun();
                }        
                return fun; 
            };
            let createJsFun = function (act, endFun) {
                // let fun = endFun;
                let fun = function () {
                    self.node.js[act]();
                    endFun();
                }        
                return fun; 
            };
            let createArr = function (act, endFun) {
                let fun = function () {
                // let counter = dyl.counter(endFun);
                    let arr = act;
                    arr.push(()=>null);
                    let counterNum = arr.length;
                    let delFun = ()=>{
                        counterNum--;
                        if (counterNum <= 0) {
                            endFun();
                        }
                    }
                    for (let i = 0; i < arr.length; i++) {
                        create(arr[i], ()=>{
                            // counter.del();
                            delFun();
                        })();
                    }
                }
                return fun;
            };
            let createOther = function (act, endFun) {
                // cc.log("createOther", act.node);
                let fun = function () {
                    let node = act.node;
                    if (node.node) {
                        node = node.node;
                    }
                    if (act.add && (act.add > 0)) {
                        act.easing(cc.easeIn(act.add));
                    }
                    else if (act.add && (act.add < 0)) {
                        let inout = cc.easeInOut(-act.add);
                    // cc.log("iiiiii", -act.add, inout);
                        act.easing(cc.easeInOut(-act.add));
                    }
                    let cfun = cc.callFunc(()=>{
                        endFun();
                    });
                    let seq = cc.sequence(act, cfun);
                    node.runAction(seq);
                }
                return fun;
            };
            let createMove = function (act, endFun) {
                let fun = function () {
                    let node = node0;
                    if (node.node) {
                        node = node.node;
                    }
                    if (act.add && (act.add > 0)) {
                        act.easing(cc.easeIn(act.add));
                    }
                    else if (act.add && (act.add < 0)) {
                        let inout = cc.easeInOut(-act.add);
                    // cc.log("iiiiii", -act.add, inout);
                        act.easing(cc.easeInOut(-act.add));
                    }
                    let cfun = cc.callFunc(endFun);
                    let seq = cc.sequence(act, cfun);
                    node.runAction(seq);
                }
                return fun;
            };
            let createDelay = function (act, endFun) {
                let fun = function () {
                    let node = node0;
                    if (node.node) {
                        node = node.node;
                    }
                    let delay = cc.delayTime(act);
                    let cfun = cc.callFunc(endFun);
                    let seq = cc.sequence(delay, cfun);
                    node.runAction(seq);
                }   
                return fun;
            };
            let create = function (act, endFun) {
                // cc.log(act, act.node);
                if (typeof act === "function") {
                    return createFun(act, endFun);
                }
                else if (typeof act === "number") {
                    return createDelay(act, endFun);
                }
                else if (typeof act === "string") {
                    return createJsFun(act, endFun);
                }
                else if (Array.isArray(act)) {
                    return createArr(act, endFun);
                }
                else if (act.node) {
                    return createOther(act, endFun);
                }
                else {
                    return createMove(act, endFun);
                }
            };
            for (let i = arguments.length - 1; i > 0; i--) {
            // cc.log("arg", i);
                let act = arguments[i];
                root = create(act, root);
            }
        // cc.log("root", root);
            root();
        }
    },

    setRand: function () {
        let __randNum = this.rand;
        let maxNum = 4671341;
        this.node.rand = function (n) {
            __randNum = (30853 * __randNum + 253) % maxNum;
            let r = __randNum / maxNum;
            if (n) {
                return Math.floor(r * n);
            }
            else {
                return r;
            }
        }
        this.node.rand.set = function (num) {
            __randNum = num;
        }
    },

    // setAct: function () {
    //     let __oriScale = this.node.getScale();
    //     let {r, g, b} = this.node.color;
    //     let __oriColor = cc.color(r, g, b);
    //     let __seq = null;
    //     let __red = 0;


    //     this.node.act = ()=>{
    //         if (this.act === Effect.SmallBig) {
    //             if (__seq) {
    //                 this.node.stopAction(__seq);
    //                 this.node.setScale(__oriScale);
    //             }
    //             let scale1 = cc.scaleTo(0.2, 1.2 * __oriScale);
    //             scale1.easing(cc.easeQuadraticActionInOut());
    //             let scale2 = cc.scaleTo(0.2, 1 * __oriScale);
    //             scale2.easing(cc.easeQuadraticActionInOut());
    //             let cfun = cc.callFunc(()=>{
    //                 __seq = null;
    //             })
    //             let seq = cc.sequence(scale1, scale2, cfun);
    //             __seq = seq;
    //             this.node.runAction(seq);
    //         }
    //         else if (this.act === Effect.Red) {
    //             __red++;
    //             this.node.color = cc.color(255, 0, 0);
    //             setTimeout(()=>{
    //                 __red--;
    //                 if (!__red) {
    //                     if (cc.isValid(this.node)) {
    //                         this.node.color = __oriColor;
    //                     }
    //                 }
    //             }, 60);
    //         }
    //         else if (this.act === Effect.Shake) {
                
    //         }
    //     }
    // },
});
