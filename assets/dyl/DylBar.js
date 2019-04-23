// node 多了 set get 函数，这是为了配合DylLab使用的


cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/♥ 血条",
        executeInEditMode: true
    },

    properties: {
        _isNew: true,
        _maxHp: 1,
        _hp: 1,

        // scaleX: {
        //     default: 1,
        //     min: 0,
        //     max: 1,
        //     step: 0.01,
        //     slide: true,
        //     notify: function (){
        //         return this.resetSpr();
        //     }
        // },

        // scaleY: {
            // default: 1,
            // min: 0,
            // max: 1,
            // step: 0.01,
            // slide: true,
            // notify: function (){
            //     return this.resetSpr();
            // }
        // },

        _barMaxLen: 0,

        progress: {
            default: 1,
            min: 0,
            max: 1,
            slide: true,
            notify: function (old){
                return this.resetProgress(old);
            }
        },

        // backSpr: {
        //     default: null,
        //     type: cc.SpriteFrame,
        //     // notify: function (){
        //     //     return this.resetSpr();
        //     // }
        // },

        // barSpr: {
        //     default: null,
        //     type: cc.SpriteFrame,
        //     // notify: function (){
        //     //     return this.resetSpr();
        //     // }
        // },
    },

    __preload: function () {
        cc.bar = this;
        this.delActFun = ()=>null;

        this.checkIsNew();
        this._bar = this.node.getChildByName("bar");
        
        if (CC_EDITOR) {
            this._bar.on("size-changed", ()=>{
                if (this.progress < 0.00001) {
                    this._bar.width = 0;
                    return;
                }
                let width = this.getSize(this._bar).x;
                if (width < 1) {
                    return cc.warn("血tiao条总长度为0", width);
                }
                this._barMaxLen = width / this.progress;
            })
        }

        this.node.set = (value)=>{
            return this.setFun(value);
        }
        this.node.change = (newValue, oldValue)=>{
            return this.changeFun(newValue, oldValue);
        }

        if (this._barMaxLen === 0) {
            let width = this.getSize(this._bar).x;
            if (width < 1) {
                return cc.warn("血条总长度为0", width);
            }
            this._barMaxLen = width / this.progress;
        }

    },

    getSize: function (node) {
        node = node.node ? node.node : node;
        var size = node.getContentSize();
        var w = size.width;
        var h = size.height;

        return cc.v2(w, h);
    },

    resetProgress: function (old) {
        if (old > 0) {
            this._barMaxLen = this.getSize(this._bar).x / old;
        }
        this._bar.width = this._barMaxLen * this.progress;
    },

    resetSpr: function () {
        this.node.getComponent(cc.Sprite).spriteFrame = this.backSpr;
        this._bar.getComponent(cc.Sprite).spriteFrame = this.barSpr;


        let size = this.getSize(this.node);
        this._maxX = size.x * this.scaleX;
        this._maxY = size.y * this.scaleY;

        this._bar.height = this._maxY;
        this._bar.setAnchorPoint(0, 0.5);
        this._bar.setPosition(-0.5 * this._maxX, 0);

        this.resetData();
    },

    resetData: function () {
        if (this._maxHp <= 0) {
            this._bar.width = 0;
        }
        else {
            this._bar.width = this._barMaxLen * this._hp / this._maxHp;
        }
    },

    checkIsNew: function () {
        if (!CC_DEBUG) {
            return;
        }
        if (!this._isNew) {
            return;
        }
        this._isNew = false;

        if (!this.node.getComponent(cc.Sprite)) {
            this.node.addComponent(cc.Sprite);
        }
        if (!this.node.getChildByName("bar")) {
            let node = new cc.Node("bar");
            this.node.addChild(node);
            node.addComponent(cc.Sprite);
            node.setAnchorPoint(0, 0.5);
            node.x = -0.5 * this.getSize(this.node).x
        }
        if (!this.node.getChildByName("bar").getComponent(cc.Sprite)) {
            cc.warn("子节点的bar, 没有sprite组件");
        }
        return;
    },

    setFun: function (value) {
        if ((typeof value !== "string") && (typeof value !== "number")) {
            cc.warn("label 的string 的data类型只能是字符串或数字", value);
            return;
        }
        if (typeof value === "string") {
            this._maxHp = Number(value);
            if (this._maxHp < 0) {
                this._maxHp = 0;
            }
            if (value[0] === "0") {
                this._hp = this._maxHp;
            }
            else if (this._hp > this._maxHp) {
                this._hp = this._maxHp;
            }
            return this._hp;
        }
        else {
            if (value > this._maxHp) {
                this._hp = this._maxHp;
                return this._hp;
            }
            else if (value < 0) {
                this._hp = 0;
                return this._hp;
            }

            // 普通改变值，所以不触发change函数
            this._hp = value;
            // this.resetData(); 
        }
    },

    changeFun: function (newValue, oldValue) {
        // cc.log(oldValue, newValue);
        this.delActFun(); // 停止之前的动作
        // cc.log(this._hp, this._maxHp, this._barMaxLen);
        if (this._maxHp <= 0) {
            cc.log("最大血量都是 0");
            return this._bar.width = 0;
        }

        if (oldValue > this._maxHp) {
            oldValue = this._maxHp;
        }
        
        if (oldValue === newValue) {
            this._bar.width = this._barMaxLen * this._hp / this._maxHp;            
        }
        this._bar.width = this._barMaxLen * oldValue / this._maxHp;
        // cc.log(this._barMaxLen, this.oldValue, this._maxHp, this._bar.width);
        let v = 300;
        let flag = newValue > oldValue ? 1 : -1;
        v = flag * v;
        let t = (newValue - oldValue) * this._barMaxLen / (v * this._maxHp);
        // cc.log(v, t);
        let update = (dt)=>{
            this._bar.width = this._bar.width + v * dt;
            t -= dt;
            if (t <= 0) {
                this._bar.width = this._barMaxLen * newValue / this._maxHp;
                return false;
            }
            return true;
        }
        this.delActFun = dyl.update(update);
    },

});
