/**
 * Created by orange on 2016/7/29.
 *
 */
var ExitLayer = cc.Layer.extend({
	_className: "ExitLayer",
	_classPath: "src/layer/ExitLayer.js",

    showPanelBtn: null,
    hidePanelBtn: null,

    clipper: null,
    panel: null,

    hallBtn: null,
    effectBtn: null,
    musicBtn: null,
    effectOffBtn: null,
    musicOffBtn: null,

    musicVolumn: 0,
    effectVolume: 0,

    callback: null,

    ctor: function () {
        this._super();

        this.initEx();
        this.initEffectConfig();
    },

    initEx: function () {
        this.showPanelBtn = new FocusButton("allcommon/show.png", "allcommon/show.png", "", ccui.Widget.PLIST_TEXTURE).to(this).anchor(0, 1).pp(0.01, 1);
        this.hidePanelBtn = new FocusButton("allcommon/hide.png", "allcommon/hide.png", "", ccui.Widget.PLIST_TEXTURE).to(this).anchor(0, 1).pp(0.01, 1).hide();

        this.showPanelBtn.setPressedActionEnabled(true);
        this.hidePanelBtn.setPressedActionEnabled(true);

        this.showPanelBtn.addClickEventListener(this.onClickBtn.bind(this));
        this.hidePanelBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.panel = new cc.Sprite("#allcommon/panel.png").anchor(0, 1).hide();

        this.hallBtn = new FocusButton("allcommon/hallBtn.png", "allcommon/hallBtn.png", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.5, 0.82);
        this.hallBtn.setPressedActionEnabled(true);
        this.hallBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.effectBtn = new FocusButton("allcommon/effect_e.png", "allcommon/effect_e.png", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.5, 0.52);
        this.effectBtn.setPressedActionEnabled(true);
        this.effectBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.musicBtn = new FocusButton("allcommon/music_e.png", "allcommon/music_e.png", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.5, 0.22);
        this.musicBtn.setPressedActionEnabled(true);
        this.musicBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.effectOffBtn = new FocusButton("allcommon/effect_d.png", "allcommon/effect_d.png", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.5, 0.52).hide();
        this.effectOffBtn.setPressedActionEnabled(true);
        this.effectOffBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.musicOffBtn = new FocusButton("allcommon/music_d.png", "allcommon/music_d.png", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.5, 0.22).hide();
        this.musicOffBtn.setPressedActionEnabled(true);
        this.musicOffBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.initClipper();

        this.effectVolume = SoundEngine.getEffectsVolume();
        this.musicVolumn = SoundEngine.getMusicVolume();

        var self = this;
        this.bindTouch({
            swallowTouches: true,
            onTouchBegan: function () {
                return self.panel.isVisible() ? true : false;
            },

            onTouchEnded: function () {
                self.onClickBtn(self.hidePanelBtn);
            }
        });
    },
     initEffectConfig: function(){
            if (typeof mpGD != "undefined")
            {
                mpGD.isBgMusicOn = cc.sys.localStorage.getItem("isBgMusicOn", "true") == "true";
                SoundEngine.setMusicVolume(mpGD.isBgMusicOn ? 1 : 0);

                mpGD.isSoundOn = cc.sys.localStorage.getItem("isSoundOn", "true") == "true";
                SoundEngine.setEffectsVolume(mpGD.isSoundOn ? 1 : 0);

                mpGD.isBgMusicOn = cc.sys.localStorage.getItem("isBgMusicOn", "true") == "true";
                if (mpGD.isBgMusicOn) {
                    this.musicBtn.show();
                    this.musicOffBtn.hide();
                }
                else {
                    this.musicBtn.hide();
                    this.musicOffBtn.show();
                }

                mpGD.isSoundOn = cc.sys.localStorage.getItem("isSoundOn", "true") == "true";
                if (mpGD.isSoundOn) {
                    this.effectBtn.show();
                    this.effectOffBtn.hide();
                }
                else {
                    this.effectBtn.hide();
                    this.effectOffBtn.show();
                }
            }
        },
    /**
     * 初始化裁剪节点
     */
    initClipper: function () {
        var h = this.showPanelBtn.ch() + 5;
        this.clipper = new cc.ClippingNode().anchor(0, 1).to(this).size(this.panel.cw(), this.panel.ch()).p(5, cc.winSize.height - h);

        var stencil = new cc.DrawNode();
        var rect = [cc.p(0, 0), cc.p(this.panel.cw(), 0), cc.p(this.panel.cw(), this.panel.ch()), cc.p(0, this.panel.ch())];
        var white = cc.color(255, 255, 255, 255);
        stencil.drawPoly(rect, white, 1, white);
        this.clipper.setStencil(stencil);

        this.panel.to(this.clipper).p(0, this.panel.ch() * 2);
    },

    /**
     * 设置重返大厅函数
     */
    setBackToHallCallback: function (callback) {
        this.callback = callback;
    },

    /**
     * 更新焦点
     */
    refreshFingerFocus: function () {
        // 第一层 上拉
        this.layer1 = this.hidePanelBtn.isVisible() ? this.hidePanelBtn : null;
        // 第二层 大厅
        this.layer2 = this.hallBtn.isVisible() ? this.hallBtn : null;
        // 第三层 音效 
        this.layer3 = this.effectBtn.isVisible() ? this.effectBtn : (this.effectOffBtn.isVisible() ? this.effectOffBtn : null);
        // 第四层 音乐
        this.layer4 = this.musicBtn.isVisible() ? this.musicBtn : (this.musicOffBtn.isVisible() ? this.musicOffBtn : null);
    },

    /**
     * 点击函数
     * @param sender
     */
    onClickBtn: function (sender) {
        switch (sender) {
            case this.showPanelBtn:
                this.hidePanelBtn.show();
                this.showPanelBtn.hide();
                this.panel.runAction(cc.sequence(cc.show(), cc.moveTo(0.2, 0, this.panel.ch())));
                GD.mainScene.setFocusSelected(this.hidePanelBtn);
                break;

            case this.hidePanelBtn:
                this.hidePanelBtn.hide();
                this.showPanelBtn.show();
                this.panel.runAction(cc.sequence(cc.moveTo(0.2, 0, this.panel.ch() * 2), cc.hide()));
                GD.mainScene.setFocusSelected(this.showPanelBtn);
                break;

            case this.hallBtn:
                if (this.callback) {
                    this.callback();
                } else {
                    app.closeSubGame();
                }
                break;

            case this.effectBtn:
                cc.sys.localStorage.setItem("isSoundOn", "false");
                SoundEngine.setEffectsVolume(0);
                this.effectOffBtn.show();
                this.effectBtn.hide();
                GD.mainScene.setFocusSelected(this.effectOffBtn);
                break;

            case this.musicBtn:
                cc.sys.localStorage.setItem("isBgMusicOn", "false");
                SoundEngine.setBackgroundMusicVolume(0);
                this.musicOffBtn.show();
                this.musicBtn.hide();
                GD.mainScene.setFocusSelected(this.musicOffBtn);
                break;

            case this.effectOffBtn:
                cc.sys.localStorage.setItem("isSoundOn", "true");
                SoundEngine.setEffectsVolume(this.effectVolume);
                this.effectOffBtn.hide();
                this.effectBtn.show();
                GD.mainScene.setFocusSelected(this.effectBtn);
                break;

            case this.musicOffBtn:
                cc.sys.localStorage.setItem("isBgMusicOn", "true");
                SoundEngine.setBackgroundMusicVolume(this.musicVolumn);
                this.musicOffBtn.hide();
                this.musicBtn.show();
                GD.mainScene.setFocusSelected(this.musicBtn);
                break;
        }

        SoundEngine.playEffect(commonRes.btnClick);
    }

});