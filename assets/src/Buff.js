cc.Class({
    extends: cc.Component,
    properties: {
    },

    //

    onLoad () {
    },

    //全新的对象  添加 roleNode buffNode name
    newBuff (role, name) {
        let buff = {};
        let buffNode = null;

        // 新建buffNode 显示版
        if (name[0] !== "_") {
            buffNode = role.buff.add();
            cc.log("hjm", name, buffNode.name);
            hjm[name] = buffNode;
        }
        buff = {
            name: name,
            num: 0,
            role: role,
            buffNode: buffNode
        }
        return buff;
    },

    addBuffArr (role) {
        let arr = [];
        let tab = {};
        let self = this;
        arr.add = function (name, num) {
            let buff = tab[name];

            // 本来没有这个buff
            if (!buff) {
                buff = self.newBuff(role, name, num);
            }
            // 已经存在了
            else if (!buff.isDel) {
                buff.num += num;
                return buff;
            }

            dyl.set(buff.buffNode, "active", true);

            buff.arrId = arr.length;
            arr.push(buff);
            tab[name] = buff;
            buff.num = num;
            // buff.buffNode.num = num;
            dyl.set(buff.buffNode, "num", buff.num);
            buff.isDel = false; 
            return buff;
        }

        arr.del = function (buff) {
            buff.isDel = true;
            dyl.set(buff.buffNode, "active", false);
            this.resetPos();
        }

        // 减少buff的num。 小于等于0 就直接zero
        arr.sub = function (end, buff, num = 1) {
            buff.num -= num;
            dyl.set(buff.buffNode, "num", buff.num);
            if (buff.num <= 0) {
                return this.zero(end, buff);
            }
            return end();
        }

        arr.zero = function (end, buff) {
            buff.num = 0;
            this.del(buff);
            end();
        }

        arr.keep = function (end) {
            end();
        }

        arr.endTurn = function (end) {
            end(); // 这里不处理，但会在回合结束的时候删了相关内容
        }

        // 这只是更新位置
        arr.resetPos = function () {
            let id = 0;
            for (let i = 0; i < this.length; i++) {
                let buff = arr[i];
                if (buff.buffNode && !buff.isDel) {
                    buff.buffNode.x = id * 100;
                    id++;
                }
            }
        }

        // 这是更新buff数组
        arr.resetBuff = function (end) {
            let tmpArr = [];
            for (let i = 0; i < this.length; i++) {
                let buff = this[i];
                if (!buff.isDel) {
                    tmpArr.push(buff);
                }
            }   

            this.length = 0;
            this.push(...tmpArr);
            end();
        }
        return arr;
    },

    runBuffArr (end, role, buffStateName, atkData, ...argArr) {
        let buffArr = role.buffArr;
        for (let i = 0; i < buffArr.length; i++) {
            let buff = buffArr[i];
            if (buff.state === buffStateName) {
                // end, atkData, buff, role
                end(buff, "fun", atkData, buff, role, ...argArr);
                end(buffArr, buff.delFun, buff);
                // buff.fun(endFun, atkData, buff, role);
            }
        }
        if (buffStateName === "endTurn") {
            for (let i = 0; i < buffArr.length; i++) {
                let buff = buffArr[i];
                if (buff.delFun === "endTurn") {
                    buffArr.del(buff);
                }
            }
        }
        end(buffArr, "resetBuff");
    },

    //////////////////////////
    // 具体技能，参数roleNode, num 给buffNode赋值state fun delFun

    //仪式，怪物每回合增加 addAtkNum (3)点攻击力
     ritual (roleNode, num = 1) {
        let addAtkNum = 3; // 每回合增加的攻击力值

        let buff = roleNode.buffArr.add("ritual", num);
        buff.state = "preTurn";
        buff.delFun = "keep";

        buff.fun = (end, atkData, buff, role)=>{
            this.dmg(roleNode, addAtkNum);
            end();
        };
    },

    //额外伤害，只能用于本回合的
    dmg (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("dmg", num);
        buff.state = "preAttack";
        buff.delFun = "zero";

        buff.fun = (end, atkData, buff, role)=>{
            atkData.dmg += buff.num;
            end();
        };
    },

    // //永久攻击增加，对于敌人来说，都是1：1的增加，但英雄是几倍增加
    // atk (roleNode, num = 1) {
    //     let buff = roleNode.buffArr.add("atk", num);
    //     buff.state = "preAttack";
    //     buff.delFun = "keep";

    //     buff.fun = (end, atkData, buff, role)=>{
    //         atkData.atk += buff.num;
    //         end();
    //     };
    // },

    liliang (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("liliang", num);
        buff.state = "preAttack";
        buff.delFun = "endTurn";

        buff.fun = (end, atkData, buff, role)=>{
            atkData.atk += buff.num;
            end();
        };
    },

    forget (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("_forget", num);
        buff.state = "discard";
        buff.delFun = "zero";

        buff.fun = (end, atkData, buff, role)=>{
            let card = atkData.playCardArr[0];
            card.isInHand = true;
            card.type = 1 - card.type;
            end();
        };
    }
});