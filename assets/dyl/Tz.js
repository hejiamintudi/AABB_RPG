var getNowTime = function () {
    let data = new Date();
    return [data.getSeconds(), data.getMilliseconds()];
};

// 空是里面执行 负数是循环次数 NaN是无限循环
window.tz = function (node, ...argArr) {
	let stopActArr = []; // {node： node， act： act};
	let loopArr = []; // 循环数组 参数 fun
	let isStop = -1; // true 代表暂停， false 代表运行中， -1 代表tz没有建立运行，还不能接受true跟false
	
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
	let isDebug = false;
	// isDebug = true;
	dylLog = function (arg) {
		console.log("%c" + String(arg), "color:#fe8bd9;font-weight:bold;");
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
			stopActArr = [];
			let count = actArr.length + 1; // 多加一个，防止数组为空，不执行
			let countFun = function () {
				if (!(--count)) {
					if (isDebug) {
						dylLog("sameArr");
					}
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
					stopActArr = [];
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
				if (isDebug) {
					// dylLog(typeof act.actName);
					dylLog(act.actName);
				}
				tmpEndFun();
			});
			let seq = cc.sequence(act, cfun);
			endFun = function () {
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
		act.node = defaultNode;
		act.actName = data;
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
		if (typeof arr[0] === "boolean") {
			if (isStop === -1) {
				cc.warn("tz 还没有建立运行");
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
        		else {
        			if (typeof node !== "object" || (!node.getChildren)) {
        				arr = [node, ...arr];
        				node = defaultNode;
        			}
        			
        			//////////////////////////// (下面这个缓冲)
        			let ease = null;
        			let easeType = arr[arr.length - 1];
        			if (easeType === "add") {
        				arr.pop();
        				ease = cc.easeIn(2.0);
        			}
        			else if (easeType === "sub") {
        				arr.pop();
        				ease = cc.easeOut(2.0);
        			}
        			else if (easeType === "addSub") {
        				arr.pop();
        				ease = cc.easeInOut(2.0);
        			}
        			else if (easeType === "backAdd") {
        				arr.pop();
        				ease = cc.easeBackIn();
        			}
        			else if (easeType === "subBack") {
        				arr.pop();
        				ease = cc.easeBackOut();
        			}
        			else if (easeType === "backAddSubBack") {
        				arr.pop();
        				ease = cc.easeBackInOut();
        			}
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