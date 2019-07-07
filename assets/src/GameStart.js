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
        this.initVar();
        // this.next();
        this.changeEvent(null, "main");
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
            arr.push(e2 + "Come");
        }
        dyl.process(this, arr);
    },

    next () { // 下一个状态
        let e1 = this._nowEvent;
        let e2 = this._nowEvent = ai.eventArr[++hjm.newEventId];
        // cc.log("next", e1, "...", e2, "||||");
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
        let mainButtonArr = this.getMainButtonArr();
        dyl.arr(mainButtonArr, true, cc.v2(1000, true));
        tz().by(mainButtonArr, [this._delayTime], this._moveTime, cc.v2(-1000, 0))(end)();
    },

    mainLeave (end) {
        let mainButtonArr = this.getMainButtonArr();
        let endFun = function () {
            dyl.arr(mainButtonArr, false);
            end();
        }
        tz().by(mainButtonArr, [this._delayTime], this._moveTime, cc.v2(-1000, 0))(endFun)();
    },

// talk 聊天界面
// data = arr [0: lab显示的字符串， ...(回复，回复后的显示和奖励)]
// 奖励 str num
    talkCome (end) {
        let dataArr = ai.newTalkNameArr[++hjm.newTalkId];
        let lab = hjm._talk_lab;
        lab.str = dataArr[0];
        tz([lab, true, cc.v2(0, 1000)])
            .to(lab, 0.5, cc.v2(0, 290))();

        let pool = hjm._talk_pool;

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
            data.replay = replay;
            for (let j = 0; j < rewardArr.length; j += 2) {
                data[rewardArr[j]] = Number(rewardArr[j + 1]);
            }
            // replyDataArr.push(data);            
            pool[i].data = data;
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
        tz()._to(hjm._talk_lab, 0.5, cc.v2(0, 1000))
            ._by(pool, [0.2], 0.3, cc.v2(-1000, 0))
            ([pool, "del"])
            ([hjm._talk_lab, false])(end)();
    },

    talkOut (p) {
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
        hjm._buttonLab.nextButton = true;
        let actNodeArr = []; // 这是奖励节点数组

        if (data.coin) {
            hjm._talk_coinLab.num = "+" + String(data.coin);
            hjm.coin += data.coin;
            actNodeArr.push(hjm._talk_coinLab);
        }
        if (data.card) {
            let newCardName = ai.newCardNameArr[++hjm.newCardId];
            hjm[newCardName] = hjm._talk_cardLab.card; // 加载图片
            hjm.deck.push(newCardName);
            actNodeArr.push(hjm._talk_cardLab);
        }

        actNodeArr.push(hjm._buttonLab.nextButton);
        // 动画效果: 回复离开， 然后奖励节点缩放从小到大，这个要反弹, 位置
        let act = tz();
        act.by([...hjm._talk_pool], [0.2], 0.3, cc.v2(-1000, 0))
            ([actNodeArr, true, [0, 0]])
            .to(actNodeArr, [cc.v2(0, -100)], 0, cc.v2(0, 0))
            .to(actNodeArr, [0.2], 0.3, [1, 1], cc.easeBackOut())();
        // lab 赋值， pool的离开， 奖励的出现， next的按钮

    },

    nextButton () {
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
