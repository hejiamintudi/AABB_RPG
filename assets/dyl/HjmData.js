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

	_hjm("m1", 15);
	_hjm("a1", false);

	_hjm("m2", 16);
	_hjm("a2", {
		a: false,
		b: true
	});

	_hjm("m3", 17);
	_hjm("a3", ["a", "b"]);

	_hjm("m4", 18);
	_hjm("a4", [{
		a: 3
	}])
};

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	window.initHjmDataFun();
}