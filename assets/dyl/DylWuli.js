cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/☄ 物理",
        executeInEditMode: true,
        inspector: 'packages://dyl-nowshow/DylNotshow.js',
    },
    properties: {
        collisionFun: {
            default: function () {
                return new cc.Component.EventHandler;
            },
            type: cc.Component.EventHandler,
        },
        // collisionFun: cc.Component.EventHandler,
    },

    __preload () {
        // if (CC_EDITOR) {
        //     cc.log("haha");
        //     this.node.on("name-changed", ()=>{
        //         cc.log("name-changed");
        //     })
        // }



        let rigidbody = this.node.getComponent(cc.RigidBody);
        Object.defineProperty(this.node, "v", {
            get: function () {
                return rigidbody.linearVelocity;
            },
            set: function (velocity) {
                rigidbody.linearVelocity = velocity;
            }
        });

        Object.defineProperty(this.node, "f", {
            get: function () {
                return rigidbody.linearDamping;
            },
            set: function (damping) {
                rigidbody.linearDamping = damping;
            }
        });

        Object.defineProperty(this.node, "a", {
            set: function (force) {
                rigidbody.applyForceToCenter(force);
            }
        });

        rigidbody.fixedRotation = true;
        rigidbody.enabledContactListener = true;
        if (this.collisionFun.handler !== "") {
            this.collisionComponent = this.collisionFun.target.getComponent(this.collisionFun.component);
        }
    },


    onEnable () {
        if (CC_EDITOR) {
            if (!this.collisionFun.target) {
                this.collisionFun.target = this.node;
            }
        }
    },
    
    onBeginContact: function (contact, selfCollider, otherCollider) {
        if (!this.collisionComponent) {
            return;
        }
        contact.disabled = this.collisionComponent[this.collisionFun.handler](otherCollider.node);
    },

    // update (dt) {},
});
