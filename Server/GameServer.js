// 游戏服务器
var gameconfig = require('./gameconfig');
var TableFrame = require('./TableFrame');
var ServerUserItem = require('./ServerUserItem');
var util = require('util');
var events = require('events');
var io = require('socket.io');
var loginCorresIO = require('socket.io-client');
var fs = require('fs');
var https = require('https');
var AndroidManager = require('./AndroidManager');
var ControlConfig = require('./Config').controlConfig;
var winston = require('winston');
var define = require('./define');
var ttutil = require("./ttutil");
var gameCMD = define.gameCMD;
var gameEvent = define.gameEvent;
var gameConst = define.gameConst;
var corresCMD = define.corresCMD;
var Encrypt = require("../../extend/Encrypt");


/**
 * 服务器类
 * @constructor
 */
function GameServer() {
    this.tableFrame = [];
    this.PORT = null;
    this.serverUserArray = [];
    this.logCorresSock = null;
    this.roomInfo = null;
    this.androidManager = null;
    this.serverSocket = null;


    if (gameconfig["Single"] == true) {
        this.roomInfo = {};
        this.roomInfo.RoomID = 1;				//房间ID
        this.roomInfo.GameName = "游戏模板";				//游戏名
        this.roomInfo.RoomName = "游戏模板";				//房间名
        this.roomInfo.GameMode = 0;				//房间模式
        this.roomInfo.TableCount = 1;		//桌子数
        this.roomInfo.ChairCount = 6;		//一张桌子椅子数
        this.roomInfo.Revenue = 0;			//税收千分比
        this.roomInfo.MinSitScore = 1;				//最小进入分数
        this.roomInfo.Cheat = 0;			//是否是防作弊模式
        this.PORT = 1236;				//游戏端口

        this.init();
        var self = this;
        setTimeout(function () {
            var androidNum = gameconfig["AndroidNum"] || 0;
            for (var i = 0; i < androidNum; ++i) {

                if (i == (gameconfig["chairID"] == null ? 4 : gameconfig["chairID"]))
                    continue;
                setTimeout((function (i) {

                    return function () {
                        var info = {};
                        info.userID = i;
                        info.gameID = i;
                        info.faceID = i % 5 + 1;
                        info.tableID = 0;
                        info.chairID = i;
                        info.score = 1230045;
                        info.nickname = "大鱼" + i;
                        info.memberOrder = i;
                        info.gender = 0;
                        info.isAndroid = 1;
                        info.sex = i % 2;

                        self.onLCUserSitDown(info);
                    }

                })(i), 2000);
            }
        }, 1000);
    }

}
/**
 * 继承事件发射器
 */
util.inherits(GameServer, events.EventEmitter);


var p = GameServer.prototype;


/**
 * 初始化游戏服务器
 * @returns {boolean}
 */
p.init = function () {
    if (this.roomInfo == null) {
        return false;
    }
    var tableCount = this.roomInfo["TableCount"];
    //创建桌子
    for (var i = 0; i < tableCount; ++i) {
        this.tableFrame[i] = new TableFrame(i, this.roomInfo, this);
    }

    this.androidManager = new AndroidManager(this);

    return true;
};

/**
 * 连接登录协调服
 */
p.connectLogonCorres = function () {
    this.logCorresSock = loginCorresIO.connect(gameconfig["LoginAddr"], {query:'roomID=' + gameconfig["RoomID"]});
    var self = this;
    this.logCorresSock.on("connect", function (data) {
        winston.info("连接协调登录服成功");
        //请求房间信息
        self.sendLCData(corresCMD.ROOM_INFO, {roomID: gameconfig["RoomID"]});
    });

    this.logCorresSock.on("disconnect", function () {
        winston.info("协调登录服断开");
        self.stop();
    });

    //登录协调服事件
    this.onCorresEvent();
};

/**
 * 发送协调服消息
 * @param eventName
 * @param msg
 */
p.sendLCData = function (eventName, msg) {
    if (!gameconfig["Single"]) {
        this.logCorresSock.emit(Encrypt.packetEvent(eventName, this.logCorresSock), Encrypt.packetData(msg, this.logCorresSock));
    }
};

/**
 * 监听登录协调服事件
 */
