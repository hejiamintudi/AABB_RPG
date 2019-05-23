let Dir = cc.Enum({
	up: 0,
	down: 1,
	left: 2,
	right: 3
})
cc.Class({
    extends: cc.Component,
    properties: {
    	dir: {
    		default: Dir.up,
    		type: Dir
    	},
    	isVertical: {
    		default: true,
    		displayName: "是否纵向"
    	},
    	d: 8, // 两张图片之间间隔,
    	maxId: 0 // 最大id，如果为 0，代表正负都可以无限。 否则 id 范围是 0-maxId
    },

    update (dt) {
    	cc.log("update");
    	this.node.add(this.t * 300);
    	this.t += dt;
    },

    __preload () {
    	if (this.maxId < 0) {
    		return cc.error("最大数量不能为负数");
    	}
    	this.t = 0;
    	cc.kk = this;
    	this.addFun = (i, node)=>{
    		node.num = i;
    	}
    	// this.addFun = null; // 这是新显示节点时触发的 fun(id, node)
    	this.nodeArr = []; // 当前显示的节点数组
    	this.poolArr = [];
    	this.nodeLen = 0;

    	this.startId = 0;
    	this.endId = 0;

    	this.len = this.isVertical ? dyl.getSize(this.node).y : dyl.getSize(this.node).x;
    	if (this.len < 1) {
    		return cc.warn("DylList 当前节点的长度小于1", this.len);
    	}
    	// this.showD = this.isVertical ? dyl.getSize(this.node).y : dyl.getSize(this.node).x; 
    	let nodeArr = this.node.getChildren();
    	for (let i = 0; i < nodeArr.length; i++) {
    		let d = this.isVertical ? dyl.getSize(nodeArr[i]).y : dyl.getSize(nodeArr[i]).x; 	 
    		if (d < 1) { // 明显如果节点长度都是 0 那还怎么是list，都堆在一起了
    			return cc.warn("DylList 这个节点的长度小于1", nodeArr[i].name);
    		}
    		this.poolArr.push(this.addPool(nodeArr[i], d));
    		this.poolArr[i].d = d;
    		this.nodeLen += (d + this.d);
    	}
    	let nodeNum = this.poolArr.length;
    	this.poolArr.add = function (id) {
    		let mod = id % this.length;
    		if (mod < 0) {
    			mod += this.length;
    		}
    		return this[mod].add();
    	}
    	// this.add(50);

    	// add 的初始化只能在第一次用，后面不能再用了
    	this.node.add = (...arr)=>{
    		if (typeof arr[0] !== "number") {
    			for (var i = arr.length - 1; i >= 0; i--) {
    				if (typeof arr[i] === "function") {
    					this.addFun = arr[i];
    				}
    				else if (typeof arr[i] === "number") {
    					this.maxId = arr[i];
    				}
    			}
    			this.node.add = (x)=>this.add(x);
    		}
    		else {
    			this.node.add = (x)=>this.add(x);
    			this.add(arr[0]);
    		}
    	}
    },

    // 当有最大值时，那第一个的id就微妙了, 暂时取消这个想法，初始化，另外一个函数，获得最大的 d = 所有节点长（包括间隔）- 
    // 虽然说是 x 其他 y 可以用
    getStartData (x) {
    	// let data = {
    	// 	p: 0, // 移动后的偏移量
    	// 	sId: 0, // 第一个节点的id
    	// 	eId: 0  // 
    	// }
    	let p = 0;
    	let sId = 0;
    	let eId = 0;

    	let n = Math.floor(x / this.nodeLen);
    	let mod = x - n * this.nodeLen;
    	x = mod; 	// 第一个节点的坐标
    	n = n * this.poolArr.length; // n 代表第几个节点, 现在还在计算中
    	let i = 0;
    	for (i = 0; i < this.poolArr.length; i++) {
    		let pool = this.poolArr[i];
    		if (x > (pool.d + this.d)) {
    			x -= (pool.d + this.d);
    			n++;
    		}
    		else {
    			// data.p = pool.d * 0.5 - x; 
    			p = x; 
    			break;
    		}
    	}
    	sId = n;

    	// 获取 eId
    	x = this.poolArr[i].d - x;
    	let poolLen = this.poolArr.length;
    	while (x <= this.len) {
    		i = (i + 1) % poolLen;
    		x += (this.poolArr[i].d + this.d);
    		n++;
    	}
    	eId = n + 1;

    	if (this.maxId) {
    		if (eId > this.maxId) {
    			eId = this.maxId;
    		}
    		let poolLen = this.poolArr.length;
	    	for (i = sId; i < eId && i < 0; i++) {
	    		let mod = i % poolLen;
	    		mod += poolLen;
	    		mod = mod % poolLen;
	    		// cc.log("mod", i, mod, this.poolArr[mod]);
	    		let pool = this.poolArr[mod];
	    		p -= (pool.d + this.d);
	    		sId++;
	    	}
    	}

    	// cc.log("data", data);
    	let data = {
    		p: p,
    		sId: sId,
    		eId: eId
    	}
    	return data;
    },

    add (x) {
    	let data = this.getStartData(x);
    	this.resetArr(this.startId, this.endId, data.sId, data.eId);
    	this.resetPos(data);
    },

    resetPos (data) {
    	let p = -data.p;
    	for (let i = 0; i < this.nodeArr.length; i++) {
    		let node = this.nodeArr[i];
    		let pos = node.d * 0.5 + p;
    		if (this.dir === Dir.up) {
    			node.y = pos;
    		}
    		else if (this.dir === Dir.down) {
    			node.y = this.len - pos;
    		}
    		else if (this.dir === Dir.right) {
    			node.x = pos;
    		}
    		else {
    			node.x = this.len - pos;
    		}
    		// cc.log(node.x, pos, p);
    		p += (node.d + this.d);
    	}
    },

    // 
    resetArr (s1, e1, s2, e2) {
    	let oriArr = this.nodeArr;
    	this.nodeArr = [];


    	let delFun = (start, end)=>{
    		for (let i = start; i < end; i++) {
    			oriArr[i - s1].dylDel();
    		}
    	}

    	let keepFun = (start, end)=>{
    		for (let i = start; i < end; i++) {
    			this.nodeArr.push(oriArr[i - s1]);
    		}
    	}

    	let addFun = (start, end)=>{
    		for (let i = start; i < end; i++) {
    			let node = this.poolArr.add(i);
    			this.nodeArr.push(node);
    			node.id = i;
    			if (this.addFun) {
    				this.addFun(i, node);
    			}
    		}
    	}


    	if ((e2 <= s1) || (e1 <= s2)) {
    		delFun(s1, e1);
    		addFun(s2, e2);
    	}
    	else { // 下面是有交集的
    		delFun(s1, s2);
    		delFun(e2, e1);
    		addFun(s2, s1);
    		keepFun(Math.max(s1, s2), Math.min(e1, e2));
    		addFun(e1, e2);

	    	// for (let i = s1; i < s2; i++) {
	    	// 	oriArr[i].dylDel();
	    	// }
	    	// for (let i = s2; i < e1; i++) {
	    	// 	this.nodeArr.push(oriArr[i]);
	    	// }
	    	// for (let i = e2; i < e1; i++) {
	    	// 	oriArr[i].dylDel();
	    	// }
	    	// for (let i = e1; i < e2; i++) {
	    	// 	let node = this.poolArr.add(i);
	    	// 	this.nodeArr.push(node);
	    	// 	node.id = i;
	    	// 	if (this.addFun) {
	    	// 		this.addFun(i, node.id);
	    	// 	}
	    	// } 
	    	// for (let i = this.poolArr.length - 1; i >= 0; i--) {
	    	// 	this.poolArr[i].dylReset();
	    	// }
    	}
		for (let i = this.poolArr.length - 1; i >= 0; i--) {
    		this.poolArr[i].dylReset();
    	}

    	this.startId = s2;
    	this.endId = e2;
    },

    addPool (node, d) {
    	let arr1 = [];
    	let arr2 = [];

    	arr1.push(node);
    	node.dylDel = function () {
			arr1.push(this);
		}

    	node.d = d;
    	node.active = true;

    	let pool = {};
    	// pool.arr1 = arr1;
    	// pool.arr2 = arr2;
    	let topNode = this.node;
    	pool.add = function () {
    		if (arr1.length > 0) {
    			return arr1.pop();
    		}
    		if (arr2.length > 0) {
    			let tmpNode = arr2.pop();
    			tmpNode.active = true;
    			return tmpNode;
    		}
			let tmpNode = cc.instantiate(node);
    		tmpNode.active = true;
    		topNode.addChild(tmpNode);
    		tmpNode.d = d;
    		tmpNode.dylDel = function () {
    			arr1.push(this);
    		}
    		return tmpNode;
    	}
    	pool.dylReset = function () {
    		for (let i = arr1.length - 1; i >= 0; i--) {
    			arr1[i].active = false;
    			arr2.push(arr1[i]);
    		}
    		arr1.length = 0;
    	}
    	return pool;
    },


    // // x轴 版本的
    // addNodeArr () {
    // 	let len = dyl.getSize(this.node).x;
    // 	if (len < 1) {
    // 		return cc.error("对不起，我这里不欢迎w小于1的节点");
    // 	}
    // 	let arr = [];
    // 	let numArr = []; // 这个代表每个子节点的总数量
    // 	let nodeArr = this.node.getChildren();
    // 	let nodeLen = 0; // 所有子节点的总长度
    // 	for (let i = 0; i < nodeArr.length; i++) {
    // 		let x = dyl.getSize(nodeArr[i]).x;
    // 		if (x < 1) {
    // 			return cc.error("不接受节点w小于1的子节点, 这个节点名字叫", nodeArr[i].name, "你自己反省一下吧");
    // 		}
    // 		nodeLen += (x + this.d);
    // 	}
    // 	let n = Math.floor(len / nodeLen);
    // 	if (n > 0) {
    // 		for (let i = 0; i < nodeArr.length; i++) {
    // 			numArr.push(n + 1);
    // 		}
    // 	}
    // 	for (let i = 0; i < nodeArr.length; i++) {
    // 		let x = nodeArr[i].x;
    // 		if (nodeLen - x > len) {
    // 			numArr.push(2 + n);
    // 		}
    // 		else {
    // 			numArr.push(1 + n);
    // 		}
    // 	}
    // 	let pool = [];
    // },

    // update (dt) {},
});
