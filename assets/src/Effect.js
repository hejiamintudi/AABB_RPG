// label这个比较特别，只能当飙血特效
cc.Class({
    extends: cc.Component,
    properties: {
        isEffect: false
    },

    __preload: function () {
        this.preInit();
        this.initPool();
    },

    // 动画，粒子 直接做，字符串另外写，以后可能要改
    // 先保存子节点数组，新建空节点，初始化子节点加入空节点上
    preInit: function () {
        let nodeArr = [...this.node.getChildren()];

        let top = new cc.Node();
        this.node.parent.addChild(top);
        for (let i = 0; i < nodeArr.length; i++) {
            nodeArr[i].parent = top;
        }
        this.node.setPosition(cc.v2(0, 0));
        let newNode = cc.instantiate(this.node);
        newNode.removeComponent("Effect");
        newNode.parent = top;
        newNode.name = "tmp";
        newNode.setPosition(cc.v2(0, 0));

        let components = [...this.node._components];
        for (let i = components.length - 1; i >= 0; i--) {
        	if (components[i] === this) {
        		continue;
        	}
        	components[i].destroy();
        }

        top.parent = this.node;
    },

    myPlay: function (node, str) {
    	// cc.log(1, "node", node.active);
        let nodeArr = node.getChildren();
        let counter = dyl.counter(()=>node.del(), nodeArr.length);

        for (let i = 0; i < nodeArr.length; i++) {
            this.playNode(nodeArr[i], str, counter);
        }
        // cc.log(1, "node", node.active);
    },

    setColor: function (node, color) {
    	if (color === null) {
    		return;
    	}
    	let nodeArr = node.getChildren();
    	for (let i = nodeArr.length - 1; i >= 0; i--) {
    		nodeArr[i].color = color;
    	}
    },

    playNode: function (node, str, counter) {
        if (node.getComponent(cc.ParticleSystem)) {
            return this.playParticleSystem(node, counter);
        }
        else if (node.getComponent(cc.Animation)) {
            return this.playAnimation(node, counter);
        }
        else if (node.getComponent(cc.Label)) {
            return this.playLabel(node, str, counter);
        }
        else {
            counter();
        }
    },

    playAnimation: function (node, counter) {
        let animation = node.getComponent(cc.Animation);
        let endFun = ()=>{
            animation.off("finished", endFun);
            counter();
        }
        animation.on("finished", endFun);
        animation.play();
    },

    // 暂时默认都是血量的效果，所以str是数字
    playLabel: function (node, str, counter) {
        let lab = node.getComponent(cc.Label);
        lab.string = String(str);
        let num = Number(str);
        if (num < 0) {
            node.color = cc.color(255, 10, 10);
        }
        else if (num > 0) {
            node.color = cc.color(10, 255, 10);
        }
        else {
            node.color = cc.color(255, 255, 255);
        }
        node.setPosition(cc.v2(0, 0));
        node.opacity = 255;

        let time = 0.5;
        tz(node)._moveBy(time, cc.v2(0, 200))
                ._fadeTo(time, 0)
                (counter)();

    },

    playParticleSystem: function(node, counter) {
        let particleSystem = node.getComponent(cc.ParticleSystem);
        particleSystem.resetSystem();
        let time = particleSystem.duration + particleSystem.life + particleSystem.lifeVar;
        tz(time)(counter)();
        // return cc.warn("暂时还没有完善粒子播放功能");
    },

    initPool: function () {
        let node = this.node.getChildren()[0];
        node.active = false;

        let pool = [];
        let delPool = [];
        // cc.pp = pool;
        // cc.ppp = delPool;
        delPool.push(node);
        node.del = function () {
            this.active = false;
            delPool.push(this);
            let id = this.__poolId;
            pool[id] = pool[pool.length - 1];
            pool[id].__poolId = id;
            pool.length = pool.length - 1;
            this.__poolId = null;
        }

        let self = this;
        if (this.isEffect) {
            this.node.add = function (...argArr) {
            	let pos = null;
            	let str = null;
            	let color = null;
            	for (var i = argArr.length - 1; i >= 0; i--) {
            		let data = argArr[i];
            		let type = typeof data;
            		if (type === "string" || type === "number") {
            			str = data;
            			continue;
            		}
            		type = cc.js.getClassName(data);
            		if (type === "cc.Vec2" || type === "cc.Node") {
            			pos = data;
            			continue;
            		}
            		else if (type === "cc.Color") {
            			color = data;
            			continue;
            		}
            	}
                let node = null;
                if (delPool.length < 1) {
                	// cc.log("111");
                    node = cc.instantiate(pool[0]);
                    node.parent = this;

                    node.del = function () {
                        this.active = false;
                        delPool.push(this);
                        let id = this.__poolId;
                        pool[id] = pool[pool.length - 1];
                        pool[id].__poolId = id;
                        pool.length = pool.length - 1;
                        this.__poolId = null;
                    }
                }
                else {
                    // cc.log("大于1");
                    node = delPool[delPool.length - 1];
                    delPool.length = delPool.length - 1;
                    node.active = true;
                }
                // cc.kk = node;
                node.__poolId = pool.length;
                pool.push(node);
                // cc.log("成功添加", node, node.active);
                if (pos === null) {
                	return cc.warn("位置没有设置");
                } 
                node.setPosition(pos);
                self.setColor(node, color);
                self.myPlay(node, str);
                return node;
            }
        }
        else {
            let addFun = ()=>null;
            this.node.add = function (...argArr) {
                if (typeof argArr[0] === "function") {
                    addFun = argArr[0];
                    return;
                }

                // cc.log("addd");
                let node = null;
                if (delPool.length < 1) {
                    node = cc.instantiate(pool[0]);
                    node.parent = this;

                    node.del = function () {
                        this.active = false;
                        delPool.push(this);
                        let id = this.__poolId;
                        pool[id] = pool[pool.length - 1];
                        pool[id].__poolId = id;
                        pool.length = pool.length - 1;
                        this.__poolId = null;
                    }
                }
                else {
                    // cc.log("大于1");
                    node = delPool[delPool.length - 1];
                    delPool.length = delPool.length - 1;
                    node.active = true;
                }
                node.__poolId = pool.length;
                pool.push(node);
                addFun(node, ...argArr);
                // cc.log("成功添加");
                return node;
            }
        }
        this.node.pool = pool;
    },

});
