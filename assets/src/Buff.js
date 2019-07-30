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
            buffNode.enName = name;

            hjm._main.button.push(buffNode); // 

            buffNode.name = "buff";
            // cc.log("hjm", name, buffNode.name);
            hjm[name] = buffNode;
        }
        buff = {
            name: name,
            num: 0,
            role: role,
            buffNode: buffNode
        }
        if (buffNode) { // 这个if是后面加的，不知道是否会有问题
            buffNode.buffData = buff;
        }
        if (name[0] !== "_") {
            dyl.notify(buff, "num", (newData, oldData)=>{
                buffNode.num = newData;
                return newData;
            })
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
            this.resetPos();
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
            // let id = 0;
            // for (let i = 0; i < this.length; i++) {
            //     let buff = arr[i];
            //     if (buff.buffNode && !buff.isDel) {
            //         buff.buffNode.x = id * 64;
            //         id++;
            //     }
            // }
            let newArr = [...this];
            let fun = (id, buff)=>{
                if (buff.isDel || !buff.buffNode) {
                    return null;
                }
                buff.buffNode.x = id * 64;
            }
            dyl.arr(newArr, fun);
        }

        // 这是更新buff数组
        arr.resetBuff = function (end) {
            // let tmpArr = [];
            // for (let i = 0; i < this.length; i++) {
            //     let buff = this[i];
            //     if (!buff.isDel) {
            //         tmpArr.push(buff);
            //     }
            // }   

            // this.length = 0;
            // this.push(...tmpArr);
            dyl.arr(this, (id, buff)=>{
                if (buff.isDel) {
                    return null;
                }
            })
            end();
        }
        return arr;
    },

    runBuffArr (end, role, buffStateName, atkData, ...argArr) {
        let buffArr = role.buffArr;
        for (let i = 0; i < buffArr.length; i++) {
            let buff = buffArr[i];
            if (buff.delState === buffStateName) {
                // end, atkData, buff, role
                end(buffArr, buff.delFun, buff);
                // buff.fun(endFun, atkData, buff, role);
            }
        }
        for (let i = 0; i < buffArr.length; i++) {
            let buff = buffArr[i];
            if (buff.state === buffStateName) {
                // end, atkData, buff, role
                end(buff, "fun", atkData, buff, role, ...argArr);
                if (buff.delState === null) {
                    end(buffArr, buff.delFun, buff);
                }
                // buff.fun(endFun, atkData, buff, role);
            }
        }
        // if (buffStateName === "endTurn") {
        //     for (let i = 0; i < buffArr.length; i++) {
        //         let buff = buffArr[i];
        //         if (buff.delFun === "endTurn") {
        //             buffArr.del(buff);
        //         }
        //     }
        // }
        end(buffArr, "resetBuff");
    },

    //////////////////////////
    // 具体技能，参数roleNode, num 给buffNode赋值state fun delFun

    //仪式，怪物每回合增加 addAtkNum (3)点攻击力
     ritual (roleNode, num = 1) {
        let addAtkNum = 3; // 每回合增加的攻击力值

        let buff = roleNode.buffArr.add("ritual", num);
        buff.state = "preTurn";
        buff.delState = null;
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
        buff.delState = null;
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

    // 重击 下次攻击造成的伤害增加 num倍
    timesDmg (roleNode, num = 1) {
        let  buff = roleNode.buffArr.add("timesDmg", num);
        buff.state = null;
        buff.delState = "endAttack";
        buff.delFun = "zero";
        buff.addFun = function (){
            // cc.log("liliang addFun");
            let addData = {
                atk: String(this.num + 1),
                def: 0,
                typeArr: ["ap", "ad"],
                name: "timesDmg"
            }
            return addData;
        }
    },

    // 每次打出攻击牌，都可以获得跟层数一样护甲
    atkDef (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("atkDef", num);
        // buff.state = "preAttack";
        buff.state = "endPlayCard";
        buff.delState = null;
        buff.delFun = "keep";

        // buff.fun = (end, atkData, buff, role)=>{
        //     atkData.atk += buff.num;
        //     end();
        // };
        buff.fun = function (end, atkData, buff, role) {
            if (isNaN(atkData.atk)) {
                return end();
            }
            role.atkData.dmgArr.push({
                atk: NaN,
                def: this.num,
                type: "def",
                name: "atkDef",
                myBuff: [],
                enBuff: []
            })
            return end();
        }
    },

    // 每次获得护甲时，都会对敌人造成一点魔法伤害
    defAtk (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("defAtk", num);
        // buff.state = "preAttack";
        buff.state = "attack";
        buff.delState = null;
        buff.delFun = "keep";

        // buff.fun = (end, atkData, buff, role)=>{
        //     atkData.atk += buff.num;
        //     end();
        // };
        buff.fun = function (end, atkData, buff, role, dmgData) {
            if (isNaN(dmgData.def) || (dmgData.def <= 0)) {
                return end();
            }
            // for (let i = buff.num - 1; i >= 0; i--) {
            role.atkData.dmgArr.push({
                atk: this.num,
                def: NaN,
                type: "ap",
                name: "ap",
                myBuff: [],
                enBuff: []
            })
            // }
            return end();
        }
    },

    liliang (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("liliang", num);
        // buff.state = "preAttack";
        buff.state = null;
        buff.delState = "endTurn";
        buff.delFun = "zero";

        // buff.fun = (end, atkData, buff, role)=>{
        //     atkData.atk += buff.num;
        //     end();
        // };
        buff.addFun = function (){
            // cc.log("liliang addFun");
            let addData = {
                atk: 1,
                def: 0,
                typeArr: ["main"],
                name: "liliang"
            }
            return addData;
        }
    },

    // 反伤，每次受到物理伤害，都会对敌人造成一点魔法伤害
    backAtk (roleNode, num = 1) {
        let buff = roleNode.buffArr.add("backAtk", num);
        // buff.state = "preAttack";
        buff.state = "hurt";
        buff.delState = null;
        buff.delFun = "keep";

        // buff.fun = (end, atkData, buff, role)=>{
        //     atkData.atk += buff.num;
        //     end();
        // };
        buff.fun = function (end, atkData, buff, getHurtRole, dmgData, attackRole) {
            if (isNaN(dmgData.atk) || (dmgData.atk <= 0) || (dmgData.type !== "ad")) {
                return end();
            }
            // attackRole.hp -= this.num;
            attackRole.getHurt(this.num);
            return end();
        }
    },

    poison (roleNode, num = 1) {
        let addAtkNum = 3; // 每回合增加的攻击力值

        let buff = roleNode.buffArr.add("poison", num);
        buff.state = "preTurn";
        buff.delState = null;
        buff.delFun = "sub";

        buff.fun = function (end, atkData, buff, role) {
            cc.log("poison", this.num);
            role.getHurt(this.num, false, end);
            // tz(0.2, end)();
            // return end();
        };
    },

    // forget (roleNode, num = 1) {
    //     let buff = roleNode.buffArr.add("_forget", num);
    //     buff.state = "discard";
    //     buff.delState = null;
    //     buff.delFun = "zero";

    //     buff.fun = (end, atkData, buff, role)=>{
    //         let card = atkData.playCardArr[0];
    //         card.isInHand = true;
    //         card.type = 1 - card.type;
    //         end();
    //     };
    // }
});