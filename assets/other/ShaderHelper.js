let CustomMaterial = require("CustomMaterial");
let ShaderEnum = cc.Enum({
});

let ShaderHelper = cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        executeInEditMode: true,
        requireComponent: cc.Sprite,
    },

    properties: {
        _shaderObject: null,
        // program: {
        //     type: ShaderEnum,
        //     default: 0,
        //     notify(oldValue) {
        //         if (this.program === oldValue) {
        //             return;
        //         }
        //         this.applyShader();
        //     }
        // },
    },

    __preload () {
        // let array = CustomMaterial.getAllName();
        // ShaderHelper.ShaderEnum = CustomMaterial.getShaderEnum();
        // cc.Class.Attr.setClassAttr(ShaderHelper, 'program', 'enumList', array);
    },

    onLoad() {
        this.sprite = this.getComponent(cc.Sprite);
        // this.applyShader();
        let t = 0.1;

        let id = 0;
        let isRed = false;

        let redNum = 0; //
        let add = ()=>{
            redNum++;
            if (redNum > 1) {
                return;
            }
            isRed = true;
            this.applyShader();
        }
        let sub = ()=>{
            redNum--;
            if (redNum === 0) {
                isRed = false;
                this.sprite.setState(cc.Sprite.State.NORMAL);
            }
        }
        this.node.oneRed = ()=>{
            add();
            setTimeout(()=>{
                if (!cc.isValid(this.node)) {
                    return;
                }
                sub();
            }, t * 1000);
        }
        this.node.addRed = ()=>add();
        this.node.subRed = ()=>sub();
        // this.node.addRed = ()=>{
        //     let tmpId = ++id;
        //     if (!isRed) {
        //         this.isRed = true;
        //         this.applyShader();
        //     }
        //     setTimeout(()=>{
        //         if (tmpId !== id || !cc.isValid(this.node)) {
        //             return;
        //         }
        //         isRed = false;
        //         this.sprite.setState(cc.Sprite.State.NORMAL);
        //     }, t * 1000);
        // }
    },

    update(dt) {
        if (CC_EDITOR) {
            return;
        }

        if (this._shaderObject && this._shaderObject.update) {
            this._shaderObject.update(this.sprite, this.material, dt);
        }
    },

    /**
     * 启用Shader
     */
    applyShader() {
        if (CC_EDITOR) {
            return;
        }

        // this._shaderObject = CustomMaterial.getShaderByIndex(this.program);
        this._shaderObject = CustomMaterial.getShaderByName("overlay");
        let sprite = this.sprite;
        let params = this._shaderObject.params;
        let defines = this._shaderObject.defines;
        let material = sprite.getMaterial(this._shaderObject.name);
        
        if (!material) {
            material = new CustomMaterial(this._shaderObject.name, params, defines || []);
            sprite.setMaterial(this._shaderObject.name, material);
        }
        this.material = material;

        sprite.activateMaterial(this._shaderObject.name);

        //设置Shader参数初值
        if (params) {
            params.forEach((item) => {
                if (item.defaultValue !== undefined) {
                    material.setParamValue(item.name, item.defaultValue);
                }
            });
        }

        if (this._shaderObject.start) {
            this._shaderObject.start(sprite, material);
        }
    },
});

module.exports = ShaderHelper;