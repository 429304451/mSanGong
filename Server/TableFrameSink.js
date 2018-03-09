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
/**
 * 游戏结束
 */
p.onGameConclude = function () {

    var gameEnd = {};
    gameEnd.tax = [];
    gameEnd.score = [];
    gameEnd.type = [];
    // 单牌点数记录
    gameEnd.singleCardValue = [];
    // 玩家名字
    gameEnd.nickname = [];
    // 排序的结算分数
    gameEnd.endScore = [];
    // 手牌信息
    gameEnd.cardData = [];
    // 牌的数字
    gameEnd.cvalue = [];

    var self = this;
    var cardInfo = [];
    for (var i = 0; i < this.chairCount; ++i) {
        var player = this.player[i];
        gameEnd.tax[i] = 0;
        gameEnd.score[i] = 0;

        if (!player.isPlaying) continue;

        var info = {};
        info.cardGroup = player.cardGroup;
        info.cvalue = player.cardGroup.cvalue;

        info.chairID = i;
        cardInfo.push(info);
    }
    cardInfo.sort(function (a, b) {
        return b.cardGroup.value - a.cardGroup.value;
    });

    // 从真人身上扣除的钱
    var RealPeopleScore_Reduce = 0;
    // 从机器人身上扣除的钱
    var AndroidScore_Reduce = 0;

    // 找出赢家 赢的人就是上面sort得到的第一位
    var winnerChairID = cardInfo[0].chairID;
    var winner = this.player[winnerChairID];
    var score = winner.cardGroup.times * this.cellScore;

    for (var i = 0; i < cardInfo.length; i++) {
        var chairID = cardInfo[i].chairID;
        var player = this.player[chairID];
        // 牌类型 大三公 小三公 单牌等
        gameEnd.type.push(player.cardGroup.type);
        // 单牌点数
        gameEnd.singleCardValue.push(player.cardGroup.singleCardValue);
        var userItem = this.tableFrame.getTableUserItem(chairID);
        // 玩家名字
        gameEnd.nickname.push(userItem.getNickname());
        // 牌52点的具体信息
        gameEnd.cardData.push(player.cardGroup.cardData);
        // 牌的大小权重
        gameEnd.cvalue.push(player.cardGroup.cvalue);

        if (winnerChairID == chairID) continue;
        // 要从输的人身上扣除多少钱
        var minuScore = score;
        if (userItem.score < minuScore)
            minuScore = userItem.score;
        if (userItem.isAndroid) {
            AndroidScore_Reduce += minuScore;
        } else {
            RealPeopleScore_Reduce += minuScore;
        }
        gameEnd.score[chairID] -=  minuScore;
        gameEnd.score[winnerChairID] += score;
    }

    // 逃跑玩家的总计分数
    gameEnd.score[winnerChairID] += this.fleeScore;
    // 逃跑的分数计入影响库存
    AndroidScore_Reduce += this.fleeAndroid;
    RealPeopleScore_Reduce += this.fleePeople;

    //计算赢家税收 这里税收最好不要用 gameEnd.score[winnerChairID] 太狠了 每局我押注一万 税收去了8000 所以用真人输的钱来算吧
    gameEnd.tax[winnerChairID] = this.tableFrame.calculateRevenue(winnerChairID, RealPeopleScore_Reduce);
    gameEnd.score[winnerChairID] -= gameEnd.tax[winnerChairID];
    gameEnd.winner = winnerChairID;

    var scoreInfo = [];
    for (var i = 0; i < this.chairCount; ++i) {
        if (!this.player[i].isPlaying) continue;
        
        var over = {};
        over.Chair = i;
        over.Score = gameEnd.score[i] - gameEnd.tax[i];
        over.Tax = gameEnd.tax[i];
        scoreInfo.push(over);
    }

    if (!this.gameControl.allAndroid) {
        winston.info("当局游戏结束 结算");
        winston.info(gameEnd);
    }
    
    // console.log(scoreInfo);

    for (var i = 0; i < cardInfo.length; i++) {
        var chairID = cardInfo[i].chairID;
        gameEnd.endScore.push(gameEnd.score[chairID]);
    }

    this.tableFrame.writeTableScore(scoreInfo);
    this.broadCastGameData(subGameMSG.S_GAME_END, null, gameEnd);


    this.tableFrame.concludeGame(subGameMSG.GS_FREE);
    this.tableFrame.checkTableUsersScore();
    // 从发牌开始就是全部是机器人 那么就不用对库存有任何影响了
    if (this.gameControl.allAndroid) {
        return;
    }
    ////////////////////// 库存计算
    var WinnerItem = this.tableFrame.getTableUserItem(winner.chairID);
    // 机器人赢 把真人输的钱加入库存
    if (WinnerItem.isAndroid) {
        this.gameControl.updateStorage(RealPeopleScore_Reduce);
    } else {
        // 真人赢 把机器人输的钱从库存里吐出来
        this.gameControl.updateStorage(-AndroidScore_Reduce);
    }
};

