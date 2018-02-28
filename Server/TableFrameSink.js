// 桌子逻辑操作类

var gameConst = require("./define").gameConst;
var subGameMSG = require("./SubGameMSG").subGameMSG;
var gameCMD = require("./define").gameCMD;
var winston = require("winston");
var Player = require("./logic/Player");
var Config = require("./Config").controlConfig;
var GameControl = require("./logic/GameControl");
var GameLogic = require("./logic/GameLogic");
var gameconfig = require("./gameconfig");

/**
 * 桌子逻辑处理类
 * @param tableFrame
 * @param roomInfo
 * @constructor
 */
function TableFrameSink(tableFrame, roomInfo) {
    this.roomInfo = roomInfo;						//房间信息
    this.chairCount = roomInfo["ChairCount"];		//椅子数
    this.tableFrame = tableFrame;					//桌子框架类
    this.timeMng = [];								//计时器管理器

    this.cellScore = gameconfig["CellScore"];

    this.gameLogic = new GameLogic();               //逻辑
    this.player = [];                               //玩家
    this.gameControl = new GameControl(this);       //游戏控制

    this.fleeScore = 0;                             //逃跑玩家扣分

    this.fleePeople = 0;                            // 真人逃跑数量
    this.fleeAndroid = 0;                           // 机器人逃跑数量

    this.init();
};

var p = TableFrameSink.prototype;

/**
 * 记录定时器启动的那一时刻  场景还原你可能需要用到
 */
p.recordTimeTick = function () {
    this.statusTime = parseInt(Date.now() / 1000);
};

/**
 * 获取剩余时间
 * @param totalTime 定时器的时间
 * @returns {number}
 */
p.getLeftTimeTick = function (totalTime) {
    var passTime = parseInt(Date.now() / 1000) - this.statusTime;
    return totalTime - passTime < 0 ? 0 :  totalTime - passTime;
};

/**
 * 初始化
 */
p.init = function () {
    for (var i = 0; i < this.chairCount; ++i) {
        this.player.push(new Player(i));
    }
};

/**
 * 复位桌子
 */
p.repositionSink = function () {
    for (var i = 0; i < this.chairCount; ++i) {
        this.player[i].reset();
    }
    this.fleeScore = 0;
    this.fleePeople = 0;                            // 真人逃跑数量
    this.fleeAndroid = 0;                           // 机器人逃跑数量
};

/**
 * 游戏开始，上层回调此函数
 */
p.onEventStartGame = function () {
    
    this.tableFrame.setGameStatus(subGameMSG.GS_PLAYING);

    var playerCount = 0;
    for (var i = 0; i < this.chairCount; ++i) {
        var userItem = this.tableFrame.getTableUserItem(i);
        if (userItem != null) {
            this.player[i].isPlaying = true;
            this.player[i].isAndroid = userItem.isAndroid;
            playerCount++;
        }
    }
    // 初始化牌数据
    var cardGroupArray = this.gameLogic.randCardList(playerCount);

    //控制牌
    this.gameControl.beginControl(cardGroupArray);
    // console.log("-------------TableFrameSink----------------");
    // for (var i = 0; i < cardGroupArray.length; i++) {
    //     cardGroupArray[i].PrintString();
    // }
    // console.log("-------------TableFrameSink----------------");
    var preCardData = [];
    var index = 0;
    for (i = 0; i < this.chairCount; ++i) {
        var player = this.player[i];
        if (player.isPlaying) {
            player.cardGroup = cardGroupArray[index];
            preCardData[i] = [];
            index++;
        } else {
            preCardData[i] = null;
        }
    }
    var cardGroupArray = this.deepCopy(preCardData);
    for (var i = 0; i < this.chairCount; ++i) {
        var player = this.player[i];
        if (player.isPlaying) {
            var mdic = { cardData: player.cardGroup.cardData, type: player.cardGroup.type, value: player.cardGroup.value, cvalue: player.cardGroup.cvalue, singleCardValue: player.cardGroup.singleCardValue };
            cardGroupArray[i] = mdic;
        }
    }

    for (var i = 0; i < this.chairCount; ++i) {
        var player = this.player[i];
        if (player.isPlaying) {
            this.tableFrame.sendTableData(gameCMD.MDM_GF_GAME, subGameMSG.S_GAME_START, i, {cardGroupArray: cardGroupArray});
        }
    }
    
    this.setGameTimer(this.onTimerOpenCard, Config.timerOpenCard, Config.openCardTime + Config.netDelayTime);
    this.recordTimeTick();
};




