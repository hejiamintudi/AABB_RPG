var SceneEnum = cc.Enum({
    Null: 0,
    NextScene: 1,
    NextLevel: 2,
    Restart: 3,
    ExitGame: 4,
    Popup: 5,
    Popdown: 6,
    Buy: 7
})
cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/♎ 按钮",
        executeInEditMode: true,
        inspector: 'packages://dyl-button/DylButton.js',
    },
    properties: {
        touchFun: {
            default: function () {
                return new cc.Component.EventHandler();
            },
            type: cc.Component.EventHandler,
            displayName: "触发事件"
        },
        nodeName: "",
        jsName: "",
        funName: "",
        popupNode: cc.Node,
        popdownNode: cc.Node,

        // clearArr: [cc.String],
        // "Null", "NextScene", "NextLevel", "Restart", "ExitGame", "Popup", "Popdown", "Buy"
        // sceneType: "NextLevel",
        sceneType: {
            default: "NextLevel",
            notify () {
                if (this.sceneType === "Buy") {
                    this.setBuy();
                }
            }
        },
        // sceneType: {
        //     default: SceneEnum.Null,
        //     type: cc.Enum(SceneEnum),
        //     // displayName: ""
        //     notify() {
        //         this._refresh();
        //     }
        // },
        nextScene: "",
        // nextScene: {
        //     default: "",
        //     visible: false,
        //     displayName: "场景名"
        // },

        coin: {
            default: 0,
            displayName: "价格"
        },
        coinName: {
            default: "coin", // 例如：钻石，金币
            displayName: "货币单位"
        },
        toolName: {
            default: "",
            displayName: "物品路径（.隔开）"
        },
        hasSetBuy: false,
        isAutoSave: {
            default: false,
            displayName: "是否要自动保存"
        },
    },

    __preload: function () {
        if (CC_EDITOR) {
            return;
        }
        this.myInit();
    },

    setBuy: function () {
        if (this.hasSetBuy) {
            return;
        }
        this.hasSetBuy = true;
        let node = new cc.Node("noMoney");
        this.node.addChild(node);
        node.addComponent(cc.Sprite);
        node.width = this.node.width;
        node.height = this.node.height;

        node = new cc.Node("coinNum");
        this.node.addChild(node);
        node.addComponent(cc.Label);
        node.lineHeight = this.node.height;
        node.fontSize = 0.8 * this.node.height;

        node = new cc.Node("hasBuy");
        this.node.addChild(node);
        node.addComponent(cc.Sprite);
        node.width = this.node.width;
        node.height = this.node.height;
    },

    getTopNode: function () {
        return cc.director.getScene().getChildren()[0];
    },

    // 获取所有场景名
    getSceneArr: function () {
        return ["aa", "bb"];
        let ansArr = [];
        let sceneInfoArr = cc.game._sceneInfos;
        for (let i = 0; i < sceneInfoArr.length; i++) {
            let url = sceneInfoArr[i].url;
            let arr = url.split("/");
            let name = arr[arr.length - 1];
            name = name.split(".")[0];
            ansArr.push(name);
        }
        return ansArr;
    },

    myInit: function () {
        let self = this;
        let _color = null;
        let _scale = null;
        this.node.on('touchstart', function ( event ) {
            if (self.sceneType === "Buy") {
                return;
            }

            // self.node.color = cc.color(125, 125, 125);
            _scale = self.node.getScale();
            _color = self.node.color;
            self.node.setScale(0.92 * _scale);
        });  
        this.node.on('touchend', function ( event ) {
            // self.node.color = _color;
            if (self.sceneType === "Buy") {
                self.onClick();
                return;
            }

            self.node.setScale(_scale);
            self.onClick();
        });  
        this.node.on('touchcancel', function ( event ) {
            if (self.sceneType === "Buy") {
                return;
            }
            // self.node.color = _color;
            // cc.log("touchcancel", _scale);
            self.node.setScale(_scale);
        }); 

        if (this.sceneType === "Buy") {
            this.initBuy();
        }
    },

    initBuy: function () {
        this.node.add = (...arr)=>{
            for (let i = arr.length - 1; i >= 0; i--) {
                let val = arr[i];
                if (typeof val === "number") {
                    this.coin = val;
                }
                else if (typeof val === "string") {
                    this.toolName = val;
                }
                else if (typeof val === "function") {
                    this.endCheckBuyFun = val;
                }
            }
            this.initBuy1();
        }
        if (this.toolName !== "") {
            this.initBuy1();
            return;
        }
    },

    //  购买add 参数如下： 顺序数量可以随意
    //     价格：数字。 
    //     物品路径： .隔开，来自于数组，或者对象是bool，只能买一个。如果对象是数字可以买多个。 
    //     检测函数： 就要购买成功前的检查，可以控制购买数量等
    initBuy1: function () {
        this.dyl_noMoneyNode = this.node.getChildByName("noMoney");
        let labNode = this.node.getChildByName("coinNum");
        if (labNode) {
            this.dyl_coinNumLab = labNode.getComponent(cc.Label);
            this.dyl_coinNumLab.string = String(this.coin);
            // cc.log("coin", this.coin);
        }
        this.dyl_hasBuyNode = this.node.getChildByName("hasBuy");

        // let toolPool = _hjm;
        let arr = this.toolName.split(".");
        // for (let i = 0; i < arr.length - 1; i++) {
        //     toolPool = toolPool[arr[i]];
        // }
        // let id = arr[arr.length - 1];

        if (arr.length === 1) { // 直接hjm.id类型
            let id = arr[0];
            if (typeof hjm[id] === "number") {
                this.dyl_isCanBuy = function () {
                    return true;
                }
                this.dyl_buy = function () {
                    hjm[id]++;
                    hjm[this.coinName] -= this.coin;
                }
            }
            else { // bool
                this.dyl_isCanBuy = function () {
                    return !hjm[id];
                }
                this.dyl_buy = function () {
                    hjm[id] = true;
                    hjm[this.coinName] -= this.coin;
                }
            }
        }
        else if (arr.length === 2){
            let [name, id] = arr;
            if (Array.isArray(hjm[name])) {
                this.dyl_isCanBuy = function () {
                    return (hjm[name].indexOf(id) < 0);
                }
                this.dyl_buy = function () {
                    hjm[name].push(id);
                    hjm[this.coinName] -= this.coin;
                    hjm[name] = hjm[name];
                }     
            }
            else {
                let isOnly = null; // 是否唯一.true 是， false 不是， null 代表出错
                let toolPool = hjm[name];
                for (let i in toolPool) {
                    if (typeof toolPool[i] === "number") {
                        isOnly = false;
                    }
                    else {
                        isOnly = true;
                    }
                    break;
                }
                if (isOnly === null) {
                    return cc.warn("DylButton", this.toolName, "这是一个空对象，不知道到底是不是唯一物品");
                }

                // 也就是bool类型
                if (isOnly) {
                    this.dyl_isCanBuy = function () {
                        return !toolPool[id];
                    }
                    this.dyl_buy = function () {
                        toolPool[id] = true;
                        hjm[this.coinName] -= this.coin;
                    }
                }
                else {
                    // 因为没有数量限制，所以买多少都无所谓
                    this.dyl_isCanBuy = function () {
                        return true;
                    }
                    if (_hjmIsObjTabFun(name)) {
                        this.dyl_buy = function () {
                            if (!toolPool[id]) {
                                toolPool[id] = 1;
                            }
                            else {
                                toolPool[id]++;
                            }
                            hjm[name] = hjm[name];
                            hjm[this.coinName] -= this.coin;
                        }
                    }
                    else {
                        this.dyl_buy = function () {
                            if (!toolPool[id]) {
                                toolPool[id] = 1;
                            }
                            else {
                                toolPool[id]++;
                            }
                            hjm[this.coinName] -= this.coin;
                        }
                    }
                }
            }
        }
        else {
            return cc.error("参数应该是str或者str.str", this.toolName);
        }

        // // cc.log(toolPool, id);
        // // 数组类型， 只能卖一个
        // if (Array.isArray(toolPool)) { // 数组
        //     let toolArr = toolPool;
        //     this.dyl_isCanBuy = function () {
        //         return (toolArr.indexOf(id) < 0);
        //     }
        //     this.dyl_buy = function () {
        //         toolArr.push(id);
        //         hjm[this.coinName] -= this.coin;
        //     }
        // } else if (toolPool === _hjm) { // 
        //     if (typeof hjm[id] === "number") {
        //         this.dyl_isCanBuy = function () {
        //             return true;
        //         }
        //         this.dyl_buy = function () {
        //             hjm[id]++;
        //             hjm[this.coinName] -= this.coin;
        //         }
        //     }
        //     else { // bool
        //         this.dyl_isCanBuy = function () {
        //             return !hjm[id];
        //         }
        //         this.dyl_buy = function () {
        //             hjm[id] = true;
        //             hjm[this.coinName] -= this.coin;
        //         }
        //     }
        // }
        // else {
        //     let isOnly = null; // 是否唯一.true 是， false 不是， null 代表出错
        //     for (let i in toolPool) {
        //         if (typeof toolPool[i] === "number") {
        //             isOnly = false;
        //         }
        //         else {
        //             isOnly = true;
        //         }
        //         break;
        //     }
        //     if (isOnly === null) {
        //         return cc.warn("DylButton", this.toolName, "这是一个空对象，不知道到底是不是唯一物品");
        //     }

        //     // 也就是bool类型
        //     if (isOnly) {
        //         this.dyl_isCanBuy = function () {
        //             return !toolPool[id];
        //         }
        //         this.dyl_buy = function () {
        //             toolPool[id] = true;
        //             hjm[this.coinName] -= this.coin;
        //         }
        //     }
        //     else {
        //         // 因为没有数量限制，所以买多少都无所谓
        //         this.dyl_isCanBuy = function () {
        //             return true;
        //         }
        //         this.dyl_buy = function () {
        //             if (!toolPool[id]) {
        //                 toolPool[id] = 1;
        //             }
        //             else {
        //                 toolPool[id]++;
        //             }
        //             hjm[this.coinName] -= this.coin;
        //         }
        //     }
        // }

        if (this.dyl_updateBuy) {
            _hjmDelArrFun(this.coinName, this.dyl_updateBuy);
        }

        this.dyl_updateBuy = ()=>{
            // cc.log("dyl_updateBuy");
            if (!this.dyl_isCanBuy()) {
                dyl.set(this.dyl_hasBuyNode, "active", true);
                // return;
            }
            else {
                dyl.set(this.dyl_hasBuyNode, "active", false);
            }
            // cc.log(hjm[this.coinName], this.coin, hjm[this.coinName] < this.coin);
            if (hjm[this.coinName] < this.coin) {
                // cc.log(true);
                dyl.set(this.dyl_noMoneyNode, "active", true);
            }
            else {
                // cc.log(false);
                dyl.set(this.dyl_noMoneyNode, "active", false);    
            }
        }
        _hjmAddArrFun(this.coinName, this.dyl_updateBuy);

        this.dyl_updateBuy();
    },

    buy: function () {
        if (this.dyl_isCanBuy()) { // 检查数量上是否可以还可以买
            if (hjm[this.coinName] >= this.coin) { // 检查金额上是否还可以买
                if (this.endCheckBuyFun) {   // 这是用户自定义的特效和特别条件:例如有购买上限的那些
                    if (this.endCheckBuyFun()) { 
                        this.dyl_buy();
                    }
                }
                else {
                    this.dyl_buy();
                }
            }
        }
        return;
    },

    onDestroy: function () {
        if (this.dyl_updateBuy) {
            _hjmDelArrFun(this.coinName, this.dyl_updateBuy);
        }
    },


    clickFun: function () {
        if (this.funName !== "") {
            hjm[this.nodeName].getComponent(this.jsName)[this.funName]();
        } 
    },

    onClick: function () {
        // if (this.audio) {
            cc.loader.load(cc.url.raw('resources/dyl/button.mp3'), function (err, sound) {
                if (err) {
                    cc.error(err);
                }
                cc.audioEngine.play(sound, false, 1);
            });
            // cc.audioEngine.play(this.audio, false, 1);
        // }
        // for (var i = this.clearArr.length - 1; i >= 0; i--) {
        //     let name = this.clearArr[i];
        //     dyl.save(name, null);
        // }

        if (this.sceneType === "NextScene") {
            this.clickFun();
            return cc.director.loadScene(this.nextScene);
        }
        else if (this.sceneType === "NextLevel") {
            this.clickFun();
            let name = cc.director.getScene().name;
            let num = name.replace(/[^0-9]/ig,""); 
            let arr = name.split(num);
            if (arr.length === 1) {
                return cc.error("这个关卡命名有问题，不是只有一个数字");
            }
            num = Number(num) + 1;
            let nextName = arr[0] + String(num) + arr[1];
            return cc.director.loadScene(nextName);
        }
        else if (this.sceneType === "ExitGame") {
            this.clickFun();
            if (cc.sys.isMobile){
               return cc.director.end();
            }
            else if (cc.sys.isBrowser) {
                window.opener=null;
                window.open('','_self');
                window.close();
                return;
            }
            else if (cc.sys.isNative) {

            }
        }
        else if (this.sceneType === "Restart") {
            this.clickFun();
            cc.director.loadScene(cc.director.getScene().name);
            return;
        }
        else if (this.sceneType === "Popup") {
            this.clickFun();
            this.popupNode.add();
            // if (this.nodeName === "") {
            //     return cc.warn("按钮弹窗节点为空");
            // }
            // let nodeName = "_" + this.nodeName.replace(" ", "");
            // let node = hjm[nodeName];
            // node.stopAllActions();
            // node.active = true;
            // node.setScale(2);
            // node.opacity = 0;
            // let fun = ()=>{
            //     if (this.popEvent && (this.popEvent.handler !== '')) {
            //         this.popEvent.emit();
            //     }
            // }
            // let cfun = cc.callFunc(fun);
            // let fade = cc.fadeTo(0.3, 255);
            // let scale = cc.scaleTo(0.3, 1);
            // node.runAction(cc.sequence(cfun, cc.spawn(fade, scale)));
        }
        else if (this.sceneType === "Popdown") {
            this.popdownNode.del(()=>this.clickFun());
            // let node = this.popNode;
            // node.stopAllActions();
            // node.active = true;
            // node.setScale(1);
            // node.opacity = 255;
            // let fun = ()=>{
            //     if (this.popEvent && (this.popEvent.handler !== '')) {
            //         this.popEvent.emit();
            //     }
            //     node.active = false;
            // }
            // let cfun = cc.callFunc(fun);
            // let fade = cc.fadeTo(0.3, 0);
            // let scale = cc.scaleTo(0.3, 2);
            // node.runAction(cc.sequence(cc.spawn(fade, scale), cfun));
        }
        else if (this.sceneType === "Buy") {
            this.buy();
        }
        else {
            this.clickFun();
        }
    },