/**
 * 广播游戏消息
 * @param subCMD
 * @param chairID
 * @param data
 * @param onlyPlaying
 */
p.broadCastGameData = function (subCMD, chairID, data, onlyPlaying) {

    if (onlyPlaying) {
        this.tableFrame.sendTableData(gameCMD.MDM_GF_GAME, subCMD, chairID, data);
    }
    else {
        this.tableFrame.broadCastTableData(gameCMD.MDM_GF_GAME, subCMD, chairID, data);
    }
};

p.onTimerOpenCard = function () {
    for (var i = 0; i < this.chairCount; ++i) {
        var player = this.player[i];
        if (player.isPlaying && !player.isOpenCard) {
            var userItem = this.tableFrame.getTableUserItem(i);
            this.onSubOpenCard(null, userItem);
        }
    }
};
/**
 * 场景消息
 * @param chairID 椅子号
 * @param userItem 用户
 * @param gameStatus 游戏状态
 * @returns {boolean}
 */
p.onEventSendGameScene = function (chairID, userItem, gameStatus) {

    var status = {};
    status.cellScore = this.cellScore;

    if (gameStatus == subGameMSG.GS_PLAYING) {
        status.playerStatus = [];
        status.cardData = [];
        status.isOpenCard = [];
        for (var i = 0; i < this.chairCount; ++i) {
            status.playerStatus[i] = this.player[i].isPlaying;
            status.isOpenCard[i] = this.player[i].isOpenCard;
            var left = Config.openCardTime -  parseInt((Date.now() - this.statusTime) / 1000);
            status.statusLeftTime = (left<0 ? 0:  left);

            if (this.player[i].isPlaying) {
                status.cardData[i] = this.player[i].cardData;
            }
        }
    }

    this.tableFrame.sendGameScene(userItem, status)
};

/**
 * 游戏消息事件
 * @param subCMD 子游戏消息
 * @param data 数据
 * @param userItem 用户
 * @returns {boolean}
 */
p.onGameMessageEvent = function (subCMD, data, userItem) {
    switch (subCMD) {
        case subGameMSG.C_OPEN_CARD:
            return this.onSubOpenCard(data, userItem);

        default :
            return false;
    }
};

p.onSubOpenCard = function (data, userItem) {
    if (this.tableFrame.getGameStatus() != subGameMSG.GS_PLAYING) {
        winston.info("开牌游戏状态错误，桌号：" + this.tableFrame.tableID +　" 用户椅子号：" + userItem.getChairID() + ", ID: " + userItem.getUserID());
        return true;
    }
    
    var player = this.player[userItem.chairID];

    //已经开过牌了
    if (player.isOpenCard) {
        return true;
    }

    player.isOpenCard = true;

    //判断开牌玩家
    var openCount = 0;
    for (var i = 0; i < this.chairCount; ++i) {
        if (!this.player[i].isPlaying || this.player[i].isOpenCard) ++openCount;
    }

    //游戏结束
    if (openCount == this.chairCount) {
        var openCard = {};
        openCard.cardGroup = [];
        for (var i = 0; i < this.chairCount; ++i) {
            openCard.cardGroup[i] = {};
            if (!this.player[i].isPlaying) continue;
            openCard.cardGroup[i].cardData = this.player[i].cardGroup.cardData;
            openCard.cardGroup[i].type = this.player[i].cardGroup.type;
            openCard.cardGroup[i].singleCardValue = this.player[i].cardGroup.singleCardValue;
            openCard.cardGroup[i].cvalue = this.player[i].cardGroup.cvalue;
        }

        this.killGameTimer(Config.openCardTime);
        this.broadCastGameData(subGameMSG.S_ALL_OPEN_CARD, null, openCard);
        
        this.onEventConcludeGame(null, null, gameConst.GER_NORMAL);

    } else {
        this.broadCastGameData(subGameMSG.S_SINGLE_OPEN_CARD, null, {chairID: player.chairID});
    }

    return true;
};

/**
 * 玩家逃跑
 * @param chairID
 */
