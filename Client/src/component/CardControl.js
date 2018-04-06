/**
 * Created by orange on 2016/8/15.
 * 牌类控件
 */
var CardControl = cc.Node.extend({
	_className: "CardControl",
	_classPath: "src/component/CardControl.js",


    viewID: null,
    cardArray: null,
    cardData: null,

    shootCount: 0,

    desPos: null,
    cardGroup: null,

    /**
     * 构造函数
     */
    ctor: function (viewID) {
        this._super();

        this.viewID = viewID;
        this.cardArray = [];
        this.cardData = [];
        
        for (var i = 0; i < CardConst.maxCount; ++i) {
            this.cardArray[i] = new Card(this).to(this).anchor(0, 0).p(i*CardConst.xSpace, 0);
        }
    },
    /**
     * 牌的位置目标点，因为可能会有动画
     * @param xOrp
     * @param y
     */
    setDesPos: function (xOrp, y) {
        this.desPos = (y == null) ? xOrp : cc.p(xOrp, y);
    },

    /**
     * 获取发牌动作的目标位置点
     * @returns {null}
     */
    getDesPos: function () {
        return this.desPos;
    },

    /**
     * 重置控件
     */
    reset: function () {

        for (var i = 0; i < CardConst.maxCount; ++i) {
            this.cardArray[i].p(i*CardConst.xSpace, 0);
            this.cardArray[i].setCardValue(null);
        }

        this.cardData = null;
        this.cardGroup = null;
    },

    /**
     * 设置牌数据
     * @param cardData
     */
    setCardData: function (cardData) {
        this.cardData = cardData;
        for (var i = 0; i < CardConst.maxCount; ++i) {
            // this.cardArray[i].setValue(cardData[i]);
            this.cardArray[i].setCardValue(cardData[i]);
            // 显示两张 盖住一张
            if (i < CardConst.maxCount - 1) {
                this.cardArray[i].showCardValue();
            }
        }
    },
    setCardGroup: function (cardGroup) {
        this.cardGroup = cardGroup;
        this.setCardData(cardGroup.cardData);
    },
    // 全部显示
    showAllCard: function () {
        for (var i = 0; i < CardConst.maxCount; ++i) {
            var card = this.cardArray[i];
            if (card.cardValue != null && card.isFaceUp == false)
                card.flipCard();
        }   
        // 全部显示的同时辅助一下  顺便说明这是牌几吧
    },

    /**
     * 设置控件牌显示的数目
     * @param count
     */
    setVisibleCount: function (count) {
        for (var i = 0; i < CardConst.maxCount; ++i) {
            i < count ? this.cardArray[i].show() : this.cardArray[i].hide();
        }
    },
});