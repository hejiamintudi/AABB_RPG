let Dir = cc.Enum({
	up: 0,
	down: 1,
	left: 2,
	right: 3
})
cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/列表",
    },
    properties: {
    	dir: {
    		default: Dir.up,
    		type: Dir
    	},
    	// isVertical: {
    	// 	default: true,
    	// 	displayName: "是否纵向"
    	// },
    	d: 8, // 两张图片之间间隔,
    	startP: 5, // 当前位置
    	maxId: 0, // 最大id，如果为 0，代表正负都可以无限。 否则 id 范围是 0-maxId
    	isTouch: true
    },

    update (dt) {
    	// cc.log("update");
    	// this.node.add(this.t * 50);
    	// this.t -= dt;
    },

    __preload () {
    	if (this.maxId < 0) {
    		return cc.error("最大数量不能为负数");
    	}
    	this.oriStartP = this.startP;

    	this.isVertical = (this.dir === Dir.up) || (this.dir === Dir.down);
    	this.t = 0;
    	// cc.kk = this;
    	this.addFun = null; // 这是新显示节点时触发的 fun(id, node)
    	this.buttonFun = null; // 点击节点触发的 fun (id, node)
    	this.runFun = null; // 自动动作的update取消函数
    	// this.addFun = (i, node)=>{
    	// 	node.num = i;
    	// }
    	// this.buttonFun = (i, node)=>{
    	// 	cc.log(i);
    	// }
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
    		cc.log("d", this.isVertical, dyl.getSize(nodeArr[i]), d);
    		this.poolArr.push(this.addPool(nodeArr[i], d));
    		this.poolArr[i].d = d;
    		this.nodeLen += (d + this.d);
    	}

    	this.minP = this.startP;
    	// this.maxP = this.nodeLen - this.len;
    	this.getMaxP();

    	this.poolArr.add = function (id) {
    		let mod = id % this.length;
    		if (mod < 0) {
    			mod += this.length;
    		}
    		return this[mod].add();
    	}
    	this.add(this.startP);


    	// add 的初始化只能在第一次用，后面不能再用了
        // add (addFun(id, node)?, buttonFun(id, node)?, maxNum) maxNum 0 为无穷
    	this.node.add = (...arr)=>{
    		if (typeof arr[0] !== "number") {
    			this.addFun = null;
    			this.buttonFun = null;
    			for (var i = 0; i < arr.length; i++) {
    				if (typeof arr[i] === "function") {
    					if (this.addFun) {
    						this.buttonFun = arr[i];
    					}
    					else {
    						this.addFun = arr[i];
    					}
    				}
    				else if (typeof arr[i] === "number") {
    					this.maxId = arr[i];
    					this.getMaxP();
    				}
    			}
    			// this.startId = 0;
    			// this.endId = 0;
    			this.resetArr(this.startId, this.endId, 0, 0);
    			this.resetPos({p: 0, sId: 0, eId: 0});
    			// this.node.add = (x)=>this.add(x);
    			this.add(this.oriStartP);
    			return this.nodeArr;
    		}
    		else {
    			// this.node.add = (x)=>this.add(x);
    			this.add(arr[0]);
    			return this.nodeArr;
    		}
    	}

    	if (this.isTouch) {
    		this.setTouch();
    	}
    	else {
    		this.setButton();
    	}
    },

    getMaxP () {
    	if (this.maxId <= 0) {
    		this.maxP = 0;
    		return;
    	}
    	let nodeNum = this.poolArr.length; 
    	let n = Math.floor(this.maxId / nodeNum);
    	let len = n * this.nodeLen;
    	n = this.maxId - n * nodeNum;
    	for (let i = 0; i < n; i++) {
    		len += (this.poolArr[i].d + this.d);
    	}
    	len -= this.oriStartP;
    	len = len - this.d - this.len;
    	this.maxP = len;
    },

    setTouch () {
    	let self = this;
    	let isMove = false;
    	let touchOnP = 0;

    	let preP = 0; 
    	let nextP = 0;

    	this.node.on("touchstart", function (event) {
    		let p = event.getLocation();
    		if (self.runFun) {
    			self.runFun();
    			self.runFun = null;
    		}
    		isMove = false;
    		touchOnP = self.isVertical ? p.y : p.x;
    		preP = touchOnP;
    		nextP = touchOnP;
    	});

    	this.node.on ("touchmove", function (event) {
    		let p = event.getLocation();
    		isMove = true;
    		preP = nextP;
    		nextP = self.isVertical ? p.y : p.x;
    		if (self.dir === Dir.right || self.dir === Dir.up) {
    			self.add(preP - nextP + self.startP);
    		}
    		else {
    			self.add(nextP - preP + self.startP);
    		}
    	});

        let pIsInNode = function (p, node) {
            p = node.convertToNodeSpace(p);
            return ((p.x >= 0) && (p.x <= node.width) && (p.y >= 0) && (p.y <= node.height));
        }

    	let touchEndFun = function (event) {
    		let p = event.getLocation();
    		if (!isMove) { // 触摸点击
    			if (self.buttonFun) {
    				for (let i = self.nodeArr.length - 1; i >= 0; i--) {
                        if (pIsInNode(p, self.nodeArr[i])) {
                            let node = self.nodeArr[i];
                            self.buttonFun(node.dylListId, node);
                            return;
                        }

    					// let rect = self.nodeArr[i].getBoundingBoxToWorld();
    					// if (rect.contains(p)) {
    					// 	let node = self.nodeArr[i];
    					// 	self.buttonFun(node.dylListId, node);
		       //              return;
		       //          }
    				}
    			}
    			return;
    		}
    		if (self.startP <= self.minP || self.startP >= self.maxP) {
    			self.checkOut();
    			return;
    		}
    		if (preP + 4 < nextP) {
    			if (self.dir === Dir.down || self.dir === Dir.left) {
    				self.quickMove(1);
    			}
    			else {
    				self.quickMove(-1)
    			}
    			return;
    		}
    		else if (nextP + 4 < preP) {
    			if (self.dir === Dir.down || self.dir === Dir.left) {
    				self.quickMove(-1);
    			}
    			else {
    				self.quickMove(1)
    			}
    			return;
    		}
    		self.checkOut();
    	}
    	this.node.on ("touchend", touchEndFun);

    	this.node.on ("touchcancel", touchEndFun);
    },

    setButton () {
    	let fun = (event)=>{
    		if (!this.buttonFun) {
    			return;
    		}
    		let p = event.getLocation();
    		for (let i = this.nodeArr.length - 1; i >= 0; i--) {
				let rect = this.nodeArr[i].getBoundingBoxToWorld();
				if (rect.contains(p)) {
					let node = this.nodeArr[i];
					this.buttonFun(node.dylListId, node);
                    return;
                }
			}
    	}
    	this.node.on ("touchend", fun);
    },

    quickMove (dir) {
    	let a = -300 * dir;
    	let v = 600 * dir;
    	let f = -16000 * dir;
    	let p = this.startP;
    	let outP = (dir > 0) ? this.maxP : this.minP;

    	// let oriPos = this.startP;
    	// let endPos = oriPos + dir * len;

		let fun = (dt)=>{
			if ((p - outP) * dir > 0) { // 超出范围了
				a += (f * dt);
				v = v + a * dt;
			}
			else {
				v = v + a * dt;
			}
			if (v * dir <= 0) { // 方向不同，代表速度为 0了
				this.runFun = null;
				this.checkOut();
				return false;
			}
			p += (v * dt);
			this.add(p);
			return true;

			// v += (dir * a * dt);
			// let r = t / time;
			// if (r >= 1) {
			// 	this.add(endPos);
			// 	this.runFun = null;
			// 	return false;
			// }
			// r = Math.sqrt(r);
			// this.add(r * len * dir + oriPos);
			// // this.add(dir * 1000 * dt + this.startP);
			// return true;
		}
		this.runFun = dyl.update(fun);
    },

    quickOut (dir) {
    	let oriPos = this.startP;
    	let endPos = null;
    	let len = null;
    	let t = 0;

    	let fun = (dt)=>{
			t += dt;
			let r = t / time;
			if (r >= 1) {
				this.add(endPos);
				this.runFun = null;
				return false;
			}
			r = Math.sqrt(r);
			this.add(r * len * dir + oriPos);
			// this.add(dir * 1000 * dt + this.startP);
			return true;
    	}

    	let out = (dt)=>{
    		
    	}
    	if (endPos > this.maxP) {
    		let endPos = this.maxP;
    		let len = this.maxP - oriPos;
    		let time = 0.002 * len; 
    	}
    	else if (endPos < this.minP) {
    		let endPos = this.minP;
    		let len = oriPos - this.minP;
    		let time = 0.002 * len; 
    	}
		this.runFun = dyl.update(fun);
    },

    checkOut () {
    	if (this.maxId === 0) {
    		return;
    	}
    	let oriP = this.startP;
    	let endP = null;
    	let time = 0.1;
    	let t = 0;
    	// cc.log(this.startP, this.minP, this.maxP);
    	if (this.startP < this.minP) {
    		endP = this.minP;
    	}
    	else if (this.minP > this.maxP) {
    		endP = this.minP;
    	}
    	else if (this.startP > this.maxP) {
    		endP = this.maxP;
    	}
    	else {
    		return;
    	}
    	// cc.log(this.startP, this.minP, this.maxP, endP);
    	let fun = (dt)=>{
    		t += dt;
    		this.add((endP - oriP) * t / time  + oriP);
    		if (t > time) {
    			this.add(endP);
    			this.runFun = null; 
    			return false;
    		}
    		return true;
    	}
    	this.runFun = dyl.update(fun);
    },

    // 当有最大值时，那第一个的id就微妙了, 暂时取消这个想法，初始化，另外一个函数，获得最大的 d = 所有节点长（包括间隔）- 
    // 虽然说是 x 其他 y 可以用
    getStartData (x) {
    	let kk = x;
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
    		// if (x > (pool.d + this.d)) {
    		if (x > pool.d) {
    			x -= (pool.d + this.d);
    			n++;
    		}
    		else {
    			// data.p = pool.d * 0.5 - x; 
    			break;
    		}
    	}
    	p = x; 
    	sId = n;

    	// cc.log("x", x, i, n, p);

    	// cc.log(this.poolArr[i]);
    	// 获取 eId
    	x = this.poolArr[i % this.poolArr.length].d - x;
    	let poolLen = this.poolArr.length;
    	let len = this.len - this.d;
    	// while (x <= this.len) {
    	while (x <= len) {
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

    	let data = {
    		p: p,
    		sId: sId,
    		eId: eId
    	}
    	// cc.log("data", kk, data);

    	return data;
    },

    add (x) {
    	cc.log("x", x);
    	this.startP = x;
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
    			node.y = pos - this.len * 0.5;
    		}
    		else if (this.dir === Dir.down) {
    			node.y = this.len * 0.5 - pos;
    		}
    		else if (this.dir === Dir.right) {
    			node.x = pos - this.len * 0.5;
    		}
    		else {
    			node.x = this.len * 0.5 - pos;
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
    			node.dylListId = i;
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
