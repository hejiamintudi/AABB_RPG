cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
    },

    addMainSkill (card, skillName) {
    	if (!this[skillName]) {
    		card.mainSkill = null;
    		return;
    	}
    	card.mainSkill = (...arr)=>this[skillName](...arr);
    },

    addFriendSkill (card, skillName) {
    	if (!this[skillName]) {
    		card.friendSkill = null;
    		return;
    	}
    	card.friendSkill = (...arr)=>this[skillName](...arr);
    },

    //............主动技能.......................

    // 这个是测试技能 skillNum 都是3
    testMain (end, atkData) {
        // return this.forget(end, atkData);
        return this.twoDmg(end, atkData);
    },

    testDef (end, atkData) {
        return this.forget(end, atkData);
    },

    // 每打出一次攻击牌，获得一点护甲
    atkDef (end, atkData) {
        atkData.myBuff.push(["atkDef", 1]);
        end();
    },

    // 每次加护甲，都造成一次一点魔法伤害
    defAtk (end, atkData) {
        atkData.myBuff.push(["defAtk", 1]);
        end();
    },

    // 加3点攻击力
    atk3 (end, atkData) {
        atkData.myBuff.push(["liliang", 1]);
        // atkData.enBuff.push(["yishang", 3]);
        end();
    },

    // 下个回合双倍伤害
    twoDmg (end, atkData) {
        atkData.myBuff.push(["timesDmg"]);
        end();
    },

    // 攻击两次
  	twoAtk (end, atkData) {
  		atkData.times++;
  		end();
  	},

    // 遗忘 自身留下，而且
    forget (end, atkData) {
        // atkData.myBuff.push("forget");
        let card = atkData.playCardArr[0];
        card.isInHand = true;
        card.type = 1 - card.type;
        end();
    },

    //............辅助技能.......................

    testFriend (end, atkData, ...argArr) {
        return this.charged(end, atkData, ...argArr);
    },

    //充能 增加一点能量 cardId 表示card的位置
    charged (end, atkData, cardId) {
    	atkData.friendNum++;
        end();
    },

    
});