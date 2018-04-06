/**
 * Created by Administrator on 2015/7/10.
 */


/** @expose */
window.io;

var SocketIO = SocketIO || window.io;

var ClientKernel = cc.Class.extend({
    _className: "ClientKernel",
    _classPath: "src/core/ClientKernel.js",

    webSocket: null,
    gameUserManager: null,
    gameEngine: null,
    gameStatus: null,
    myUserItem: null,
    myUserID: null,
    serverReady: false,          //服务端是否准备好, 当成功触发onReady后， 就会重置为false， 防止重复触发
    clientReady: false,         //客户端是否准备好，当成功触发onReady后， 就会重置为false， 防止重复触发
    loginSuccess: false,        //登录是否成功
    uuid: null,

    ctor: function (userID, uuid) {
        this.gameUserManager = new GameUserManager(this);
        this.myUserID = userID;
        this.uuid = uuid;
    },

    webSocketSend: function (data) {

        if(this.webSocket == null)
            return;

        data = Encrypt.packetData(data, this.webSocket);
        this.webSocket.send(data);
    },

    /**
     * 启动服务器
     * @param url
     * @param gameEngine
     */
    startConnect: function (url, gameEngine) {
        if(!G_OPEN_CONNECT_SERVER)
            return;

        if(cc.sys.isNative && !nonHttps)
            this.webSocket = SocketIO.connect(url, "res/cacert.pem");
        else
            this.webSocket = SocketIO.connect(url);

        this.webSocket.tag = "GAME_Client";
        var self = this;

        //设置游戏引擎
        this.setGameEngine(gameEngine);


        //链接事件
        this.webSocket.on("connect", function (data) {
            cc.log("连接成功");
            self.onEventConnect(data);
        });
        //断开事件
        this.webSocket.on("disconnect", function () {
            cc.log("断开连接");
            self.onEventDisconnect();
            self.webSocket = null;
        });
        //错误消息
        this.webSocket.on("error", function (error) {
            cc.log(error.stack);
            self.onEventDisconnect();
            self.webSocket = null;
        });
        //通信消息
        this.webSocket.on("message", function (data) {
            if(cc.sys.isNative)
                data = JSON.parse(data);

            self.onEventMessage(data);
        });
    },

    /**
     * 设置游戏逻辑引擎
     * @param gameEngine
     */
    setGameEngine: function (gameEngine) {

        this.gameEngine = gameEngine;
        this.gameEngine.setClientKernel(this);

    },

    /**
     * 停止websocket服务器
     */
    stopWebSocket: function () {
        this.webSocket && this.webSocket.disconnect();
        this.webSocket = null;
    },

    /**************************************************************************
     websocket事件操作
     **************************************************************************/

    /**
     * 链接成功
     * @param data
     */
    onEventConnect: function (data) {
        if (this.myUserID == null) {
            return;
        }

        //请求
        this.webSocketSend({
            mainCMD: gameCMD.MDM_GR_LOGON,
            subCMD: gameCMD.SUB_GR_LOGON_ACCOUNTS,
            data: {userID: this.myUserID, uuid: this.uuid}
        });
    },

    /**
     * 断开连接
     */
    onEventDisconnect: function () {
        this.gameEngine && this.gameEngine.onEventDisconnect && this.gameEngine.onEventDisconnect();
    },

    /**
     * 消息事件
     * @param data
     * @returns {boolean}
     */
    onEventMessage: function (data) {
        switch (data["mainCMD"]) {
            case gameCMD.MDM_GR_LOGON:
                this.onSocketMainLogon(data["subCMD"], data["data"]);
                return true;

            case gameCMD.MDM_GR_USER:
                this.onSocketMainUser(data["subCMD"], data["data"]);
                return true;

            case gameCMD.MDM_GF_GAME:
                this.onSocketMainGame(data["subCMD"], data["data"]);
                return true;

            case gameCMD.MDM_GF_FRAME:
                this.onSocketMainFrame(data["subCMD"], data["data"]);
                return true;
        }
    },

    /**
     * 登录处理函数
     * @param subCMD
     * @param data
     * @returns {boolean}
     */
    onSocketMainLogon: function (subCMD, data) {
        switch (subCMD) {
            //登录成功
            case gameCMD.SUB_GR_LOGON_SUCCESS:
                //登录成功就获取自己
                this.myUserID = data["userID"];
                this.gameConfig = data["gameConfig"];
                this.myUserItem = this.gameUserManager.getUserByUserID(this.myUserID);
                //this.onEventSelfEnter(this.myUserItem);
                //获取游戏信息
                //this.webSocket.send({mainCMD:gameCMD.MDM_GF_FRAME, subCMD:gameCMD.SUB_GF_GAME_OPTION});
                this.serverReady = true;
                this.loginSuccess = true;
                if (this.clientReady) {
                    this.onReady();
                    this.serverReady = false;
                }
                return true;

            default :
                return true;
        }
    },


    onClientReady: function () {
        this.clientReady = true;
        if (this.serverReady) {
            this.onReady();
            this.clientReady = false;
        }
    },

    onReady: function () {
        this.onEventSelfEnter(this.myUserItem);
        //获取场景游戏信息
        this.webSocketSend({mainCMD: gameCMD.MDM_GF_FRAME, subCMD: gameCMD.SUB_GF_GAME_OPTION});

        //自己先进
        this.onUserItemActive(this.myUserItem);

        var userItem = null;
        for (var i = 0; i < this.gameUserManager.tableUserItem.length; ++i) {
            userItem = this.gameUserManager.tableUserItem[i];
            if (!userItem || userItem == this.myUserItem) continue;
            this.onUserItemActive(userItem);
        }


    },

    /**
     * 用户命令函数
     * @param subCMD
     * @param data
     * @returns {boolean}
     */
    onSocketMainUser: function (subCMD, data) {
        switch (subCMD) {
            case gameCMD.SUB_GR_USER_ENTER:
                this.onUserEnter(data);
                return true;
            case gameCMD.SUB_GR_USER_STATUS:
                this.onSubUserStatus(data);
                return true;
            case gameCMD.SUB_GR_USER_SCORE:
                this.onSubUserScore(data);
            default :
                return true;
        }
    },

    /**
     * 游戏命令函数
     * @param subCMD
     * @param data
     */
    onSocketMainGame: function (subCMD, data) {

        this.gameEngine.onEventGameMessage(subCMD, data);

    },

    /**
     * 框架命令函数
     * @param subCMD
     * @param data
     * @returns {boolean}
     */
    onSocketMainFrame: function (subCMD, data) {
        switch (subCMD) {
            case gameCMD.SUB_GF_GAME_SCENE:
                this.gameEngine.onEventSceneMessage(this.gameStatus, data);
                return true;

            case gameCMD.SUB_GF_GAME_STATUS:
                this.gameStatus = data["gameStatus"];
                return true;

            default :
                this.gameEngine.onEventFrameMessage(subCMD, data);
                return true;
        }
    },

    /**
     * 发送消息
     * @param mainCMD
     * @param subCMD
     * @param data
     */
    sendSocketData: function (mainCMD, subCMD, data) {
        var o = {};
        o.mainCMD = mainCMD;
        o.subCMD = subCMD;
        o.data = data;
        this.webSocketSend(o);
    },

    /**
     * 用户状态
     * @param data 数据
     * @returns {boolean}
     */
    onSubUserStatus: function (data) {
        var userID = data["userID"];
        var tableID = data["tableID"];
        var chairID = data["chairID"];
        var userStatus = data["userStatus"];

        var userItem = this.gameUserManager.getUserByUserID(userID);
        if (userItem == null) return true;

        if (userStatus <= gameConst.US_FREE) {
            this.gameUserManager.deleteUserItem(userItem);
        } else {
            this.gameUserManager.updateUserItemStatus(userItem, {
                tableID: tableID,
                chairID: chairID,
                userStatus: userStatus
            });
        }

        return true;
    },
    /**
     * 用户分数变更
     * @param data
     */
    onSubUserScore: function (data) {
        var userID = data["userID"];
        var score = data["score"];

        var userItem = this.gameUserManager.getUserByUserID(userID);
        if (userItem == null) return true;

        this.gameUserManager.updateUserItemScore(userItem, score);
    },

    /**
     * 用户进入
     * @param data
     * @returns {boolean}
     */
    onUserEnter: function (data) {
        var infoArray = data;


        for (var i = 0; i < infoArray.length; ++i) {
            //创建玩家
            this.gameUserManager.createNewUserItem(infoArray[i]);
        }
    },

    /**
     * 切换视图椅子
     * @param chairID
     */
    switchViewChairID: function (chairID) {

        var chairCount = gameConst.GAME_PLAYER_NUM;
        var viewChairID = Math.floor((chairID + chairCount * 3 / 2 - this.myUserItem.getChairID()) % chairCount);
        return viewChairID;
    },


    /**
     * 获取自己椅子ID
     * @returns {*}
     */
    getMeChairID: function () {
        return this.myUserItem.getChairID();
    },

    /**
     * 获取自己
     * @returns {null}
     */
    getMeUserItem: function () {
        return this.myUserItem;
    },

    /**
     * 获取座位玩家
     * @param chairID
     * @returns {*}
     */
    getTableUserItem: function (chairID) {
        return this.gameUserManager.getTableUserItem(chairID);
    },

    /**
     * 通过UserID获取用户
     * @param userID
     * @returns {*}
     */
    getUserByUserID: function (userID) {

        return this.gameUserManager.getUserByUserID(userID);
    },

    /**
     * 通过游戏ID获取用户
     */
    getUserByGameID: function (gameID) {

        return this.gameUserManager.getUserByGameID(gameID);
    },

    /**
     * 发送准备
     * @returns {boolean}
     */
    sendUserReady: function () {
        this.webSocketSend({mainCMD: gameCMD.MDM_GF_FRAME, subCMD: gameCMD.SUB_GF_USER_READY});
        return true;
    },


    /**
     *用户信息变化处理
     */



    /**
     * 玩家激活
     * @param userItem
     * @returns {boolean}
     */
    onUserItemActive: function (userItem) {
        if (!userItem || !this.loginSuccess) {
            return false;
        }


        if (this.gameEngine == null) {
            return false;
        }

        this.gameEngine.onEventUserEnter(userItem);
    },

    /**
     * 玩家删除
     * @param userItem
     * @returns {boolean}
     */
    onUserItemDelete: function (userItem) {
        if (userItem == null) {
            return false;
        }

        cc.log("onUserItem Delete");
        this.gameEngine.onEventUserLeave(userItem);
    },

    /**
     * 分数更新
     * @param userItem
     * @param scoreInfo
     * @returns {boolean}
     */
    onUserItemUpdateScore: function (userItem, scoreInfo) {
        if (userItem == null) {
            return false;
        }
        this.gameEngine.onEventUserScore(userItem);
    },

    /**
     * 状态更新
     * @param userItem
     * @param statusInfo
     * @returns {boolean}
     */
    onUserItemUpdateStatus: function (userItem, statusInfo) {
        this.gameEngine.onEventUserStatus(userItem);
    },

    /**
     * 自己进入
     * @param userItem
     * @returns {boolean}
     */
    onEventSelfEnter: function (userItem) {

        this.gameEngine.onEventSelfEnter(userItem);
    },

    /**
     * 获取游戏配置
     * @returns {null}
     */
    getGameConfig: function () {
        return this.gameConfig;
    }
});