cc.Class({
    extends: cc.Component,
    properties: {
        dealCardTime: 0.3,
        cardDis: 200,
        cardY: -341,
    },
// library, hand, graveyard
    onLoad () {
        this._touchId = 0; //用来区别每次触摸
    },

    startGame () {
        hjm._hero.def = 0;
        hjm._en.def = 0;

        this.round = 0; // 这代表第几轮

        // 1 我的回合开始
        // 2 出牌攻击
        let arr = [
            "preCombat", 
            "preCombatAct",
                1,  "dealCard", "myGetAllCardData", "myGetAllCardNum", "myPreTurn",  //出牌前
                2,  "touchCard", // 触摸操作
                    "getPlayCard", "myGetAtkData", "myMainSkill", // 获取卡牌数据
                    "myPreAttack", "myPreAttackAct", "myHurt", "myAttack", "myEndAttackAct", "checkDie",
                    "discardBuff", "discard", "myCheckNotCard_2",
                "myEndTurn", // 我方结束回合后 

                "enGetAtkData", 
                "enPreAttack", "enPreAttackAct", "enHurt", "enAttack", "enEndAttackAct", "checkDie",
                "enEndTurn",  
                -1
        ];



        // let arr = [
        //     "preCombat", "runGame"//, "addCardArr", "startGame"
        // ];
        dyl.process(this, arr, true);
    },

    preCombatAct (end) {
        hjm._main.opacity = 0;
        let dis = 800;
        let hero = hjm._hero;
        let en = hjm._en;
        hero.setPosition(cc.v2(-dis, 0).add(hero));
        en.setPosition(cc.v2(dis, 0).add(en));

        tz(hjm._main).fadeTo(1, 255)
                        ._moveBy(hero, 0.4, cc.v2(dis, 0), "subBack")
                        ._moveBy(en, 0.4, cc.v2(-dis, 0), "subBack")
                      (end)();
    },

    // runGame (end) {
    //     let arr = [
    //         "dealCard", "myPreTurn", "myRun"
    //     ];
    //     dyl.process(this, arr);
    // },

    // myRun (end) {
    //     let arr = [
    //         "touchCard",
    //     ];
    //     dyl.process(this, arr);
    // },

    //初始化我的回合，执行回合前buff
    myPreTurn (end) {
        hjm._hero.def = 0;
        this.runBuffArr(end, hjm._hero, "preTurn", null);
        end();
    },

    myGetAllCardData (end) {
        let hand = ai.hand;
        for (let i = hand.length - 1; i >= 0; i--) {
            hand[i].atkData = this.getInitCardData(hand[i]);
            // this.runBuffArr(end, hjm._hero, "myGetCardData", hand[i].atkData,);
            if (hand[i].friendSkill) {
                end(hand[i], "friendSkill", hand[i].atkData, i);
            }
        }
        end();
    },

    myGetAllCardNum (end) {
        for (var i = ai.hand.length - 1; i >= 0; i--) {
            this.getCardNum(i);
        }
        end();
    },

    getCardNum (id) {
        let mainCard = ai.hand[id];
        mainCard.atkData.num = mainCard.atkData.mainNum;
        for (let i = id - 1; i >= 0; i--) {
            let card = ai.hand[i];
            if (card.type !== mainCard.type) {
                break;
            }
            mainCard.atkData.num += card.atkData.friendNum;
        }
        for (let i = id + 1; i < ai.hand.length; i++) {
            let card = ai.hand[i];
            if (card.type !== mainCard.type) {
                break;
            }
            mainCard.atkData.num += card.atkData.friendNum;
        }
        mainCard.power = mainCard.atkData.num;
    },

    getInitCardData (card) {
        return {
            atk: card.atk < 0 ? NaN : card.atk,
            def: card.def,
            // num: this._playCardArr.length,
            num: 0, // num = friend所有的friendNum + 自身mainNum
            friendNum: 1, // 默认为 1
            mainNum: 1, // 默认为 1

            myBuff: [],
            enBuff: [],
            // playCardArr: this._playCardArr,
            playCardArr: null,
            cardType: card.type
        }
    },

    myGetAtkData (end) {
        let mainCard = this._playCardArr[0];
        // let atkData = {
        //     atk: mainCard.atk < 0 ? NaN : mainCard.atk,
        //     def: mainCard.def,
        //     num: this._playCardArr.length,
        //     myBuff: [],
        //     enBuff: [],
        //     playCardArr: this._playCardArr,
        //     cardType: mainCard.type
        // }
        mainCard.atkData.playCardArr = this._playCardArr;
        hjm._hero.atkData = mainCard.atkData;
        end();
    },

    enGetAtkData (end) {
        let EnSkill = this.node.getComponent("EnSkill");
        hjm._en.atkData = EnSkill.addSkill(hjm._en, this.round);
        end();
    },

    // 暂时不要
    // myFriendSkill (end) {
    //     let cardArr = this._playCardArr;
    //     let atkData = hjm._hero.atkData;
    //     for (let i = 1; i < cardArr.length; i++) {
    //         let card = cardArr[i];
    //         if (card.friendSkill) {
    //             // card.friendSkill()
    //             end(card, "friendSkill", atkData);
    //         }
    //     }
    //     end();
    // },

    myMainSkill (end) {
        let card = this._playCardArr[0];
        let atkData = hjm._hero.atkData;
        if (card.mainSkill) {
            if (atkData.num >= card.skillNum) {
                end(card, "mainSkill", atkData);
            }
        }
        end();
    },

    myPreAttack (end) {
        this.runBuffArr(end, hjm._hero, "preAttack", hjm._hero.atkData);
        end();
    },

    enPreAttack (end) {
        this.runBuffArr(end, hjm._en, "preAttack", hjm._en.atkData);
        end();
    },

    myPreAttackAct (end) {
        return this.attackPreAct(end, hjm._hero, hjm._en);
    },

    enPreAttackAct (end) {
        return this.attackPreAct(end, hjm._en, hjm._hero);
    },

    myHurt (end) {
        return this.hurt(end, hjm._hero, hjm._en);
    },

    enHurt (end) {
        return this.hurt(end, hjm._en, hjm._hero);
    },

    myAttack (end) {
        return this.attack(end, hjm._hero, hjm._en);
    },

    enAttack (end) {
        return this.attack(end, hjm._en, hjm._hero);
    },

    myEndAttackAct (end) {
        return this.attackEndAct(end, hjm._hero, hjm._en);  
    },

    enEndAttackAct (end) {
        return this.attackEndAct(end, hjm._en, hjm._hero);  
    },

    // 查看是否还有手牌，如果有，那就继续出牌，否则
    myCheckNotCard_2 (end) {
        if (ai.hand.length === 0) {
            // cc.log("myCheckNotCard_2 0");
            end();
        }
        else {
            // cc.log("myCheckNotCard_2 1");
            end(2);
        }
    },

    discardBuff (end) {
        let role = hjm._hero;
        this.runBuffArr(end, role, "discard", role.atkData);
        end();
    },

    discard (end) {
        return this.resetHandPos(end);
    },

    myEndTurn (end) {
        return this.endTurn(end, hjm._hero);
    },

    enEndTurn (end) {
        return this.endTurn(end, hjm._en);
    },

    // 如果胜负出来，那就不需要运行end了
    checkDie (end) {
        if (hjm._hero.hp <= 0) {
            return this.endGame("lose");
        }
        else if (hjm._en.hp <= 0) {
            return this.endGame("win");
        }
        end();
    },

    endGame (endStr) {
        cc.log(endStr);
        let isWin = endStr === "win";
        let winRole = isWin ? hjm._hero : hjm._en;
        let dieRole = isWin ? hjm._en : hjm._hero;
        this.die(dieRole);
    },

    die (role) {
        tz(role).fadeTo(0.01, 0)();
        hjm._die.add(role);
    },

    endTurn (end, role) {
        this.runBuffArr(end, role, "endTurn", role.atkData);
        end();
    },

    hurt (end, attackRole, getHurtRole) {
        let atkData = attackRole.atkData;
        this.runBuffArr(end, getHurtRole, "hurt", atkData);
        end();
    },

    // 获取受伤数值，受伤
    // 直接给双方加buff
    attack (end, attackRole, getHurtRole) {
        let atkData = attackRole.atkData;
        let {atk, def, num, myBuff, enBuff} = atkData;
        if (isNaN(atk)) { // 如果是非攻击卡，那就没有攻击效果
            atk = 0;
        }
        attackRole.def += def * num;

        // 上面代码是有攻击防御的效果，这里的代码是根据type改变攻击防御效果 以atk为战斗力
        if (atkData.cardType) {
            atk = atk;
            attackRole.def = 0;
        }
        else {
            attackRole.def = atk * num;
            atk = 0;
        }
        //

        let hurtNum = atk * num - getHurtRole.def;

        atkData.hurtNum = hurtNum > 0 ? hurtNum : 0;

        if (hurtNum >= 0) {
            getHurtRole.def = 0;
            getHurtRole.hp -= hurtNum;
        }
        else {
            getHurtRole.def = -hurtNum;
        }

        let Buff = this.node.getComponent("Buff");
        for (let i = 0; i < myBuff.length; i++) {
            // end(Buff, myBuff[i], attackRole, 1);
            if (typeof myBuff[i] === "string") {
                Buff[myBuff[i]](attackRole);
            }
            else {
                let [buffName, buffNum] = myBuff[i];
                Buff[buffName](attackRole, buffNum);   
            }
        }
        for (let i = 0; i < enBuff.length; i++) {
            if (typeof enBuff[i] === "string") {
                Buff[enBuff[i]](getHurtRole);
            }
            else {
                let [buffName, buffNum] = enBuff[i];
                Buff[buffName](getHurtRole, buffNum);   
            }
            // Buff[enBuff[i]](getHurtRole);
        }
        end();
    },

    // 攻击前特效, 攻击角色向前动一下
    attackPreAct (end, attackRole, getHurtRole) {
        let dir = attackRole.type;

        let atkMoveP = cc.v2(100 * dir, 0); // 攻击移动的距离
        let atkMoveTime = 0.2; // 攻击移动的时间

        tz(attackRole)
            .moveBy(atkMoveTime, atkMoveP)
             (end)();

    },

    attackEndAct (end, attackRole, getHurtRole) {
        // 判断是否攻击牌攻击
        let isAttack = !isNaN(attackRole.atkData.atk);
        // if (!isAttack) {
        //     end(); // 没有攻击动画
        // }

        let dir = attackRole.type;
        
        let recoverP = cc.v2(-100 * dir, 0); // 恢复动作的位移
        let recoverTime = 0.4; // 恢复back的时间

        let getHurtActFun = (cb)=>{ //
            // 没有受伤动画
            if (!isAttack) {
                return;
            }
            getHurtRole.en.addRed();

            hjm._eff.add(getHurtRole, -attackRole.atkData.hurtNum);
            dyl.shake(hjm._bg, 0.2);
            tz(getHurtRole)
                ._moveBy(0.1, cc.v2(80 * dir, 0))
                ._rotateTo(0.1, 15 * dir)
                ._moveBy(0.2, cc.v2(-80 * dir, 0))
                ._rotateTo(0.2, 0)
                (cb)();
            return true;
        }

        // let back = cc.moveBy(0.1, cc.v2(20 * dir, 0));
        // let rotate = cc.rotateTo(0.1, 15);
        // let getHurtAct = cc.spawn(back, rotate);

        // let back1 = cc.moveBy(0.2, cc.v2(-20 * dir, 0));
        // let rotate1 = cc.rotateTo(0.2, 0);
        // let getHurtAct1 = cc.spawn(back1, rotate1);

        let act = tz();
        act._moveBy(attackRole, recoverTime, recoverP)
            // .sequence(getHurtRole, getHurtAct, getHurtAct1)
            (getHurtActFun)
           ._(end)();
    },

    //添加触摸，并且临时保存end函数(结束触摸),这个函数暂时不结束，等触摸完再结束
    touchCard (end) {
        // cc.log("touccccc");
        this.node.touch = ["playCard", end];
    },

    newBuffArr (node) {
        let Buff = this.node.getComponent("Buff");
        return Buff.addBuffArr(node);
        // let arr = [];
        // arr.add = function (buffNode) {
        //     if (!buffNode.getChildren) {
        //         return;
        //     }

        //     buffNode.active = true;
        //     buffNode.arrId = this.length;
        //     this.push(buffNode);
        //     this.resetPos();
        // }
        // arr.del = function (buffNode) {
        //     buffNode.id++;
        //     if (!buffNode.getChildren) {
        //         return;
        //     }

        //     buffNode.active = false;
        //     let id = buffNode.arrId;
        //     for (let i = id; i < this.length - 1; i++) {
        //         this[i] = this[i + 1];
        //         this[i].arrId = i;
        //     }   
        //     this.length = this.length - 1;
        //     this.resetPos();
        // }
        // arr.sub = function (end, buffNode, num = 1) {
        //     buffNode.num -= num;
        //     if (buffNode.num <= 0) {
        //         return this.zero(end, buffNode);
        //     }
        //     end();
        // }
        // arr.zero = function (end, buffNode) {
        //     buffNode.num = 0;
        //     this.del(buffNode);
        //     end();
        // }
        // arr.resetPos = function () {
        //     for (let i = this.length - 1; i >= 0; i--) {
        //         this[i].x = x * 100;
        //     }
        // }
        // return arr;
    },

    // 初始化每个角色， 添加buff表
    initNode (role) {
        role.buffArr = this.newBuffArr(role); // 下面是触发技能，这个是buff节点数组
        // node.buffTab = {}; //存放buff节点
        // let buffArr = ["Attack", "Turn", "Combat"];
        // for (var i = buffArr.length - 1; i >= 0; i--) {
        //     let name = buffArr[i];
        //     node["pre" + name] = [];
        //     node["end" + name] = [];
        // }
        // node["hurt"] = [];
        // node["discard"] = [];
    },

    //本场战斗前，英雄，通过遗物获取buff，敌人，获取敌人buff
    preCombat (end) { 
        let relicArr = ["ring"]; // 这是临时设置的遗物
        ai.drawCard = 5; //摸牌数

        this.initNode(hjm._hero);
        this.initNode(hjm._en);

        // 初始化遗物buff
        let Relic = this.node.getComponent("Relic");
        for (let i = 0; i < relicArr.length; i++) {
            Relic[relicArr[i]]();
        }

        // let Buff = this.node.getComponent("Buff");
        //触发我方战斗前的buff效果
        this.runBuffArr(end, hjm._hero, "preCombat", null);
        // for (let i = 0; i < ai.myPreCombat.length; i++) {
        //     end(Buff, hjm._hero.preCombat[i].fun, end, hjm._hero);
        // }

        //触发敌方战斗前的buff效果
        this.runBuffArr(end, hjm._en, "preCombat", null);
        // for (let i = 0; i < ai.enPreCombat.length; i++) {
        //     end(Buff, hjm._en.preCombat[i].fun, end, hjm._en);
        // }
        end();
    },

    runBuffArr (end, role, buffStateName, atkData) {
        let Buff = this.node.getComponent("Buff");
        Buff.runBuffArr(end, role, buffStateName, atkData);

        // let buffArr = role[buffStateName];
        // for (let i = 0; i < buffArr.length; i++) {
        //     // end(Buff, role[buffStateName].fun, end, role);
        //     let buffData = buffArr[i];
        //     if (buffData.id !== dyl.get(buffData, "buffNode", "id")) {
        //         continue;
        //     }
        //     // atkData, buffNode, role
        //     end(buffData, buffData.fun, atkData, buffData.buffNode, role);
        // }
    },

    playCardOn (p, end) {
        cc.log("playCardOn");
        let id = this._touchId;
        // this._isShowCardData = false;
        let {hand} = ai;
        for (let i = 0; i < hand.length; i++) {
            if (p.in(hand[i])) {
                this._playCardId = i;
                // setTimeout(()=>{
                //     if (id === this._touchId) {
                //         this._isShowCardData = true;
                //         return cc.log("卡牌信息，hjmzainali");
                //     }
                // }, 300);
                return true;
            }
        }
        return false;
    },

    playCardLongOn (p, end) {
        cc.log("playCardLongOn");
        let {hand} = ai;
        for (let i = 0; i < hand.length; i++) {
            if (p.in(hand[i])) {
                this._playCardId = i;
                this.showCardData();
                return true;
            }
        }
    },

    playCardLongEnd (p, end) {
        cc.log("playCardLongEnd");
        hjm._cardData.active = false;
    },

    playCardUp (p, end) {
        cc.log("playCardUp");
        this.playCardOut(p);
        if (!this._isShowCardData) {
            this.node.touch = "stop";
            // this.playCard();
            // this._endFun();
            end();
        }
    },

    playCardOut (p) {
        cc.log("playCardOut");
        this._touchId++;
        if (this._isShowCardData) {
            cc.log("取消显示卡牌信息");
        }
    },

    dealCard (end) { // 发牌
        this.round++; // 下一轮

        this.getHand(ai.drawCard);
        this.resetHandPos(end);
        // let hand = ai.hand;
        // let act = tz()._();
        // let oriX = (1 - hand.length) * this.cardDis * 0.5;
        // for (let i = 0; i < hand.length; i++) {
        //     let card = hand[i];
        //     this.setCardType(card, dyl.rand(2));
        //     card.x = 2000;
        //     card.y = this.cardY;
        //     card.setScale(1);
        //     act.moveTo(card, this.dealCardTime, cc.v2(oriX + i * this.cardDis, card.y));
        // }
        // act._()();
    },

    resetHandPos (end) {
        let arr = [...ai.hand]; // 这是手牌，包括要被丢弃的牌和要保留的牌
        let discardArr = []; // 这是代表要被丢弃的牌
        ai.hand.length = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].isInHand) {
                arr[i].opacity = 255;
                ai.hand.push(arr[i]);
            }
            else {
                discardArr.push(arr[i]);
            }
        }

        let hand = ai.hand;
        let act = tz()._();
        // ..........下面要写丢弃牌的动作, 放进弃牌库，还有最后隐藏
        // 向右下角飞去
        let endPos = cc.v2(1000, -600);
        for (let i = 0; i < discardArr.length; i++) {
            let card = discardArr[i];
            ai.graveyard.push(card);
            // act.moveTo(card, this.dealCardTime, endPos);
            act.fadeTo(card, this.dealCardTime, 0);

        }

        let delCardFun = ()=>{
            for (let i = 0; i < discardArr.length; i++) {
                discardArr[i].y = this.cardY;
                discardArr[i].x = 2000;
                discardArr[i].active = false;
                discardArr[i].opacity = 255;
            }
        }

        act._();
        act._();

        let oriX = (1 - hand.length) * this.cardDis * 0.5;
        for (let i = 0; i < hand.length; i++) {
            let card = hand[i];
            card.active = true;
            // card
            // this.setCardType(card, dyl.rand(2));
            // card.x = 2000;
            // card.y = this.cardY;
            // card.setScale(1);
            act.moveTo(card, this.dealCardTime, cc.v2(oriX + i * this.cardDis, this.cardY));
        }


        act._()(delCardFun)(end)();
    },



    // //建立攻击流程图, 牌上移，角色动，根据攻击牌获取攻击前的
    // playCard (end) {
    //     let arr = ["getPlayCard"]
    //     dyl.process(this, arr);
    // },

    copySpr (node1, node2) {
        let spr = node2.getComponent(cc.Sprite).spriteFrame;
        node1.getComponent(cc.Sprite).spriteFrame = spr;
    },

    showCardData () {
        let id = this._playCardId;
        let card = ai.hand[id];
        if (!card) {
            cc.log("没有显示牌");
        }

        let showNode = hjm._cardData;
        showNode.active = true;

        let cardType = card.type;

        // hjm[card.cardName] = showNode.card;
        this.copySpr(showNode.card, card.card);
        showNode.card = (cardType === 0) ? cc.color(204, 51, 51) : cc.color(51, 153, 255);
        
        showNode.cardBg = (cardType === 1);

        showNode.power = card.atkData.num;

        let data = dyl.data("card." + card.cardName, showNode);

        let y = 0;
        let d = 230;
        if (data.mainSkill) {
            showNode.mainSkill = true;
            showNode.mainSkill = cc.v2(true, y);
            y -= d;
        }
        else {
            showNode.mainSkill = false;
            // showNode.mainSkill = cc.v2(true, y);   
        }

        if (data.friendSkill) {
            showNode.friendSkill = true;
            showNode.friendSkill = cc.v2(true, y);
            y -= d;
        }
        else {
            showNode.friendSkill = false;
            // showNode.mainSkill = cc.v2(true, y);   
        }
    },

    //获取攻击的牌，并且向上移动，playCardArr 第一个是主攻卡，后面都是辅助卡
    getPlayCard (end) {
        let id = this._playCardId;
        cc.log("打出第", id, "张卡牌");
        let playCardArr = [];

        this._playCardArr = playCardArr;
        
        // ai.hand[id].isInHand = false;
        // let startId = id;
        
        //判断第i张手牌是否可以被打出
        let type = ai.hand[id].type;

        //判断第 i 张卡的颜色是否跟主攻击卡一样
        let isPlayCard = (i)=>{
            let cardType = dyl.get(ai.hand[i], "type");
            let mainCardType = ai.hand[id].type;
            // cc.log("...................");
            // cc.log(id, i);
            // cc.log("isPlayCard", cardType, mainCardType);
            return cardType === mainCardType;
        }

        //把第i张卡加入打出牌数组
        let pushPlayCardArr = (i)=>{
            let card = ai.hand[i];
            card.isInHand = false;
            playCardArr.push(card);
        }

        pushPlayCardArr(id);

        for (let i = id - 1; isPlayCard(i); i--) {
            // let card = ai.hand[i];
            // card.isInHand = false;
            // playCardArr.push(card);
            // cc.log("left", i);
            pushPlayCardArr(i);
            // startId = i;
        }
        for (let i = id + 1; isPlayCard(i); i++) {
            // cc.log("right", i);
            pushPlayCardArr(i);
        }
        let act = tz()._();
        for (let i = playCardArr.length - 1; i >= 0; i--) {
            // cc.log(i, "iiiiiiii");
            // cc.log(53213, "fds", act);
            // act.moveBy(playCardArr[i], 0.3, cc.v2(0, 100));
            act.fadeTo(playCardArr[i], 0.2, 0);
            if (playCardArr[i].type === 0) {
                hjm._card.add(playCardArr[i], cc.color(204, 51, 51));
            }
            else if (playCardArr[i].type === 1) {
                hjm._card.add(playCardArr[i], cc.color(51, 153, 255));
            }
            else {
                cc.warn("card 的type不是0或1",  type);
            }
        }
        act._()(0.1);
        // cc.log(53213, "hjm");
        // cc.log(ai.hand[id].cardName, playCardArr.length);
        // let discard = ()=>{
        //     cc.log("startId", startId);
        //     ai.hand.splice(startId, playCardArr.length);
        //     ai.graveyard.push(...playCardArr);
        //     for (let i = 0; i < playCardArr.length; i++) {
        //         playCardArr[i].active = false;
        //     }
        //     this.resetHandPos(()=>null);
        // }
        // act(discard)(end)();
        act(end)();
    },

    getHand (n) { //获取手牌节点
        if (ai.library.length >= n) {
            for (let i = 0; i < n; i++) {
                let card = ai.library.pop();
                card.y = this.cardY;
                card.x = 2000;
                // this.setCardType(card, dyl.rand(2));
                card.type = dyl.rand(2);
                card.isInHand = true;
                ai.hand.push(card);
            }
        }  
        else {
            n -= ai.library.length;
            this.getHand(ai.library.length);
            this.shuffleCard();
            if (n > ai.library.length) {
                n = ai.library.length;
            }
            this.getHand(n);
        }
    },

    shuffleCard () { //洗牌, 弃牌堆的牌回到牌库里
        ai.graveyard.sort(()=>(dyl.rand() - 0.5));
        ai.library.push(...ai.graveyard);
        ai.graveyard.length = 0;
        // ai.library.sort();
    },

});