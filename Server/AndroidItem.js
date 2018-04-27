/**
 * Created by Administrator on 2015/7/26.
 */
var AndroidUserSink = require('./AndroidUserSink'); // 逻辑操作
var gameConst = require("./define").gameConst;
var gameEvent = require("./define").gameEvent;
var gameCMD = require("./define").gameCMD;
var util = require('util');
var events = require('events');

function AndroidItem(serverUserItem, androidUserMNG) {
    this.serverUserItem = serverUserItem;
    this.androidUserManager = androidUserMNG;
    this.gameStatus = gameConst.GAME_STATUS_FREE;
    this.androidUserSink = new AndroidUserSink(this);

    this.on(gameEvent.EVENT_ANDROID, this.onSocketEvent.bind(this))
}
util.inherits(AndroidItem, events.EventEmitter);


var p = AndroidItem.prototype;

/**
 * 获取用户ID
 * @returns {*|String}
 */
p.getUserID = function () {
    return this.serverUserItem.getUserID();
};
/**
 * 获取桌子号
 * @returns {*}
 */
p.getTableID = function () {
    return this.serverUserItem.getTableID();
};
/**
 * 获取椅子号
 * @returns {*}
 */
p.getChairID = function () {
    return this.serverUserItem.getChairID();
};
/**
 * 获取自己
 * @returns {*}
 */
p.getMeUserItem = function () {
    return this.serverUserItem;
};

/**
 * 发送数据
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.sendSocketData = function (subCMD, data) {
    this.androidUserManager.sendDataToServer(this.serverUserItem, gameCMD.MDM_GF_GAME, subCMD, data);
    return true;
};
/**
 * 发送准备
 * @param data
 * @returns {boolean}
 */
p.sendUserReady = function (data) {
    // console.log("AndroidItem_sendUserReady发送用户准备", this.getChairID());
    this.androidUserManager.sendDataToServer(this.serverUserItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_USER_READY, data);
};

/**
 * 发送自己起立
 */
p.sendUserStandUp = function () {

    this.androidUserManager.sendDataToServer(this.serverUserItem, gameCMD.MDM_GR_USER, gameCMD.SUB_GR_USER_STANDUP, null);
};

/**
 * 清除所有定时器
 * @returns {boolean}
 */
p.clearAllTimer = function () {
    this.androidUserSink.clearAllTimer();
    return true;
};
/**
 * 启动游戏
 */
p.startGameClient = function () {
    this.androidUserManager.sendDataToServer(this.serverUserItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_GAME_OPTION, null);
};

/**
 * 网络消息
 * @param mainCMD
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.onSocketEvent = function (mainCMD, subCMD, data) {
    switch (mainCMD) {
        // 登录事件
        case gameCMD.MDM_GR_LOGON:
            this.onSocketMainLogon(subCMD, data);
            return true;
        // 用户事件 登录成功 用户状态
        case gameCMD.MDM_GR_USER:
            this.onSocketMainUser(subCMD, data);
            return true;
        // 游戏主命令
        case gameCMD.MDM_GF_GAME:
            this.onSocketMainGame(subCMD, data);
            return true;
        // 框架主命令
        case gameCMD.MDM_GF_FRAME:
            this.onSocketMainFrame(subCMD, data);
            return true;

        default :
            return true;
    }

    return true;
};

/**
 * 登录事件
 * @param subCMD
 * @param data
 */
p.onSocketMainLogon = function (subCMD, data) {
    switch (subCMD) {
        case gameCMD.SUB_GR_LOGON_SUCCESS:
            this.startGameClient();
            break;
    }
};
/**
 * 用户事件
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.onSocketMainUser = function (subCMD, data) {
    switch (subCMD) {
        case gameCMD.SUB_GR_USER_ENTER:
            return true;
        case gameCMD.SUB_GR_USER_STATUS:
            return true;

        default :
            return true;
    }
};
/**
 * 游戏事件
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.onSocketMainGame = function (subCMD, data) {
    return this.androidUserSink.onEventGameMessage(subCMD, data);
};
/**
 * 框架事件
 * @param subCMD
 * @param data
 * @returns {boolean}
 */
p.onSocketMainFrame = function (subCMD, data) {
    switch (subCMD) {
        case gameCMD.SUB_GF_GAME_SCENE:

            this.androidUserSink.onEventSceneMessage(this.gameStatus, data);
            return true;

        case gameCMD.SUB_GF_GAME_STATUS:
            this.gameStatus = data["gameStatus"];
            return true;
    }
};

module.exports = AndroidItem;








