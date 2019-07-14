cc.Class({
    extends: cc.Component,
    properties: {
    },

    start () {
        this._delayTime = 0.1;
        this._moveTime = 0.3;
        // this.replyArr = [];
        // this.node.button = [hjm._button];
        // let arr = ["initCard", "pushCard", "resetPos", "autoChoose"];
        // dyl.process(this, arr);
        this.initAi();
        this.initVar();
        // this.next();
        this.changeEvent(null, "main");
        dyl.button(this, hjm._buttonLab);
    },

    initAi () {
        dyl.setRand(1);
        let tabToNameArr = function (data) {
            var nameArr = [];
            for (var i in data) {
                nameArr.push(i);
            }
            return nameArr;
        }

        let dylDataIdToArr = function (name) {
            var data = dyl._data[name];
            var arr = [];
            for (var i in data) {
                if (i !== "_data") {
                    arr.push(i);
                }
            }
            return arr;
        }

        // 在allArr 里面随机获取num个元素的新数组，元素排序不变
        let getNewArr = function (num, allArr) {
            var newArr = [];
            for (var i = 0; i < allArr.length; i++) {
                // r 剩余要获取的数量 / 剩余总数 = 当前元素被提取的概率
                var r = (num - newArr.length) / (allArr.length - i);
                if (dyl.rand() <= r) {
                    newArr.push(allArr[i]);
                }
            }
            return newArr;
        }

        // 参数形式 [name, num, name, num ....];
        let getEventArr = function (arr) {
            var data = {}; // data[name] = num;
            var nameArr = [];
            var len = 0; // 总数量
            var eventArr = [];
            for (var i = 0; i < arr.length; i += 2) {
                if (arr[i + 1] < 1) {
                    continue;
                }
                data[arr[i]] = arr[i+1];
                nameArr.push(arr[i]);
                len += arr[i + 1]
            }
            for (var i = 0; i < len; i++) {
                var id = dyl.rand(nameArr.length);
                var name = nameArr[id];
                eventArr.push(name);
                if ((--data[name]) === 0) {
                    nameArr[id] = nameArr[nameArr.length - 1];
                    nameArr.length--;
                }
            }
            return eventArr;
        }

        ai._allEnNameArr = dylDataIdToArr("en");
        ai._allTalkNameArr = tabToNameArr(dylTalkData);
        ai.newCardNameArr = getNewArr(ai._maxCardNum, ai._allCardNameArr); // 新卡将会按顺序从这个数组里面开始获取，暂时直接用_maxCardNum，以后是直接根据动态生成这个数量
        ai.newEnNameArr = getNewArr(ai._maxEnNum,  ai._allEnNameArr);
        ai.newTalkNameArr = getNewArr(ai._maxTalkNum, ai._allTalkNameArr);
        ai.eventArr = getEventArr(["talk", 2, "shop", 1]);
    },

    initVar () {
        this._nowEvent = "main"; // 当前事件是空
    },

    changeEvent (e1, e2) {
        let arr = [];
        if (e1) {
            arr.push(e1 + "Leave");
        }
        if (e2) {
            this.node.touch = e2;
            arr.push(e2 + "Come");
        }
        dyl.process(this, arr);
    },

    next () { // 下一个状态
        let e1 = this._nowEvent;
        let e2 = this._nowEvent = ai.eventArr[++hjm.newEventId];
        cc.log("next", e1, "...", e2, "||||");
        this.changeEvent(e1, e2);
    },

    getMainButtonArr () {
        let mainButtonArr = [];
        if (hjm.newEventId > -1) { // 没有存档，就是少了一个button
            mainButtonArr.push(hjm._buttonLab.continueGameMainButton);
        }
        mainButtonArr.push(hjm._buttonLab.newGameMainButton);
        return mainButtonArr;
    },

// main 开始界面
    mainCome (end) {
        hjm._other = [false];
        let mainButtonArr = this.getMainButtonArr();
        dyl.arr(mainButtonArr, true, cc.v2(1000, true));
        tz().by(mainButtonArr, [this._delayTime], this._moveTime, cc.v2(-1000, 0))(end)();
    },

    mainLeave (end) {
        hjm._other = [true];
        let mainButtonArr = this.getMainButtonArr();
        let endFun = function () {
            dyl.arr(mainButtonArr, false);
            end();
        }
        tz().by(mainButtonArr, [this._delayTime], this._moveTime, cc.v2(-1500, 0))(endFun)();
    },

// talk 聊天界面
// data = arr [0: lab显示的字符串， ...(回复，回复后的显示和奖励)]
// 奖励 str num
    talkCome (end) {
        let name = ai.newTalkNameArr[++hjm.newTalkId];
        let dataArr = dylTalkData[name];
        let pool = hjm._talk_pool;
        let lab = hjm._talk_lab;
        lab.str = dataArr[0];
        // cc.log("talkCome..........");
        tz([lab, true, cc.v2(0, 1000)], [pool, true])
            .to(lab, this._moveTime, cc.v2(0, 290))();


        // 
        let replyStrArr = []; // 回复的显示的字符串
        // let replyDataArr = []; // replay: 点击后的回复显示， 其他是： 奖励名：数量

        for (let i = 1; i < dataArr.length; i += 2) {
            replyStrArr.push(dataArr[i]);

            // 节点设置
            let lab = hjm._talk_pool.add();
            lab.str = dataArr[i];

            let data = {}; // replay: 点击后的回复显示， 其他是： 奖励名：数量
            let  [replay, ...rewardArr] = dyl.get(dataArr[i + 1], " ");
            // cc.log("replay", dataArr[i], replay, rewardArr);
            data.replay = replay;
            for (let j = 0; j < rewardArr.length; j += 2) {
                data[rewardArr[j]] = Number(rewardArr[j + 1]);
            }
            // replyDataArr.push(data);         
            // let node = pool.add();   
            lab.data = data;
        }



        pool = [...pool.pool];
        // 节点从右到左移动
        tz().to(pool, [cc.v2(0, -100)], cc.v2(1500, 0))
            .by(pool, [0.2], 0.4, cc.v2(-1500, 0))(end)();
        // tz([])

    },

    talkLeave (end) {
        hjm._buttonLab.nextButton = false;
        let pool = [...hjm._talk_pool.pool];
        tz()._to(hjm._talk_lab, this._moveTime, cc.v2(0, 1500))
            ._by(pool, [this._delayTime], this._moveTime, cc.v2(-1500, 0))
            ([pool, "del"])
            ([hjm._talk_lab, false])(end)();
    },

    talkEnd (p) {
        cc.log("talk end");
        let node = p.in(...hjm._talk_pool.pool);
        if (!node) {
            return;
        }

        let data = node.data; // replay: 点击后的回复显示， 其他是： 奖励名：数量

        if (data.replay === "") {
            return this.next();
        }

        // 赋值 数据处理
        let newCard = null;
        hjm._talk_lab.str = data.replay;
        // hjm._buttonLab.nextButton = true;
        let actNodeArr = []; // 这是奖励节点数组

        if (data.maxHp) {
            hjm.maxHp += data.maxHp;
            if (data.maxHp > 0) {
                hjm._talk_rewardLab.maxHpLab.num = "+" + data.maxHp;
            }
            else if (data.maxHp < 0) {
                hjm._talk_rewardLab.maxHpLab.num = "" + data.maxHp;    
            }
            actNodeArr.push(hjm._talk_rewardLab.maxHpLab);
        }
        if (data.hp) {
            hjm.hp += data.hp;
            if (data.hp > 0) {
                hjm._talk_rewardLab.hpLab.num = "+" + data.hp;
            }
            else if (data.hp < 0) {
                hjm._talk_rewardLab.hpLab.num = "" + data.hp;    
            }
            actNodeArr.push(hjm._talk_rewardLab.hpLab);
        }
        if (data.coin) {
            hjm._talk_rewardLab.coinLab.num = "+" + String(data.coin);
            hjm.coin += data.coin;
            actNodeArr.push(hjm._talk_rewardLab.coinLab);
        }
        if (data.card) {
            let newCardName = ai.newCardNameArr[++hjm.newCardId];
            // cc.log("card", newCardName);
            hjm._talk_rewardLab.cardLab.active = true;
            hjm[newCardName] = hjm._talk_rewardLab.cardLab.card; // 加载图片
            hjm.deck.push(newCardName);
            actNodeArr.push(hjm._talk_rewardLab.cardLab);
            this.node.touch = ["talk1", hjm._talk_rewardLab.cardLab, newCardName];
        }

        let y0 = -368; // 下边界的 y 坐标
        let y1 = 46; // 上边界的 y 坐标
        let h = 120; // 奖励节点的 高
        let n = actNodeArr.length; // 奖励节点的数量

        // actNodeArr.push(hjm._buttonLab.nextButton);
        // 动画效果: 回复离开， 然后奖励节点缩放从小到大，这个要反弹, 位置

        let act = tz([hjm._buttonLab.nextButton, true, [0, 0]]);
        let pool = [...hjm._talk_pool.pool];
        act([actNodeArr, true, [0, 0]])
            .by(pool, [this._delayTime], this._moveTime, cc.v2(-1500, 0))
            ([pool, "del"])
            // ([actNodeArr, true, [0, 0]])
            .to(actNodeArr, 0, cc.v2(0, 0), function (i, node) {
                // let y = ((y1 - y0 - h * n) / (n + 1) + 0.5 * h) * (i + 1) + y0;
                let y = (y1 - y0 + h) / (n + 1) * (i + 1) - (0.5 * h) + y0;
                return cc.v2(0, y);
            })
            .to([hjm._buttonLab.nextButton, ...actNodeArr], [this._delayTime], this._moveTime, [1, 1], cc.easeBackOut())();
        // lab 赋值， pool的离开， 奖励的出现， next的按钮

    },

    talk1LongOn (p, cardNode, name) {
        this.showCardData(cardNode, name);
        return true;
    },

    talk1End (p) {
        hjm._cardDataLab = [false];
    },

////////////// shop
    shopCome (end) {
        for (let i = 0; i < 3; i++) {
            let name = ai.newCardNameArr[++hjm.newCardId];
            let node = hjm._shop_pool.add();
            hjm[name] = node.card;
            node.name = name;
            let coin = dyl.data("card." + name).coin// 价格
            node.button.add("deck." + name, coin);
        }
        let nodeArr = hjm._shop_pool.pool;
        // let y = nodeArr[0].y; // 固定高度
        let d = 200;
        dyl.arr(nodeArr, cc.v2(1500, true));
        // hjm._cardDataLab = [true];
        tz([hjm._cardDataLab, true])
          ([hjm._buttonLab.nextButton, true, [0, 0]])
          ([hjm._cardDataLab.bg1, false])
            .by(hjm._cardDataLab, 0, cc.v2(0, 1000))
            ._by(hjm._cardDataLab, this._moveTime, cc.v2(0, -1000), cc.easeBackOut())
             .to(hjm._buttonLab.nextButton, this._moveTime, [1, 1], cc.easeBackOut())
            ._to(nodeArr, [this._delayTime, cc.v2(d, 0)], this._moveTime, cc.v2(-d, true))
             (()=>{
                hjm._shop_choose = [true];
                this.shopChoose(nodeArr[0]);
             })(end)();
        // this.showCardData(nodeArr[0], nodeArr[0].name);
        
    },
// pool cardDataLab-bg1 nextButton  shop_choose
    shopLeave (end) {
        hjm._shop_choose = [false];
        hjm._cardDataLab.bg1 = true;
        hjm._cardDataLab = [false];
        let pool = [...hjm._shop_pool.pool];
        tz()._by(pool, [this._delayTime], this._moveTime, cc.v2(-1500, 0))
            ._to(hjm._buttonLab.nextButton, this._moveTime, [0, 0])
            ([hjm._buttonLab.nextButton, false])(end)();
    },

    shopChoose (node) {
        this.showCardData(node, node.name);
        cc.log("shop_choose", node.x, node.y, node);
        hjm._shop_choose = [cc.v2(node.x, true)];
    },

    shopOn (p) {
        let node = p.in(...hjm._shop_pool.pool);
        if (!node) {
            return;
        }
        this.shopChoose(node);
    },

    copySpr (node1, node2) {
        let spr = node2.getComponent(cc.Sprite).spriteFrame;
        node1.getComponent(cc.Sprite).spriteFrame = spr;
    },

    showCardData (card, name) {
        let playColor = cc.color(233, 129, 4);
        let stopColor = cc.color(110, 110, 110);

        let showNode = hjm._cardDataLab;
        showNode.active = true;

        let cardType = 0;

        this.copySpr(showNode.card, card.card);
        
        showNode.cardBg = true;

        showNode.power = false; // 这个不显示

        let data = dyl.data("card." + name, showNode);
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

    nextButton () {
        cc.log("nextButton");
        let e = this._nowEvent;
        if (e === "talk") {
            let nodeArr = [hjm._buttonLab.nextButton, ...hjm._talk_rewardLab.getChildren()];
            // hjm._talk_rewardLab.coinLab.active && nodeArr.push(hjm._talk_rewardLab.coinLab);
            // hjm._talk_rewardLab.cardLab.active && nodeArr.push(hjm._talk_rewardLab.cardLab);
            cc.log("nodeArr1", nodeArr);
            dyl.arr(nodeArr, (i, node)=>{
                if (!node.active) {
                    return null;
                }
            })
            cc.log("nodeArr2", nodeArr);
            tz()._to(hjm._talk_lab, this._moveTime, cc.v2(0, 1500))
                ._to(nodeArr, this._moveTime, [0, 0])
                ([nodeArr, false])
                ([[hjm._talk_lab], false])(()=>{
                    this._nowEvent = null;
                    this.next();
                })();
        }
        else {
            this.next();
        }
    },

    newGameMainButton () {
        cc.log("newGameMainButton");
        hjm(true); // 清空之前的存档
        let seedNum = Math.random() * 10000 + 23 >> 0;
        cc.log("随机种子是", seedNum);
        hjm.seedNum = seedNum;
        dyl.setRand(seedNum);
        this.next();
    },

    continueGameMainButton () {
        cc.log("continueGameMainButton");
        cc.log("随机种子是", hjm.seedNum);
        dyl.setRand(hjm.seedNum);
        this.next();
    },

//     ////////////////////////////////
//     ///////   下面都是需要注释的
//     ////////////////////

//     pushCard (end) {
//         // this.initCard();
//         this.hand = [];
//         cc.hand = this.hand;
//         for (let i = 0; i < 3; i++) {
//             let card = this.addCard();
//             this.hand.push(card);
//         }
//         end();
//         // this.resetPos();
//     },

//     autoChoose (end) {
//         this.nowCard = null; // 表示当前选择的card
//         this.choose(this.hand[0]);
//         this.node.touch = "chooseCard";
//         end();
//     },

//     chooseCardOn (p) {
//         let card = p.in(...this.hand);
//         if (!card) {
//             return;
//         }
//         this.choose(card);
//     },

//     choose (card) {
//         // hjm._choose.active = true;
//         // hjm._choose.setPosition(cc.v2(card).add(card.parent));
//         hjm._choose = [true, cc.v2(card).add(card.parent)];

//         let data = card.npcData;
//         let dataId = data.id;

//         let chat = data.chatArr[dataId];
//         if (chat.doing) {
//             data.doing = chat.doing;
//         }
//         hjm._talk.lab = data.doing;

//         if (this.nowCard) {
//             // this.leaveCard(this.nowCard);
//              // 这是点击其他手牌时，中间角色卡的离开
//     // leaveCard (card) {
//             // 暂时只是说聊天npc的，特殊情况晚点再上面加
//             let showCard0 = hjm._who.pool[0]; // 这里是中间的角色，不是下面的卡牌
//             hjm._button.active = false;
//             tz(showCard0).moveTo(0.5, -1500, showCard0.y)
//                         (()=>{
//                             showCard0.x = 1500;
//                             showCard0.del();
//                         })();
//         // }, 
//         }
//         this.nowCard = card;
//         let name = card.npcData.name;

//         // 暂时只是说聊天npc的，特殊情况晚点再上面加
//         let showCard = hjm._who.add();
//         showCard.x = 1500;
//         showCard.lab = name;
//         tz(showCard, 0.1).moveTo(0.3, 0, showCard.y)
//                         (()=>{
//                             hjm._button.active = true;
//                         })();
//         // this.comeCard(this.nowCard);
//     },

//     // comeCard (card) {
//     //     let name = card.npcData.name;

//     //     // 暂时只是说聊天npc的，特殊情况晚点再上面加
//     //     let showCard = hjm._who.add();
//     //     showCard.x = 1500;
//     //     showCard.lab = name;
//     //     tz(showCard, 0.1).moveTo(0.3, 0, showCard.y)
//     //                     (()=>{
//     //                         hjm._button.active = true;
//     //                     })();
//     // },

//     buttonOn (node) {
//         // cc.log("buttonOn", this.node.touch);
//         this[this.node.touch + "Button"](node);
//     },

//     talkButton (replyNode) {
//         // cc.log(replyNode.lab);
//         let {keep, id, otherId, coin} = replyNode.reply;
//         let data = this.nowCard.npcData;
//         if (coin) {
//             hjm.coin += coin;
//         }
//         if (keep === true) {
//             data.keep = true;
//         }
//         if (typeof keep === "number") {
//             data.keep = true;
//             data.id = keep;
//         }
//         if (otherId) {
//             for (let i = this.cardDataArr.length - 1; i >= 0; i--) {
//                 if (this.cardDataArr[i].name === otherId[0]) {
//                     this.cardDataArr[i].id = otherId[1];
//                     break;
//                 }
//             }
//         }
//         if (typeof id === "number") {
//             this.changeId(id);
//             return;
//         }
//         // 因为没有跳转，所以删除当前聊天并，退出聊天窗口
//         this.delCard(this.nowCard);
//         dyl.process(this, ["leaveTalk", "comeMain"]);
//     },

//     chooseCardButton (button) {
//         hjm._choose.active = false;
//         this.node.touch = "talk";
//         this.node.button = this.replyArr;
//         let arr = ["leaveMain", "comeTalk"];
//         dyl.process(this, arr);
//     },

//     comeMain (end) {
//         dyl.process(this, ["resetPos", "autoChoose", ()=>{
//             this.node.button = [hjm._button];
//             this.node.touch = "chooseCard";
//         }, end]);
//     },

//     // 离开主面板，进入其他版块的模式（聊天，shop等等）
//     leaveMain (end) { 
//         hjm._button.active = false;
//         let card = hjm._who.pool[0];
//         tz().moveTo(card, 0.1, -1500, card.y)
//             (()=>{
//                 card.x = 1500;
//                 card.del();
//             })
//             ((cb)=>{
//                 this.resetPos(cb, -1);
//                 return true;
//             })(end)();
//     },

//     // 进入商店面板
//     comeShop (end) {
//         let cardNameArr = ["aa", "bb", "cc"];
//         let cardArr = []; // 商品展示的卡组
//         for (let i = 0; i < cardNameArr.length; i++) {
//             let name = cardNameArr[i];
//             let card = hjm._shop.add();
//             card.x = 1000;
//             hjm[name] = card.card; // 动态加载图片
//             let data = {};
//             dyl.data("card." + name, data);
//             card.buy.add(data.coin, "deck." + name);
//         }
//         let d = 250; // 两张卡牌之间距离
//         let leftX = (1 - len) * d / 2; // 最左卡牌的横坐标
//         let y = cardArr[0].y; // 卡牌的纵坐标
//         tz.to(cardArr, [cc.v2(d, 0), 0.3], 0.5, cc.v2(leftX, y))(end)();
//     },

//     setWinButton (leaveWinName, comeWinName, str) {
        
//     },

//     // 进入聊天面板
//     // 只需要添加回复ui就好了
//     comeTalk (end) {
//         let data = this.nowCard.npcData;
//         let chat = data.chatArr[data.id];
//         hjm._talk.lab = chat.talk;
//         let replyArr = chat.replyArr;
//         // this.replyArr = [...replyArr];
//         this.replyArr.length = 0;
//         let act = tz();
//         for (let i = 0; i < replyArr.length; i++) {
//             let node = hjm._reply.add();
//             this.replyArr.push(node); 
//             node.reply = replyArr[i];
//             node.lab = replyArr[i].talk;
//             let startPos = cc.v2(1500, -100 * i);
//             node.setPosition(startPos);
//             act.moveTo(node, 0.2, 0, startPos.y);
//         }
//         act(end)();
//     },

//     leaveTalk (end) {
//         let replyArr = this.replyArr;
//         let act = tz();
//         for (let i = 0; i < replyArr.length; i++) {
//             act.moveTo(replyArr[i], 0.2, -1500, replyArr[i].y);
//             act(()=>replyArr[i].del());
//         }
//         act(end)();
//     },

   

//     // dir： 1 代表卡牌进入， -1代表卡牌退出
//     resetPos (end, dir = 1) {
//         let hand = this.hand;
//         let speed = 4000;

//         //////////////////////////////
//         if (hand.length === 0) {
//             cc.warn("没有手牌，不可能吧？");
//             end();
//             return;
//         }

// ///////////////
//         let x = -1000 + (1 - hand.length) * 200
//         let preFun = function (id) {
//             hand[id].active = true;
//             if (dir > 0) {
//                 hand[id].x = 1000 + 400 * id;
//             }
//         }
//         let endFun = function () {
//             if (dir < 0) {
//                 for (let i = hand.length - 1; i >= 0; i--) {
//                     hand[i].x = 1500;
//                     hand[i].active = false;
//                 }
//             }
//         }
//         // let data = hand[i].npcData;
//         tz().by(hand, [0.3], 0.5, cc.v2(x, 0), preFun)(endFun, end)();

//         // let act = tz();
//         // for (let i = 0; i < hand.length; i++) {
//         //     hand[i].active = true;
//         //     let data = hand[i].npcData;
//         //     let x = (dir > 0) ? (400 * (i - 1)) : -1500;
//         //     let t = Math.abs(hand[i].x - x) / speed;
//         //     act.moveTo(hand[i], t, x, hand[i].y);
//         //     if (dir < 0) {
//         //         act(()=>{
//         //             hand[i].x = 1500;
//         //             hand[i].active = false;
//         //             // hand[i].del();
//         //         })
//         //     }
//         // }
//         // act(end)();
//     },

//     // 旧卡删除，新卡填补，没有卡，那就
//     addCard () {
//         let data = this.cardDataArr[this.cardId++];
//         if (!data) {
//             return null;
//         }
//         let card = hjm._card.add();
//         card.lab = data.name;

//         // data.node = card;
//         card.npcData = data;
//         card.x = 1500;
//         return card;
//     },

//     // 删除 添加 重新设置位置
//     delCard (card) {
//         let id = this.hand.indexOf(card);
//         card.del();
//         this.hand.splice(id, 1);
//         card = this.addCard();
//         if (card) {
//             this.hand.push(card);
//         }
//         // this.resetPos(()=>null);
//     },

//     initCard (end) {
//         this.cardId = 0;
//         let cardDataArr = [];
//         let pId = 0;
//         for (let i in windowCardData) {
//             let cardData = this.getCardData(i, windowCardData[i]);
//             cardData.pId = pId;
//             cardDataArr.push(cardData);
//         }
//         this.cardDataArr = cardDataArr;
//         end();
//     },

//     getCardData (name, dataArr) {
//         let npcData = {};

//         // 首先是name的特别处理
//         let nameArr = name.split("_");
//         let nameStr = nameArr[0];
//         for (let i = 1; i < nameArr.length; i++) {
//             nameStr += ("(" + nameArr[i] + ")");
//         }
//         npcData.name = nameStr;
//         npcData.id = 0;
//         npcData.node = null;

//         let chatArr = []; 
//         npcData.chatArr = chatArr;

//         let chatData = null;
//         for (let i = 0; i < dataArr.length; i++) {
//             let data = dataArr[i];
//             // 字符串，新的对话
//             if (typeof data === "string") {
//                 if (chatData) {
//                     chatArr.push(chatData);
//                 }
//                 chatData = {}

//                 let nextData = dataArr[i + 1];
//                 // 有描述版的
//                 if (typeof nextData === "string") {
//                     chatData.doing = data;
//                     chatData.talk = nextData;
//                     chatData.replyArr = [];
//                     i++;
//                 }
//                 // 没描述版的
//                 else {
//                     chatData.doing = null;
//                     chatData.talk = data;
//                     chatData.replyArr = [];
//                 }
//             }
//             // 数组，添加回复
//             else {
//                 let reply = {};
//                 // let arr = data.split(" ");
//                 let arr = data;
//                 reply.talk = arr[0];
//                 // keep 代表卡牌聊完后，要么跳转，要么停留 
//                 for (let j = 1; j < arr.length; j++) {
//                     if (arr[j] = "keep") {
//                         reply.keep = true;
//                     }
//                     // 跳转
//                     else if (typeof arr[j] === "string") {
//                         let tmpStr = arr[j].split("_");
//                         if (tmpStr.length > 1) {
//                             if (tmpStr[0] === "keep") {
//                                 reply.keep = Number(tmpStr[1]);
//                             }
//                             else {
//                                 reply.otherId = [tmpStr[0], Number(tmpStr[1])];
//                             }
//                         }
//                         else {
//                             reply.id = Number(tmpStr[0]);
//                         }
//                     }
//                     // 金币
//                     else if (typeof arr[j] === "number") {
//                         reply.coin = arr[j];
//                     }
//                     else {
//                         cc.warn("其他类型暂时我还没有考虑到", arr[j]);
//                     }
//                 }
//                 chatData.replyArr.push(reply);
//             }
//         }
//         if (chatData) {
//             chatArr.push(chatData);
//         }
//         return npcData;        
//     },
});
