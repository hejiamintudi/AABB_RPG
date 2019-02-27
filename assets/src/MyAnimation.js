cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
    	var anim = this.node.getComponent(cc.Animation);
    	cc.ff = ()=>anim.play("hurt");
    },
});