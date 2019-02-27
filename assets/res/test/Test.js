cc.Class({
    extends: cc.Component,
    editor: {
        // menu: " ☒☢ ☺ ☻ ☼ ☽☾ ♠ 　 ♡ ♢ ♣ ♤ ♥ ♦ ",
    },
    properties: {
        role: cc.Node
    },
    onLoad () {
        ai.tz = tz(hjm._a, "tz start")
                  .moveBy(0.4, cc.v2(0, 300))
                  ._moveBy(0.4, cc.v2(0, -300))
                   .moveBy(hjm._b, 0.4, cc.v2(0, -300))
                  ._moveBy(hjm._c, 0.4, cc.v2(0, -300))
                  ._moveBy(0.4, cc.v2(0, 300))
                   .moveBy(hjm._b, 0.4, cc.v2(0, 300))
                  ._moveBy(hjm._c, 0.4, cc.v2(0, 300))
                  .moveBy(0.4, cc.v2(0, -300))
                ("................", -3, "tz end 1111111111111")
                  .moveBy(0.4, cc.v2(0, 300))
                  ._moveBy(0.4, cc.v2(0, -300))
                   .moveBy(hjm._b, 0.4, cc.v2(0, -300))
                  ._moveBy(hjm._c, 0.4, cc.v2(0, -300))
                  ._moveBy(0.4, cc.v2(0, 300))
                   .moveBy(hjm._b, 0.4, cc.v2(0, 300))
                  ._moveBy(hjm._c, 0.4, cc.v2(0, 300))
                  .moveBy(0.4, cc.v2(0, -300))
                ("---------------------", -2, "tz end 22222222222")
                ();
        // let move = cc.moveBy(2, cc.v2(600, 0));
        // hjm._a.runAction(move);
        // setTimeout(()=>{
        //     cc.log("stop");
        //     hjm._a.stopAction(move);
        // }, 500);
        // setTimeout(()=>{
        //     cc.log("resum");
        //     hjm._a.resumeAllActions();
        // }, 2500);
    },

});