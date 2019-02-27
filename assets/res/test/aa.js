cc.Class({
    extends: cc.Component,
    editor: {
        // menu: " ☒☢ ☺ ☻ ☼ ☽☾ ♠ 　 ♡ ♢ ♣ ♤ ♥ ♦ ",
    },
    properties: {
        role: cc.Node
    },

    __preload () {
        this.role.getComponent("bb").enabled = false;
        this.role.getComponent("bb").destroy();
        // let arr = this.role._components;
        // for (let i = 0; i < arr.length; i++) {
        //     if (arr[i] === this.role.getComponent("bb")) {
        //         arr.splice(i, 1);
        //         break;
        //     }
        // }
        // // this.destroy();
        // let node = cc.instantiate(this.role);
        // node.parent = this.node;
    },

    onLoad () {

    },

    start () {
    }
});