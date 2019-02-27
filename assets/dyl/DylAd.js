cc.Class({
    extends: cc.Component,

    properties: {
        isDebug: false // 嘉敏 嘉敏
    }, 

    onLoad: function () {
        let __isDebug = this.isDebug;
        let __debugShowad = false;
        let agent = null;
        let ads_plugin = null;
        if (!__isDebug) {
            agent = anysdk.agentManager;
            ads_plugin = agent.getAdsPlugin();
            // ads_plugin.preloadAds(AdsType.AD_TYPE_REWARDEDVIDEO);
            // this.log(typeof ads_plugin.callFuncWithParam);
            ads_plugin.callFuncWithParam("preloadAd");
        }
        else {
            setTimeout(()=>{
                __debugShowad = true;
            }, 10000);
        }

        dyl.__adFun = ()=>{};
        dyl.__isLoading = false;
        let show = ()=>{
            if (!__isDebug) {
                let param = anysdk.PluginParam.create("gq4XnooZ4zAyQJPiva3");
                // var ads_plugin = agent.getAdsPlugin();
                // var ads_plugin = this.ads_plugin;
                ads_plugin.callFuncWithParam("showAd", param);
            }
            else {
                cc.log("假广告出来了，哈哈哈哈哈");
            }
        }
        dyl.addAd = (fun)=>{
            if (fun) {
                dyl.__adFun = fun;
            }
            let showad = null;
            if (!__isDebug) {
                let param0 = anysdk.PluginParam.create("gq4XnooZ4zAyQJPiva3");
                showad = ads_plugin.callBoolFuncWithParam("couldShowAd", param0);
            }
            else {
                showad = __debugShowad;
            }
            if (showad) {
                show();
                dyl.__adFun();
                return true;
            }
            else {
                if (dyl.__isLoading) {
                    return false;
                }
                dyl.__isLoading = true;
                cc.loader.loadRes("dylLoadingAd", function (err, prefab) {
                    let newNode = cc.instantiate(prefab);
                    let canvas = cc.director.getScene().getChildren()[0];
                    canvas.addChild(newNode);
                });
                return false;
            }
            return showad;
        }
    },
});
