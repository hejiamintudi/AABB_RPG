cc.Class({
    extends: cc.Component,

    properties: {
    },

    start () {
        let arr = [...hjm._a.getChildren()];
        let t = 2;
        tz().to(arr, [cc.v2(120, 0), -2], cc.v2(-400, 0), (id, node)=>{node.num = id})();

    },

    // update (dt) {},
});