p.onCorresEvent = function () {

    //房间信息事件
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.ROOM_INFO), this.onLCSocketEvent.bind(this, corresCMD.ROOM_INFO, "onLCRoomInfo"));
    //用户消息
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.USER_SIT_DOWN), this.onLCSocketEvent.bind(this, corresCMD.USER_SIT_DOWN, "onLCUserInfo"));
    //机器人离开
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.USER_LEAVE), this.onLCSocketEvent.bind(this, corresCMD.USER_LEAVE, "onLCUserLeave"));
    //用户写分
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.WRITE_SCORE), this.onLCSocketEvent.bind(this, corresCMD.WRITE_SCORE, "onLCUserScore"));
    //修改用户权重
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.MODIFY_USER_WEIGHT), this.onLCSocketEvent.bind(this, corresCMD.MODIFY_USER_WEIGHT, "onLCModifyUserWeight"));
    //获取房间控制配置
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.GET_ROOM_CONTROL), this.onLCSocketEvent.bind(this, corresCMD.GET_ROOM_CONTROL, "onLCGetRoomControl"));
    //修改房间控制配置
    this.logCorresSock.on(Encrypt.packetEvent2(corresCMD.MODIFY_ROOM_CONTROL), this.onLCSocketEvent.bind(this, corresCMD.MODIFY_ROOM_CONTROL, "onLCModifyRoomControl"));
};

p.onLCSocketEvent = function (eventName, funcName, data) {


    if (this[funcName] != null && typeof(this[funcName]) == "function") {
        data = Encrypt.decryptData2(data);
        this[funcName](data);
    }
};

/**
 * 修改用户权重
 * @param data
 */
p.onLCModifyUserWeight = function (data) {
    winston.info("修改用户权重， userID: " + data.userID + " weight: " + data.weight);
    var userItem = this.getUserItemByUserID(data.userID);
    //有用户且 weight是数字
    if (userItem != null && !isNaN(parseFloat(data.weight))) {
        userItem.setWeight(data.weight);
    }
};

/**
 * 获取房间控制配置
 * @param data
 */
p.onLCGetRoomControl = function (data) {
    winston.info("获取房间控制配置");

    try {
        var config = ControlConfig.onGetContronlCofig();
        this.sendLCData(corresCMD.GET_ROOM_CONTROL, {msgIndex: data.msgIndex, config: config});
    }
    catch (e) {
        winston.error("-----------------------------------------------");
        winston.error("获取房间控制配置出错");
        winston.error(e);
        winston.error("-----------------------------------------------");
        this.sendLCData(corresCMD.GET_ROOM_CONTROL, {
            msgIndex: data.msgIndex,
            config: [{key: "errDesc", value: "子游戏获取房间控制配置出错", desc: "出错信息", attr: "r"}]
        });
    }

};

/**
 * 修改房间控制配置
 * @param data
 */
p.onLCModifyRoomControl = function (data) {
    winston.info("修改房间控制配置" + JSON.stringify(data));

    try {
        var ret = ControlConfig.onModifyControlConfig(data.config);
        var retData = {};
        if (!ret) retData.errMsg = "修改房间控制配置失败";
        else retData.success = true;
        this.sendLCData(corresCMD.MODIFY_ROOM_CONTROL, {msgIndex: data.msgIndex, data: retData});
    }
    catch (e) {
        winston.error("-----------------------------------------------");
        winston.error("保存房间控制配置出错");
        winston.error(e);
        winston.error("-----------------------------------------------");
        this.sendLCData(corresCMD.MODIFY_ROOM_CONTROL, {msgIndex: data.msgIndex, data: {errMsg: "子游戏出错,请联系该子游戏作者"}});
    }

};

/**
 * 得到要下发到游戏的配置
 */
p.getGameConfig = function () {
    var config = {};

    //这边暂时没有需要配置的东西

    return config;
};


/**
 * 分数变更    LC --> S
 * @param data
 * @returns {boolean}
 */
p.onLCUserScore = function (data) {
    if (data == 0) return false;
    var score = data["score"];
    var userID = data["userID"];

    var userItem = this.getUserItemByUserID(userID);
    if (userItem == null || score == null) {
        //winston.info ("更变分数失败，用户分数或者用户分数为NULL");
        return false;
    }

    //userItem.setUserScore(score);

    return true;
};

/**
 * 机器人人离开    LC --> S
 * @param data
 */
