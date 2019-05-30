cc.Class({
    extends: cc.Component,

    properties: {
    },

    start () {
    	cc.jj = this;
    },

    kk () {
    	let node = hjm._a;
    	let arr = node.getChildren();
    	// tz(this.node).to([node], 1, cc.v2(0, 0))();
    	cc.kk = tz(hjm._b, "haha", ()=>{
    		cc.log("nihao");
    	}).moveTo(0.5, -100, 0)
    					  .to([...arr], [1, cc.v2(200, 0)],1, cc.v2(-100, 100), cc.easeIn(3.0))
    					  .by([cc.color(100, 100, 100), 3], 0.5, cc.v2(0, -100))(NaN)();

    	// cc.kk = tz().to([...arr], [cc.v2(200, 0)], cc.v2(0, -100))
    	// 		.to([...arr], [0.2, cc.v2(100, 0), [-20]], 1, cc.v2(-200, -100))();
    	return arr;
    },


    // update (dt) {},
});
