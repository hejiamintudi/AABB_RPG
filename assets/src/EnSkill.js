cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
    },

    addSkill (en, round) {
        let enName = en.enName;
    	let dataArr = this[enName](en, round);
    	let atkData = { //攻击数据
    		atk: dataArr[0],
    		def: dataArr[1],
            times: dataArr[2],
    		num: 1, // 能量
            myBuff: dataArr[3],
            enBuff: dataArr[4],
            type: "main",
            dmgArr: [],
            addDataArr: []
      //       // myBuff: this.addBuffArr(en.atkData.myBuff, dataArr[2]),
      //       // enBuff: this.addBuffArr(en.atkData.enBuff, dataArr[2]),
      //       myBuff: this.addBuffArr([], dataArr[3]),
    		// enBuff: this.addBuffArr([], dataArr[4])
    	};
    	return atkData;
    },

    addBuffArr (buffArr, dataArr) {
    	if (!dataArr) {
    		return [];
    	}
    	let i = 0;
    	for (let i = 0; i < dataArr.length; i++) {
    		let buffData = {
    			// name: dataArr[i]
    		}
    		// if (typeof dataArr[i + 1] === "number") {
    		// 	buffData.num = dataArr[i + 1];
    		// 	i += 2;
    		// }
    		// else {
    		// 	buffData.num = 1;
    		// 	i++;
    		// }
            if (typeof dataArr[i] === "string") {
                buffData.name = dataArr[i];
                buffData.num = 1;
            }
            else if (Array.isArray(dataArr[i])){
                let [name, num] = dataArr[i];
                buffData.name = name;
                buffData.num = num;
            }
            else {
                cc.warn("类型不是字符串或数组", dataArr[i]);
            }
    		buffArr.push(buffData);
    	} 
    },

//返回攻击数据对象 [atk, def, times, [meBuff], [enBuff]]
// plan 有攻击（atk） 防守（def） 强化（add） 负面（sub） 不明（what） 逃跑（run）
// round 是从0开始的
    en1 (en, round) {
        // cc.log("round", round);
    	if (round === 0) {
    		return [NaN, 10, 1, ["backAtk"], []];
    	}
    	else {
    		return [1, NaN, 5, [], []];
    	}
    	// en.skill = fun1;
    },

});