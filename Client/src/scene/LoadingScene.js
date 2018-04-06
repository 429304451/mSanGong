/**
 * Created by orange on 2016/07/21.
 */

/**
 * 加载场景
 */

var LoadingScene = FocusLoadingScene.extend({
	_className: "LoadingScene",
	_classPath: "src/scene/LoadingScene.js",

	logoBG: null,
    logo: null,

    loadTS: null,
    loadPointArray: [],
    cardColors: null,
    index: 0,

    colorName: ["ht.png", "fk.png", "mh.png", "hx.png"],

    loadArray: null,
    finishCallback: null,

    ctor: function (loadArray, finishCallback) {
        this._super();
        this.loadArray = loadArray;
        this.finishCallback = finishCallback;
        this.initEx();
    },

    startLoad: function() {
    	var self = this;
    	cc.loader.load(self.loadArray,
    		function(result, count, loadedCount) {
    			var percent = count == 0 ? 100 : (loadedCount / count * 100) | 0;
    			percent = Math.min(percent, 100)

    			self.label.setString(percent + "%");
    		},
    		function() {
    			if (self.finishCallback) {
    				// 让其下一帧再运行 以免这帧界面还没显示就卡了一下
    				self.runAction(cc.callFunc(self.finishCallback));
    			}
    		}
    	);
    },
    initEx: function() {
        //加载资源
        cc.spriteFrameCache.addSpriteFrames(loadingRes.LOADING_PLIST);

        this.setContentSize(cc.winSize);

        this.logoBG = new cc.Sprite("#res/sangong/loading/logoBg.png").to(this).pp(0.5, 0.6);

        var size = this.logoBG.getContentSize();

    	this.cardColors = new cc.Sprite("#res/sangong/loading/" + this.colorName[this.index]).to(this.logoBG).p(size.width / 2 + 26, size.height / 2 + 126);
        this.cardColors.setScale(0.8);

        this.logo = new cc.Sprite("#res/sangong/loading/logo.png").to(this.logoBG).pp(0.499, 0.523);
        this.logo.setScale(0.9);

    	this.loadTS = new cc.Sprite("#res/sangong/loading/loading.png").to(this.logoBG).pp(0.46, -0.1);
        this.loadTS.setScale(0.8);

        for (var i = 0; i < 3; i++) {
            this.loadPointArray[i] = new cc.Sprite("#res/sangong/loading/point.png").to(this.loadTS).pp(1.1 + i * 0.1, 0.2);
        }

        //loading percent
        var label = this.label = new cc.LabelTTF("0%", "Arial", 45);
        label.to(this.loadTS);
        label.pp(1.58, 0.42);
        label.setColor(cc.color(231, 195, 79));

        this.schedule(this.updateLoad, 0.5);
    	this.runAction(cc.callFunc(this.startLoad.bind(this)));
    },
    updateLoad: function () {
        this.updateBling();
        this.index++;
    },
    updateBling: function () {
        var deg = -45 * this.index * 2 * Math.PI / 360;
        var ox = 26;
        var oy = 126;
        var x = ox * Math.cos(deg) - oy * Math.sin(deg);
        var y = ox * Math.sin(deg) + oy * Math.cos(deg);
        var size = this.logoBG.getContentSize();
        this.cardColors.setPosition(size.width / 2 + x, size.height / 2 + y);
        var index = this.index % this.colorName.length;
        this.cardColors.display("#res/sangong/loading/" + this.colorName[index]);

        var rIndex = this.index % 8;
        if (rIndex == 6 || rIndex == 7) {
            this.cardColors.setRotation(180);
        } else {
            this.cardColors.setRotation(0);
        }
    },
    
});