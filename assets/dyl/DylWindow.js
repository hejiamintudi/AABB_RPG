let NodeData = cc.Class({
	name: "NodeData",
	properties: {
		id: "",
		node: cc.Node,
		p: cc.v2(0, 0),		
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		// anchorX: cc.v2(0.5, 0.5),
		anchorX: 0.5,
		anchorY: 0.5,
		// size: cc.size(100, 100),/**/
		height: 0.0,
		width: 0.0,
		color: cc.color(255, 255, 255),
		opacity: 255,
		skewX: 0,
		skewY: 0,
		active: true,
        lab: "",
	}
});

let NodeDataArr = cc.Class({
	name: "NodeDataArr",
	properties: {
		// arr: {
		// 	default: [],
		// 	type: NodeData
		// }
		arr: [NodeData]
	}
});


cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/☃ 弹窗",
        executeInEditMode: true,
        inspector: 'packages://dyl-window/DylWindow.js',
    },
    ctor: function() {
    	Object.defineProperty(this,"node",{//这里的方法名name,就表示定义了一个name属性（因此才能通过object.name访问）,只定义了getter访问器,没有定义[[value]]值
		    get:function (){//只定义了get 特性，因此只能读不能写
		        return undefined;
		    },    
		  	set:function (node) {
		        delete this.node;
		        this.node = node;
		        this._myInit();
			},
		  	configurable: true
		});
    },
    properties: {
        defaultData: {
            default: null,
            type: NodeDataArr,
        },
    	data: {
    		default: [],
    		type: NodeDataArr,
    		visible: false,
    	},
    	// [SaveData],
    	showData: "default",
    	_stateArr:{
    		default: [],
    		type: cc.String
    	},
    	stateArr: {
    		default: [],
    		type: cc.String,
    		// notify() {
    		// 	for (let i = this._stateArr.length - 1; i >= 0; i--) {
    		// 		if (this._stateArr[i] !== this.stateArr[i]) {
    		// 			if (this.stateArr[i] === " ") {
    		// 				this.stateArr[i] = this._stateArr[i];
    		// 			}
    		// 			this._save(i);
    		// 		}
    		// 	}
    		// 	this._stateArr.length = 0;
    		// 	this._stateArr.push(...this.stateArr);	
    		// }
    	},
    },

    _myInit: function() {
        // cc.log("_myInit");
        this.node.add = (state, fun = ()=>{})=>this.addFun(state, fun);
        this.node.del = (fun = ()=>{})=>this.delFun(fun);
    	// this.node.add = (name, time)=>{
     //        if (!name) {
     //            return this.myAct(time);
     //        }
    	// 	name = this._getString(name);
    	// 	for (let i = this.stateArr.length - 1; i >= 0; i--) {
	    // 		if(name === this._getString(this.stateArr[i])) {
	    // 			this._read(i);
	    // 			break;
	    // 		}
	    // 	}
	    // 	this.myAct(time);
    	// }
    },

    // getAction: function (from, to) {
    //     if (!to.active) {
    //         // cc.log("return 0");
    //         return [];
    //     }
    //     let time = 0;
    //     let fun = (t)=>{
    //         time = (time > t) ? time : t;
    //     }
    //     let getTime = (name, r)=>{
    //         fun(Math.abs(to[name] - from[name]) * 0.4 / r);
    //     }
    //     fun(to.p.sub(from.p).mag() * 0.4 / 540);
    //     getTime("rotation", 60);
    //     getTime("scaleX", 0.7);
    //     getTime("scaleY", 0.7);
    //     getTime("opacity", 150);
    //     if (time < 0.0001) {
    //         // cc.log("return 1");
    //         return [];
    //     }
    //     let arr = [];
    //     let addAct = (act)=>{
    //         act.easing(cc.easeSineOut());
    //         act.node = to.node;
    //         arr.push(act);
    //     }
    //     addAct(cc.moveTo(time, to.p));
    //     addAct(cc.rotateTo(time, to.rotation));
    //     addAct(cc.scaleTo(time, to.scaleX, to.scaleY));
    //     addAct(cc.fadeTo(time, to.opacity));
    //     // cc.log("return 2");
    //     return arr;
    // },

    getAction: function (seq, from, to) {
        if (!to.node.active) {
            // cc.log("return 0");
            return [];
        }
        let time = 0;
        let fun = (t)=>{
            time = (time > t) ? time : t;
            // time = 0.1; // 暂时改为这个
        }
        let getTime = (name, r)=>{
            fun(Math.abs(to[name] - from[name]) * 0.4 / r);
        }
        fun(to.p.sub(from.p).mag() * 0.4 / 540);
        getTime("rotation", 60);
        getTime("scaleX", 0.7);
        getTime("scaleY", 0.7);
        getTime("opacity", 150);
        if (time < 0.0001) {
            // cc.log("return 1");
            return [];
        }
        // let arr = [];
        // let addAct = (act)=>{
        //     act.easing(cc.easeSineOut());
        //     act.node = to.node;
        //     arr.push(act);
        // }
        // addAct(cc.moveTo(time, to.p));
        // addAct(cc.rotateTo(time, to.rotation));
        // addAct(cc.scaleTo(time, to.scaleX, to.scaleY));
        // addAct(cc.fadeTo(time, to.opacity));
        // return arr;

        seq.moveTo(to.node, time, to.p)
           .rotateTo(to.node, time, to.rotation)
           .scaleTo(to.node, time, to.scaleX, to.scaleY)
           .fadeTo(to.node, time, to.opacity);
        // cc.log("return 2");
    },

    notActChange: function (dataArr) {
        for (var i = dataArr.length - 1; i >= 0; i--) {
            let {node, anchorX, anchorY, height, width, color, skewX, skewY, active, lab} = dataArr[i];
            node.active = active;
            node.anchorX = anchorX;
            node.anchorY = anchorY;
            node.height = height;
            node.width = width;
            node.color = color;
            node.skewX = skewX;
            node.skewY = skewY;
            if (node.getComponent(cc.Label)){
                node.getComponent(cc.Label).string = lab;
            }
        }
    },

    addFun: function (state, fun) {
        if (!state) {
            state = this.showData;
        }
        else {
            this.showData = state;
        }
        if (state === "default") {
            // cc.log("default");
            return this._read("default");
        }
        this._read("default");
        let dataArr = this.data[this.stateArr.indexOf(state)].arr;
        this.notActChange(dataArr);
        // let arr = [];

        // for (var i = dataArr.length - 1; i >= 0; i--) {
        //     arr.push(...this.getAction(this.defaultData.arr[i], dataArr[i]));
        // }
        // dyl.run(fun, arr);
        let seq = tz();
        seq._();
        for (var i = dataArr.length - 1; i >= 0; i--) {
            this.getAction(seq, this.defaultData.arr[i], dataArr[i]);
        }
        seq._()();
    },

    delFun: function (fun) {
        if (!this.node.active) {
            fun();
            return;
        }
        if (this.showData === "default") {
            return this.node.active = false;
        }
        let dataArr = this.data[this.stateArr.indexOf(this.showData)].arr;
        // let arr = [];
        // for (var i = dataArr.length - 1; i >= 0; i--) {
        //     arr.push(...this.getAction(dataArr[i], this.defaultData.arr[i]));
        // }
        // dyl.run(arr, ()=>{
        //     this.node.active = false;
        //     fun();
        // })

        let seq = tz();
        seq._();
        for (var i = dataArr.length - 1; i >= 0; i--) {
            this.getAction(seq, dataArr[i], this.defaultData.arr[i]);
        }
        seq._()(()=>{
            this.node.active = false;
            fun();
        })();
    },

    myAct: function(time) {
    	if (!time) {
    		return;
    	}
        this.node.active = true;
    	let oriScale = this.node.scale;
    	let oriOpacity = this.node.opacity;

    	let scaleR = (time > 0) ? 2 : 1;
    	let opacityR = (time > 0) ? 0 : 1;


    	let node = this.node;
        node.stopAllActions();
        node.setScale(oriScale * scaleR);
        node.opacity = oriOpacity * opacityR;
        // let cfun = cc.callFunc(fun);
        let fade = cc.fadeTo(Math.abs(time), oriOpacity * (1 - opacityR));
        let scale = cc.scaleTo(Math.abs(time), oriScale * (3 - scaleR));
        let cfun = cc.callFunc(()=>{
        	this.node.opacity = oriOpacity;
        	this.node.setScale(oriScale);
        	this.node.active = (time > 0);
        });
        let seq = cc.sequence(cc.spawn(fade, scale), cfun);
        node.runAction(seq);
    },

    _getString: function(str) {
    	return str.replace(/\s+/g,"");
    },

    _read: function(name) {
        // if (this._getString(this.stateArr[id]) === "") {
        //     return;
        // }
        let dataArr = null;
        if (name === "default") {
            dataArr = this.defaultData.arr;
        }
        else {
            for (var i = this.stateArr.length - 1; i >= 0; i--) {
                if (this.stateArr[i] === name) {
                    dataArr = this.data[i].arr;
                }
            }
        }
    	// let dataArr = this.data[id].arr;

        // cc.log("read", id);
        // cc.log(this.data);
        // for (let i in this.data) {
        //  cc.log("i", i);
        // }
        // cc.log(this.data[id]);
    	// for (let i = 0; i < dataArr.length; i++) {
    	// 	cc.log("ii", i, dataArr[i]);
    	// }
    	for (let i = dataArr.length - 1; i >= 0; i--) {
    		// cc.log("node", dataArr[i].node);
    		if (!dataArr[i].node) {
    			continue;
    		}
    		// cc.log("rrreeeddd");
    		let node = dataArr[i].node;
    		let data = dataArr[i];
    		node.setPosition(data.p);
    		node.rotation = data.rotation;
    		node.scaleX = data.scaleX;
    		node.scaleY = data.scaleY;
    		node.anchorX = data.anchorX;
    		node.anchorY = data.anchorY;
    		// node.size = data.size;
    		node.color = data.color;
    		node.opacity = data.opacity;
    		node.skewX = data.skewX;
    		node.skewY = data.skewY;
            let lab = node.getComponent(cc.Label);
            if (lab) {
                lab.string = data.lab;
            }
            if (node.name === "Canvas") {
                let canvas = this.node.getComponent(cc.Canvas);
                canvas.designResolution = cc.size(data.width, data.height);
            }
            else {
                node.height = data.height;
                node.width = data.width;
            }
    		node.active = data.active;
    	}
    	//   	id: "",
		// node: cc.Node,
		// p: cc.v2(0, 0),		
		// rotation: 0,
		// scaleX: 1,
		// scaleY: 1,
		// anchor: cc.v2(0.5, 0.5),
		// size: cc.size(100, 100),
		// color: cc.color(255, 255, 255),
		// opacity: 255,
		// skew: cc.v2(0, 0),

    },

    buttonSave: function(name) {
        if (name === "default") {
            this.defaultData = this._getSaveData();
            return;
        }
        for (var i = this.stateArr.length - 1; i >= 0; i--) {
            if (this.stateArr[i] === name) {
                this.data[i] = this._getSaveData();
            }
        }
    },

    _save: function(id, value, oldValue) {
    	// cc.log("save");
        // let oldValue = this.stateArr[id];
        this.stateArr[id] = value;
        if (value === "default") {
            this.defaultData = this._getSaveData();
            this.stateArr[id] = "";
            return;
        }
        else {
    	   this.data[id] = this._getSaveData();
        }
        // cc.log("_save", id, value, oldValue);
        if (value === "") {
            this.stateArr[id] = oldValue;
        }
        for (var i = this.stateArr.length - 1; i >= 0; i--) {
            if ((this.stateArr[i] === this.stateArr[id]) && (i !== id)) {
                this.stateArr[id] = "";
                return;
            }
        }
    	// for (let i in this.data) {
    	// 	cc.log("i", i);
    	// }
    	// cc.log(this.)
    },

    _getSaveData: function() {
    	let saveData = new NodeDataArr;
    	saveData.arr = this._getSaveNodeArr(this.node);
    	return saveData;
    },

    _getSaveNodeArr: function(node) {
    	let arr = [this._addNodeData(node)];
    	let nodeArr = node.getChildren();
    	for (let i = nodeArr.length - 1; i >= 0; i--) {
    		arr.push(...this._getSaveNodeArr(nodeArr[i]));
    	}
    	return arr;
    },

    _addNodeData: function(node) {
    	let nodeData = new NodeData;
    	nodeData.id = node.name;
    	nodeData.node = node;
    	nodeData.p = cc.v2(node);
    	nodeData.rotation = node.rotation;
    	nodeData.scaleX = node.scaleX;
    	nodeData.scaleY = node.scaleY;
    	nodeData.anchorX = node.anchorX;
    	nodeData.anchorY = node.anchorY;
    	// nodeData.size = node.size;
    	nodeData.height = node.height;
    	nodeData.width = node.width;
    	nodeData.color = node.color;
    	nodeData.opacity = node.opacity;
    	nodeData.skewX = node.skewX;
    	nodeData.skewY = node.skewY;
    	nodeData.active = node.active;
        let lab = node.getComponent(cc.Label);
        if (lab) {
            nodeData.lab = lab.string;
        }
    	return nodeData;
    },

    // _addEventListeners: function() {
    // 	cc.director.on(cc.Director.EVENT_BEFORE_VISIT, this._doLayoutDirty, this);
    //     this.node.on('size-changed', this._doLayoutDirty, this);
    //     this.node.on('anchor-changed', this._doLayoutDirty, this);
    //     this.node.on('child-added', this._doLayoutDirty, this);
    //     this.node.on('child-removed', this._doLayoutDirty, this);
    //     this.node.on('child-reorder', this._doLayoutDirty, this);
    //     this._addChildrenEventListeners();
    // },

    // _addChildrenEventListeners: function() {
    // 	var children = this.node.children;
    //     children.forEach(function (child) {
    //         child.on('size-changed', this._doLayoutDirty, this);
    //         child.on('position-changed', this._doLayoutDirty, this);
    //         child.on('anchor-changed', this._doLayoutDirty, this);
    //         child.on('active-in-hierarchy-changed', this._doLayoutDirty, this);
    //     }.bind(this));
    // },

    // _doLayoutDirty: function() {
    // 	this._save();
    // },




    onLoad: function () {
    	this.node.on('touchstart', ()=>null);
    },
});
