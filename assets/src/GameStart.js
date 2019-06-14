cc.Class({
    extends: cc.Component,
    properties: {
    },

    start () {
        cc.jj = this;
        this.replyArr = [];
        this.node.button = [hjm._button];
        let arr = ["initCard", "pushCard", "resetPos", "autoChoose"];
        dyl.process(this, arr);
    },

    pushCard (end) {
        // this.initCard();
        this.hand = [];
        cc.hand = this.hand;
        for (let i = 0; i < 3; i++) {
            let card = this.addCard();
            this.hand.push(card);
        }
        end();
        // this.resetPos();
    },

    autoChoose (end) {
        this.nowCard = null; // 表示当前选择的card
        this.choose(this.hand[0]);
        this.node.touch = "chooseCard";
        end();
    },

    chooseCardOn (p) {
        let card = p.in(...this.hand);
        if (!card) {
            return;
        }
        this.choose(card);
    },

    choose (card) {
        hjm._choose.active = true;
        hjm._choose.setPosition(cc.v2(card).add(card.parent));
        let data = card.npcData;
        let dataId = data.id;

        let chat = data.chatArr[dataId];
        if (chat.doing) {
            data.doing = chat.doing;
        }
        hjm._talk.lab = data.doing;

        if (this.nowCard) {
            // this.leaveCard(this.nowCard);
             // 这是点击其他手牌时，中间角色卡的离开
    // leaveCard (card) {
            // 暂时只是说聊天npc的，特殊情况晚点再上面加
            let showCard0 = hjm._who.pool[0]; // 这里是中间的角色，不是下面的卡牌
            hjm._button.active = false;
            tz(showCard0).moveTo(0.5, -1500, showCard0.y)
                        (()=>{
                            showCard0.x = 1500;
                            showCard0.del();
                        })();
        // }, 
        }
        this.nowCard = card;
        let name = card.npcData.name;

        // 暂时只是说聊天npc的，特殊情况晚点再上面加
        let showCard = hjm._who.add();
        showCard.x = 1500;
        showCard.lab = name;
        tz(showCard, 0.1).moveTo(0.3, 0, showCard.y)
                        (()=>{
                            hjm._button.active = true;
                        })();
        // this.comeCard(this.nowCard);
    },

    // comeCard (card) {
    //     let name = card.npcData.name;

    //     // 暂时只是说聊天npc的，特殊情况晚点再上面加
    //     let showCard = hjm._who.add();
    //     showCard.x = 1500;
    //     showCard.lab = name;
    //     tz(showCard, 0.1).moveTo(0.3, 0, showCard.y)
    //                     (()=>{
    //                         hjm._button.active = true;
    //                     })();
    // },

    buttonOn (node) {
        // cc.log("buttonOn", this.node.touch);
        this[this.node.touch + "Button"](node);
    },

    talkButton (replyNode) {
        // cc.log(replyNode.lab);
        let {keep, id, otherId, coin} = replyNode.reply;
        let data = this.nowCard.npcData;
        if (coin) {
            hjm.coin += coin;
        }
        if (keep === true) {
            data.keep = true;
        }
        if (typeof keep === "number") {
            data.keep = true;
            data.id = keep;
        }
        if (otherId) {
            for (let i = this.cardDataArr.length - 1; i >= 0; i--) {
                if (this.cardDataArr[i].name === otherId[0]) {
                    this.cardDataArr[i].id = otherId[1];
                    break;
                }
            }
        }
        if (typeof id === "number") {
            this.changeId(id);
            return;
        }
        // 因为没有跳转，所以删除当前聊天并，退出聊天窗口
        this.delCard(this.nowCard);
        dyl.process(this, ["leaveTalk", "comeMain"]);
    },

    chooseCardButton (button) {
        hjm._choose.active = false;
        this.node.touch = "talk";
        this.node.button = this.replyArr;
        let arr = ["leaveMain", "comeTalk"];
        dyl.process(this, arr);
    },

    comeMain (end) {
        dyl.process(this, ["resetPos", "autoChoose", ()=>{
            this.node.button = [hjm._button];
            this.node.touch = "chooseCard";
        }, end]);
    },

    // 离开主面板，进入其他版块的模式（聊天，shop等等）
    leaveMain (end) { 
        hjm._button.active = false;
        let card = hjm._who.pool[0];
        tz().moveTo(card, 0.1, -1500, card.y)
            (()=>{
                card.x = 1500;
                card.del();
            })
            ((cb)=>{
                this.resetPos(cb, -1);
                return true;
            })(end)();
    },

    // 进入聊天面板
    // 只需要添加回复ui就好了
    comeTalk (end) {
        let data = this.nowCard.npcData;
        let chat = data.chatArr[data.id];
        hjm._talk.lab = chat.talk;
        let replyArr = chat.replyArr;
        // this.replyArr = [...replyArr];
        this.replyArr.length = 0;
        let act = tz();
        for (let i = 0; i < replyArr.length; i++) {
            let node = hjm._reply.add();
            this.replyArr.push(node); 
            node.reply = replyArr[i];
            node.lab = replyArr[i].talk;
            let startPos = cc.v2(1500, -100 * i);
            node.setPosition(startPos);
            act.moveTo(node, 0.2, 0, startPos.y);
        }
        act(end)();
    },

    leaveTalk (end) {
        let replyArr = this.replyArr;
        let act = tz();
        for (let i = 0; i < replyArr.length; i++) {
            act.moveTo(replyArr[i], 0.2, -1500, replyArr[i].y);
            act(()=>replyArr[i].del());
        }
        act(end)();
    },

   

    // dir： 1 代表卡牌进入， -1代表卡牌退出
    resetPos (end, dir = 1) {
        let hand = this.hand;
        let speed = 4000;

        //////////////////////////////
        if (hand.length === 0) {
            cc.warn("没有手牌，不可能吧？");
            end();
            return;
        }
        // let actFun = (i, endFun)=>{
        //     hand[i].active = true;
        //     let data = hand[i].npcData;
        //     let x = (dir > 0) ? (400 * (i - 1)) : -1500;
        //     if (dir > 0) {
        //         hand[i].x = 1000 + 400 * i;
        //     }
        //     let t = Math.abs(hand[i].x - x) / speed;
        //     let act = tz(hand[i], 0.1 * i).moveTo(t, x, hand[i].y);
        //     if (dir < 0) {
        //         act(()=>{
        //             hand[i].x = 1500;
        //             hand[i].active = false;
        //         })
        //     }
        //     act(endFun)();
        // }
        // for (let i = 0; i < hand.length - 1; i++) {
        //     actFun(i, ()=>null);
        // }
        // actFun(hand.length - 1, end);

///////////////
        let x = -1000 + (1 - hand.length) * 200
        let preFun = function (id) {
            hand[id].active = true;
            if (dir > 0) {
                hand[id].x = 1000 + 400 * id;
            }
        }
        let endFun = function () {
            if (dir < 0) {
                for (let i = hand.length - 1; i >= 0; i--) {
                    hand[i].x = 1500;
                    hand[i].active = false;
                }
            }
        }
        // let data = hand[i].npcData;
        tz().by(hand, [0.3], 0.5, cc.v2(x, 0), preFun)(endFun, end)();

        // let act = tz();
        // for (let i = 0; i < hand.length; i++) {
        //     hand[i].active = true;
        //     let data = hand[i].npcData;
        //     let x = (dir > 0) ? (400 * (i - 1)) : -1500;
        //     let t = Math.abs(hand[i].x - x) / speed;
        //     act.moveTo(hand[i], t, x, hand[i].y);
        //     if (dir < 0) {
        //         act(()=>{
        //             hand[i].x = 1500;
        //             hand[i].active = false;
        //             // hand[i].del();
        //         })
        //     }
        // }
        // act(end)();
    },

    // 旧卡删除，新卡填补，没有卡，那就
    addCard () {
        let data = this.cardDataArr[this.cardId++];
        if (!data) {
            return null;
        }
        let card = hjm._card.add();
        card.lab = data.name;

        // data.node = card;
        card.npcData = data;
        card.x = 1500;
        return card;
    },

    // 删除 添加 重新设置位置
    delCard (card) {
        let id = this.hand.indexOf(card);
        card.del();
        this.hand.splice(id, 1);
        card = this.addCard();
        if (card) {
            this.hand.push(card);
        }
        // this.resetPos(()=>null);
    },

    initCard (end) {
        this.cardId = 0;
        let cardDataArr = [];
        let pId = 0;
        for (let i in windowCardData) {
            let cardData = this.getCardData(i, windowCardData[i]);
            cardData.pId = pId;
            cardDataArr.push(cardData);
        }
        this.cardDataArr = cardDataArr;
        end();
    },

    getCardData (name, dataArr) {
        let npcData = {};

        // 首先是name的特别处理
        let nameArr = name.split("_");
        let nameStr = nameArr[0];
        for (let i = 1; i < nameArr.length; i++) {
            nameStr += ("(" + nameArr[i] + ")");
        }
        npcData.name = nameStr;
        npcData.id = 0;
        npcData.node = null;

        let chatArr = []; 
        npcData.chatArr = chatArr;

        let chatData = null;
        for (let i = 0; i < dataArr.length; i++) {
            let data = dataArr[i];
            // 字符串，新的对话
            if (typeof data === "string") {
                if (chatData) {
                    chatArr.push(chatData);
                }
                chatData = {}

                let nextData = dataArr[i + 1];
                // 有描述版的
                if (typeof nextData === "string") {
                    chatData.doing = data;
                    chatData.talk = nextData;
                    chatData.replyArr = [];
                    i++;
                }
                // 没描述版的
                else {
                    chatData.doing = null;
                    chatData.talk = data;
                    chatData.replyArr = [];
                }
            }
            // 数组，添加回复
            else {
                let reply = {};
                // let arr = data.split(" ");
                let arr = data;
                reply.talk = arr[0];
                // keep 代表卡牌聊完后，要么跳转，要么停留 
                for (let j = 1; j < arr.length; j++) {
                    if (arr[j] = "keep") {
                        reply.keep = true;
                    }
                    // 跳转
                    else if (typeof arr[j] === "string") {
                        let tmpStr = arr[j].split("_");
                        if (tmpStr.length > 1) {
                            if (tmpStr[0] === "keep") {
                                reply.keep = Number(tmpStr[1]);
                            }
                            else {
                                reply.otherId = [tmpStr[0], Number(tmpStr[1])];
                            }
                        }
                        else {
                            reply.id = Number(tmpStr[0]);
                        }
                    }
                    // 金币
                    else if (typeof arr[j] === "number") {
                        reply.coin = arr[j];
                    }
                    else {
                        cc.warn("其他类型暂时我还没有考虑到", arr[j]);
                    }
                }
                chatData.replyArr.push(reply);
            }
        }
        if (chatData) {
            chatArr.push(chatData);
        }
        return npcData;        
    },
});
