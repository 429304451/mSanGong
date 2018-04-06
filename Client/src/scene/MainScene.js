var MainScene = FocusScene.extend({
	_className: "MainScene",
	_classPath: "src/scene/MainScene.js",

    exitLayer: null,
    mainLayer: null,
    cardLayer: null,
    gameEndLayer: null,
    timerLayer: null,
    UILayer: null,

    ctor: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames("res/sangong/allcommon/common.plist");
        // cc.spriteFrameCache.addSpriteFrames(res.EXIT_PLIST);
        cc.spriteFrameCache.addSpriteFrames(res.GAME_PLIST);
        cc.spriteFrameCache.addSpriteFrames("res/sangong/card.plist");
        ccs.armatureDataManager.addArmatureFileInfo(res.WINNER_JSON);
        // ccs.armatureDataManager.addArmatureFileInfo(res.MIAOSHA_JSON);
        // ccs.armatureDataManager.addArmatureFileInfo(res.MIAOSHA_WZ_JSON);
        ccs.armatureDataManager.addArmatureFileInfo(res.TIMER_JSON);
        ccs.armatureDataManager.addArmatureFileInfo(res.JIESUAN_SHU_JSON);
        ccs.armatureDataManager.addArmatureFileInfo(res.JIESUAN_YING_JSON);

        this.mainLayer = new MainLayer().to(this);
        this.cardLayer = new CardLayer().to(this);
        this.timerLayer = new TimerLayer().to(this);
        this.UILayer = new UILayer().to(this);
        this.gameEndLayer = new GameEndLayer().to(this);
        this.exitLayer = new ExitLayer().to(this, 10);


        SoundEngine.playBackgroundMusic("res/sangong/sound/bg_music.mp3", true);

        // TV的按键提示手指
        this.setSelectPanal();

    },

});   