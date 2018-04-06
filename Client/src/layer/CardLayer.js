/**
 * Created by orange on 2016/8/15.
 */
var CardLayer = cc.Layer.extend({
    _className: "CardLayer",
    _classPath: "src/layer/CardLayer.js",


    cardControls: null,

    cardTypes: null,

    ctor: function () {
        this._super();

        this.initEx();

    },

    initEx: function () {

        this.cardControls = [];
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.cardControls[i] = new CardControl(i).to(this).anchor(0, 0);
            this.cardControls[i].setVisibleCount(0);
        }

        this.cardTypes = [];
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.cardTypes[i] = new CardType().to(this, 9999).anchor(0.5, 0).hide();
        }

        this.cardControls[0].p(360, this.ch()-270).setDesPos(360, this.ch()-270);
        this.cardControls[1].p(this.cw()/2+70, this.ch()-270).setDesPos(this.cw()/2+70, this.ch()-270);
        this.cardControls[2].p(this.cw()-430,  this.ch()/2 - 55).setDesPos(this.cw()-430,  this.ch()/2 - 55);
        this.cardControls[3].p(this.cw()/2+70, 160).setDesPos(this.cw()/2+70, 160);
        this.cardControls[4].p(360, 160).setDesPos(360, 160);
        this.cardControls[5].p(180, this.ch()/2 - 55).setDesPos(180, this.ch()/2 - 55);

        this.cardTypes[0].p(480, this.ch()-290);
        this.cardTypes[1].p(this.cw()/2+190, this.ch()-290);
        this.cardTypes[2].p(this.cw()-310,  this.ch()/2 - 75);
        this.cardTypes[3].p(this.cw()/2+190, 140).setScale(0.7);
        this.cardTypes[4].p(480, 140);
        this.cardTypes[5].p(300, this.ch()/2 - 75);
    },

    onSendCardData: function (cardGroupArray) {

        var playerChairArray = [];
        for (var i = 0; i < cardGroupArray.length; ++i) {
            if (cardGroupArray[i] != null){
                var viewID = GD.gameEngine.switchViewChairID(i);
                playerChairArray.push({viewID: viewID, cardIndex: i});
            }
        }

        var cardCount = CardConst.maxCount * playerChairArray.length;

        var cardArray = [];

        for (i = 0; i < cardCount; ++i) {
            cardArray[i] = new cc.Sprite("#sangong/g/card/card_back.png").to(this, cardCount-i).anchor(0, 0).p(this.cw()/2  - 47, this.ch()/2 - 64);
        }


        var self = this;

        var index = 0;

        for (i = 0; i < playerChairArray.length; ++i) {

            var viewID = playerChairArray[i].viewID;
            var cardControl = this.cardControls[viewID].show();

            cardControl.setCardGroup( cardGroupArray[ playerChairArray[i].cardIndex ] );
            
            var desPos = cardControl.getDesPos();

            for (var j = 0; j < CardConst.maxCount; ++j) {
                var card = cardArray[i*CardConst.maxCount + j];
                var isLast = (i*CardConst.maxCount + j + 1) == cardArray.length;
                card.runAction(cc.sequence(
                    cc.delayTime(0.12 * i),
                    cc.delayTime(0.02*j),
                    cc.callFunc(function(){
                        if (Math.floor(index%2)==0) SoundEngine.playEffect("res/sangong/sound/sendCard.mp3");
                        index++;
                    }, card),
                    cc.moveTo(0.2, desPos.x + j * CardConst.xSpace, desPos.y),
                    cc.callFunc(function (node, data) {
                        node.removeFromParent();
                        data.cardControl.setVisibleCount(3);
                        if (data.isLast) self.doSendCardFinish();
                    }, card, {cardControl: cardControl, index: j, isLast: isLast})
                ));
            }
        }

       // this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(this.doSendCardFinish.bind(this))));
    },

    /**
     * 设置牌类型
     * @param viewID 牌类型视图位置
     * @param value 牌值
     * @param scaleAction 伸缩动画
     */
    setCardType: function (viewID, value, scaleAction) {
        this.cardTypes[viewID].setValue(value);
        this.cardTypes[viewID].show();
        if (viewID==GD.selfViewID && scaleAction) {
            this.cardTypes[viewID].runAction(cc.scaleTo(0.3, 1));
        }
    },

    reset: function () {
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.cardTypes[i].hide();
            this.cardControls[i].reset();
            this.cardControls[i].setVisibleCount(0);
        }
    },

    // 发牌完毕 给 cardControls 赋初值
    doSendCardFinish: function () {
        var cardData = this.cardControls[GD.selfViewID].cardData;
        if (cardData == null) {
            return ;
        }

        // 显示开牌按钮
        GD.mainScene.UILayer.onSendCardFinish();
    },

    /**
     * 设置牌数据
     * @param viewID
     * @param data
     */
    setControlData: function (viewID, data) {
        this.cardControls[viewID] && this.cardControls[viewID].setCardData(data);
    },

    /**
     * 设置一个牌控件显示牌的张数
     * @param viewID
     * @param count
     */
    showControlCount: function (viewID, count) {
        this.cardControls[viewID] && this.cardControls[viewID].setVisibleCount(count);
    },
    // 单人开牌辅助函数
    doOpenCard: function (viewID) {

        var cardControl = this.cardControls[viewID];
        if (cardControl) {
            cardControl.showAllCard();
            var cardGroup = this.cardControls[viewID].cardGroup;
            if (cardGroup != null) {
                this.cardTypes[viewID].commonShow(cardGroup);
            }
        }

    },
    // 显示用来开牌的牌
    addOpenCard: function () {
        // 先把开牌按钮禁用掉
        GD.mainScene.UILayer.openCardBtn.setEnabled(false);
        GD.mainScene.UILayer.autoBtn.setEnabled(false);

        var cardData = this.cardControls[GD.selfViewID].cardData[2];
        var cardValue = GD.gameLogic.getCardValue(cardData);
        var cardColor = GD.gameLogic.getCardColor(cardData);

        // 创造一张用来撸牌的背景牌
        if (this.bkCard == undefined) {
            this.bkCard = new cc.Sprite("#sangong/UI_KP_paibei.png");
            this.bkCard.to(this);
        }
        this.bkCard.setRotation(0);
        this.bkCard.p(this.getMyLastCardPos()).setScale(0.21);
        this.bkCard.show();
        
        // 创建正确的点数牌
        this.mFlopCard = new FlopCard(cardValue, cardColor);
        this.mFlopCard.to(this).pp(0.5, 0.5).setRotation(90);
        
        // ClippingNode 撸牌用的效果
        if (this.clipper == undefined) {
            var backRoll = new BackCard();
            backRoll.setRotation(90);
            var stencil = new cc.Sprite("#sangong/UI_KP_paibei.png");
            stencil.setRotation(90);
            var clipper = new cc.ClippingNode();
            clipper.attr({x: V.w / 2,y: V.h / 2});
            clipper.stencil = stencil;
            clipper.alphaThreshold = 0.5;
            this.addChild(clipper, 9);
            this.clipper = clipper;
            this.clipper.addChild(backRoll);
            this.clipper.backRoll = backRoll;
        } 
        this.mFlopCard.hide();
        this.clipper.backRoll.hide();

        // 旋转到中间准备要开牌
        var time = 0.4;
        var action = cc.sequence(
            cc.spawn(cc.rotateTo(time, 90), cc.moveTo(time, cc.p(V.w/2, V.h/2)),  cc.scaleTo(time, 1)),
            cc.callFunc(()=>{
                this.mFlopCard.show();
                this.clipper.backRoll.show();
                this.clipper.backRoll.setScale(1);
                this.clipper.backRoll.pp(0, 0);
                // 自身隐藏 接下来代替你的是clipper的分身
                this.bkCard.hide();
                GD.mainScene.UILayer.openCardBtn.setEnabled(true);
                GD.mainScene.UILayer.autoBtn.setEnabled(true);
            })
        );
        this.bkCard.runAction(action);
    },
    resetOpenCard: function () {
        if (this.bkCard)
            this.bkCard.hide();
        if (this.mFlopCard) {
            this.mFlopCard.removeFromParent();
            this.mFlopCard = null;
        }
        this.clipper.backRoll.hide();
    },
    getMyLastCardPos: function() {
        // 获得我的最后一张待开牌的位置
        var card = GD.mainScene.cardLayer.cardControls[GD.selfViewID].cardArray[2];
        var pos = card.convertToWorldSpace(card.getPosition());
        pos = cc.p(pos.x-17, pos.y+64);
        return pos;
    },


});