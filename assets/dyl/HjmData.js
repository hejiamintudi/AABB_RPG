"use strict";

window.initHjmDataFun = function () {
	_hjm("level", 0);
	_hjm("level4", 0);
	_hjm("day", -1);
	_hjm("ansNum", 0);

	_hjm("arr", [0, 1]);
	_hjm("tab", {hp: 1, mp: 2});
	_hjm("zxp", {a: 1, b: 2});
};

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	window.initHjmDataFun();
}