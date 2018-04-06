/**
 * Created by orange on 2016/8/16.
 */
var UILayer = cc.Layer.extend({
	_className: "UILayer",
	_classPath: "src/layer/UILayer.js",


    openCardBtn: null,
    readyBtn: null,

    ruleBtn: null,              //规则按钮

    cancelBtn: null,            //取消按钮
    autoBtn: null,              //自动开牌按钮
    qrcodeBtn: null,            //二维码
    readyText: null,

    cell: null,
    cellText: null,


    isAutoGame: false,        //是否自动游戏
    openStatus: false,        //是否是开牌状态

    ctor: function () {
        this._super();

        this.initEx();
    },

    initEx: function () {
        // 开牌按钮
        this.openCardBtn = new FocusButton("sangong/g/op_n.png", "sangong/g/op_h.png", "sangong/g/op_d.png", ccui.Widget.PLIST_TEXTURE).to(this).p(this.cw()-150, 150).hide();
        // 撸牌按钮
        this.lineCardBtn = new FocusButton("sangong/g/cuo_n.png", "sangong/g/cuo_h.png", "sangong/g/cuo_d.png", ccui.Widget.PLIST_TEXTURE).to(this).p(this.cw()-350, 150).hide();
        
        this.readyBtn = new FocusButton("sangong/g/ready_n.png", "sangong/g/ready_h.png", "", ccui.Widget.PLIST_TEXTURE).to(this).p(this.cw()/2, 330).hide();
        this.ruleBtn = new FocusButton("sangong/g/rule_n.png", "sangong/g/rule_h.png", "", ccui.Widget.PLIST_TEXTURE).to(this).p(this.cw()-90, this.ch()-100);
        this.autoBtn = new FocusButton("sangong/g/auto_n.png", "sangong/g/auto_h.png", "sangong/g/auto_d.png", ccui.Widget.PLIST_TEXTURE).to(this).p(this.cw()-150, 60).show();
        this.cancelBtn = new FocusButton("sangong/g/cancel_n.png", "sangong/g/cancel_h.png", "sangong/g/cancel_d.png", ccui.Widget.PLIST_TEXTURE).to(this).p(this.cw()-150, 60).hide();
        this.qrcodeBtn = new FocusButton("res/room/invitebtn1.png", "res/room/invitebtn1.png", "", ccui.Widget.PLIST_TEXTURE).to(this).p(111, 60);
        typeof G_OPEN_QRCODE_SCANNER != "undefined" && !G_OPEN_QRCODE_SCANNER && this.qrcodeBtn.hide();

        this.cell = new cc.Sprite("#sangong/g/cell_frame.png").to(this).p(this.cw()-110, this.ch()-30);
        this.cellText = new cc.LabelTTF("底注: 10000000", GameFontDef.fontName, GameFontDef.fontSize ).to(this.cell).anchor(0.5, 0.5).pp(0.5, 0.5);
        this.cellText.setColor(GameFontDef.fillStyle);

        this.qrcodeBtn.addClickEventListener(()=>{new RoomCodeLayer().to(this);});
        this.openCardBtn.addClickEventListener(this.onClickEvent.bind(this));
        this.lineCardBtn.addClickEventListener(this.onClickEvent.bind(this));
        this.readyBtn.addClickEventListener(this.onClickEvent.bind(this));
        this.ruleBtn.addClickEventListener(this.onClickEvent.bind(this));
        this.autoBtn.addClickEventListener(this.onClickEvent.bind(this));
        this.cancelBtn.addClickEventListener(this.onClickEvent.bind(this));

        this.readyText = [];

        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.readyText[i] = new cc.Sprite("#sangong/g/read_font.png").to(this).hide();
        }

        this.readyText[0].p(480, this.ch()-200 + 15);
        this.readyText[1].p(this.cw()/2+190, this.ch()-200 + 15);
        this.readyText[2].p(this.cw()-310,  this.ch()/2 + 30);
        this.readyText[3].p(this.cw()/2+190, 245);
        this.readyText[4].p(480, 245);
        this.readyText[5].p(300, this.ch()/2 + 30);
    },

    showReadyBtn: function (show) {
        this.readyBtn.setVisible(show);
    },

    showOpenCardBtn: function (show) {
        this.openCardBtn.setVisible(show);
        this.openStatus = show;
        this.setOpenCardEnable(false);

        this.lineCardBtn.setVisible(show);

    },

    setOpenCardEnable: function (enable) {
        this.openCardBtn.setEnabled(enable);
        this.lineCardBtn.setEnabled(enable);
    },

    showReadyText: function (viewID, show) {
        if (viewID==null || viewID<0 || viewID>gameConst.GAME_PLAYER_NUM) {
            return ;
        }

        this.readyText[viewID].setVisible(show);
    },

    onUpdateCell: function (cell) {
        this.cellText.setString("底注: " + cell);
    },

    onClickEvent: function (sender) {
        switch (sender) {
            case this.readyBtn:
                GD.gameEngine.onReadyBtn();
                this.readyBtn.hide();
                break;

            case this.openCardBtn:
                if (GD.mainScene.cardLayer.clipper && GD.mainScene.cardLayer.clipper.backRoll && GD.mainScene.cardLayer.clipper.backRoll.isVisible()) {
                    GD.mainScene.cardLayer.clipper.backRoll.openCard();
                } else {
                    GD.gameEngine.onSendOpenCard();
                    this.showOpenCardBtn(false);
                }
                break;

            case this.ruleBtn:
                if (this.helpLayer)
                    this.helpLayer.removeFromParent();
                this.helpLayer = new HelpLayer().to(GD.mainScene, 1);
                break;

            case this.autoBtn:
                this.isAutoGame = true;
                this.autoBtn.hide();
                var isAutoNow = this.cancelBtn.isVisible();
                this.cancelBtn.show();
                // this.openStatus
                if (this.openCardBtn.isVisible()){
                    this.openCardBtn.onClick();
                }

                if (this.readyBtn.isVisible()) {
                    this.onClickEvent(this.readyBtn);
                }
                // tv手指的移动
                if (isAutoNow == false)
                    GD.mainScene.setFocusSelected(this.cancelBtn);
                break;

            case  this.cancelBtn:
                this.isAutoGame = false;
                this.autoBtn.show();
                this.cancelBtn.hide();
                GD.mainScene.setFocusSelected(this.autoBtn);
                break;
            case this.lineCardBtn:
                // 这张牌隐藏 后面重复利用 原地方创造一张 用来翻牌的精灵
                GD.mainScene.cardLayer.cardControls[GD.selfViewID].cardArray[2].hide();
                GD.mainScene.cardLayer.addOpenCard();
                this.lineCardBtn.setEnabled(false);
                break;
        }

        SoundEngine.playEffect(commonRes.btnClick);
    },

    onSendCardFinish: function () {
        this.setOpenCardEnable(true);
        if (this.isAutoGame) {
            this.onClickEvent(this.autoBtn);
        }
    },

    onGameEndFinish: function () {
        this.showReadyBtn(true);
        if (this.isAutoGame) {
            this.onClickEvent(this.readyBtn);
        }
    }
});