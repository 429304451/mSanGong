/**
 * Created by Administrator on 2015/7/10.
 */
var GameFrameEngine = cc.Class.extend({
	_className: "GameFrameEngine",
	_classPath: "src/core/GameFrameEngine.js",

    clientKernel: null,
    ctor: function () {
    },

    setClientKernel: function (clientKernel) {
        this.clientKernel = clientKernel;
    },

    //停止websocket服务
    stopWebSocket: function () {
        if (this.clientKernel == null) {
            return false;
        }
        this.clientKernel.stopWebSocket();
    },

    /*
     * 发送消息
     */
    sendSocketData: function (subCMD, data) {

        this.clientKernel.sendSocketData(gameCMD.MDM_GF_GAME, subCMD, data);
    },


    //游戏消息
    onEventGameMessage: function (subCMD, data) {
        return true;
    },
    //场景消息
    onEventSceneMessage: function (gameStatus, data) {
        return true;
    },
    //框架消息
    onEventFrameMessage: function (sub, data) {
        return true;
    },

    /*
     * 用户操作
     */

    //用户进入
    onEventUserEnter: function (userItem) {
        return true;
    },
    //用户离开
    onEventUserLeave: function (userItem) {
        return true;
    },
    //用户分数变更
    onEventUserScore: function (userItem) {
        return true;
    },
    //用户状态变更
    onEventUserStatus: function (userItem) {
        return true;
    },
    //用户自己进入
    onEventSelfEnter: function (userItem) {
        return true;
    },
    //获取桌子玩家信息
    getTableUserItem: function (chairID) {
        return this.clientKernel.getTableUserItem(chairID);
    },
    //
    getUserByGameID: function (gameID) {
        return this.clientKernel.getUserByGameID(gameID);
    },
    //获取桌子玩家信息
    getUserByUserID: function (userID) {
        return this.clientKernel.getUserByUserID(userID);
    },
    //视图转换
    switchViewChairID: function (chairID) {
        return this.clientKernel.switchViewChairID(chairID)
    },

    getMeUserItem: function () {
        return this.clientKernel.getMeUserItem();
    },


    getMeChairID: function () {
        return this.clientKernel.getMeChairID();
    },


    /**
     * 发送用户准备
     * @returns {*}
     */
    sendUserReady: function () {
        return this.clientKernel.sendUserReady();
    },


    getGameConfig: function () {
        return this.clientKernel.getGameConfig();
    },

    /**
     * 断开连接
     */
    onEventDisconnect: function () {

    }
});