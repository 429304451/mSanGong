/**
 * Created by Administrator on 2015/7/26.
 * 机器人逻辑钩子
 */

var gameConst = require("./define").gameConst;
var subGameMSG = require("./SubGameMSG").subGameMSG;
var gameCMD = require("./define").gameCMD;
var Config = require("./Config").controlConfig; 
var GameLogic = require("./logic/GameLogic");

/**
 * 机器人逻辑对象
 * @param androidItem
 * @constructor
 */
function AndroidUserSink(androidItem) {
    this.timeMng = [];                           //计时器管理器
    this.androidUserItem = androidItem;

    this.cardData = null;
}
var p = AndroidUserSink.prototype;

p.gameLogic = new GameLogic();

/**
 * 游戏框架消息
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.onEventFrameMessage = function (subCMD, data) {
    return true;
};
/**
 * 场景消息
 * @param gameStatus 游戏状态
 * @param data
 * @returns {boolean}
 */
p.onEventSceneMessage = function (gameStatus, data) {
    switch (gameStatus) {
        case subGameMSG.GS_FREE:
            var time = Math.floor(Math.random() * Config.androidConfig.startGameTime) + Config.androidConfig.startGameTime;
            this.setGameTimer(this.onTimerStartGame, Config.androidConfig.timerStartGame, time);
            break;

        default :
            return true;
    }
    return true;
};
/**
 * 游戏消息
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.onEventGameMessage = function (subCMD, data) {
    switch (subCMD) {
        case subGameMSG.S_GAME_START:
            this.onSubGameStart(data);
            break;

        case subGameMSG.S_GAME_END:
            this.onSubGameEnd(data);
            break;

        default :
            return false;
    }
    return true;
};

p.onSubGameStart = function (data) {

    var chairID = this.androidUserItem.getChairID();
    // this.cardData = data.cardData[chairID];
    this.cardData = data.cardGroupArray[chairID].cardData;

    var time = Math.floor(Math.random() * Config.androidConfig.openCardTime) + Config.androidConfig.openCardTime;
    this.setGameTimer(this.onTimerOpenCard, Config.androidConfig.timerOpenCard, time);
};

p.onSubGameEnd = function (data) {
    this.killGameTimer(Config.androidConfig.timerStartGame);
    this.killGameTimer(Config.androidConfig.timerOpenCard);

    var time = Math.floor(Math.random() * Config.androidConfig.startGameTime) + Config.androidConfig.startGameTime+1;
    this.setGameTimer(this.onTimerStartGame, Config.androidConfig.timerStartGame, time);
};

p.onTimerOpenCard = function () {
    this.androidUserItem.sendSocketData(subGameMSG.C_OPEN_CARD, null);
};

p.onTimerStartGame = function () {
    this.androidUserItem.sendUserReady(null);
};


/**
 * 定时器功能
 * @param func  定时器回调函数
 * @param timerID 定时器标识
 * @param time 定时器时间  1s
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

    this.timeMng.push({key: timerID, value: timer});
};

/**
 * 删除定时器
 * @param timerNum 定时器标识
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

/**
 *清除所有定时器
 */
p.clearAllTimer = function () {
    for (var i = 0; i < this.timeMng.length; ++i) {
        clearTimeout(this.timeMng[i].value);
    }
    this.timeMng.length = 0;
};

/**
 * 用户进入 上层未实现接口 保留
 */

p.onEventUserEnter = function (userItem) {
    return true;
};
/**
 * 用户离开 上层未实现接口 保留
 */
p.onEventUserLeave = function (userItem) {
    return true;
};
/**
 * 用户分数变更 上层未实现接口 保留
 */
p.onEventUserScore = function (userItem) {
    return true;
};
/**
 * 用户状态变更 上层未实现接口 保留
 */
p.onEventUserStatus = function (userItem) {
    return true;
};
/**
 * 用户自己进入 上层未实现接口 保留
 */
p.onEventSelfEnter = function (userItem) {
    return true;
};


module.exports = AndroidUserSink;