p.onLCUserLeave = function (data) {
    var userID = data["userID"];
    var userItem = this.getUserItemByUserID(userID);

    if (userItem) {
        winston.info("用户离开,ID:" + data["userID"] + "是否是机器人: " + userItem.isAndroid + " 昵称 " + userItem.getNickname());
        this.deleteUserItem(null, userItem, false);
    }


};


/**
 * 用户消息
 */
p.onLCUserInfo = function (data) {
    //有错误 关闭客户端
    if (data.errMsg != null) {
        winston.info("接受用户信息为空，用户ID为： " + data.userID);
        var userItem = this.getUserItemByUserID(data.userID);
        this.sendRequestFailure(userItem, data.errMsg);
        //那边也不在房间里， 所以不必通知大厅
        this.deleteUserItem(null, userItem, false);
        return false;
    }

    if (data == null) return false;

    var info = {};
    info.userID = data["userID"];
    info.gameID = data["gameID"];
    info.faceID = data["faceID"];
    info.tableID = data["tableID"];
    info.chairID = data["chairID"];
    info.score = data["score"];
    info.nickname = data["nickname"];
    info.sex = data["gender"];
    info.isAndroid = data["isAndroid"];
    info.memberOrder = data["memberOrder"];
    info.weight = data["weight"];                   //权重

    //体验房调整
    if (gameconfig["FreeMode"]) {
        info.score = gameconfig["FreeModeMoney"];
    }

    this.onLCUserSitDown(info);
};

/**
 * 用户坐下   LC --> S
 * @param data
 * @returns {boolean}
 */
p.onLCUserSitDown = function (data) {
    winston.info("接受信息： ");
    winston.info(data);

    if (data == null) {
        return false;
    }

    var userItem;

    if (data.isAndroid == true) {
        userItem = this.createAndroid(data);
    } else {
        //先清桌子 判重
        this.clearTablesUserByID(data.userID);

        userItem = this.getUserItemByUserID(data.userID);
        if (userItem != null) {
            userItem.setInfo(data);
        }
    }

    if (userItem == null) {
        winston.info("onLCUserSitDown 用户不存在啦");
        return false;
    }

    var sitDownSuccess;
    if (data.isAndroid == true) {
        sitDownSuccess = this.onSitDownEvent({
            tableID: userItem.tableID,
            chairID: userItem.chairID
        }, null, userItem);
    } else {
        sitDownSuccess = this.onSitDownEvent({
            tableID: userItem.tableID,
            chairID: userItem.chairID
        }, userItem.socket, null);
    }

    if (!sitDownSuccess) {
        //坐下失败断开链接
        this.deleteUserItem(userItem.socket, userItem, true);
        winston.info("坐下失败");
        return false;
    }
    //通知客户端成功
    this.sendData(userItem, gameCMD.MDM_GR_LOGON, gameCMD.SUB_GR_LOGON_SUCCESS, {
        userID: userItem.userID,
        gameConfig: this.getGameConfig()
    });
    winston.info("坐下成功");
    return true;
};

/**
 * 创建机器人
 * @param info
 * @returns {ServerUserItem|exports|module.exports}
 */
p.createAndroid = function (info) {
    var userItem = new ServerUserItem(null, this);
    userItem.setInfo(info);
    this.serverUserArray.push(userItem);
    this.androidManager.createAndroidItem(userItem);
    return userItem;
};

/**
 *  房间消息   LC --> S
 * @param data
 * @returns {*}
 */
p.onLCRoomInfo = function (data) {
    if (data.errMsg) {
        winston.error(data.errMsg);
        return false;
    }

    //登入消息
    var crtRoom = null;

    var roomID = "roomID";


    for (var i = 0; i < data.length; ++i) {
        if (parseInt(gameconfig["RoomID"]) == data[i][roomID]) {
            crtRoom = data[i];
        }
    }

    if (crtRoom == null) {
        return crtRoom
    }


    winston.info(crtRoom);

    this.roomInfo = {};
    this.roomInfo.RoomID = crtRoom["roomID"];				//房间ID
    this.roomInfo.GameName = crtRoom["moduleName"];				//游戏名
    this.roomInfo.RoomName = crtRoom["roomName"];				//房间名
    this.roomInfo.GameMode = crtRoom["roomMode"];				//房间模式
    this.roomInfo.TableCount = crtRoom["tableCount"];		//桌子数
    this.roomInfo.ChairCount = crtRoom["chairCount"];		//一张桌子椅子数
    this.roomInfo.Revenue = crtRoom["revenue"];			//税收千分比
    this.roomInfo.MinSitScore = crtRoom["minScore"];				//最小进入分数
    this.roomInfo.Cheat = crtRoom["cheatProof"];			//是否是防作弊模式
    this.PORT = crtRoom["port"];				//游戏端口

    if (gameconfig["FreeMode"]) {
        this.roomInfo.MinSitScore = gameconfig["FreeModeMinScore"];
    }

    this.init();
    this.start();
    winston.info("游戏服务器启动成功");
    //返回启动成功消息
    this.sendLCData(corresCMD.OPEN_OK, crtRoom);
};


