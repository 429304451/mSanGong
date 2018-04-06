/**
 * Created by orange on 2016/8/15.
 * 牌类
 */
var Card = ccui.ImageView.extend({
	_className: "Card",
	_classPath: "src/component/Card.js",

    cardValue: null,        // 牌值

    isFaceUp: false,        // 是否是正面

    maskSprite: null,       // 半透明遮罩


    ctor: function() {

        this._super("sangong/g/card/card_back.png", ccui.Widget.PLIST_TEXTURE);

        this.maskSprite = new cc.Sprite("#sangong/g/card/card_mask.png").to(this).pp(0.5, 0.5).hide();
        
    },
    // 设置单牌值
    setCardValue: function (cardValue) {

        this.cardValue = cardValue;

        if (cardValue == null) {
            this.showCardValue();
        }
    },

    showCardValue: function() {
        if (this.cardValue==null) {
            this.loadTexture("sangong/g/card/card_back.png", ccui.Widget.PLIST_TEXTURE);
            this.isFaceUp = false;
        } else {
            var color = GD.gameLogic.getCardColor(this.cardValue);
            var value = GD.gameLogic.getCardValue(this.cardValue);
            if (color>3 || value > 13) {
                this.loadTexture("sangong/g/card/card_back.png", ccui.Widget.PLIST_TEXTURE);
                this.isFaceUp = false;
            } else {
                this.loadTexture("sangong/g/card/card_" + color + "_"  + value + ".png", ccui.Widget.PLIST_TEXTURE);
                this.isFaceUp = true;
            }
        }
    },
    // 直接显示牌值 不需要任何效果
    showValue: function () {
        this.show();
        this.showCardValue();
    },
    // 翻转开牌发
    flipCard: function () {
        var time = 0.3;
        var action = cc.sequence(
            cc.scaleTo(time, 0, 1),
            cc.callFunc(()=>{
                this.showValue();
            }),
            cc.scaleTo(time, 1)
        );
        this.runAction(action);
    },
});


// 翻牌用来显示实际点数的精灵
var FlopCard = cc.Sprite.extend({

    ctor: function (cardValue, cardColor) {
        this._super("#sangong/UI_KP_paimian.png");
        // 1-13 
        this.cardValue = cardValue;
        // 0-4
        this.cardColor = cardColor;
    },
    onEnter: function () {
        this._super();

        this.colorStr = CardSetting.color[this.cardColor];

        this.addUpDown();

        this.addContent();
    },
    // 增加上下的实际数字
    addUpDown: function () {
        // 上下的字数
        var number_png = "#sangong/UI_KP_r"+CardSetting.value[this.cardValue]+".png"
        if (this.cardColor%2 == 1)
            number_png = "#sangong/UI_KP_b"+CardSetting.value[this.cardValue]+".png"
        var upPercent = 0.88;
        var lfPercent = 0.12;
        this.upNumber = new cc.Sprite(number_png).to(this).pp(lfPercent, upPercent).hide();
        this.dnNumber = new cc.Sprite(number_png).to(this).pp(1-lfPercent, 1-upPercent).hide();
        this.dnNumber.setRotation(180);

        var scale = 0.7;
        upPercent = 0.75;
        lfPercent = 0.12;
        this.upColor = new cc.Sprite(this.colorStr).to(this).pp(lfPercent, upPercent).setScale(scale);
        this.dnColor = new cc.Sprite(this.colorStr).to(this).pp(1-lfPercent, 1-upPercent).qscale(scale).setRotation(180);

    },
    showNumber: function () {
        this.upNumber.show();
        this.dnNumber.show();
    },
    // 增加牌的点数
    addContent: function() {
        if (this.cardValue < 11) {
            var tabWhich = CardSetting["tab"+this.cardValue];
            for (var i = 0; i < tabWhich.length; i++) {
                var tmpArray = tabWhich[i];
                var node = new cc.Sprite(this.colorStr).to(this).pp(tmpArray[0], tmpArray[1]);
                if (tmpArray[2])
                    node.setRotation(180);
            }
        } else {
            var upPercent = 0.656;
            var kp = "#sangong/UI_KP_" + CardSetting.kp[this.cardColor] + CardSetting.value[this.cardValue] + ".png"
            var upNode = new cc.Sprite(kp).to(this).pp(0.5, upPercent);
            new cc.Sprite(this.colorStr).to(upNode).pp(0.22, 0.75);
            var dnNode = new cc.Sprite(kp).to(this).pp(0.5, 1-upPercent);
            // 花牌旁边的色点
            dnNode.setRotation(180);
            new cc.Sprite(this.colorStr).to(dnNode).pp(0.22, 0.75);
        }
    },
    rollBackCard: function() {
        this.showNumber();

        var pos = GD.mainScene.cardLayer.getMyLastCardPos();
        var time = 0.5;
        var action = cc.spawn(cc.rotateTo(time, 0), cc.moveTo(time, pos),  cc.scaleTo(time, 0.12));
        var removeAc = cc.callFunc(()=>{
            var card = GD.mainScene.cardLayer.cardControls[GD.selfViewID].cardArray[2];
            card.showValue();
            // 移除自身 移除
            GD.mainScene.cardLayer.mFlopCard.removeFromParent();
            // GD.gameEngine.onSendOpenCard();
            GD.mainScene.UILayer.openCardBtn.onClick();
        });
        this.runAction(cc.sequence(cc.delayTime(0.2), action, cc.scaleTo(0.1, 0.35), cc.scaleTo(0.1, 0.21), removeAc));

    },
})


var BackCard = cc.Sprite.extend({
    ctor: function () {
        this._super("#sangong/UI_KP_paibei.png");
        this.bindTouch({
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
        })
    },
    onTouchBegan: function(touch, event) {
        this.lBeganPos_ = this.getPosition();
        this.lBeganPoint_ = touch.getLocation();
        return true;
    },
    onTouchMoved: function(touch, event) {
        this.p(cc.pAdd(this.lBeganPos_, cc.pSub(touch.getLocation(), this.lBeganPoint_)));
    },
    onTouchEnded: function(touch, event) {
        var nowPos = this.getPosition();
        var diffX = Math.abs(nowPos.x - this.lBeganPos_.x);
        var diffY = Math.abs(nowPos.y - this.lBeganPos_.y);
        if (diffX > 190 || diffY > 180) {
            // 返回到最后一张牌的位置 开牌
            this.openCard();
        } else {
            this.pp(0, 0);
        }
    },
    // 开牌
    openCard: function () {
        GD.mainScene.cardLayer.mFlopCard.rollBackCard();
        this.hide();
    },

})