"use strict";

var getNowTime = function () {
    let data = new Date();
    return [data.getSeconds(), data.getMilliseconds()];
};

// 空是里面执行 负数是循环次数 NaN是无限循环
window.tz = function (node, ...argArr) {
	let isDebug = false;
	isDebug = true;
	let debugStr = "";

	let stopActArr = []; // {node： node， act： act};
	let loopArr = []; // 循环数组 参数 fun
	let isStop = -1; // true 代表暂停， false 代表运行中， -1 代表tz没有建立运行，还不能接受true跟false
					// "del" 代表已经删除了，其他操作都没有意义了
	
	let once = function (fn) {
		return fn; // 因为要循环运行，所以要多次触发，不需要一次性的函数了

		let result = null;
        return  function() { 
            if(fn) {
                result = fn.apply(this, arguments);
                fn = null;
            }
            else {
            	cc.warn("tz 这个结束的end函数已经运行过一次了");
            }
            return result;
        };
	}
	let dylLog = function (arg) {
		if (cc.sys.isMobile || DylIsFinal) {
			cc.log(arg);
		}
		else {
			console.log("%c" + debugStr + String(arg), "color:#fe8bd9;font-weight:bold;");
		}
	}
	// isDebug = true;
	let defaultNode = null;
	if (typeof node === "object" && node.getChildren) {
		defaultNode = node;
	}
	else {
		defaultNode = cc.director.getScene().getChildren()[0];
		argArr = [node, ...argArr];
	}

	let mainSeq = [];
	let sameArr = null;

	let proxy = null;

	// let oriEndFun = null; // 这是最初的头执行函数, 下面再赋值
	// let runNum = 1; // 要执行的次数 -1 代表无限执行
	// let endFun = function () {
	// 	if (--runNum) {
	// 		oriEndFun();
	// 	}
	// };
	let endFun = function () {

	};
	loopArr.push(endFun);

	let createActArrFun = function (actArr) {
		let callBack = endFun;
		endFun = function () {
			if (isDebug) {
				dylLog("sameArr");
			}
			stopActArr = [];
			let count = actArr.length + 1; // 多加一个，防止数组为空，不执行
			let countFun = function () {
				if (!(--count)) {
					// if (isDebug) {
					// 	dylLog("sameArr");
					// }
					callBack();
				}
			}
			for (let i = actArr.length - 1; i >= 0; i--) {
				let act = actArr[i];
				// if (typeof act === "number" && act < 0) {
				// 	return cc.warn("tz 同步动作不能接受 循环操作");
				// }
				if (typeof act === "number") {
					return cc.error("tz 同步动作不能接受 循环操作");
					// act = cc.delayTime(act);
				}
				else if (typeof act === "function") {
					// act = cc.callFunc(act);
					// 设置唯一函数，防止多次调用，也防止明明返回false，还要继续执行
					if (act.actArr) {
						for (let j = 0; j < act.actArr.length; j++) {
							let tmpAct = act.actArr[j];
							stopActArr.push({node: tmpAct.node, act: tmpAct});
						}
					}
					let actCallBack = once(countFun);
					if (!act(actCallBack)) {
						actCallBack();
					}
					continue;
				}
				let cfun = cc.callFunc(countFun);
				let seq = cc.sequence(act, cfun);
				if (!act.node.active) {
					cc.warn("这个节点 active 为 false", "sameArr");
				}
				stopActArr.push({node: act.node, act: seq});
				act.node.runAction(seq);
			}
			countFun();
		}
		endFun = once(endFun);
	}
	let run = function () {
		// cc.log("rr uuuuu nnnnnnn");
		if (sameArr) {
			return cc.error("同时运行的动作，没有结束");
		}
		if (typeof mainSeq[0] === "number") {
			return cc.error("tz 一开始不能是循环数，因为没有动作可以循环");
		}
		if (typeof mainSeq[mainSeq.length - 1] !== "number") {
			mainSeq.push(1);
		}
		for (let i = mainSeq.length - 1; i >= 0; i--) {
			let act = mainSeq[i];
			if (Array.isArray(act)) {
				createActArrFun(act);
				continue;
			}
			
			let tmpEndFun = endFun;
			if (typeof act === "function") {
				endFun = once(()=>{
					if (isDebug) {
						// cc.log("fun isDebug");
						dylLog(act.actName);
					}
					stopActArr = [];
					if (act.actArr) {
						for (let j = 0; j < act.actArr.length; j++) {
							let tmpAct = act.actArr[j];
							stopActArr.push({node: tmpAct.node, act: tmpAct});
						}
					}
					if (!act(tmpEndFun)) {
						tmpEndFun();
					}
				})	
				continue;
			}

			// act是循环次数 -1为无限循环下去。
			if (typeof act === "number") {
				if (typeof mainSeq[i - 1] === "number") {
					return cc.warn("tz 连续这里有一个循环体为空，就是连续两个参数为负数");
				}

				let loopId = loopArr.length; // 当前loopFun的id，因为赋值晚点才触发
				loopArr[loopId - 1].oriEndFun = endFun;
				let loopNum = act;

				endFun = ()=>{
					if (isDebug) {
						if (act === -1) {
							dylLog("无限循环");
						}
						else {
							dylLog("还剩循环次数 " + String(loopNum));
						}
					}
					stopActArr = [];
					if (loopNum--) {
						loopArr[loopId].oriEndFun();
					}
					else {
						loopArr[loopId - 1]();
					}
				}
				loopArr.push(endFun);
				continue;
			}

			let cfun = cc.callFunc(function () {
				// if (isDebug) {
				// 	// dylLog(typeof act.actName);
				// 	if (typeof act !== "number") {
				// 		dylLog(act.actName);
				// 	}
				// 	else {
				// 		dylLog(act);
				// 	}
				// }
				tmpEndFun();
			});
			let seq = cc.sequence(act, cfun);
			endFun = function () {
				if (isDebug) {
					dylLog(act.actName);
				}
				stopActArr = [{node: act.node, act: seq}];
				if (!act.node.active) {
					cc.warn("这个节点 active 为 false", act.actName);
				}
				act.node.runAction(seq);
			}
			endFun = once(endFun);
		}
		// loopArr.push(endFun);
		loopArr[loopArr.length - 1].oriEndFun = endFun;

		loopArr[loopArr.length - 1]();
		// oriEndFun = endFun;
		// loopArr.push(endFun);
		// endFun();
	}
	let createSampleAct = function (data) {
		let act = null;

		// 数组代表直接对节点或者节点数组赋值
		// 直接赋值的数据类型 bool：active cc.v2:position [num]:rotate [num1, num2]:scale num:opacity color
		// string: 节点这个属性是函数，那就运行这个函数，如果string后是数组，那这个数组的内容就是函数的参数列表 否则函数参数为空
		if (Array.isArray(data)) { // 也是转换函数，丢给函数处理
			let arr = data;
			data = function () {
				let nodeArr = [];
				let setVal = function (name, val) {
					for (let i = nodeArr.length - 1; i >= 0; i--) {
						nodeArr[i][name] = val;
					}
				}
				let setPosFun = function (val) {
					for (let i = nodeArr.length - 1; i >= 0; i--) {
						let x = (val.x === true) ? nodeArr[i].x : val.x;
						let y = (val.y === true) ? nodeArr[i].y : val.y;
						nodeArr[i].setPosition(x, y);
					}
				}
				for (let i = 0; i < arr.length; i++) {
					let val = arr[i];
					let className = null;
					if (val && (typeof val === "object") && (!val.getChildren) && (val.x !== undefined) && (val.y !== undefined)) {
						className = "cc.Vec2"
					}
					else {
						className = cc.js.getClassName(val);
					}
					if (Array.isArray(val)) {
						if (val.length < 1) {
							return cc.error("这里的数组不能为空");
						}
						if (typeof val[0] === "number") {
							if (val.length === 1) {
								setVal("rotate", val);
							}
							else {
								setVal("scale", cc.v2(val[0], val[1]));
							}
						}
						else {
							nodeArr = val;
						}
					}
					else if (className === "cc.Node") {
						nodeArr = [val];
					}
					else if (typeof val === "boolean") {
						setVal("active", val);
					}
					else if (className === "cc.Color") {
						setVal("color", val);
					}
					else if (className === "cc.Vec2") {
						// setVal("position", val);
						setPosFun(val);
					}
					else if (typeof val === "number") {
						setVal("opacity", val);
					}
					else if (typeof val === "string") {
						if (typeof nodeArr[0][val] === "function") {
							if (Array.isArray(arr[i+1])) {
								i++;
								for (let j = 0; j < nodeArr.length; j++) {
									nodeArr[j][val](...arr[i]);
								}
							}
							else {
								for (let j = 0; j < nodeArr.length; j++) {
									nodeArr[j][val]();
								}	
							}
						}
						else {
							i++;
							setVal(val, arr[i]);
						}
					}
					else {
						return cc.error("完全不知道怎么处理");
					}
				}
			}
		}
		if (typeof data === "string") { //转换为函数，丢给函数处理
			let str = data;
			if (debugStr === "") {
				debugStr = str + " ";
			}
			data = function () {
				cc.log(str);
			}
		}
		if (typeof data === "function") {
			// let fun = ()=>{
			// 	data();
			// }
			// act = cc.callFunc(fun);
			let fun = (end)=>data(end);
			act = fun;
		}
		else if (typeof data === "number") {
			if (data < 0) {
				act = -data;
			}
			else if (isNaN(data)) {
				act = -1;
			}
			else  {
				act = cc.delayTime(data);
			}
		}
		else {
			cc.error("参数有问题,这里不接受其他参数", data);
		}
		if (typeof act === "function") {
			act.node = defaultNode;
			act.actName = "function";
		} else if (typeof act !== "number") {
			act.node = defaultNode;
			act.actName = data;
		}
		return act;
	}
	let ansFun = function (...arr) {
		if (arr[0] === undefined) {
			// cc.log("tz 0");
			if (isStop !== -1) {
				return cc.warn("tz 已经运行过了，不能再用了");
			}
			isStop = false;
			run(); //开始运行了
			return proxy;
		}
		// else if (typeof arr[0] === "number" && arr[0] < 0) {
		// 	// cc.log("tz 1");
		// 	if (isStop !== -1) {
		// 		return cc.warn("tz 已经运行过了，不能再用了");
		// 	}
		// 	isStop = false;
		// 	runNum = -arr[0];
		// 	return run();
		// }
		// else if (typeof arr[0] === "number" && isNaN(arr[0])) {
		// 	// cc.log("tz 2");
		// 	if (isStop !== -1) {
		// 		return cc.warn("tz 已经运行过了，不能再用了");
		// 	}
		// 	isStop = false;
		// 	runNum = -1;
		// 	return run();
		// }
		if (arr[0] === null) { // 暂停并删除这些动作
			if (isStop === -1) {
				cc.warn("tz 还没有建立运行");
				return proxy;
			}
			if (stopActArr.length === 0) {
				// cc.warn("tz 这里没有要删除的动作表，是否都是函数？");
				return proxy;
			}
			for (var i = stopActArr.length - 1; i >= 0; i--) {
				stopActArr[i].node.stopAction(stopActArr[i].act);
			}
			isStop = "del";
			return proxy;
		}

		if (typeof arr[0] === "boolean") {
			if (isStop === -1) {
				cc.warn("tz 还没有建立运行");
				return proxy;
			}
			if (isStop === "del") {
				cc.warn("tz 所有动作都删除了，没必要暂停和恢复了");
				return proxy;
			}
			if (stopActArr.length === 0) {
				cc.warn("tz 这里没有要暂停的动作表，是否都是函数？");
				return proxy;
			}
			if (arr[0]) { // 恢复运行
				if (!isStop) { // 本来就在运行了，没必要再执行一次
					return proxy;
				}
				for (var i = stopActArr.length - 1; i >= 0; i--) {
					stopActArr[i].node.resumeAllActions();
				}
				isStop = false;
			}
			else { // 
				if (isStop) { // 本来就在停止了，没必要再停止一次
					return proxy;
				}
				for (var i = stopActArr.length - 1; i >= 0; i--) {
					stopActArr[i].node.pauseAllActions();
				}
				isStop = true;
			}
			return proxy;
		}
		for (let i = 0; i < arr.length; i++) {
			let data = arr[i];
			let act = createSampleAct(data);
			if (sameArr) { 
				sameArr.push(act);
			}
			else {
				mainSeq.push(act);
			}
		}
		return proxy;
	}


	for (let i = 0; i < argArr.length; i++) {
		// cc.log("aaaaaa nnnnnn ssssssss", argArr);
		if (argArr[i] === undefined) {
			continue;
		}
		ansFun(argArr[i]);
	}

	proxy = new Proxy(ansFun, {
        get: function get(target, id) {
        	let isChangeArr = false;
			if (id[0] === "_") {
				isChangeArr = true;
			}
        	let actName = id.split("_").pop();
        	// cc.log("id", actName, id);
        	let fun = function (node, ...arr) {
        		let act = null;
        		if (actName === "") {
        			// if (!arr.length) { //这是_()的情况，这一般是用来终结同时运行数组的
        			// 	arr = [0];
        			// }
        			if (node === undefined)  {
        				node = 0;
        			}
        			act = createSampleAct(node, ...arr);
        			act.actName = node;
        		}
        		// 参数 [nodeArr / node]? [差别数组]?  ...other
        		// funArr (id) 根据返回值的类型来增加或者修改这个id节点的动作
        		// diff_funArr (id) 偏移量 是相对于前一个来对比的
         		// 变化的类型都必需要在普通类型里面有定义（延时除外），否则会报错
        		else if (actName === "to" || actName === "by") {
        			let ease = null;
        			let easeType = arr[arr.length - 1];
        			if ((typeof easeType === "object") && (typeof easeType.easing === "function") && (typeof easeType.reverse === "function")) {
        				arr.pop();
        				ease = easeType;
        			}
        			arr = [node, ...arr];
        			// cc.log(arr);
        			let i = 0;
        			let nodeArr = null;
        			let actArr = [];
        			let diffArr = [];

        			let funArr = [];
        			let diff_funArr = [];

        			// 给动作指定节点数组 判断第一个参数，节点或节点数组
        			if (Array.isArray(arr[i])) {
        				if (typeof arr[i][0].getChildren === "function") {
    						nodeArr = arr[i];
    						i++;
    					}
        			}
        			else if (typeof arr[i].getChildren === "function") {
        				nodeArr = [arr[i]];
        				i++;
        			}
        			if (!nodeArr) {
        				nodeArr = [defaultNode];
        			}

        			// 偏移数组
        			if (Array.isArray(arr[i])) {
        				diffArr = arr[i];
    					i++;
        			}

        			// // 初始化节点数组 和 偏移数组
        			// for (i; i < arr.length; i++) {
        			// 	// cc.log("arr", i, arr[i], Array.isArray(arr[i]));
        			// 	if (Array.isArray(arr[i])) {
        			// 		if (typeof arr[i][0].getChildren === "function") {
        			// 			nodeArr = arr[i];
        			// 		}
        			// 		else {
        			// 			diffArr = arr[i];
        			// 		}
        			// 	}
        			// 	else {
        			// 		break;
        			// 	}
        			// }

        			// // 节点数组的补充，就是非数组的时候，可能直接是一个节点，或者默认节点
        			// if (typeof arr[i].getChildren === "function") {
        			// 	if (nodeArr) {
        			// 		return cc.error("tz 已经有了数组，那就别再加节点了", arr[i]);
        			// 	}
        			// 	nodeArr = [arr[i]];
        			// 	i++;
        			// }
        			// else if (!nodeArr){
        			// 	nodeArr = [defaultNode];
        			// }


        			let delayTime = 0;
        			let diff_delayTime = 0;
        			let now_diff_delayTime = 0;

        			let tab = {
        				pos: null,
        				diff_pos: cc.v2(0, 0),
        				now_diff_pos: cc.v2(0, 0),

        				rotate: null,
        				diff_rotate: 0,
        				now_diff_rotate: 0,

        				// 以数组形式保存
        				scale: null,
        				diff_scale: [0, 0],
        				now_diff_scale: [0, 0],

        				color: null,
        				diff_color: cc.color(0, 0, 0),
        				now_diff_color: cc.color(0, 0, 0)
        			};

        			// let pos = null;
        			// let diff_pos = cc.v2(0, 0);
        			// let now_diff_pos = cc.v2(0, 0);

        			// let opacity = null;
        			// let diff_opacity = 0;
        			// let now_diff_opacity = 0;

        			// // 以数组形式保存
        			// let scale = null;
        			// let diff_scale = [0, 0];
        			// let now_diff_scale = [0, 0];

        			// let color = null;
        			// let diff_color = cc.color(0, 0, 0);
        			// let now_diff_color = cc.color(0, 0, 0);

        			// 把后面的参数都初始化，数组，数字，颜色，函数，位置
        			for (i; i < arr.length; i++) {
        				if (typeof arr[i] === "number") {
        					delayTime = arr[i];
        				}
        				else if (typeof arr[i] === "function") {
        					funArr.push(arr[i]);
        				}
        				else if (Array.isArray(arr[i])) {
        					if (arr[i].length === 1) { // 
        						tab.rotate = arr[i][0];
        					}
        					else { //缩放
        						tab.scale = arr[i];
        					}
        				}
        				else if (cc.js.getClassName(arr[i]) === "cc.Vec2") {
        					tab.pos = arr[i];
        				}
        				else if (cc.js.getClassName(arr[i]) === "cc.Color") {
        					tab.color = arr[i];
        				}
        				else {
        					return cc.error("tz 这个类型我不知道怎么处理", arr[i]);
        				}
        			}
        			// cc.log("0 funArr", funArr);
        			// 处理偏移节点的内容
        			for (i = 0; i < diffArr.length; i++) {
        				if (typeof diffArr[i] === "number") {
        					diff_delayTime = diffArr[i];
        					if (diff_delayTime < 0) {
        						now_diff_delayTime = -diff_delayTime * nodeArr.length;
        					}
        					else {
        						now_diff_delayTime = -diff_delayTime;
        					}
        				}
        				else if (typeof diffArr[i] === "function") {
        					diff_funArr.push(diffArr[i]);
        				}
        				else if (Array.isArray(diffArr[i])) {
        					if (diffArr[i].length === 1) { // 角度
        						tab.diff_rotate = diffArr[i][0];
        						if (tab.rotate === null) {
        							return cc.error("tz 有偏移透明度，但没有固定透明度赋值 [number]");
        							// opacity = true;
        						}
        					}
        					else { //缩放
        						tab.diff_scale = diffArr[i];
        						if (tab.scale === null) {
        							return cc.error("tz 有偏移缩放，但没有固定缩放赋值 [number, number]");
        							// scale = true;
        						}
        					}
        				}
        				else if (cc.js.getClassName(diffArr[i]) === "cc.Vec2") {
        					tab.diff_pos = diffArr[i];
        					if (tab.pos === null) {
        						return cc.error("tz 有偏移位置, 但没有固定位置");
        						// pos = true;
        					}
        				}
        				else if (cc.js.getClassName(diffArr[i]) === "cc.Color") {
        					tab.diff_color = diffArr[i];
        					if (tab.color === null) {
        						return cc.error("tz 有偏移颜色, 但没有固定颜色");
        						// color = true;
        					}
        				}
        				else {
        					return cc.error("tz 这个类型我不知道怎么处理", diffArr[i]);
        				}
        			}

        			let addId = 0;
        			let toByEndFun = null;
        			let tmpAdd = function (num) {
        				addId = num;
        			}
        			let tmpDel = function () {
        				// cc.log("tmpDel");
        				addId--;
        				if (addId === 0) {
        					toByEndFun();
        				}
        			}
        			// 根据基本数据 跟 diff数据，生成动作
        			let addActFun = function(act1, tmpNode, dt) {
        				let cb = cc.callFunc(tmpDel);
        				if (ease) {
	        				act1.easing(ease);
	        			}
	        			let seq = null;
	        			if (dt > 0.000001) {
        					let dtAct = cc.delayTime(dt);
        					seq = cc.sequence(dtAct, act1, cb);
	        			}
	        			else {
	        				seq = cc.sequence(act1, cb);	
	        			}
        				// cc.log("act", act1, tmpNode);
        				seq.node = tmpNode;
        				actArr.push(seq);
        			}

        			let getFunArrData = function (i, arr, node) {
        				let data = {};
        				for (let j = 0; j < arr.length; j++) {
        					let value = arr[j](i, node);
        					if (typeof value === "number") {
        						data.time = value;
        					}
        					else if (Array.isArray(value)) {
        						if (value.length === 1) {
        							data.rotate = value[0];
        						}
        						else {
        							data.scale = value;
        						}
        					}
        					else if (cc.js.getClassName(value) === "cc.Vec2") {
        						data.pos = value;
        					}
        					else if (cc.js.getClassName(value) === "cc.Color") {
        						data.color = value;
        					}
        				}
        				return data;
        			}

        			if (actName === "to") {
	        			for (i = 0; i < nodeArr.length; i++) {
	        				let tmpNode = nodeArr[i];

	        				let funData = getFunArrData(i, funArr, tmpNode);
	        				let diff_funData = getFunArrData(i, diff_funArr, tmpNode);

	        				let t = delayTime;
	        				if (typeof funData.time === "number") {
	        					t = funData.time;
	        				}
	        				if (typeof diff_funData.time === "number") {
	        					now_diff_delayTime = diff_funData.time;
	        				}
	        				else {
	        					now_diff_delayTime += diff_delayTime;
	        				}

	        				let getAct = function (name, value) {
	        					if (name === "pos") {
	        						return cc.moveTo(t, value);
	        					}
	        					else if (name === "rotate") {
	        						return cc.rotateTo(t, value);
	        					}
	        					else if (name === "scale") {
	        						return cc.scaleTo(t, value[0], value[1]);
	        					}
	        					else if (name === "color") {
	        						return cc.tintTo(t, value.r, value.g, value.b);
	        					}
	        				}

	        				// 添加偏移值
	        				let addDiff = function (name) {
	        					if (name === "pos") {
	        						tab.pos = tab.pos.add(tab.diff_pos);
	        					}
	        					else if (name === "rotate") {
	        						tab.rotate += tab.diff_rotate;
	        					}
	        					else if (name === "scale") {
	        						let [a0, a1] = tab.scale;
	        						let [b0, b1] = tab.diff_scale;
	        						tab.scale = [a0 + b0, a1 + b1];
	        					}
	        					else if (name === "color") {
	        						let {r, g, b} = tab.diff_color;
	        						tab.color = cc.color(tab.color.r + r, tab.color.g + g, tab.color.b + b);
	        					}
	        				}

	        				let setData = function (name) {
	        					if (diff_funData[name]) {
	        						tab["diff_" + name] = diff_funData[name];
	        					}
	        					if (funData[name]) {
	        						let	act = getAct(name, funData[name]);
	        						addActFun(act, tmpNode, now_diff_delayTime);
	        						if (tab[name] !== null) {
	        							tab[name] = funData[name];
	        							addDiff(name);
	        						}
	        					}
	        					else if (tab[name] !== null) {
	        						let act = getAct(name, tab[name]);
	        						addActFun(act, tmpNode, now_diff_delayTime);
	        						addDiff(name);
	        					}
	        				}

	        				setData("pos");
	        				setData("rotate");
	        				setData("scale");
	        				setData("color");
	        				
							// if (pos === true) {
// 	        					let move = cc.moveTo(t, diff_pos.mul(i).add(tmpNode));
// 	        					addActFun(move, tmpNode, i * diff_delayTime);
// 	        				}
// 	        				else if (pos) { 
// 	        					// cc.log("pos", t, diff_pos.mul(i).add(pos));
// 	        					let move = cc.moveTo(t, diff_pos.mul(i).add(pos));
// 	        					addActFun(move, tmpNode, i * diff_delayTime);
// 	        				}

// 	        				if (opacity === true) {
// 	        					let fade = cc.fadeTo(t, diff_opacity * i + tmpNode.opacity);
// 	        					addActFun(fade, tmpNode, i * diff_delayTime);
// 	        				}
// 	        				else if (opacity !== null) {
// 	        					let fade = cc.fadeTo(t, diff_opacity * i + opacity);
// 	        					addActFun(fade, tmpNode, i * diff_delayTime);
// 	        				}

// 	        				if (scale === true) {
// 	        					let act1 = cc.scaleTo(t, diff_scale[0] * i + tmpNode.scaleX, diff_scale[1] * i + tmpNode.scaleY);
// 	        					addActFun(act1, tmpNode, i * diff_delayTime);
// 	        				}
// 	        				else if (scale !== null) {
// 	        					let act1 = cc.scaleTo(t, diff_scale[0] * i + scale[0], diff_scale[1] * i + scale[1]);
// 	        					addActFun(act1, tmpNode, i * diff_delayTime);	
// 	        				}

// 	        				if (color === true) {
// 	        					let {r, g, b} = diff_color;
// 	        					let act1 = cc.tintTo(t, r * i + tmpNode.color.r, g * i + tmpNode.color.g, b * i + tmpNode.color.b);
// 	        					addActFun(act1, tmpNode, i * diff_delayTime);
// 	        				}
// 	        				else if (color !== null) {
// 	        					let {r, g, b} = diff_color;
// 	        					let act1 = cc.tintTo(t, r * i + color.r, g * i + color.g, b * i + color.b);
// 	        					addActFun(act1, tmpNode, i * diff_delayTime);	
// 	        				}

	        			}
        			}
        			else if (actName === "by") {
        				// if (color === true) {
        				// 	color = cc.color(0, 0, 0);
        				// }
        				// if (opacity === true) {
        				// 	opacity = 0;
        				// }
        				// if (scale === true) {
        				// 	scale = [0, 0];
        				// }
        				// if (pos === true) {
        				// 	pos = cc.v2(0, 0);
        				// } 
        				for (i = 0; i < nodeArr.length; i++) {
	        				let tmpNode = nodeArr[i];

        					let funData = getFunArrData(i, funArr, tmpNode);
	        				let diff_funData = getFunArrData(i, diff_funArr, tmpNode);

	        				let t = delayTime;
	        				if (typeof funData.time === "number") {
	        					t = funData.time;
	        				}
	        				if (typeof diff_funData.time === "number") {
	        					now_diff_delayTime = diff_funData.time;
	        				}
	        				else {
	        					now_diff_delayTime += diff_delayTime;
	        				}

	        				let getAct = function (name, value) {
	        					if (name === "pos") {
	        						return cc.moveBy(t, value);
	        					}
	        					else if (name === "rotate") {
	        						return cc.rotateBy(t, value);
	        					}
	        					else if (name === "scale") {
	        						return cc.scaleBy(t, value[0], value[1]);
	        					}
	        					else if (name === "color") {
	        						return cc.tintBy(t, value.r, value.g, value.b);
	        					}
	        				}

	        				let addValue = function (name, v1, v2) {
	        					if (name === "pos") {
	        						// tab.pos = tab.pos.add(tab.diff_pos);
	        						return v1.add(v2);
	        					}
	        					else if (name === "rotate") {
	        						return v1 + v2;
	        					}
	        					else if (name === "scale") {
	        						let [a0, a1] = v1;
	        						let [b0, b1] = v2;
	        						return [a0 + b0, a1 + b1];
	        					}
	        					else if (name === "color") {
	        						let {r, g, b} = v1;
	        						return cc.color(v2.r + r, v2.g + g, v2.b + b);
	        					}
	        				}

	        				// 添加偏移值
	        				let addDiff = function (name) {
	        					tab["now_diff_" + name] = addValue(name, tab["now_diff_" + name], tab["diff_" + name]);
	        					// if (name === "pos") {
	        					// 	// tab.pos = tab.pos.add(tab.diff_pos);
	        					// 	tab.now_diff_pos = tab.now_diff_pos.add(tab.diff_pos);
	        					// }
	        					// else if (name === "opacity") {
	        					// 	// tab.opacity += tab.diff_opacity;
	        					// 	tab.now_diff_opacity += tab.diff_opacity;
	        					// }
	        					// else if (name === "scale") {
	        					// 	let [a0, a1] = tab.now_diff_scale;
	        					// 	let [b0, b1] = tab.diff_scale;
	        					// 	tab.now_diff_scale = [a0 + b0, a1 + b1];
	        					// }
	        					// else if (name === "color") {
	        					// 	let {r, g, b} = tab.diff_color;
	        					// 	tab.now_diff_color = cc.color(tab.now_diff_color.r + r, tab.now_diff_color.g + g, tab.now_diff_color.b + b);
	        					// }
	        				}

	        				let setData = function (name) {
	        					if (diff_funData[name]) {
	        						tab["diff_" + name] = diff_funData[name];
	        					}
	        					if (funData[name]) {
	        						let	act = getAct(name, funData[name]);
	        						addActFun(act, tmpNode, now_diff_delayTime);
	        						if (tab[name] !== null) {
	        							tab[name] = funData[name];
	        						}
	        					}
	        					else if (tab[name] !== null) {
	        						let act = getAct(name, addValue(name, tab[name], tab["now_diff_" + name]));
	        						addActFun(act, tmpNode, now_diff_delayTime);
	        						addDiff(name);
	        					}
	        				}

	        				setData("pos");
	        				setData("rotate");
	        				setData("scale");
	        				setData("color");
	        				
        					// let tmpNode = nodeArr[i];
	        				// let t = i * diff_delayTime + delayTime;

	        				// if (pos) { 
	        				// 	let move = cc.moveBy(t, diff_pos.mul(i).add(pos));
	        				// 	addActFun(move, tmpNode, i * diff_delayTime);
	        				// }

	        				// if (opacity !== null) {
	        				// 	let fade = cc.fadeTo(t, diff_opacity * i + opacity + tmpNode.opacity);
	        				// 	addActFun(fade, tmpNode, i * diff_delayTime);
	        				// }

	        				// if (scale !== null) {
	        				// 	let act1 = cc.scaleBy(t, diff_scale[0] * i + scale[0], diff_scale[1] * i + scale[1]);
	        				// 	addActFun(act1, tmpNode, i * diff_delayTime);	
	        				// }

	        				// if (color !== null) {
	        				// 	let {r, g, b} = diff_color;
	        				// 	let act1 = cc.tintBy(t, r * i + color.r, g * i + color.g, b * i + color.b);
	        				// 	addActFun(act1, tmpNode, i * diff_delayTime);	
	        				// }
        				}
        			}
        			else {
        				cc.error("tz 这个actName突然变得好奇怪，不是to也不是by", actName);
        			}
        			let toOrByFun = function (end) {
        				toByEndFun = end;
        				// stopActArr = [];
        				tmpAdd(actArr.length + 1);
        				for (let i = 0; i < actArr.length; i++) {
        					// stopActArr.push({node: actArr[i].node, act: actArr[i]});
        					// cc.log(i, actArr[i]);
        					actArr[i].node.runAction(actArr[i]);
        				}
        				tmpDel();
        				return true;
        			}
        			toOrByFun.actName = actName;
        			toOrByFun.actArr = actArr;
        			act = toOrByFun;
        		}
        		else {
        			if (typeof node !== "object" || (!node.getChildren)) {
        				arr = [node, ...arr];
        				node = defaultNode;
        			}
        			
        			//////////////////////////// (下面这个缓冲)
        			let ease = null;
        			let easeType = arr[arr.length - 1];
        			if ((typeof easeType === "object") && (typeof easeType.easing === "function") && (typeof easeType.reverse === "function")) {
        				arr.pop();
        				ease = easeType;
        			}
        			// if (easeType === "add") {
        			// 	arr.pop();
        			// 	ease = cc.easeIn(2.0);
        			// }
        			// else if (easeType === "sub") {
        			// 	arr.pop();
        			// 	ease = cc.easeOut(2.0);
        			// }
        			// else if (easeType === "addSub") {
        			// 	arr.pop();
        			// 	ease = cc.easeInOut(2.0);
        			// }
        			// else if (easeType === "backAdd") {
        			// 	arr.pop();
        			// 	ease = cc.easeBackIn();
        			// }
        			// else if (easeType === "subBack") {
        			// 	arr.pop();
        			// 	ease = cc.easeBackOut();
        			// }
        			// else if (easeType === "backAddSubBack") {
        			// 	arr.pop();
        			// 	ease = cc.easeBackInOut();
        			// }
        			/////////////////////////////////////////

        			act = cc[actName](...arr);
        			act.node = node;
        			act.actName = actName;

        			if (ease) {
        				act.easing(ease);
        			}
        		}
        		if (isChangeArr) {
        			if (sameArr) { // 这里准备结束同时运行数组
        				sameArr.push(act);
        				mainSeq.push(sameArr);
        				sameArr = null;
        			}
        			else {
        				sameArr = [act];
        			}
        		}
        		else {
        			if (sameArr) {
        				sameArr.push(act);
        			}
        			else {
        				mainSeq.push(act);
        			}
        		}
        		return proxy;
        	}
            return fun;
        },
    });

    return proxy;
}