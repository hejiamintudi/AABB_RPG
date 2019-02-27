cc.Class({
    extends: cc.Component,
    editor: {
        // menu: " ☒☢ ☺ ☻ ☼ ☽☾ ♠ 　 ♡ ♢ ♣ ♤ ♥ ♦ ",
    },
    properties: {
    },

    __preload () {
        cc.log("bb 1");
    },

    onLoad () {
        cc.log("bb 2");
    },

    start () {
        cc.log("bb 3");
    }
});