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
        return this.atk3(end, atkData);
    },

    // 加3点攻击力
    atk3 (end, atkData) {
        atkData.myBuff.push(["liliang", 3]);
        end();
    },

    // 重击 伤害加倍
  	twoAtk (end, atkData) {
  		atkData.atk *= 2;
  		end();
  	},

    // 遗忘 自身留下，而且
    forget (end, atkData) {
        atkData.myBuff.push("forget");
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