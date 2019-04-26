cc.Class({
    extends: cc.Component,
    properties: {
    	enPosDis: 300,
    	enPos: 500,
    },

    onLoad () {
        dyl.setRand(651);
        // dyl.notify(ai, "drawCard", (newValue, oldValue)=>{
        //     cc.warn("drawCard", oldValue, newValue);
        //     return newValue;
        // })
    	ai.cardNameArr = [
    						"jian", 
							"dun"
                            // "jian", 
                            // "jian",
                            // "jian", 
                            // "dun",
                            // "dun", 
                            // "dun"
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
        hjm._en.hp = "03";

        hjm._en.oriPos = cc.v2(hjm._en);
        hjm._hero.oriPos = cc.v2(hjm._hero);

        // // 开始时，没有动作
        // hjm._hero.tz = ()=>null;
        // hjm._en.tz = ()=>null;

        hjm._hero.def = (newValue, oldValue)=>{
            if (newValue <= 0) {
                hjm._hero.def = false;
            }
            else if (isNaN(newValue)) {
                hjm._hero.def = false;
            }
            else {
                hjm._hero.def = true;
            }
        }

        hjm._en.def = (newValue, oldValue)=>{
            if (newValue <= 0) {
                hjm._en.def = false;
            }
            else {
                hjm._en.def = true;
            }
        }

        // 这里添加 hp 小于等于 0 的死亡动画，不断变透明
        let dieFun = function (newValue, oldValue, role){
            if (newValue <= 0) {
                tz(role).fadeTo(0.1, 0)();
            }
            return newValue;
        }
        // hjm._hero.hp = (newValue, oldValue)=>dieFun(newValue, oldValue, hjm._hero.en);
        hjm._en.hp = (newValue, oldValue)=>dieFun(newValue, oldValue, hjm._en.en);

        hjm._en.enName = this.enName; 

        this.setGetHurtFun(hjm._hero, -1);
        this.setGetHurtFun(hjm._en,    1);
        // this.setDieFun(hjm._hero);
        // this.setDieFun(hjm._en);

        let arr = ["addHero", "addEn", "addCardArr", "startGame"];
        dyl.process(this, arr);
    },

    playAttack () {
        hjm._en.en.getComponent(cc.Animation).play("attack");
    },

    // setDieFun (role) {
    //     tz(role).fadeTo
    // },

    setGetHurtFun (role, dir) {
        // isNotDef 代表是否要无视护甲
        role.getHurt = function (num, isNotDef) {
            // 不接受回血，没有受到伤害的处理
            if (isNaN(num) || (num <= 0)) {
                return;
            }
            let backTime = 0.1;
            dyl.shake(hjm._bg, backTime);
            role.en.oneRed();
            role.tz(null); 

            role.setPosition(role.oriPos);
            role.rotation = 0;

            role.tz = tz(role)
                ._moveBy(backTime, cc.v2(80 * dir, 0))
                ._rotateTo(role.en, backTime, 15 * dir)
                ();
            if (isNotDef) { // 无视护甲真实伤害
                role.hp -= num;
            }
            else { // 普通伤害
                if (role.def > num) { // 护甲足够，不用扣血
                    // attackRole.atkData.isAtk = true; // 这句应该放在攻击函数里
                    role.def -= num;
                    // this.getHurtAct(attackRole, getHurtRole); // 这句应该放在攻击函数里
                }
                else { // 扣血，扣护甲
                    // attackRole.atkData.isAtk = true; // 这句应该放在攻击函数里
                    role.hp = role.hp - num + role.def;
                    role.def = 0;
                    // this.getHurtAct(attackRole, getHurtRole);
                }
            }
            hjm._buff.defaultHurt.add(role, -num);
        }
        role.tz = ()=>null;
    },

    // getHurtAct (attackRole, getHurtRole) {
    //     let dir = attackRole.type;
    //     let backTime = 0.1;
    //     dyl.shake(hjm._bg, backTime);
    //     getHurtRole.en.oneRed();
    //     getHurtRole.tz(null);
    //     // cc.log("getHurtAct false");

    //     getHurtRole.setPosition(getHurtRole.oriPos);
    //     getHurtRole.rotation = 0;

    //     getHurtRole.tz = tz(getHurtRole)
    //         ._moveBy(backTime, cc.v2(80 * dir, 0))
    //         ._rotateTo(backTime, 15 * dir)
    //         ();

    //     // let isAtk = attackRole.atkData.isAtk;
    //     // let dir = attackRole.type;
        
    //     // let recoverP = cc.v2(-100 * dir, 0); // 恢复动作的位移

    //     // if (isAtk) {
    //     //     getHurtRole.en.addRed();
    //     //     dyl.shake(hjm._bg, 0.2);
    //     //     getHurtRole.en.setPosition(cc.v2(80 * dir, 0));
    //     //     getHurtRole.en.rotation = 15 * dir;
    //     // }
    //     // end();
    // },

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
            let heroSprite = hjm._hero.en.getComponent(cc.Sprite);
            heroSprite.spriteFrame = frames[0];
            // hjm._hero.en.oriSpriteFrame = frames[0];
            hjm._hero.resetSpr = function () {
                heroSprite.spriteFrame = frames[0];
            }

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
            if (err) {
                cc.error(err);
            }

            let tmpFrames = atlas.getSpriteFrames();
            let len = tmpFrames.length;
            for (let i = 0; i < len; i++) {
                frames.push(atlas.getSpriteFrame(String(i)));
            }
            // dyl.sprs = frames;
            let enSprite = hjm._en.en.getComponent(cc.Sprite);
            enSprite.spriteFrame = frames[0];

            hjm._en.resetSpr = function () {
                enSprite.spriteFrame = frames[0];
            }

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
    	ai.hand = []; //手牌
        return end();

        // 下面没有必要了，改为gameMain里面实现
        let cardNameArr = this.cardNameArr;
        cardNameArr.sort(()=>(dyl.rand()-0.5));
        let cardArr = [];
        let cardLayer = hjm._cardLayer;
        for (let i = cardNameArr.length - 1; i >= 0; i--) {
            let card = cardLayer.add();
            // dyl.card = card;
            // cc.log("card", card.card, cardNameArr[i]);
            hjm[cardNameArr[i]] = card.card; //动态加载图片
            card.cardName = cardNameArr[i];
            this.initCard(card);
            cardArr.push(card);
        }
        cardArr.sort(()=>(dyl.rand() - 0.5));
        ai.library = cardArr; //牌库
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