var SceneEnum = cc.Enum({
    Null: 0,
    NextScene: 1,
    NextLevel: 2,
    Restart: 3,
    ExitGame: 4,
    Popup: 5,
    Popdown: 6,
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
        // "Null", "NextScene", "NextLevel", "Restart", "ExitGame", "Popup", "Popdown"
        sceneType: "NextLevel",
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

    },

    __preload: function () {
        this.myInit();
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
            // self.node.color = cc.color(125, 125, 125);
            _scale = self.node.getScale();
            _color = self.node.color;
            self.node.setScale(0.92 * _scale);
        });  
        this.node.on('touchend', function ( event ) {
            // self.node.color = _color;
            self.node.setScale(_scale);
            self.onClick();
        });  
        this.node.on('touchcancel', function ( event ) {
            // self.node.color = _color;
            cc.log("touchcancel", _scale);
            self.node.setScale(_scale);
        }); 
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