/**
 * 开启服务器 消息格式 {mainCMD:x, subCMD:x, data:{xxx}}
 */
p.start = function () {


    if (gameconfig["nohttps"]) {
        this.serverSocket = io.listen(this.PORT);
    }
    else {
        var options = {
            // key: fs.readFileSync('../../key/ryans-key.pem'),
            // cert: fs.readFileSync('../../key/ryans-cert.pem'),
            key: fs.readFileSync('../../key/subgame.key'),
            cert: fs.readFileSync('../../key/subgame.pem'),
            // dhparam:"2048"
            // pfx: fs.readFileSync("../../key/subgame.pfx"),
            // passphrase: fs.readFileSync("../../key/pfx-password.txt"),
        };
        //安全协议
        var app = https.createServer(options);
        this.serverSocket = io.listen(app);
        app.listen(this.PORT);
    }


    winston.info("端口号" + this.PORT);


    var that = this;
    //连接成功
    this.serverSocket.on('connection', function (socket) {
        winston.info("新socket链接成功");

        socket._981_msgID = -1; //网络包id
        //网络消息
        socket.on('message', function (data) {

            try {
                var obj = require("../../extend/Encrypt").decryptData(data, socket);

                if (obj) {
                    that.onClientSocketEvent(obj, socket, null);
                }
            } catch (e) {
                winston.error(data);
                winston.error(e.stack)
            }
        });
        //断开消息
        socket.on('disconnect', function (data) {
            that.onUserShut(data, socket);
        });
        //错误消息
        socket.on('error', function (error) {
            winston.error(error.stack);
        });
    });
    //异步事件处理
    this.onAsynEvent();
};

/**
 * 停服
 */
p.stop = function () {
    winston.info("游戏服务器停止");
    this.removeAllListeners();
    var i, userItem;
    //删除玩家
    for (i = 0; i < this.serverUserArray.length; ++i) {
        userItem = this.serverUserArray[i];
        if (!userItem.isAndroid) {
            userItem.socket.disconnect();
        }
    }
    this.serverUserArray.length = 0;


    //可能还没连接上就断开了就是还没有执行init。所以要做此非空判断
    this.androidManager && this.androidManager.clearAll();


    //删除桌子
    this.tableFrame.length = 0;

    this.serverSocket && this.serverSocket.close();
};
/**
 * 用户关闭
 * @param data
 * @param socket
 * @returns {boolean}
 */
p.onUserShut = function (data, socket) {
    var userItem = this.getUserItem(socket);
    //
    if (userItem == null) {
        winston.info("user shut user is null");
        socket.disconnect();
        return true;
    }
    //断线

    winston.info("用户socket断开退出，用户ID：" + userItem.getUserID() + " 原因： " + data);
    this.deleteUserItem(socket, userItem, true);
    return true;
};
/**
 * 内部异步事件
 */
p.onAsynEvent = function () {
    //玩家状态
    this.on(gameEvent.EVENT_USER_STATUS, this.eventUserItemStatus);
    //分数状态
    this.on(gameEvent.EVENT_USER_SCORE, this.eventUserItemScore);
    //机器人消息处理
    this.on(gameEvent.EVENT_ANDROID, this.onClientSocketEvent);
};
/**
 * 用户分数变更
 * @param userItem 用户
 */
