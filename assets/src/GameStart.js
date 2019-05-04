cc.Class({
    extends: cc.Component,
    properties: {
    },

    start () {
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
            this.leaveCard(this.nowCard);
        }
        this.nowCard = card;
        this.comeCard(this.nowCard);
    },

    comeCard (card) {
        let name = card.npcData.name;

        // 暂时只是说聊天npc的，特殊情况晚点再上面加
        let showCard = hjm._who.add();
        showCard.x = 1000;
        showCard.lab = name;
        tz(showCard, 0.1).moveTo(0.3, 0, showCard.y)
                        (()=>{
                            hjm._button.active = true;
                        })();
    },

    buttonOn (node) {
        cc.log("buttonOn", this.node.touch);
        this[this.node.touch + "Button"](node);
    },

    talkButton (replyNode) {
        cc.log(replyNode.lab);
    },

    chooseCardButton (button) {
        hjm._choose.active = false;
        this.node.touch = "talk";
        this.node.button = this.replyArr;
        let arr = ["leaveMain", "comeTalk"];
        dyl.process(this, arr);
    },

    // 离开主面板，进入其他版块的模式（聊天，shop等等）
    leaveMain (end) { 
        hjm._button.active = false;
        let card = hjm._who.pool[0];
        tz().moveTo(card, 0.1, -1000, card.y)
            (()=>{
                card.x = 1000;
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
            let startPos = cc.v2(1000, -100 * i);
            node.setPosition(startPos);
            act.moveTo(node, 0.2, 0, startPos.y);
        }
        act(end)();
    },

    leaveCard (card) {
        // 暂时只是说聊天npc的，特殊情况晚点再上面加
        let showCard = hjm._who.pool[0]; // 这里是中间的角色，不是下面的卡牌
        hjm._button.active = false;
        tz(showCard).moveTo(0.5, -1000, showCard.y)
                    (()=>{
                        showCard.x = 1000;
                        showCard.del();
                    })();
    }, 

    // dir： 1 代表卡牌进入， -1代表卡牌退出
    resetPos (end, dir = 1) {
        let hand = this.hand;
        let speed = 4000;
        let act = tz();
        for (let i = 0; i < hand.length; i++) {
            let data = hand[i].npcData;
            let x = (dir > 0) ? (400 * (i - 1)) : -1000;
            let t = Math.abs(hand[i].x - x) / speed;
            act.moveTo(hand[i], t, x, hand[i].y);
            if (dir < 0) {
                act(()=>{
                    hand[i].x = 1000;
                    hand[i].del();
                })
            }
        }
        act(end)();
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
        card.x = 1000;
        return card;
    },

    initCard (end) {
        this.cardId = 0;
        let cardDataArr = [];
        for (let i in windowCardData) {
            cardDataArr.push(this.getCardData(i, windowCardData[i]));
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
