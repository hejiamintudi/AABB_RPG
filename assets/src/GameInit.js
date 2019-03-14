cc.Class({
    extends: cc.Component,
    properties: {
    	enPosDis: 300,
    	enPos: 500,
    },

    onLoad () {
        dyl.setRand(9295271);
        // dyl.notify(ai, "drawCard", (newValue, oldValue)=>{
        //     cc.warn("drawCard", oldValue, newValue);
        //     return newValue;
        // })
    	this.cardNameArr = [
    						"jian", 
							"dun",
                            "jian", 
                            "jian",
                            "jian", 
                            "dun",
                            "dun", 
                            "dun"
		];

		// this.enNameArr = [
		// 					"qingtianwawa",
		// 					"shayu"
		// ];

        this.enName = "en1";

        this.relicArr = [ // 遗物
                            "ring",
        ];

        hjm._en.type = -1;
        hjm._hero.type = 1;
        hjm._hero.hp = "030";
        hjm._en.hp = "030";
        hjm._hero.def = (oldValue, newValue)=>{
            if (newValue <= 0) {
                hjm._hero.def = false;
            }
            else {
                hjm._hero.def = true;
            }
        }

        hjm._en.def = (oldValue, newValue)=>{
            if (newValue <= 0) {
                hjm._en.def = false;
            }
            else {
                hjm._en.def = true;
            }
        }

        hjm._en.name = this.enName;

        let arr = ["addHero", "addEn", "addCardArr", "startGame"];
        dyl.process(this, arr);
    },

    playAttack () {
        hjm._en.en.getComponent(cc.Animation).play("attack");
    },

    addHero (end) {
        let frames = [];
        this.frames = frames;
        cc.loader.loadRes("hero", cc.SpriteAtlas, function (err, atlas) {
            // var frame = atlas.getSpriteFrame('sheep_down_0');
            // sprite.spriteFrame = frame;
            let tmpFrames = atlas.getSpriteFrames();
            let len = tmpFrames.length;
            for (let i = 0; i < len; i++) {
                frames.push(atlas.getSpriteFrame(String(i)));
            }
            hjm._hero.en.getComponent(cc.Sprite).spriteFrame = frames[0];

            let animation = hjm._hero.en.getComponent(cc.Animation);
            // hjm._en.en.setScale(-1.5, 1.5);
            // frames 这是一个 SpriteFrame 的数组.
            let clip = cc.AnimationClip.createWithSpriteFrames(frames, 30);
            clip.name = "attack";
            // clip.wrapMode = cc.WrapMode.Loop;

            // // 添加帧事件
            // clip.events.push({
            //     frame: 1,               // 准确的时间，以秒为单位。这里表示将在动画播放到 1s 时触发事件
            //     func: "frameEvent",     // 回调函数名称
            //     params: [1, "hello"]    // 回调参数
            // });

            animation.addClip(clip);
            // animation.play("idle");
            end();
        }); 
    },

    addEn (end) {
        // hjm[this.enName] = hjm._en.en;
        let frames = [];
        this.frames = frames;
        cc.loader.loadRes("en/" + this.enName + "/attack", cc.SpriteAtlas, function (err, atlas) {
            // var frame = atlas.getSpriteFrame('sheep_down_0');
            // sprite.spriteFrame = frame;
            let tmpFrames = atlas.getSpriteFrames();
            let len = tmpFrames.length;
            for (let i = 0; i < len; i++) {
                frames.push(atlas.getSpriteFrame(String(i)));
            }
            hjm._en.en.getComponent(cc.Sprite).spriteFrame = frames[0];

            let animation = hjm._en.en.getComponent(cc.Animation);
            // hjm._en.en.setScale(-1.5, 1.5);
            // frames 这是一个 SpriteFrame 的数组.
            let clip = cc.AnimationClip.createWithSpriteFrames(frames, 30);
            clip.name = "attack";
            // clip.wrapMode = cc.WrapMode.Loop;

            // // 添加帧事件
            // clip.events.push({
            //     frame: 1,               // 准确的时间，以秒为单位。这里表示将在动画播放到 1s 时触发事件
            //     func: "frameEvent",     // 回调函数名称
            //     params: [1, "hello"]    // 回调参数
            // });

            animation.addClip(clip);
            // animation.play("idle");
            end();
        });         
    },

    // addEnArr (end) {
    // 	let {enNameArr} = this;
    // 	let enArr = [];
    // 	let enLayer = hjm._enLayer;
    // 	let oriX = this.enPos - (enNameArr.length - 1) * this.enPosDis * 0.5;
    // 	cc.log("oriX", oriX, this.enPos, (enNameArr.length - 1) * this.enPosDis * 0.5);
    // 	for (let  i = 0; i < enNameArr.length; i++) {
    // 		let en = enLayer.add();
    // 		en.x = oriX + i * this.enPosDis;
    // 		hjm[enNameArr[i]] = en.en;
    // 		enArr.push(en);
    // 	}
    // 	ai.enArr = enArr;
    // 	end();
    // },

    addCardArr (end) {
    	let cardNameArr = this.cardNameArr;
    	cardNameArr.sort(()=>(dyl.rand()-0.5));
    	let cardArr = [];
    	let cardLayer = hjm._cardLayer;
    	for (let i = cardNameArr.length - 1; i >= 0; i--) {
    		let card = cardLayer.add();
            dyl.card = card;
            // cc.log("card", card.card, cardNameArr[i]);
    		hjm[cardNameArr[i]] = card.card; //动态加载图片
    		card.cardName = cardNameArr[i];
    		this.initCard(card);
    		cardArr.push(card);
    	}
    	cardArr.sort(()=>(dyl.rand() - 0.5));
    	ai.library = cardArr; //牌库
    	ai.hand = []; //手牌
    	ai.graveyard = []; //弃牌堆
    	end();
    },

    initCard (card) {
        card.x = 2000;
        this.setCardTypeFun(card);
        let {mainSkill, friendSkill} = dyl.data("card." + card.cardName, card);

        // atk 改为不显示
        // card.atk = card.atk >= 0;
        card.atk = false;

        let Skill = this.node.getComponent("Skill");
        Skill.addMainSkill(card, mainSkill);
        Skill.addFriendSkill(card, friendSkill);
    },

    setCardTypeFun (card) {
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

    startGame (end) {
    	this.node.getComponent("GameMain").startGame();
    	end();
    },
});