p.eventUserItemScore = function (userItem) {
    if (userItem instanceof ServerUserItem == false) return false;

    var table = this.tableFrame[userItem.getTableID()];

    if (table != null) {
        table.broadCastTableData(gameCMD.MDM_GR_USER, gameCMD.SUB_GR_USER_SCORE, null,
            {userID: userItem.userID, score: userItem.getUserScore()});
    }
};
/**
 * 用户状态变更
 * @param userItem 用户
 * @param oldTableID 旧桌子
 * @param oldChairID 旧椅子
 * @returns {boolean}
 */
p.eventUserItemStatus = function (userItem, oldTableID, oldChairID, oldStatus) {
    //暂时回送坐下消息 以及检测游戏开始
    if (userItem instanceof ServerUserItem == false) return false;

    if (userItem.userStatus != gameConst.US_FREE) { // 其他操作

        this.sendLCData(corresCMD.USER_STATUS, {userID: userItem.userID, status: userItem.userStatus});
        if (userItem.userStatus == gameConst.US_NULL) {
            winston.info("游戏服 -> 协调服, 用户状态： " + userItem.userStatus + " 游戏ID：" + userItem.getUserID());
        }

    }

    if (userItem.userStatus == gameConst.US_NULL && !userItem.isAndroid) {
        //如果状态为US_NULL关闭链接删除用户
        userItem.socket.disconnect();
    }


    //群发状态本桌
    var table = this.tableFrame[userItem.tableID];
    if (table == null) {
        return false;
    }
    //群发给本桌
    table.broadCastTableData(gameCMD.MDM_GR_USER, gameCMD.SUB_GR_USER_STATUS, null,
        {
            userID: userItem.userID,
            tableID: userItem.tableID,
            chairID: userItem.chairID,
            userStatus: userItem.userStatus
        });

    if (userItem.userStatus == gameConst.US_READY) {
        //检测开始
        var table = this.tableFrame[userItem.tableID];

        if (table != null && table.efficacyStartGame()) {
            table.startGame();
        }
    }

    return true;
};

/**
 * 通信主函数
 * @param data {mainCMD:x, subCMD:x, data:{xxx}}
 * @param socket 机器人时为null
 * @param androidUserItem 真人时为null
 * @returns {boolean}
 */
p.onClientSocketEvent = function (data, socket, androidUserItem) {
    var ret = false;
    try {
        switch (data['mainCMD']) {
            //真人登录命令
            case gameCMD.MDM_GR_LOGON:
                ret = this.onClientLogonEvent(data['subCMD'], data['data'], socket, androidUserItem);
                break;
            //用户命令
            case gameCMD.MDM_GR_USER:
                ret = this.onClientUserEvent(data['subCMD'], data['data'], socket, androidUserItem);
                break;
            //游戏命令
            case gameCMD.MDM_GF_GAME:
                ret = this.onClientGameEvent(data['subCMD'], data['data'], socket, androidUserItem);
                break;
            //框架命令
            case gameCMD.MDM_GF_FRAME:
                ret = this.onClientFrameEvent(data['subCMD'], data['data'], socket, androidUserItem);
                break;
        }
    } catch (err) {
        //捕获异常错误处理
        try {
            this.deleteUserItem(socket, androidUserItem, true);
            winston.error(err.stack);
        }
        catch (err2) {
            winston.error(err2.stack);
        }

    }

    //如果返回值错误断开链接
    if (!ret) {

        try {
            var userItem = this.checkUserItem(socket, androidUserItem);
            if (userItem) {
                winston.error("返回值错误，删除用户, 用户ID:" + userItem.getUserID());
                winston.error("----------------------------------------------------------");
                winston.error(data);
                winston.error("----------------------------------------------------------");
            }
            else {
                winston.error("返回值错误，删除用户, 用户为空");
                winston.error("----------------------------------------------------------");
                winston.error(data);
                winston.error("----------------------------------------------------------");
            }


            this.deleteUserItem(socket, androidUserItem, true);
        }
        catch (err) {
            winston.error(err.stack);
        }

    }
};
/**
 * 客户端登录事件
 * @param subCMD 子命令
 * @param data 数据
 * @param socket 玩家socket
 * @param androidUserItem 用户item
 * @returns {boolean}
 */
