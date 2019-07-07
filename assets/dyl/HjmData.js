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

	hjm("coin", 12);
	hjm("deck", ["jian", "dun"]);

	hjm("newCardId", -1); // 当前新卡id
	hjm("newEnId", -1); // 当前新卡id
	hjm("newTalkId", -1); // 当前事件id
	hjm("newEventId", -1); // 存档

	/////////////////////// 
	// 下面是 ai 的全局设置
	var funTab = _dylHjmDataFunTab();

	ai._allCardNameArr = ["aa", "bb", "cc", "dd", "ee"];
	ai._maxCardNum = 4; // 
	ai.newCardNameArr = funTab.getNewArr(ai._maxCardNum, ai._allCardNameArr); // 新卡将会按顺序从这个数组里面开始获取，暂时直接用_maxCardNum，以后是直接根据动态生成这个数量

	ai._allEnNameArr = funTab.dylDataIdToArr("en");
	ai._maxEnNum = 3;
	ai.newEnNameArr = funTab.getNewArr(ai._maxEnNum,  ai._allEnNameArr);

	ai._allTalkNameArr = funTab.tabToNameArr(dylTalkData);
	ai._maxTalkNum = 5;
	ai.newTalkNameArr = funTab.getNewArr(ai._maxTalkNum, ai._allTalkNameArr);

	ai.eventArr = ["main", ...funTab.getEventArr("shop", 2, "en", ai._maxEnNum, "ad", 3)];
};

// 把函数写在这里，这样就可以把需要设置的内容都放在一起了
var _dylHjmDataFunTab = function () {
	var tab = {};

	tab.tabToNameArr = function (data) {
		var nameArr = [];
		for (var i in data) {
			nameArr.push(i);
		}
		return nameArr;
	}

	tab.dylDataIdToArr = function (name) {
		var data = dyl._data[name];
		var arr = [];
		for (var i in data) {
			if (i !== "_data") {
				arr.push(i);
			}
		}
		return arr;
	}

	// 在allArr 里面随机获取num个元素的新数组，元素排序不变
	tab.getNewArr = function (num, allArr) {
		var newArr = [];
		for (var i = 0; i < allArr.length; i++) {
			// r 剩余要获取的数量 / 剩余总数 = 当前元素被提取的概率
			var r = (num - newArr.length) / (allArr.length - i);
			if (dyl.rand() <= r) {
				newArr.push(allArr[i]);
			}
		}
		return newArr;
	}

	// 参数形式 [name, num, name, num ....];
	tab.getEventArr = function (arr) {
		var data = {}; // data[name] = num;
		var nameArr = [];
		var len = 0; // 总数量
		var eventArr = [];
		for (var i = 0; i < arr.length; i += 2) {
			data[arr[i]] = data[arr[i+1]];
			nameArr.push(arr[i]);
			len += arr[i + 1]
		}
		for (var i = 0; i < len; i++) {
			var id = dyl.rand(nameArr.length);
			var name = nameArr[id];
			eventArr.push(name);
			if ((--data[name]) === 0) {
				nameArr[id] = nameArr[nameArr.length - 1];
				nameArr.length--;
			}
		}
		return eventArr;
	}

	return tab;
};

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	var ___ttt = hjm;
    hjm = _hjm;
    window.initHjmDataFun();
    hjm = ___ttt;
}