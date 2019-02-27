cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
    },

    //蛇眼，增加摸牌数 1
    ring () {
    	ai.drawCard++; //摸牌数加一
    },
});