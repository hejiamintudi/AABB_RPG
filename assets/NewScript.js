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
        // 16个节点，先排成表格在右方to，然后一个一个走到中间by， 同时颜色，第一排红色，第二批蓝色，第三批绿色，第四排，灰色
        let d = 100;
        let num = 4;
        let x = d * (num - 1) * 0.5;
        let preP = cc.v2(1000, 0);
        let oriP = cc.v2(-x, -x);
        let posFun = function (id) {
            cc.log("posFun");
            arr[id].num = id;
            if (id % 4 === 0) {
                return oriP.add(cc.v2(0, d * id / 4));
            }
        }
        let colorFun = function (id) {
            if (id === 4) {
                return cc.color(0, 255, 0);
            }
            if (id === 8) {
                return cc.color(0, 0, 255);
            }
            if (id === 12) {
                return cc.color(255, 122, 0);
            }
        }
        cc.kk = tz().to([...arr], [cc.v2(d, 0)], 0, oriP, posFun)
                    .to([...arr], 0, cc.color(0, 0, 0))
                    .by([...arr], cc.v2(1000, 0))
                    ._by([...arr], [0.1], 1, cc.v2(-1000, 0))
                     .to([...arr], [0.1, cc.color(10, 10, 10)], 1, cc.color(255, 0, 0), colorFun)
                    ._by([...arr], [0.1], 1, [360])
                    ();


    	// cc.kk = tz(hjm._b, "haha", ()=>{
    	// 	cc.log("nihao");
    	// }).moveTo(0.5, -100, 0)
    	// 				  .to([...arr], [1, cc.v2(200, 0)],1, cc.v2(-100, 100), cc.easeIn(3.0))
    	// 				  .by([3], 0.5, cc.v2(0, -100))(NaN)();

    	// cc.kk = tz().to([...arr], [cc.v2(200, 0)], cc.v2(0, -100))
    	// 		.to([...arr], [0.2, cc.v2(100, 0), [-20]], 1, cc.v2(-200, -100))();
    	return arr;
    },


    // update (dt) {},
});