p.onClientLogonEvent = function (subCMD, data, socket, androidUserItem) {
    switch (subCMD) {
        case gameCMD.SUB_GR_LOGON_ACCOUNTS:

            if (gameconfig["Single"]) {


                var userItem = new ServerUserItem(socket, this);
                userItem.socket = socket;
                this.serverUserArray.push(userItem);

                var tableFrame = this.tableFrame[0];

                var i = this.serverUserArray.length;
                var info = {};
                userItem.userID = 123 + i;
                info.userID = 123 + i;
                info.gameID = 123 + i;
                info.faceID = 1;
                info.tableID = 0;
                info.chairID = tableFrame.getFreeChairID();

                info.score = 2000012;
                info.nickname = "小鱼" + i;
                info.gender = 0;
                info.isAndroid = 0;
                info.memberOrder = 10;
                this.onLCUserSitDown(info);

                console.info("用户登录ID: " + userItem.userID + " \n主动请求");
                //请求坐下消息事件
                this.sendLCData(corresCMD.USER_SIT_DOWN, {userID: userItem.userID, roomID: this.roomInfo.RoomID});
                return true;
            }

            //创建用户，返回登录成功信息
            var userItem = this.getUserItemByUserID(data["userID"]);

            //之前遗留的用户强制关闭
            if (userItem != null) {
                winston.error("大厅启动两次触发，暂时处理");
                //强制关闭客户端
                this.sendData(userItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_FORCE_CLOSE, null);
                this.deleteUserItem(null, userItem, false);
            }

            var userItem = new ServerUserItem(socket, this);
            userItem.userID = data["userID"];
            this.serverUserArray.push(userItem);

            winston.info("用户登录ID: " + userItem.userID + " \n主动请求");
            userItem.socket = socket;

            //请求坐下消息事件
            this.sendLCData(corresCMD.USER_SIT_DOWN, {
                uuid: data.uuid,                        //发个这个过去， 好验证是不是别人乱发的
                userID: userItem.userID,
                roomID: this.roomInfo.RoomID
            });
            return true;
    }

    return false;
};
/**
 * 框架事件
 * @param subCMD
 * @param data
 * @param socket
 * @param androidUserItem
 * @returns {boolean}
 */
p.onClientFrameEvent = function (subCMD, data, socket, androidUserItem) {
    var userItem = this.checkUserItem(socket, androidUserItem);
    if (userItem == null) return false;

    var tableID = userItem.getTableID();
    var chairID = userItem.getChairID();


    if (tableID == null || chairID == null) return false;

    var tableFrame = this.tableFrame[tableID];

    switch (subCMD) {

        default :
            return tableFrame.onEventSocketFrame(subCMD, data, userItem);
    }

    return true;
};


/**
 * 用户事件
 * @param subCMD
 * @param data
 * @param socket
 * @param androidUserItem
 * @returns {boolean}
 */
p.onClientUserEvent = function (subCMD, data, socket, androidUserItem) {
    switch (subCMD) {
        //用户坐下
        case gameCMD.SUB_GR_USER_SIT_DOWN:
            return this.onSitDownEvent(data, socket, androidUserItem);
        //用户起立
        case gameCMD.SUB_GR_USER_STANDUP:
            return this.onStandUpEvent(data, socket, androidUserItem);
    }

    return false;
};
/**
 * 游戏事件
 * @param subCMD
 * @param data
 * @param socket
 * @param androidUserItem
 * @returns {boolean}
 */
p.onClientGameEvent = function (subCMD, data, socket, androidUserItem) {
    var tableUserItem = this.checkUserItem(socket, androidUserItem);
    if (tableUserItem == null) {
        winston.info('the client userItem is null');
        return false;
    }

    if (tableUserItem.tableID == null || tableUserItem.chairID == null) {
        return true;
    }

    var tableFrame = this.tableFrame[tableUserItem.tableID];

    if (tableFrame == null) return false;

    return tableFrame.onEventSocketGame(subCMD, data, tableUserItem);
};

/**
 * 通过socket获取用户
 * @param socket
 * @returns {*}
 */
p.getUserItem = function (socket) {

    if (!socket) {
        return null;
    }

    for (var i = 0; i < this.serverUserArray.length; ++i) {
        if (this.serverUserArray[i].socket == socket) {
            return this.serverUserArray[i];
        }
    }
    return null;
};
/**
 * 通过游戏ID获取用户
 * @param userID
 * @returns {*}
 */
p.getUserItemByUserID = function (userID) {

    for (var i = 0; i < this.serverUserArray.length; ++i) {
        if (this.serverUserArray[i].userID == userID) {
            return this.serverUserArray[i];
        }
    }
    return null;
};

