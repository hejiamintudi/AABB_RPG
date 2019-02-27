cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
    },

    addSkill (en, round) {
        let enName = en.name;
    	let dataArr = this[enName](en, round);
    	let atkData = { //攻击数据
    		atk: dataArr[0],
    		def: dataArr[1],
    		num: 1, // 能量
            // myBuff: this.addBuffArr(en.atkData.myBuff, dataArr[2]),
            // enBuff: this.addBuffArr(en.atkData.enBuff, dataArr[2]),
            myBuff: this.addBuffArr([], dataArr[2]),
    		enBuff: this.addBuffArr([], dataArr[3])
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

    // addBuff ()
//返回攻击数据对象 [atk, def, [meBuff], [enBuff]]
    polarBear (en, round) {
    	if (round === 0) {
    		return [0, 0, ["ritual"]];
    	}
    	else {
    		return [3, 0];
    	}
    	// en.skill = fun1;
    },

});