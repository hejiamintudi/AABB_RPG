cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/▦ 瓦块地图",
        inspector: 'packages://dyl-nowshow/DylNotshow.js',
    },
    properties: {
    },

    __preload: function () {
        this.initTileMap();
    },

    initTileMap: function () {
        let tmx = this.node.getComponent(cc.TiledMap);
        let mapSize = tmx.getMapSize();
        let tileD = tmx.getTileSize().width;

        this.node.map = dyl.addMap(mapSize.width, mapSize.height);
        this.node.posMap = dyl.addMapLayer(mapSize.width, mapSize.height, tileD);
        //checkIn(p,isT) tposToPos(tp) getTpos(p) getPos(p, isT)

        this.node.add = function (layerName, fun) {
            let layer = node.getChildByName(layerName).getComponent(cc.TiledLayer);
            if (layer) { //正常的地图，其他是对象
                let size = layer.getLayerSize();
                let d = layer.getMapTileSize().width;
                for (let x = size.width - 1; x >= 0; x--) {
                    for (let y = size.height - 1; y >= 0; y--) {
                        let gid = layer.getTileGIDAt(x, size.height - y - 1);
                        fun(cc.v2(x, y), gid);
                    }
                }
                map.d = d;
                return map;
            }
            else {
                layer = tmx.getObjectGroup(layerName);
                let arr = layer.getObjects();
                // cc.log("layerName", arr);
                for (var i = arr.length - 1; i >= 0; i--) {
                    let x = arr[i].x / tileD;
                    let y = arr[i].y / tileD;
                    // fun(arr[i], dyl.newPos(x, mapSize.height - y - 1));
                    fun(cc.v2(x, mapSize.height - y - 1), arr[i].name);
                }
            }
        }
    },
});
