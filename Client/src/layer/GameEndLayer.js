/**
 * Created by orange on 2016/8/17.
 */

var GameEndLayer = cc.Layer.extend({
	_className: "GameEndLayer",
	_classPath: "src/layer/GameEndLayer.js",


    result: null,

    scorePos: [],
    winnerPos: [],
    winnerArmature: null,

    name: [],
    type: [],
    score: [],

    ctor: function () {

        this._super();

        this.initEx();

    },

    initEx: function () {

        this.winnerPos[0] = cc.p(470, this.ch()-70);
        this.winnerPos[1] = cc.p(this.cw()/2+ 210, this.ch() - 70);
        this.winnerPos[2] = cc.p(this.cw()-90, this.ch()/2);
        this.winnerPos[3] = cc.p(this.cw()/2+ 210, 70);
        this.winnerPos[4] = cc.p(470, 70);
        this.winnerPos[5] = cc.p(90, this.ch()/2);

        this.winnerArmature = new ccs.Armature("winner").to(this).p(this.winnerPos[0]);

        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.name[i] = new cc.LabelTTF("平野绫平野绫", GameFontDef.fontName, GameFontDef.fontSize).to(this, 1).anchor(0.5, 0.5).p(460, 410 - i * 35).hide();
            this.type[i] = new cc.LabelTTF("无牛", GameFontDef.fontName, GameFontDef.fontSize).to(this, 1).anchor(0.5, 0.5).p(670, 410 - i * 35).hide();
            this.type[i].setColor(GameFontDef.fillStyle);
            this.score[i] = new cc.LabelTTF("+100", GameFontDef.fontName, GameFontDef.fontSize).to(this, 1).anchor(0.5, 0.5).p(870, 410 - i * 35).hide();
            this.score[i].setColor(cc.color(255, 0, 0))
        }
    },

    onGameEnd: function (data) {
        if (data == null) return;
        this.result = data;
        this.verificationData();

        var viewID = GD.gameEngine.switchViewChairID(data.winner);
        // 赢的效果展示
        this.winnerArmature.p(this.winnerPos[viewID]);
        var ani = this.winnerArmature.getAnimation();
        ani.setMovementEventCallFunc(null);
        ani.playWithIndex(0);
        ani.setMovementEventCallFunc(function(bone, eventName) {
            if(eventName == ccs.MovementEventType.complete)
                this.doGameEnd();
        }, this);
    },
    verificationData: function () {
        if (this.result == null) return;
        var cardData = this.result.cardData;
        console.log("verificationData");
        console.log(cardData);
    },

    doGameEnd: function () {
        var mechairID = GD.gameEngine.getMeChairID();
        var resultArmature = null;
        if (0>= this.result.score[mechairID]) {
            resultArmature = new ccs.Armature("jiesuan_shu").to(this).p(this.cw()/2, this.ch()/2);
        } else {
            resultArmature = new ccs.Armature("jiesuan_ying").to(this).p(this.cw()/2+25, this.ch()/2);
        }

        var ani = resultArmature.getAnimation();
        ani.playWithIndex(0);
        ani.setFrameEventCallFunc(function (bone, eventName) {
            if (eventName == "showResult") {
                this.showResult();
            }

            if (eventName == "hideResult") {
                this.reset();
            }

        }, this);

        ani.setMovementEventCallFunc(function () {
            resultArmature.removeFromParent();
            GD.mainScene.UILayer.onGameEndFinish();
            GD.gameEngine.onGameEndFinish();
        }, this);

        if (this.result.winner == mechairID) {
            SoundEngine.playEffect("res/sangong/sound/win.mp3");
        } else {
            SoundEngine.playEffect("res/sangong/sound/fail.mp3");
        }
    },

    showResult: function () {
        var index = 0;
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            if (this.result.nickname[i]==null) continue;
            this.name[index].show().setString(this.result.nickname[i]);
            this.type[index].show().setString(this.getTypeString(this.result.type[i], this.result.singleCardValue[i], this.result.cardData[i]));

            var scoreFmt = "";
            var endScore = this.result.endScore[i];
            if (endScore <= 0) {
                scoreFmt = ttutil.formatMoney(endScore);
                this.score[index].setColor(cc.color(0, 255, 0));
            } else {
                scoreFmt = "+" + ttutil.formatMoney(endScore);
                this.score[index].setColor(cc.color(255, 0, 0));
            }

            this.score[index].show().setString(scoreFmt);

            index++;
        }
    },

    reset: function () {
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.name[i].hide();
            this.type[i].hide();
            this.score[i].hide();
        }
        this.result = null;
    },

    getTypeString: function (type, singleCardValue, cardData) {
        var cardValueArray = [];
        for (var i = 0; i < cardData.length; i++) {
            // 花色和牌值
            var color = GD.gameLogic.getCardColor(cardData[i]);
            var value = GD.gameLogic.getCardValue(cardData[i]);
            value = CardSetting.value[value];
            cardValueArray.push(value);
        }

        switch (type) {
            case 1:
                return "单牌:"+singleCardValue+"点 "+cardValueArray;
            case 2:
                return "八点 "+cardValueArray;
            case 3:
                return "九点 "+cardValueArray;
            case 4:
                return "混三公 "+cardValueArray;
            case 5:
                return "小三公 "+cardValueArray;
            case 6:
                return "大三公 "+cardValueArray;
            default:
                return "错误----"+cardValueArray;
        }
    }
});