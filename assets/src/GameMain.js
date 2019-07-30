cc.Class({
    extends: cc.Component,
    properties: {
        dealCardTime: 0.3,
        cardDis: 200,
        cardY: -341,
    },
// library, hand, graveyard
    onLoad () {
        this.redColor = cc.color(204, 51, 51);
        this.blueColor = cc.color(16, 194, 194);


        dyl.button(this, hjm._endGame);
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
                1,  "enGetAtkData", "enPreAttack", // 敌人的数据要一开始就显示，所以要先获取数据
                    "dealCard", "myPreTurn", "updateDataShow",  //出牌前
                2,  "myGetAllCardData", "myGetAllCardNum", "touchCard", // 触摸操作
                    "delBig", "getPlayCard", "myGetAtkData", "myMainSkill", // 获取卡牌数据
                    "resetHandPos", "myPreAttack", "updateDataShow", "myAddMainDmg", "endPlayCard", "myPreAttackAct", 
                    3, "myAttack_3", 
                        "myEndAttack", "myAddBuff", "myResetHurtAct", "checkDie",
                        // "discardBuff", "discard", 
                        "myCheckNotCard_2",
                "myEndTurn", // 我方结束回合后 

                "enPreTurn", "enAddMainDmg", "enPreAttackAct", 
                    4, "enAttack_4", 
                        "enEndAttack", "enAddBuff", "enResetHurtAct", "checkDie",
                "enEndTurn",  
                -1
        ];



        // let arr = [
        //     "preCombat", "runGame"//, "addCardArr", "startGame"
        // ];
        // dyl.process(this, arr);
        dyl.process(this, arr, true);
    },

    buttonOn (buff) {
        hjm._buffShow.active = true;
        this.showBuff(buff);
    },

    buttonEnd (buff) {
        hjm._buffShow.active = false;
    },

    showBuff (buff) {
        let data = {};
        dyl.data("buff." +  buff.enName, data);
        hjm._buffShow.lab = (data.chName + ": " + data.chLab).replace("x", " " + String(buff.buffData.num) + " ");
        hjm._buffShow.x = buff.x + buff.parent.x + buff.parent.parent.x;
    },

    delBig (end) {
        for (var i = ai.hand.length - 1; i >= 0; i--) {
            ai.hand[i].big = false;
        }
        end();
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

    enPreTurn (end) {
        hjm._en.def = 0;
        this.runBuffArr(end, hjm._en, "preTurn", null);
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
        if (mainCard.power >= mainCard.skillNum) {
            mainCard.big = true;
            mainCard.big = (mainCard.type === 1) ? this.blueColor : this.redColor;
        }
        else {
            mainCard.big = false;
        }
    },

    getInitCardData (card) {
        let data = {
            atk: card.atk < 0 ? NaN : card.atk,
            def: card.def < 0 ? NaN : card.def,
            times : card.times,
            // num: this._playCardArr.length,
            num: 0, // num = friend所有的friendNum + 自身mainNum
            friendNum: 1, // 默认为 1
            mainNum: 1, // 默认为 1

            myBuff: [],
            enBuff: [],
            // playCardArr: this._playCardArr,
            playCardArr: null,
            cardType: card.type,

            dmgArr: [], // 记录不同伤害的数组

            addDataArr: [],
            type: "main"
        }
        // card.def = !!card.def; // 设置def是否显示
        return data;
    },

    // 查看两个数组是否有相同的元素
    isX (type, typeArr) {
        return (typeArr.indexOf(type) !== -1);
        // for (var i = arr1.length - 1; i >= 0; i--) {
        //     if (arr2.indexOf(arr1) !== -1) {
        //         return true;
        //     }
        // }
        // return false;
    },

    // 返回的是一个简约版的dmgData，只要攻击和防御
    getEndData (oriData, buffArr, isChangeOriData) {
        let tab = {
                    atk_mul: 1, // 乘法因子
                    atk_add: 0, // 加法因子
                    def_mul: 1, // 乘法因子
                    def_add: 0 // 加法因子
                }

        // 一种类型的处理
        let oneTypeFun = (data, type)=>{
            if (typeof data[type] === "string") {
                tab[type + "_mul"] *= Number(data[type]);
            }
            else {
                tab[type + "_add"] += data[type];
            }
        } 

        let fun = (data)=>{
            oneTypeFun(data, "atk");
            oneTypeFun(data, "def");
        }

        for (let i = 0; i < buffArr.length; i++) {
            let buff = buffArr[i];
            if (!buff.addFun) {
                continue;
            }
            let addData = buff.addFun();
            // cc.log(oriData.type, addData.typeArr);
            if (this.isX(oriData.type, addData.typeArr)) {
                // cc.log("isX", addData);
                fun(addData);
            }
        }
        // cc.log("endData tab", tab);
        // 数值要向上取整
        let getEndValue = (type)=>{
            return Math.ceil(oriData[type] * tab[type + "_mul"] + tab[type + "_add"]);
        }
        let endData = {
            atk: getEndValue("atk"),
            def: getEndValue("def")
        };

        if (isChangeOriData) {
            for (let i in endData) {
                oriData[i] = endData[i];
            }
        }
        
        return endData;
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
        let data = EnSkill.addSkill(hjm._en, this.round);
        hjm._en.atkData = data;
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

    resetEnShow (data) {
        let en = hjm._en;

        // 意图图案显示
        en.gongshi = !(isNaN(data.atk) || (data.atk === 0));
        en.shoushi = !(isNaN(data.def) || (data.def === 0));
        en.fumian = (hjm._en.atkData.enBuff.length > 0);
        en.qianghua = (hjm._en.atkData.myBuff.length > 0);

        // 攻击力显示
        if (isNaN(data.atk) || (data.atk === 0)) {
            en.atkLab = false;
            return;
        }
        en.atkLab = true;
        let atkStr = String(data.atk);
        if (hjm._en.atkData.times > 1) {
            atkStr = atkStr + " X " + String(hjm._en.atkData.times);
        }
        en.atkLab = atkStr;
    },

    updateDataShow (end = ()=>null) { // 这个没有延迟的
        let enEndData = this.getEndData(hjm._en.atkData, hjm._en.buffArr);
        this.resetEnShow(enEndData);
        end();
    },

    myPreAttackAct (end) {
        return this.attackPreAct(end, hjm._hero, hjm._en);
    },

    addMainDmg (end, role) {
        let atkData = role.atkData;
        this.getEndData (atkData, role.buffArr, true);
        // atkData.dmgArr = [data, ...atkData.dmgArr];
        let data = {
            atk: atkData.atk,
            def: atkData.def,
            name: "main",  //
            type: isNaN(atkData.atk) ? "def" : "ad",   // 
            myBuff: atkData.myBuff,
            enBuff: atkData.enBuff

        };

        // 已经复制给dmgArr了，现在的buff数组是算总数的
        atkData.myBuff = [];
        atkData.enBuff = [];

        let oriDmgArr = [...atkData.dmgArr, data];
        let dmgArr = [];
        // atkData.dmgArr.push(data);
        for (let i = 0; i < atkData.times; i++) {
            for (let j = 0; j < oriDmgArr.length; j++) {
                let newData = {};
                // 深度拷贝
                for (let name in oriDmgArr[j]) {
                    let value = oriDmgArr[j][name];
                    // 只是发现有数组，没有发现对象，所以暂时不考虑这情况
                    if (Array.isArray(value)) {
                        newData[name] = [...value];
                    }
                    else {
                        newData[name] = value;
                    }
                }
                dmgArr.push(newData);
            }
        }
        atkData.dmgArr = dmgArr;
        // let dmgArr = atkData.dmgArr;
        atkData.isAtk = false;

        // 改为实时监测
        // for (var i = dmgArr.length - 1; i >= 0; i--) {
        //     if (!isNaN(dmgArr[i].num)) {
        //         atkData.isAtk = true;
        //         break;
        //     }
        // }
        end();
    },

    myAddMainDmg (end) {
        let atkData = hjm._hero.atkData;
        atkData.atk = atkData.num * atkData.atk;
        atkData.def = atkData.num * atkData.def;
        return this.addMainDmg(end, hjm._hero);
        // let atkData = hjm._hero.atkData;
        // // atkData.dmgArr = [data, ...atkData.dmgArr];
        // let data = {
        //     atk: atkData.num * atkData.atk,
        //     def: atkData.num * atkData.def,
        //     name: "main",  //
        //     type: "ad",
        //     myBuff: atkData.myBuff,
        //     enBuff: atkData.enBuff

        // };
        // let oriDmgArr = [...atkData.dmgArr, data];
        // let dmgArr = [];
        // // atkData.dmgArr.push(data);
        // for (let i = 0; i < atkData.times; i++) {
        //     for (let j = 0; j < oriDmgArr.length; j++) {
        //         let newData = {};
        //         // 深度拷贝
        //         for (let name in oriDmgArr[j]) {
        //             let value = oriDmgArr[j][name];
        //             // 只是发现有数组，没有发现对象，所以暂时不考虑这情况
        //             if (Array.isArray(value)) {
        //                 newData[name] = [...value];
        //             }
        //             else {
        //                 newData[name] = value;
        //             }
        //         }
        //         dmgArr.push(newData);
        //     }
        // }
        // atkData.dmgArr = dmgArr;
        // // let dmgArr = atkData.dmgArr;
        // atkData.isAtk = false;

        // // 改为实时监测
        // // for (var i = dmgArr.length - 1; i >= 0; i--) {
        // //     if (!isNaN(dmgArr[i].num)) {
        // //         atkData.isAtk = true;
        // //         break;
        // //     }
        // // }
        // end();
    },

    endPlayCard (end) {
        this.runBuffArr(end, hjm._hero, "endPlayCard", hjm._hero.atkData);
        end();
    },

    enAddMainDmg (end) {
        return this.addMainDmg(end, hjm._en);
        // let atkData = hjm._en.atkData;
        // atkData.dmgArr = [];
        // for (let i = 0; i < atkData.times; i++) {
        //     let data = {
        //         atk: atkData.atk,
        //         def: atkData.def,
        //         name: "main",
        //         type: "ad",
        //         myBuff: atkData.myBuff,
        //         enBuff: atkData.enBuff
        //     };
        //     atkData.dmgArr.push(data);
        // }
        // atkData.isAtk = false;
        // end();
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

    myAttack_3 (end) {
        return this.attack(end, hjm._hero, hjm._en, 3);
    },

    myEndAttack (end) {
        return this.endAttack(end, hjm._hero);
    },

    enEndAttack (end) {
        return this.endAttack(end, hjm._en);
    },

    endAttack (end, role) {
        this.runBuffArr(end, role, "endAttack", role.atkData);
        end();
    },

    enAttack_4 (end) {
        return this.attack(end, hjm._en, hjm._hero, 4);
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
        this.die(dieRole, isWin);
    },

    die (role, isWin) {
        this.node.touch = "endGame";
        // this.node.bu
        tz(role).fadeTo(0.3, 0)(0.1)(()=>{
            hjm._endGame.active = true;
            if (!isWin) {
                hjm._endGame.lose = true;
                return;
            }
            hjm._endGame.coin = 5;
            if (ai.winCard) {
                hjm._endGame.Card = true;
                hjm._endGame.Coin = cc.v2(true, 0);
                hjm._endGame.Card = cc.v2(true, -130);
                hjm._endGame.next = cc.v2(true, -260);
                hjm[ai.winCard] = hjm._endGame.card.card;
            }
            else {
                hjm._endGame.Card = false;
                hjm._endGame.Coin = cc.v2(true, -65);
                hjm._endGame.next = cc.v2(true, -195);
            }

        })();
        // hjm._die.add(role);
    },

    // coinButton () {
    //     ai.coin += hjm._endGame.coin;
    //     cc.log("获得金币", hjm._endGame.coin, "金币总数", ai.coin);
    // },

    // cardButton () {
    //     cc.log("获得卡片");
    // },

    cardShowButton () {
        hjm._endCardData.active = true;
        hjm._endGame.cardShowButton = false;
        hjm._endGame.next = false;
        this.showEndCardData(hjm._endGame.card);
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

    // 作用完buff后，直接攻击
    oneAttack (end, attackRole, getHurtRole, dmgData) {
        let {atk, name, myBuff, enBuff, def} = dmgData;
        if (isNaN(def)) {
            def = 0;
        }
        let showAtk = atk; // 显示出来的伤害，而atk在下面是表示扣去def后的伤害
        // cc.log("myBuff", )
        // 数值处理
        attackRole.def += def;
        // if (isNaN(attackRole.def)) {
        //     attackRole.def = 0;
        // }
        if (isNaN(atk)) {
            cc.log("不是攻击类型");
        }
        else {
            attackRole.atkData.isAtk = true;
            getHurtRole.getHurt(atk, false);
        }
        // else if (getHurtRole.def > atk) { // 护甲足够，不用扣血
        //     attackRole.atkData.isAtk = true;
        //     getHurtRole.def -= atk;
        //     this.getHurtAct(attackRole, getHurtRole);
        // }
        // else { // 扣血，扣护甲
        //     attackRole.atkData.isAtk = true;
        //     getHurtRole.hp = getHurtRole.hp - atk + getHurtRole.def;
        //     getHurtRole.def = 0;
        //     this.getHurtAct(attackRole, getHurtRole);
        // }


        // buff处理
        attackRole.atkData.myBuff.push(...myBuff);
        // cc.log(".........", enBuff);
        attackRole.atkData.enBuff.push(...enBuff);

        // 特效处理
        if (isNaN(atk)) { // 非攻击状态
            if (hjm._buff[name]) {
                hjm._buff[name].add(cc.v2(getHurtRole));
            }
            else {
                hjm._buff.defaultDef.add(cc.v2(getHurtRole));
            }

        }
        else {             
            if (hjm._buff[name]) {
                hjm._buff[name].add(cc.v2(getHurtRole));
            }
            else {
                hjm._buff.defaultAtk.add(cc.v2(getHurtRole));
            }
        }
        // end();

        // 延时处理
        tz(0.1, end)();
    },

    myAddBuff (end) {
        return this.addBuff(end, hjm._hero, hjm._en);
    },

    enAddBuff (end) {
        return this.addBuff(end, hjm._en, hjm._hero);
    },

    addBuff (end, attackRole, getHurtRole) {
        let {myBuff, enBuff} = attackRole.atkData;
        cc.log("addBuff", enBuff);
        let Buff = this.node.getComponent("Buff");
        for (let i = 0; i < myBuff.length; i++) {
            // end(Buff, myBuff[i], attackRole, 1);
            if (typeof myBuff[i] === "string") {
                // cc.log(Buff, myBuff[i], Buff[myBuff[i]]);
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
        this.updateDataShow();
        cc.log(hjm._en.buffArr[0]);
        end();
    },

    attack_getEndData(end, oriData, buffArr, isChangeOriData) {
        this.getEndData(oriData, buffArr, isChangeOriData);
        end();
    },

    // runBuffArr (end, role, buffStateName, atkData, ...argArr)
    // readNum 是读档数字
    attack (end, attackRole, getHurtRole, readNum) {
        let atkData = attackRole.atkData;
        let dmgArr = atkData.dmgArr;
        if (dmgArr.length === 0) {
            cc.log("attack 0");
            return end();
        }
        let dmgData = dmgArr.pop();
        // if (isNaN(dmgData.atk)) {
        //     dmgData.atk = 0;
        // }
        this.runBuffArr(end, attackRole, "attack", atkData, dmgData);
        end(this, "attack_getEndData", dmgData, attackRole.buffArr, true);
        this.runBuffArr(end, getHurtRole, "hurt", atkData, dmgData, attackRole);
        end(this, "oneAttack", attackRole, getHurtRole, dmgData);
        // cc.log("attack", readNum);
        end(readNum);

        // let atkData = attackRole.atkData;
        // let dmgArr = atkData.dmgArr;
        // // oneAttack (end, dmgData, attackRole, getHurtRole)
        // if (dmgArr.length === 0) {
        //     end();
        // }
        // else {

        // }
        // for (let i = 0; i < dmgArr.length; i++) {
        //     end(this, "runBuffArr", getHurtRole, "hurt", atkData, dmgArr[i]);
        //     end(this, "oneAttack", dmgArr[i], attackRole, getHurtRole);
        // }

        // end();
    },

    // // 获取受伤数值，受伤
    // // 直接给双方加buff
    // attack (end, attackRole, getHurtRole) {
    //     let atkData = attackRole.atkData;
    //     let {atk, def, num, myBuff, enBuff} = atkData;
    //     if (isNaN(atk)) { // 如果是非攻击卡，那就没有攻击效果
    //         atk = 0;
    //     }
    //     attackRole.def += def * num;

    //     // 上面代码是有攻击防御的效果，这里的代码是根据type改变攻击防御效果 以atk为战斗力
    //     // if (atkData.cardType) {
    //     //     atk = atk;
    //     //     attackRole.def = 0;
    //     // }
    //     // else {
    //     //     attackRole.def = atk * num;
    //     //     atk = 0;
    //     // }
    //     ////////////////////////

    //     let hurtNum = atk * num - getHurtRole.def;

    //     atkData.hurtNum = hurtNum > 0 ? hurtNum : 0;

    //     if (hurtNum >= 0) {
    //         getHurtRole.def = 0;
    //         getHurtRole.hp -= hurtNum;
    //     }
    //     else {
    //         getHurtRole.def = -hurtNum;
    //     }

    //     let Buff = this.node.getComponent("Buff");
    //     for (let i = 0; i < myBuff.length; i++) {
    //         // end(Buff, myBuff[i], attackRole, 1);
    //         if (typeof myBuff[i] === "string") {
    //             Buff[myBuff[i]](attackRole);
    //         }
    //         else {
    //             let [buffName, buffNum] = myBuff[i];
    //             Buff[buffName](attackRole, buffNum);   
    //         }
    //     }
    //     for (let i = 0; i < enBuff.length; i++) {
    //         if (typeof enBuff[i] === "string") {
    //             Buff[enBuff[i]](getHurtRole);
    //         }
    //         else {
    //             let [buffName, buffNum] = enBuff[i];
    //             Buff[buffName](getHurtRole, buffNum);   
    //         }
    //         // Buff[enBuff[i]](getHurtRole);
    //     }
    //     end();
    // },

    // 攻击前特效, 攻击角色向前动一下
    attackPreAct (end, attackRole, getHurtRole) {
        attackRole.en.getComponent(cc.Animation).play("attack");

        let dir = attackRole.type;

        let atkMoveP = cc.v2(100 * dir, 0); // 攻击移动的距离
        let atkMoveTime = 0.2; // 攻击移动的时间

        tz(attackRole)
            .moveBy(atkMoveTime, atkMoveP)
             (end)();

    },

    myGetHurtAct (end) {
        return this.getHurtAct(end, hjm._hero, hjm._en);
    },

    myResetHurtAct (end) {
        return this.resetHurtAct(end, hjm._hero, hjm._en);
    },

    enResetHurtAct (end) {
        return this.resetHurtAct(end, hjm._en, hjm._hero);
    },

    resetHurtAct (end, attackRole, getHurtRole) {
        // if (attackRole.atkData.isAtk) {
        //     // getHurtRole.en.subRed();
        //     getHurtRole.en.setPosition(cc.v2(0, 0));
        //     getHurtRole.en.rotation = 0;
        // }
        let recoverTime = 0.2;
        attackRole.en.getComponent(cc.Animation).stop("attack");
        attackRole.resetSpr();
        // let randNum = dyl.rand(238381);
        if (attackRole.atkData.isAtk) {
            getHurtRole.tz(null);
            // cc.log("resetHurtAct false");
            getHurtRole.tz = tz(getHurtRole)
                                ._moveTo(recoverTime, getHurtRole.oriPos)
                                  .rotateTo(getHurtRole.en, recoverTime, 0)
                                  .moveTo(attackRole, recoverTime, attackRole.oriPos)
                                ._rotateTo(attackRole.en, recoverTime, 0)
                                (end)();
            return;
        }
        tz(attackRole)
            ._moveTo(recoverTime, attackRole.oriPos)
            ._rotateTo(recoverTime, 0)
            (end)();
    },

    getHurtAct (attackRole, getHurtRole) {
        let dir = attackRole.type;
        let backTime = 0.1;
        dyl.shake(hjm._bg, backTime);
        getHurtRole.en.oneRed();
        getHurtRole.tz(null);
        // cc.log("getHurtAct false");

        getHurtRole.setPosition(getHurtRole.oriPos);
        getHurtRole.rotation = 0;

        getHurtRole.tz = tz(getHurtRole)
            ._moveBy(backTime, cc.v2(80 * dir, 0))
            ._rotateTo(backTime, 15 * dir)
            ();

        // let isAtk = attackRole.atkData.isAtk;
        // let dir = attackRole.type;
        
        // let recoverP = cc.v2(-100 * dir, 0); // 恢复动作的位移

        // if (isAtk) {
        //     getHurtRole.en.addRed();
        //     dyl.shake(hjm._bg, 0.2);
        //     getHurtRole.en.setPosition(cc.v2(80 * dir, 0));
        //     getHurtRole.en.rotation = 15 * dir;
        // }
        // end();
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

            hjm._eff.add(getHurtRole, -attackRole.atkData.hurtNum); // 待定
            dyl.shake(hjm._bg, 0.2);
            tz(getHurtRole)("1_attackEndAct")
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

        let act = tz()("2_attackEndAct");
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

    runBuffArr (end, role, buffStateName, atkData, ...argArr) {
        let Buff = this.node.getComponent("Buff");
        Buff.runBuffArr(end, role, buffStateName, atkData, ...argArr);

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

    endGameOn (p) {
        if (p.in(hjm._endCardData)) {
            // cc.log("endGameOn");
            hjm._endGame.cardShowButton = true;
            hjm._endGame.next = true;
            hjm._endCardData.active = false;
        }
    },

    // endGameLongOn (p) {
    //     let card = hjm._endGame.card
    //     if (p.in(card)) {
    //         this.showEndCardData(card);
    //     }
    //     return true;
    // },

    // endGameLongEnd (p) {
    //     hjm._endCardData.active = false;
    //     return false;
    // },

    // endGameEnd (p) {
    //     let touchButton = function (buttonName, nullName) {
    //         if (p.in(hjm._endGame[buttonName])) {
    //             hjm._endGame[nullName] = false;
    //             return true;
    //         }
    //         return false;
    //     }

    //     if (touchButton("coinButton", "Coin")) {
    //         this.coinButton();
    //         return false;
    //     }
    //     if (touchButton("cardButton", "Card")) {
    //         this.cardButton();
    //         return false;
    //     }
    //     // if (touchButton("next")) {
    //     //     this.cardButton();
    //     //     return false;
    //     // }

    // },

    addCard (name) {
        let card = hjm._cardLayer.add();
        card.cardName = name;
        card.x = 2000;
        hjm[name] = card.card;
        let {mainSkill, friendSkill} = dyl.data("card." + card.cardName, card);
        let Skill = this.node.getComponent("Skill");
        Skill.addMainSkill(card, mainSkill);
        Skill.addFriendSkill(card, friendSkill);

        this.setCardTypeFun(card);
        return card;
    },

    setCardTypeFun (card) {
        // 查看这个card是否曾经被创建过
        if (card.hasCreate) {
            return;
        }
        card.hasCreate = true;
        let fun = (type)=>{
            if (type === 0) {
                // card.cardColor = cc.color(204, 51, 51);
                card.cardBg = false;
            }
            else if (type === 1) {
                // card.cardColor = cc.color(51, 153, 255);
                card.cardBg = true;
            }
            else {
                return cc.error("setCardType 类型有错，不是 0 或 1", type);
            }
            return type;
        }
        dyl.notify(card, "type", fun);
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
        end();
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
            // ai.graveyard.push(card);
            // act.moveTo(card, this.dealCardTime, endPos);
            act.fadeTo(card, this.dealCardTime, 0);

        }

        let delCardFun = ()=>{
            for (let i = 0; i < discardArr.length; i++) {
                discardArr[i].y = this.cardY;
                discardArr[i].x = 2000;
                // discardArr[i].active = false;
                // discardArr[i].opacity = 255;
                discardArr[i].del();
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


        // act._()(delCardFun)(end)();
        act._()(delCardFun)();
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

    showEndCardData (card) {
        let playColor = cc.color(233, 129, 4);
        let stopColor = cc.color(110, 110, 110);
        // let card = ai.hand[id];

        let showNode = hjm._endCardData;
        showNode.active = true;

        let cardType = 0;

        // hjm[card.cardName] = showNode.card;
        this.copySpr(showNode.card, card.card);
        // showNode.card = (cardType === 0) ? cc.color(204, 51, 51) : cc.color(51, 153, 255);
        
        showNode.cardBg = (cardType === 1);

        showNode.power = false; // 这个不显示

        let data = dyl.data("card." + ai.winCard, showNode);
        // cc.log("showNode atk", showNode.atk);
        // if (showNode.atk < 0) {
        // showNode.Atk = showNode.atk > 0; 
        let atkData = {
            atk: showNode.atk < 0 ? NaN : showNode.atk,
            def: showNode.def < 0 ? NaN : showNode.def,
            type: "main"
        };
        let endData = atkData;
        let fun = (name)=>{
            if (isNaN(atkData[name])) {
                showNode[name + "Lab"] = stopColor;
                showNode[name] = false;
                showNode[name + "AddLab"] = false;
            }
            else {
                showNode[name + "Lab"] = playColor;
                showNode[name] = true;
                showNode[name + "AddLab"] = true;   
                let addNum = endData[name] - atkData[name];
                // cc.log("addNum", name, endData[name], atkData[name], addNum);
                showNode[name] = atkData[name];
                let str = "";
                if (addNum > 0) {
                    showNode[name + "AddLab"] = cc.color(0, 255, 0);
                    str = "(+" + String(addNum) + ")";
                }
                else if (addNum < 0) {
                    showNode[name + "AddLab"] = cc.color(255, 0, 0);
                    str = "(" + String(addNum) + ")";
                }
                showNode[name + "AddLab"] = str;
            }

        }
        fun("atk");
        fun("def");

        let showSkillStr = "";
        let addStrToShowSkillStr = function (str) {
            if (showSkillStr) {
                showSkillStr += "\n";
            }
            showSkillStr += str;
        }
        if (data.mainSkillStr) {
            let str = "技能(" + String(data.skillNum) + ")：" + data.mainSkillStr;
            addStrToShowSkillStr(str);
        }
        if (data.friendSkillStr) {
            let str = "辅助：" + data.friendSkillStr;
            addStrToShowSkillStr(str);
        }
        showNode.skillStr = showSkillStr;

        // showNode.mainSkillLab = playColor;

        // let y = 0;
        // let d = 230;
        // if (data.mainSkill) {
        //     showNode.mainSkill = true;
        //     showNode.mainSkill = cc.v2(true, y);
        //     y -= d;
        // }
        // else {
        //     showNode.mainSkill = false;
        //     // showNode.mainSkill = cc.v2(true, y);   
        // }

        // if (data.friendSkill) {
        //     showNode.friendSkill = true;
        //     showNode.friendSkill = cc.v2(true, y);
        //     y -= d;
        // }
        // else {
        //     showNode.friendSkill = false;
        //     // showNode.mainSkill = cc.v2(true, y);   
        // }
    },

    showCardData () {
        let playColor = cc.color(233, 129, 4);
        let stopColor = cc.color(110, 110, 110);
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
        // showNode.card = (cardType === 0) ? cc.color(204, 51, 51) : cc.color(51, 153, 255);
        
        showNode.cardBg = (cardType === 1);

        showNode.power = card.atkData.num;

        let data = dyl.data("card." + card.cardName, showNode);
        // cc.log("showNode atk", showNode.atk);
        // if (showNode.atk < 0) {
        // showNode.Atk = showNode.atk > 0; 
        let atkData = {
            atk: showNode.atk < 0 ? NaN : showNode.atk,
            def: showNode.def < 0 ? NaN : showNode.def,
            type: "main"
        };
        let endData = this.getEndData(atkData, hjm._hero.buffArr);

        let fun = (name)=>{
            if (isNaN(atkData[name])) {
                showNode[name + "Lab"] = stopColor;
                showNode[name] = false;
                showNode[name + "AddLab"] = false;
            }
            else {
                showNode[name + "Lab"] = playColor;
                showNode[name] = true;
                showNode[name + "AddLab"] = true;   
                let addNum = endData[name] - atkData[name];
                // cc.log("addNum", name, endData[name], atkData[name], addNum);
                showNode[name] = atkData[name];
                let str = "";
                if (addNum > 0) {
                    showNode[name + "AddLab"] = cc.color(0, 255, 0);
                    str = "(+" + String(addNum) + ")";
                }
                else if (addNum < 0) {
                    showNode[name + "AddLab"] = cc.color(255, 0, 0);
                    str = "(" + String(addNum) + ")";
                }
                showNode[name + "AddLab"] = str;
            }

        }
        fun("atk");
        fun("def");

        let showSkillStr = "";
        let addStrToShowSkillStr = function (str) {
            if (showSkillStr) {
                showSkillStr += "\n";
            }
            showSkillStr += str;
        }
        if (data.mainSkillStr) {
            let str = "技能(" + String(data.skillNum) + ")：" + data.mainSkillStr;
            addStrToShowSkillStr(str);
        }
        if (data.friendSkillStr) {
            let str = "辅助：" + data.friendSkillStr;
            addStrToShowSkillStr(str);
        }
        showNode.skillStr = showSkillStr;

        // if (showNode.skillNum <= showNode.power) {
        //     showNode.mainSkillLab = playColor;
        // }
        // else {
        //     showNode.mainSkillLab = stopColor;
        // }

        // let y = 0;
        // let d = 230;
        // if (data.mainSkill) {
        //     showNode.mainSkill = true;
        //     showNode.mainSkill = cc.v2(true, y);
        //     y -= d;
        // }
        // else {
        //     showNode.mainSkill = false;
        //     // showNode.mainSkill = cc.v2(true, y);   
        // }

        // if (data.friendSkill) {
        //     showNode.friendSkill = true;
        //     showNode.friendSkill = cc.v2(true, y);
        //     y -= d;
        // }
        // else {
        //     showNode.friendSkill = false;
        //     // showNode.mainSkill = cc.v2(true, y);   
        // }
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
                hjm._card.add(playCardArr[i], this.redColor);
            }
            else if (playCardArr[i].type === 1) {
                // hjm._card.add(playCardArr[i], cc.color(51, 153, 255));
                hjm._card.add(playCardArr[i], this.blueColor);
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
        while (n--) {
            let card = this.addCard(ai.cardNameArr[dyl.rand(ai.cardNameArr.length)]);
            card.y = this.cardY;
            card.x = 2000;
            card.type = dyl.rand(2);
            card.isInHand = true;
            ai.hand.push(card);
        }
        return;

        // if (ai.library.length >= n) {
        //     for (let i = 0; i < n; i++) {
        //         let card = ai.library.pop();
        //         card.y = this.cardY;
        //         card.x = 2000;
        //         // this.setCardType(card, dyl.rand(2));
        //         card.type = dyl.rand(2);
        //         card.isInHand = true;
        //         ai.hand.push(card);
        //     }
        // }  
        // else {
        //     n -= ai.library.length;
        //     this.getHand(ai.library.length);
        //     this.shuffleCard();
        //     if (n > ai.library.length) {
        //         n = ai.library.length;
        //     }
        //     this.getHand(n);
        // }
    },

    shuffleCard () { //洗牌, 弃牌堆的牌回到牌库里
        ai.graveyard.sort(()=>(dyl.rand() - 0.5));
        ai.library.push(...ai.graveyard);
        ai.graveyard.length = 0;
        // ai.library.sort();
    },

});