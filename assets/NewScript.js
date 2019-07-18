cc.Class({
    extends: cc.Component,

    properties: {
    },

    start () {
    	let node = hjm._zxp;
        this.node.on("touchstart", function (event) {
    		let p = event.getLocation();
    		cc.log(node.convertToNodeSpace(p));
    	});
    },

    // update (dt) {},
});