p.onPlayerFlee = function (chairID) {
    // 发送玩家逃跑
    this.broadCastGameData(subGameMSG.S_PLAYER_EXIT, null, {chairID: chairID});

    var fleeScore = this.cellScore*(Config.fleeTimes + 1);
    var userItem = this.tableFrame.getTableUserItem(chairID);
    if (fleeScore > userItem.getUserScore()) {
        fleeScore = userItem.getUserScore();
    }

    if (userItem.isAndroid) {
        this.fleeAndroid += fleeScore;  // 机器人逃跑导致扣除的钱
    } else {
        this.fleePeople += fleeScore;  // 真人逃跑扣除的钱
    }

    //逃跑玩家扣分
    this.tableFrame.writeUserScore({
        Score: -fleeScore,
        Tax: 0,
        Chair: chairID
    });

    //能继续游戏肯定是大于底分了。
    this.fleeScore += fleeScore;
    winston.info("玩家逃跑", this.fleeScore, userItem.nickname);

    this.player[chairID].reset();


    var userCount = 0;
    var realPlayer = 0;

    for (var i = 0;  i < this.chairCount; ++i) {
        if (this.player[i].isOpenCard) userCount++;
        if (this.player[i].isPlaying) realPlayer++;
    }

    //只剩一个人了就结束游戏吧
    if (realPlayer==1) {
        this.killGameTimer(Config.openCardTime);
        this.onEventConcludeGame(null, null, gameConst.GER_NORMAL);
        return;
    }
    // 公布所有人开牌 结算游戏
    if (userCount == realPlayer) {
        var openCard = {};
        openCard.cardGroup = [];
        for (var i = 0; i < this.chairCount; ++i) {
            openCard.cardGroup[i] = {};
            if (!this.player[i].isPlaying) continue;
            openCard.cardGroup[i].cardData = this.player[i].cardGroup.cardData;
            openCard.cardGroup[i].type = this.player[i].cardGroup.type;
            openCard.cardGroup[i].singleCardValue = this.player[i].cardGroup.singleCardValue;
            openCard.cardGroup[i].cvalue = this.player[i].cardGroup.cvalue;
        }

        this.killGameTimer(Config.openCardTime);
        this.broadCastGameData(subGameMSG.S_ALL_OPEN_CARD, null, openCard);

        this.onEventConcludeGame(null, null, gameConst.GER_NORMAL);
    }
};

//////////////////////////////////////////////////////////

/**
 * 深复制
 * @param o
 * @returns {*}
 */
p.deepCopy = function (o) {
    if (o instanceof Array) {
        var n = [];
        for (var i = 0; i < o.length; ++i) {
            n[i] = this.deepCopy(o[i]);
        }
        return n;

    } else if (o instanceof Object) {
        var n = {};
        for (var i in o) {
            n[i] = this.deepCopy(o[i]);
        }
        return n;
    } else {
        return o;
    }
};

/**
 * 游戏开始，上层回调此函数 处理完显示调用 this.tableFrame.concludeGame函数
 */
p.onEventConcludeGame = function (chair, userItem, concludeReason) {
    switch (concludeReason) {
        case gameConst.GER_NORMAL:
            this.onGameConclude();
            return true;

        case gameConst.GER_USER_LEAVE:
        case gameConst.GER_NETWORK_ERROR:
            this.onPlayerFlee(chair);
            return true;


        default:
            return false;
    }
};

/**
 * 游戏解散
 */
p.onDismiss = function () {
};

/**
 * 玩家起立
 * @param chair
 * @param userItem
 */
p.onActionUserStandUp = function (chair, userItem) {

};

/**
 * 玩家坐下
 * @param chair
 * @param userItem
 * @param lookup
 */
p.onActionUserSitDown = function (chair, userItem) {

};

/**
 * 游戏定时器
 * @param func 回调函数
 * @param timerID 计时器ID
 * @param time 时间
 */
p.setGameTimer = function (func, timerID, time) {
    var that = this;
    var args = null;
    if (arguments.length > 3)
        args = Array.prototype.slice.call(arguments, 3);	//貌似性能不好？

    this.killGameTimer(timerID);
    var timer = setTimeout(function () {

        for (var i = 0; i < that.timeMng.length; ++i) {
            if (that.timeMng[i].value == timer) {
                that.timeMng.splice(i, 1);
                break;
            }
        }
        func.apply(that, args);
    }, time * 1000);

    that.timeMng.push({key: timerID, value: timer});
};

/**
 * 删除定时器
 * @param timerID
 */
p.killGameTimer = function (timerID) {
    for (var i = 0; i < this.timeMng.length; ++i) {
        if (this.timeMng[i].key == timerID) {
            clearTimeout(this.timeMng[i].value);
            this.timeMng.splice(i, 1);
            break;
        }
    }
};
module.exports = TableFrameSink; 














