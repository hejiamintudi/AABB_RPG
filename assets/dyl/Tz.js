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
			cc.error("参数有问题,这里不接受其他参数");
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
        		// 参数 [nodeArr]? [差别数组]? node? 时间 = 0 
        		else if (actName === "to" || actName === "by") {
        			arr = [node, ...arr];
        			// cc.log(arr);
        			let i = 0;
        			let nodeArr = null;
        			let actArr = [];
        			let diffArr = [];
        			for (i; i < arr.length; i++) {
        				// cc.log("arr", i, arr[i], Array.isArray(arr[i]));
        				if (Array.isArray(arr[i])) {
        					if (typeof arr[i][0].getChildren === "function") {
        						nodeArr = arr[i];
        					}
        					else {
        						diffArr = arr[i];
        					}
        				}
        				else {
        					break;
        				}
        			}

        			// cc.log("nodeArr", nodeArr);
        			if (typeof arr[i].getChildren === "function") {
        				if (nodeArr) {
        					return cc.error("tz 已经有了数组，那就别再加节点了", arr[i]);
        				}
        				nodeArr = [arr[i]];
        				i++;
        			}
        			else if (!nodeArr){
        				nodeArr = [defaultNode];
        			}
        			let delayTime = 0;
        			let diff_delayTime = 0;

        			let pos = null;
        			let diff_pos = cc.v2(0, 0);

        			let opacity = null;
        			let diff_opacity = 0;

        			// 以数组形式保存
        			let scale = null;
        			let diff_scale = cc.v2(0, 0);

        			let color = null;
        			let diff_color = cc.color(0, 0, 0);

        			for (i; i < arr.length; i++) {
        				if (typeof arr[i] === "number") {
        					delayTime = arr[i];
        				}
        				else if (Array.isArray(arr[i])) {
        					if (arr[i].length === 1) { // 透明度
        						opacity = arr[i][0];
        					}
        					else { //缩放
        						scale = arr[i];
        					}
        				}
        				else if (cc.js.getClassName(arr[i]) === "cc.Vec2") {
        					pos = arr[i];
        				}
        				else {
        					return cc.error("tz 这个类型我不知道怎么处理", arr[i]);
        				}
        			}

        			for (i = 0; i < diffArr.length; i++) {
        				if (typeof diffArr[i] === "number") {
        					diff_delayTime = diffArr[i];
        				}
        				else if (Array.isArray(diffArr[i])) {
        					if (diffArr[i].length === 1) { // 透明度
        						diff_opacity = diffArr[i][0];
        						if (opacity === null) {
        							opacity = true;
        						}
        					}
        					else { //缩放
        						diff_scale = diffArr[i];
        						if (scale === null) {
        							scale = true;
        						}
        					}
        				}
        				else if (cc.js.getClassName(diffArr[i]) === "cc.Vec2") {
        					diff_pos = diffArr[i];
        					if (pos === null) {
        						pos = true;
        					}
        				}
        				else if (cc.js.getClassName(diffArr[i]) === "cc.Color") {
        					diff_color = diffArr[i];
        					if (color === null) {
        						color = true;
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
        			// 根据基本数据 跟 diff数据，生成动作。 缓冲还没有添加
        			let addActFun = function(act1, tmpNode) {
        				let cb = cc.callFunc(tmpDel);
        				let seq = cc.sequence(act1, cb);
        				// cc.log("act", act1, tmpNode);
        				seq.node = tmpNode;
        				actArr.push(seq);
        			}
        			if (actName === "to") {
	        			for (i = 0; i < nodeArr.length; i++) {
	        				let tmpNode = nodeArr[i];
	        				let t = i * diff_delayTime + delayTime;

	        				if (pos === true) {
	        					let move = cc.moveTo(t, diff_pos.mul(i).add(tmpNode));
	        					addActFun(move, tmpNode);
	        				}
	        				else if (pos) { 
	        					// cc.log("pos", t, diff_pos.mul(i).add(pos));
	        					let move = cc.moveTo(t, diff_pos.mul(i).add(pos));
	        					addActFun(move, tmpNode);
	        				}

	        				if (opacity === true) {
	        					let fade = cc.fadeTo(t, diff_opacity * i + tmpNode.opacity);
	        					addActFun(fade, tmpNode);
	        				}
	        				else if (opacity !== null) {
	        					let fade = cc.fadeTo(t, diff_opacity * i + opacity);
	        					addActFun(fade, tmpNode);
	        				}

	        				if (scale === true) {
	        					let act1 = cc.scaleTo(t, diff_scale[0] * i + tmpNode.scaleX, diff_scale[1] * i + tmpNode.scaleY);
	        					addActFun(act1, tmpNode);
	        				}
	        				else if (scale !== null) {
	        					let act1 = cc.scaleTo(t, diff_scale[0] * i + scale[0], diff_scale[1] * i + scale[1]);
	        					addActFun(act1, tmpNode);	
	        				}

	        				if (color === true) {
	        					let {r, g, b} = diff_color;
	        					let act1 = cc.tintTo(t, r * i + tmpNode.color.r, g * i + tmpNode.color.g, b * i + tmpNode.color.b);
	        					addActFun(act1, tmpNode);
	        				}
	        				else if (color !== null) {
	        					let {r, g, b} = diff_color;
	        					let act1 = cc.tintTo(t, r * i + color.r, g * i + color.g, b * i + color.b);
	        					addActFun(act1, tmpNode);	
	        				}

	        			}
        			}
        			else if (actName === "by") {
        				if (color === true) {
        					color = cc.color(0, 0, 0);
        				}
        				if (opacity === true) {
        					opacity = 0;
        				}
        				if (scale === true) {
        					scale = [0, 0];
        				}
        				if (pos === true) {
        					pos = cc.v2(0, 0);
        				}
        				for (i = 0; i < nodeArr.length; i++) {
        					let tmpNode = nodeArr[i];
	        				let t = i * diff_delayTime + delayTime;

	        				if (pos) { 
	        					let move = cc.moveBy(t, diff_pos.mul(i).add(pos));
	        					addActFun(move, tmpNode);
	        				}

	        				if (opacity !== null) {
	        					let fade = cc.fadeTo(t, diff_opacity * i + opacity + tmpNode.opacity);
	        					addActFun(fade, tmpNode);
	        				}

	        				if (scale !== null) {
	        					let act1 = cc.scaleBy(t, diff_scale[0] * i + scale[0], diff_scale[1] * i + scale[1]);
	        					addActFun(act1, tmpNode);	
	        				}

	        				if (color !== null) {
	        					let {r, g, b} = diff_color;
	        					let act1 = cc.tintBy(t, r * i + color.r, g * i + color.g, b * i + color.b);
	        					addActFun(act1, tmpNode);	
	        				}
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