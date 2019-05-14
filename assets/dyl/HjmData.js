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
	_hjm("coin", 0);
	_hjm("dd", {
		a: "a",
		b: "b"
	});
	_hjm("arr", [1, 2, 3]);
	_hjm("obj", [{a: 23}]);
};

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	window.initHjmDataFun();
}