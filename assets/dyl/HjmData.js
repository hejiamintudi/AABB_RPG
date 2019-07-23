"use strict";
window.DylIsFinal = false; // 是否最终发布版
// DylIsFinal = true;
if (DylIsFinal) {
	cc.log = function() {};
}

cc.log(cc.sys.isBrowser);
cc.log(cc.sys.isMobile);
cc.log(cc.sys.isNative);

window.initHjmDataFun = function () {
	// hjm("levelId", -1); // 存档

	hjm("coin", 12, true);
	hjm("deck", ["jian", "dun"], true);
	hjm("playDeck", ["jian", "dun"], true);

	hjm("newCardId", -1, true); // 当前新卡id
	hjm("newEnId", -1, true); // 当前新卡id
	hjm("newTalkId", -1, true); // 当前事件id
	hjm("newEventId", -1, true); // 存档

	hjm("seedNum", 0); // 随机种子

	hjm("hp", 10, true);
	hjm("maxHp", 10, true);

	hjm.hp = function (newValue, oldValue, labArr) {
		if (newValue > hjm.maxHp) {
			hjm.hp = hjm.maxHp;
		}
		else if (newValue < 0) {
			hjm.hp = 0;
		}
		else {
			var timeFun = function (node) {
				setTimeout(function(){
					if (cc.isValid(node)) {
						node.setScale(1);
					}
				}, 100);
			}
			for (var i = labArr.length - 1; i >= 0; i--) {
				labArr[i].node.setScale(1.5);
				timeFun(labArr[i].node);
			}
		}
	}

	hjm.maxHp = function (newValue, oldValue, labArr) {
		var timeFun = function (node) {
			setTimeout(function(){
				if (cc.isValid(node)) {
					node.setScale(1);
				}
			}, 100);
		}
		for (var i = labArr.length - 1; i >= 0; i--) {
			labArr[i].node.setScale(1.5);
			timeFun(labArr[i].node);
		}
	}

	hjm.coin = function (newValue, oldValue, labArr) {
		var timeFun = function (node) {
			setTimeout(function(){
				if (cc.isValid(node)) {
					node.setScale(1);
				}
			}, 100);
		}
		for (var i = labArr.length - 1; i >= 0; i--) {
			labArr[i].node.setScale(1.5);
			timeFun(labArr[i].node);
		}
	}

	/////////////////////// 
	// 下面是 ai 的全局设置
	// var funTab = _dylHjmDataFunTab();

	ai._allCardNameArr = ["anjian", "chengzhang", "chongneng"];
	ai._maxCardNum = 3; // 
	ai.newCardNameArr = [];
	

	// ai._allEnNameArr = funTab.dylDataIdToArr("en");
	ai._allEnNameArr = [];
	ai._maxEnNum = 3;
	ai.newEnNameArr = [];
	

	// ai._allTalkNameArr = funTab.tabToNameArr(dylTalkData);
	ai._allTalkNameArr = [];
	ai._maxTalkNum = 5;
	ai.newTalkNameArr = [];
	

	// ai.eventArr = funTab.getEventArr(["shop", 2, "en", ai._maxEnNum, "ad", 3, "talk", 5]);
	ai.eventArr = [];
};

// // 把函数写在这里，这样就可以把需要设置的内容都放在一起了
// var _dylHjmDataFunTab = function () {
// 	var tab = {};

// 	tab.tabToNameArr = function (data) {
// 		var nameArr = [];
// 		for (var i in data) {
// 			nameArr.push(i);
// 		}
// 		return nameArr;
// 	}

// 	tab.dylDataIdToArr = function (name) {
// 		var data = dyl._data[name];
// 		var arr = [];
// 		for (var i in data) {
// 			if (i !== "_data") {
// 				arr.push(i);
// 			}
// 		}
// 		return arr;
// 	}

// 	// 在allArr 里面随机获取num个元素的新数组，元素排序不变
// 	tab.getNewArr = function (num, allArr) {
// 		var newArr = [];
// 		for (var i = 0; i < allArr.length; i++) {
// 			// r 剩余要获取的数量 / 剩余总数 = 当前元素被提取的概率
// 			var r = (num - newArr.length) / (allArr.length - i);
// 			if (dyl.rand() <= r) {
// 				newArr.push(allArr[i]);
// 			}
// 		}
// 		return newArr;
// 	}

// 	// 参数形式 [name, num, name, num ....];
// 	tab.getEventArr = function (arr) {
// 		var data = {}; // data[name] = num;
// 		var nameArr = [];
// 		var len = 0; // 总数量
// 		var eventArr = [];
// 		for (var i = 0; i < arr.length; i += 2) {
// 			if (arr[i + 1] < 1) {
// 				continue;
// 			}
// 			data[arr[i]] = arr[i+1];
// 			nameArr.push(arr[i]);
// 			len += arr[i + 1]
// 		}
// 		for (var i = 0; i < len; i++) {
// 			var id = dyl.rand(nameArr.length);
// 			var name = nameArr[id];
// 			eventArr.push(name);
// 			if ((--data[name]) === 0) {
// 				nameArr[id] = nameArr[nameArr.length - 1];
// 				nameArr.length--;
// 			}
// 		}
// 		return eventArr;
// 	}

// 	return tab;
// };

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	var ___ttt = hjm;
    hjm = _hjm;
    window.initHjmDataFun();
    hjm = ___ttt;
}