cc.Class({
    extends: cc.Component,

    properties: {
    },

    start () {
        let arr = [...hjm._a.getChildren()];
        let t = 2;
        dyl.arr(arr, cc.color(255, 255, 0), 255, (i, node)=>{
            if (i === t) {
                // node.active = false;
                // cc.nn = node;
                t--;
                return [hjm._c, hjm._d];
            }
        }, (i, node)=>{
            return cc.v2((i - 3) * 110, -100);
        }, (i, node)=>{
            if (i === 4) {
                return 100;
            }
            if (i === 8) {
                return 255;
            }
            if (i === 12) {
                return 1000;
            }

        }, i=>({num: i}));
    },

    // update (dt) {},
});
