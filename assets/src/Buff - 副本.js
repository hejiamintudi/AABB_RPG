cc.Class({
    extends: cc.Component,
    properties: {
    },

    //

    onLoad () {
    },

    // 为角色添加buffArr
    addBuffArr (role) {
        let arr = [];
        arr.add = function (buffNode) {
            // if (!buffNode.getChildren) {
            //     return;
            // }

            buffNode.active = true;
            buffNode.arrId = this.length;
            this.push(buffNode);
            this.resetPos();
        }
        arr.del = function (buffNode) {
            // buffNode.id++;
            // if (!buffNode.getChildren) {
            //     return;
            // }

            buffNode.active = false;
            let id = buffNode.arrId;
            for (let i = id; i < this.length - 1; i++) {
                this[i] = this[i + 1];
                this[i].arrId = i;
            }   
            this.length = this.length - 1;
            this.resetPos();
        }
        arr.sub = function (end, buffNode, num = 1) {
            buffNode.num -= num;
            if (buffNode.num <= 0) {
                return this.zero(end, buffNode);
            }
            end();
        }
        arr.zero = function (end, buffNode) {
            buffNode.num = 0;
            this.del(buffNode);
            end();
        }
        arr.resetPos = function () {
            let id = 0;
            for (let i = this.length - 1; i >= 0; i--) {
                let buffNode = this[i];
                if (buffNode.getChildren) {
                    buffNode.x = id * 100;
                }
                // this[i].x = x * 100;
            }
        }
        // role.buffArr = arr;
        return arr;
    },

    runBuffArr (end, role, buffStateName, atkData) {
        // let Buff = this.node.getComponent("Buff");
        let buffArr = role[buffStateName];
        let resetId = 0; // 这是有效位置
        for (let i = 0; i < buffArr.length; i++) {
            // end(Buff, role[buffStateName].fun, end, role);
            let buffData = buffArr[i];
            // if (buffData.id !== dyl.get(buffData, "buffNode", "id")) {
            //     continue;
            // }

            if (buffData.buffNode.active) {
                // 重新设置位置
                buffData.arrId = resetId; 
                buffArr[resetId++] = buffData;

                // atkData, buffNode, role
                end(buffData, buffData.fun, atkData, buffData.buffNode, role);
            }
            else { // 这是要被删除的，好像不需要其他逻辑

            }
            buffArr.length = resetId;
        }
    },

    //新建一个buffNode
    newBuffNode (buffName, node) {
    	let {buffTab} = node;
    	let buffNode = node.buff.add();
    	hjm[buffName] = buffNode;
    	buffTab[buffName] = buffNode;
    	buffNode.id = 0;
    	return buffNode;
    },

    // 这是假的buffNode，就是没有节点的
    newOtherBuffNode (buffName, node) {
        let {buffTab} = node;
        let buffNode = {
            active: true
        };
        buffTab[buffName] = buffNode;
        buffNode.id = 0;
        return buffNode;
    },

    //添加buff，如果已经有这个buff，那就增加数量，否则就加buff
    //初始化位置，精灵，数量
    //返回buffNode, 如果这个buff已经存在了，那就返回false
    addBuffNode (buffName, node, num = 1) {
    	let {buffTab, buffArr} = node;
    	this.nowRoleNode = node;

        // 这个好像是没有buff节点的，而且好像也没有num，算是永久的
        // 这个应该暂定是不要的
    	if (!buffName) { 
    		this.nowBuffNode = null;
    		return false;
    	}


        let buffNode = buffTab[buffName];
        if (!buffNode) { //全无

            // buffNode = node.buff.add(); //新建节点
            // hjm[buffName] = buffNode; // 添加图片
            // buffTab[buffName] = buffNode; // 加入buffTab

            // 这个是不现实的buffNode
            if (buffName[0] === "_") {
                buffNode = this.newOtherBuffNode(buffName, node);
            }
            else {
                buffNode = this.newBuffNode(buffName, node);
            }

    		buffNode.num = num; // 初始化buff数量
    		buffArr.add(buffNode);
   //  		buffNode.arrId = buffArr.length; // 加入buffArr，并设置arrId
			// buffArr.push(buffNode);
			// return buffNode;
    	}
    	else if (buffNode.active) { // 已经有了
    		buffNode.num += num;
    		// return false;
    		buffNode = null; // 不需要添加了，所以这里为空
    	}
    	else { // 曾经有
			// buffNode.active = true;
			// buffNode.arrId = buffArr.length;
			// buffArr.push(buffNode);
			buffArr.add(buffNode);
			buffNode.num = num;
			// return buffNode;
    	}
    	this.nowBuffNode = buffNode;
    	return buffNode;
    },

// delStr： sub 减少1 zero 清零 null 不变
// fun (end, atkData, buffNode, role)
    addToBuffState (name, buffFun, delStr) {
        let callBack = null;
        let buffNode = this.nowBuffNode;
    	let buffArr = this.nowRoleNode.buffArr;

        if (delStr === null) {
            callBack = function (end) {
                end();
            }
        }
        else {
            callBack = function (end) {
                buffArr[delStr](end, buffNode);
            }
        }

    	// if (delStr === "sub1") {
    	// 	callBack = function (end) {
    	// 		buffArr.sub(end, buffNode, 1);
    	// 	}
    	// }
    	// else if (delStr === "zero") {
    	// 	callBack = function (end) {
    	// 		buffArr.zero(end, buffNode);
    	// 	}
    	// }
    	// else if (delStr === "null") {
    	// 	callBack = function (end) {
    	// 		end();
    	// 	}
    	// }
    	// else {
    	// 	cc.warn("delStr 出错了", delStr);
    	// }
    	let fun = (end, atkData, buffNode, role)=>{
    		return buffFun(()=>callBack(end), atkData, buffNode, role);
    	}
    	let data = {
    		fun: fun,
    		roleNode: this.nowRoleNode,
    		buffNode: this.nowBuffNode,
    		// id: this.nowBuffNode ? this.nowBuffNode.id : undefined
            arrId: this.nowRoleNode[name].length // 在状态数组里的位置
    	}
    	this.nowRoleNode[name].push(data);
    },

    //仪式，怪物每回合增加 addAtkNum (3)点攻击力
    ritual (node, num = 1) {
    	let addAtkNum = 3; // 每回合增加的攻击力值

    	let buffNode = this.addBuffNode("ritual", node, num);
    	if (!buffNode) {
    		// 已经有这个buff了，所以更新一下buff数量就好了
    		return;
    	}
    	let preTurn = (end, atkData, buffNode, role)=>{
    		this.dmg(node, addAtkNum);
    		end();
    	}
    	this.addToBuffState("preTurn", preTurn, null);
    },

    //额外伤害，只能用于本回合的
    dmg (node, num = 1) {
    	let buffNode = this.addBuffNode("dmg", node, num);
    	let preAttack = (end, atkData, buffNode, role)=>{
    		atkData.dmg += buffNode.num;
    		end();
    	}
    	// let endTurn = (end, atkData, buffNode, role)=>{
    	// 	role.buffArr.del(buffNode);
    	// 	end();
    	// }
    	this.addToBuffState("preAttack", preAttack, "sub");
    	// this.addToBuffState("endTurn", endTurn);
    },

    //永久攻击增加，对于敌人来说，都是1：1的增加，但英雄是几倍增加
    atk (node, num = 1) {
        cc.log("atk", num);
    	let buffNode = this.addBuffNode("atk", node, num);
    	let preAttack = (end, atkData, buffNode, role)=>{
    		atkData.atk += buffNode.num;
    		end();
    	}
    	this.addToBuffState("preAttack", preAttack, null);
    },

    forget (node, num = 1) {

        this.addBuffNode("_forget", node, num);

        let discard = (end, atkData, buffNode, role)=>{
            // cc.log("eeeeeeeeeeeeeeeeeeeee");
            let card = atkData.playCardArr[0];
            card.isInHand = true;
            card.type = 1 - card.type;
            end();
        }
        this.addToBuffState("discard", discard, "zero");
    }
});