/**
 * 根据玩家ID清理 桌子
 */
p.clearTablesUserByID = function (userID) {

    for (var i = 0; i < this.tableFrame.length; ++i) {

        var table = this.tableFrame[i];
        //坐着的玩家
        for (var j = 0; j < this.roomInfo["ChairCount"]; j++) {
            var userItem = table.getTableUserItem(j);

            //桌子上起立
            if (userItem && userItem.getUserID() == userID) {
                winston.error("桌子人有人坐下, 桌子号: " + userItem.getTableID() + " , 椅子号: " + userItem.getChairID());
                table.performStandUpActionNotNotifyPlaza(userItem);
            }
        }
    }

};

/**
 * 通过游戏ID获取用户 , 判重
 * @param userID
 */
p.getUserItemArrayByUserID = function (userID) {
    var userArray = [];
    for (var i = 0; i < this.serverUserArray.length; ++i) {
        if (this.serverUserArray[i].userID = userID) {
            userArray.push(this.serverUserArray[i]);
        }
    }

    return userArray;
};

/**
 * 删除用户 (通知协调服务器)
 * @param socket
 * @param userItem
 */
p.deleteUserItem = function (socket, userItem, notifyPlaza) {
    var userItem = this.checkUserItem(socket, userItem);

    if (userItem == null) {
        winston.info("deleteUserItem userItem is null");
        if (socket) socket.disconnect();
        return;
    }

    //如果已经被标志要删除了， 就不重入了， 比如玩家逃跑时， 可能会触发结算， 结算就会触发 分数踢人， 导致玩家重入
    if (userItem.markDelete) {
        return;
    }
    userItem.markDelete = true;

    //若在位置先让其起立
    var table = this.tableFrame[userItem.tableID];
    if (table != null) {
        if (notifyPlaza) {
            table.performStandUpAction(userItem);
        }
        else {
            table.performStandUpActionNotNotifyPlaza(userItem);
        }


        table.broadCastTableData(gameCMD.MDM_GR_USER, gameCMD.SUB_GR_USER_STATUS, null,
            {
                userID: userItem.userID,
                tableID: userItem.tableID,
                chairID: userItem.chairID,
                userStatus: gameConst.US_NULL
            });
    }

    ttutil.arrayRemove(this.serverUserArray, userItem);
    if (userItem.isAndroid) {
        this.androidManager.deleteAndroidUserItem(userItem);
    }


};


/**
 * 检测函数，如果userItem不为null直接返回，如果为null，通过sock查找用户
 * @param sock
 * @param userItem
 * @returns {*}
 */
p.checkUserItem = function (sock, userItem) {
    if (userItem != null) {
        return userItem;
    }
    return this.getUserItem(sock);
};

/**
 * 坐下处理
 * @param data
 * @param socket
 * @param androidUserItem
 * @returns {boolean}
 */
p.onSitDownEvent = function (data, socket, androidUserItem) {
    var userItem = this.checkUserItem(socket, androidUserItem);
    if (userItem == null) {
        winston.info("坐下失败，userItem == null");
        return false;
    }

    if (userItem.tableID < this.roomInfo["TableCount"] && userItem.chairID < this.roomInfo["ChairCount"]) {
        if (this.tableFrame[userItem.tableID].getTableUserItem(userItem.chairID) == userItem) {
            winston.info("已经在这个位置上了");
            return true;
        }
    }

    //如果他了tableID为0xffff的话，自动寻位
    var requestTableID = data['tableID'];
    var requestChairID = data['chairID'];

    if (requestTableID == null || requestTableID > this.roomInfo["TableCount"]) {
        winston.info("非法椅子号");
        return false;
    }

    //坐下处理
    var sitSuccess = this.tableFrame[requestTableID].performSitDownAction(requestChairID, userItem);

    if (sitSuccess) {
        //发送给用户这桌的玩家
        this.sendUserInfoPacket(userItem);
        //通知这桌其他用户
        this.sendUserEnter(userItem);
    }

    return sitSuccess;
};


/**
 * 起立
 * @param data
 * @param socket
 * @param androidUserItem
 * @returns {boolean}
 */
p.onStandUpEvent = function (data, socket, androidUserItem) {
    var userItem = this.checkUserItem(socket, androidUserItem);
    this.deleteUserItem(socket, userItem, true);
    return true;
};


