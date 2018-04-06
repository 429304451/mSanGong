/**
 * Created by orange on 2016/8/16.
 */
var CardType = cc.Sprite.extend({
	_className: "CardType",
	_classPath: "src/component/CardType.js",

    value: null,

    ctor: function () {
        this._super("#sangong/g/niu_frame.png");
        this.shadow = new cc.Sprite("res/sangong/niu_replace.png").to(this).pp(0.5, 0.5);
        this.shadow.setOpacity(150);

        this.tmpString = new cc.LabelTTF("待替换","黑体",25,cc.size(300,30),cc.TEXT_ALIGNMENT_CENTER,cc.TEXT_ALIGNMENT_CENTER).to(this).anchor(0.5,0.5).pp(0.5, 0.5);
    },

    // 简单显示 辅助开发
    commonShow: function (cardGroup) {
        this.show();
        this.setScale(0.7);
        this.setCardType(cardGroup.type, cardGroup.singleCardValue, cardGroup.cardData);
    },

    setCardType: function(type, singleCardValue, cardData) {
        var mstr = this.getCardType(type, singleCardValue, cardData);
        this.tmpString.setString(mstr);
    },

    getCardType: function (type, singleCardValue, cardData) {
        var cardValueArray = [];
        for (var i = 0; i < cardData.length; i++) {
            var color = GD.gameLogic.getCardColor(cardData[i]);
            var value = GD.gameLogic.getCardValue(cardData[i]);
            cardValueArray.push(value);
        }

        switch (type) {
            case 1:
                return "单牌:"+singleCardValue+"点 ";
            case 2:
                return "八点 ";
            case 3:
                return "九点 ";
            case 4:
                return "混三公 ";
            case 5:
                return "小三公 ";
            case 6:
                return "大三公 ";
            default:
                return "错误----";
        }

    }
});