//下面button弹窗的节点字符串

    // nextStr: function () {
    //     if (this._inputStr === "") {
    //         return this.setNodeName("");
    //     }
    //     let now = this._inputStr + this._patch;
    //     let arr = this.getNodeNameArr;
    //     let ans = "";
    //     let nowId = 0;
    //     for (let i = arr.length - 1; i >= 0; i--) {
    //         let tmpArr = arr[i].split(this._inputStr);
    //         if (tmpArr.length > 1 && tmpArr[0] === "") {
    //             if (arr[i] === now) {
    //                 nowId = i;
    //                 break;
    //             }
    //         }
    //     }
    //     for (let i = 0; i < arr.length; i++) {
    //         let j = (i + nowId + 1) % arr.length;
    //         let tmpArr = arr[j].split(this._inputStr);
    //         if (tmpArr.length > 1 && tmpArr[0] === "") {
    //             ans = arr[j];
    //             break;
    //         }
    //     }
    //     this._patch = ans.slice(this._inputStr.length);
    //     let str = this._inputStr + " " + this._patch;
    //     this._lastStr = str;
    //     this.setNodeName(str);
    // },

    // changeStr: function () {
    //     let last = this._lastStr;
    //     let now = this.nodeName;
    //     if (now.length > last.length) {
    //         let add = now.slice(last.length);
    //         if (add === " ") {
    //             return this.nextStr();
    //         }
    //         let input = this._inputStr + add;
    //         let patch = false;
    //         while (true) {
    //             patch = this.getPatch(input);
    //             if (typeof patch === "string") {
    //                 break;
    //             }
    //             input = input.slice(0, input.length - 1);
    //         }
    //         this._inputStr = input;
    //         this._patch = patch;
    //         let str = input + " " + patch;
    //         if (str === " ") {
    //             str = "";
    //         }
    //         this._lastStr = str;
    //         this.setNodeName(str);
    //     }
    //     else if (now.length < last.length) {
    //         let delNum = last.length - now.length;
    //         let input = this._inputStr;
    //         if (delNum >= input.length) {
    //             this._inputStr = "";
    //             this._lastStr = "";
    //             this.setNodeName("");
    //             return;
    //         }
    //         let patch = false;
    //         input = this._inputStr.slice(0, this._inputStr.length - delNum);
    //         while (true) {
    //             patch = this.getPatch(input);
    //             if (typeof patch === "string") {
    //                 break;
    //             }
    //             input = input.slice(0, input.length - 1);
    //         }

    //         this._inputStr = input;
    //         this._patch = patch;
    //         let str = input + " " + patch;
    //         if (str === " ") {
    //             str = "";
    //         }
    //         this._lastStr = str;
    //         this.setNodeName(str);
    //     }
    // },

    // setNodeName: function (str) {
    //     this._flag = true;
    //     this.nodeName = str;
    //     this._flag = false;
    // },

    // getPatch: function (input) {
    //     let arr = this.getNodeNameArr;
    //     if (input === "") {
    //         return "";
    //     }
    //     for (let i = 0; i < arr.length; i++) {
    //         let str = arr[i];
    //         let tmpArr = str.split(input);
    //         if (tmpArr.length > 1 && tmpArr[0] === "") {
    //             let ans = str.slice(input.length);
    //             // cc.log("ans", ans, typeof ans);
    //             return ans;
    //         }
    //     }
    //     return false;
    // },  

    // updateNodeData: function () {
    //     let arr = [];
    //     let fun = function (node) {
    //         if (node.name[0] === "_") {
    //             arr.push(node.name.slice(1));
    //         }
    //         let nodeArr = node.getChildren();
    //         for (var i = nodeArr.length - 1; i >= 0; i--) {
    //             fun(nodeArr[i]);
    //         }
    //     }
    //     if (CC_EDITOR) {
    //         var node = cc.director.getScene().getChildren()[0];
    //         fun(node);
    //     }
    //     this.getNodeNameArr = arr;
    // },

});