/**
 * 发送玩家消息
 * @param userItem 用户
 * @param mainCMD 主命令
 * @param subCMD 子命令
 * @param data 数据
 * @param messageType消息类型， 默认message
 * @returns {boolean}
 */
p.sendData = function (userItem, mainCMD, subCMD, data, messageType) {
    if (userItem instanceof ServerUserItem == false) {
        winston.info("消息发送错误, userItem不是ServerUserItem");
        //winston.info("消息发送错误, userItem不是ServerUserItem")
        return false;
    }

    messageType = messageType || "message";

    var o = {};
    o.mainCMD = mainCMD;
    o.subCMD = subCMD;
    o.data = data;

    if (userItem.isAndroid == true) {
        //机器人发送消息
        this.androidManager.sendDataToClient(userItem, mainCMD, subCMD, data);
    } else {

        //直接发o
        userItem.socket.emit(messageType, o);
    }
};

/**
 * 发送给坐下玩家此桌玩家的消息
 * @param serverUserItem
 * @returns {boolean}
 */
p.sendUserInfoPacket = function (serverUserItem) {
    var table = this.tableFrame[serverUserItem.tableID];

    if (table == null) {
        return false;
    }

    var msg = [];

    var copyAttr = function (userItem) {
        return {
            userID: userItem.userID,
            gameID: userItem.gameID,
            tableID: userItem.tableID,
            chairID: userItem.chairID,
            faceID: userItem.faceID,
            nickname: userItem.nickname,
            sex: userItem.sex,
            score: userItem.score,
            userStatus: userItem.userStatus,
            memberOrder: userItem.memberOrder,
            otherInfo: userItem.otherInfo,
        };
    };

    //自己第一个进入
    msg.push(copyAttr(serverUserItem));

    for (var i = 0; i < this.roomInfo["ChairCount"]; ++i) {
        var userItem = table.getTableUserItem(i);
        if (userItem == null || userItem == serverUserItem) continue;
        msg.push(copyAttr(userItem));
    }


    this.sendData(serverUserItem, gameCMD.MDM_GR_USER, gameCMD.SUB_GR_USER_ENTER, msg);


    return true;
};
/**
 * 发送玩家进入
 * @param enterUserItem
 * @returns {boolean}
 */
p.sendUserEnter = function (enterUserItem) {
    var table = this.tableFrame[enterUserItem.tableID];

    if (table == null || enterUserItem == null) {
        return false;
    }

    var msg = [];
    var sendUser = {
        userID: enterUserItem.userID,
        gameID: enterUserItem.gameID,
        tableID: enterUserItem.tableID,
        chairID: enterUserItem.chairID,
        faceID: enterUserItem.faceID,
        nickname: enterUserItem.nickname,
        sex: enterUserItem.sex,
        score: enterUserItem.score,
        userStatus: enterUserItem.userStatus,
        memberOrder: enterUserItem.memberOrder,
        otherInfo: enterUserItem.otherInfo,
    };
    msg.push(sendUser);

    for (var i = 0; i < this.roomInfo["ChairCount"]; ++i) {
        var userItem = table.getTableUserItem(i);
        if (userItem == null || userItem == enterUserItem) continue;

        this.sendData(userItem, gameCMD.MDM_GR_USER, gameCMD.SUB_GR_USER_ENTER, msg);
    }

    return true;
};

/**
 * 发送tip消息
 * @param userItem
 * @param message
 * @returns {boolean}
 */
p.sendToastMsg = function (userItem, message) {
    if (userItem == null) {
        return false;
    }
    var o = {};
    o.message = message;
    this.sendData(userItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_TOAST_MSG, o);
};

/**
 * 发送请求失败
 * @param userItem 用户
 * @param message 消息
 * @returns {boolean}
 * @constructor
 */
p.sendRequestFailure = function (userItem, message, type) {
    if (userItem == null) {
        return false;
    }
    var o = {};
    o.message = message;
    o.type = type;
    this.sendData(userItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_REQUEST_FAILURE, o);
};


/**
 * 记录错误日记到数据库中
 * @param type
 * @param content
 */
p.recordError = function (type, content) {
    this.sendLCData(corresCMD.RECORD_ERROR, {type: type, content: content});
};

module.exports = GameServer;