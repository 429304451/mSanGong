/**
 * Created by Apple on 2016/8/4.
 */


/**
 * 帮助层
 */
var HelpLayer = cc.LayerColor.extend({
	_className: "HelpLayer",
	_classPath: "src/layer/HelpLayer.js",


    bgBox: null,
    ruleBox: null,

    yxjsBtn: null,  //游戏介绍
    yxgzBtn: null,  //游戏规则
    closeBtn: null, //关闭按钮

    descSprite: null,
    ruleScroll: null,
    ctor: function () {
        this._super(cc.color(0, 0, 0, 0x80));
        this.swallowTouch();
        this.initEx();
    },

    initEx: function () {

        this.bgBox = new cc.Sprite("#sangong/g/ruleBox.png").to(this).pp(0.5, 0.5);

        this.ruleBox = new cc.Scale9Sprite().to(this.bgBox).pp(0.5, 0.4);
        this.ruleBox.initWithSpriteFrameName("sangong/g/ruleBG.png");
        this.ruleBox.size(this.bgBox.cw() * 0.9, this.bgBox.ch() * 0.6);

        new cc.Sprite("#sangong/g/rule.png").to(this.bgBox).pp(0.5, 0.90);

        //游戏介绍
        this.yxjsBtn = new FocusButton("sangong/g/infoBtn_n.png", "sangong/g/infoBtn_h.png", "", ccui.Widget.PLIST_TEXTURE).to(this.bgBox).p(130, 400);

        //游戏规则
        this.yxgzBtn = new FocusButton("sangong/g/ruleBtn_n.png", "sangong/g/ruleBtn_h.png", "", ccui.Widget.PLIST_TEXTURE).to(this.bgBox).p(300, 400);
        //关闭按钮
        this.closeBtn = new FocusButton("sangong/g/close.png", "sangong/g/close-dj.png", "", ccui.Widget.PLIST_TEXTURE).to(this.bgBox).p(1070, 460);

        this.ruleScroll = new FocusScrollView().to(this.ruleBox).anchor(0.5, 0).pp(0.5, 0);
        this.ruleScroll.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.ruleScroll.setTouchEnabled(true);           //设置可点击
        this.ruleScroll.setBounceEnabled(true);          //设置有弹力
        this.ruleScroll.setContentSize(this.ruleBox.size());     //限定一下点击区域

        this.descSprite = new cc.Sprite(res.RULE_PNG);
        var size = this.descSprite.size();

        this.ruleScroll.setInnerContainerSize(cc.size(size.width, size.height + 20));//限定一下点击区域
        this.descSprite.to(this.ruleScroll).anchor(0, 1).pp(0.01, 0.99);
        this.descSprite.setScale(0.87);


        var self = this;
        this.closeBtn.addClickEventListener(function () {
            self.onDelete();
            SoundEngine.playEffect(commonRes.btnClick);
        });

        this.yxgzBtn.addClickEventListener(function () {
            self.showYXGZ();
            SoundEngine.playEffect(commonRes.btnClick);
        });
        this.yxjsBtn.addClickEventListener(function () {
            self.showYXJS();
            SoundEngine.playEffect(commonRes.btnClick);
        });

        this.showYXJS();
        // TV 按键绑定
        this.yxjsBtn.setNextFocus(null, null, null, this.yxgzBtn);
        this.yxgzBtn.setNextFocus(null, null, this.yxjsBtn, this.closeBtn);
        this.closeBtn.setNextFocus(null, null, this.yxgzBtn, null);
        GD.mainScene.setFocusSelected(this.closeBtn);

    },

    //显示游戏介绍
    showYXJS: function () {
        this.yxjsBtn.loadTextureNormal("sangong/g/infoBtn_h.png", ccui.Widget.PLIST_TEXTURE);
        this.yxgzBtn.loadTextureNormal("sangong/g/ruleBtn_n.png", ccui.Widget.PLIST_TEXTURE);
        this.descSprite.display(res.INFO_PNG);
        this.ruleScroll.scrollToTop(0, true);
    },
    //显示游戏规则
    showYXGZ: function () {
        this.yxjsBtn.loadTextureNormal("sangong/g/infoBtn_n.png", ccui.Widget.PLIST_TEXTURE);
        this.yxgzBtn.loadTextureNormal("sangong/g/ruleBtn_h.png", ccui.Widget.PLIST_TEXTURE);
        this.descSprite.display(res.RULE_PNG);
        this.ruleScroll.scrollToTop(0, true);
    },
    onDelete: function () {
        this.removeFromParent();
        GD.mainScene.setFocusSelected(GD.mainScene.UILayer.ruleBtn);
        GD.mainScene.UILayer.helpLayer = null;
    }
});