//桌子框架类
var TableFrameSink = require('./TableFrameSink');
var ServerUserItem = require('./ServerUserItem');
var gameConst = require('./define').gameConst;
var gameCMD = require('./define').gameCMD;
var corresCMD = require("./define").corresCMD;
var winston = require('winston');
var gameconfig = require('./gameconfig');
var util = require('util');
/**
 * 桌子类
 * @param id 桌子ID
 * @param roomInfo    房间信息
 * @param gameServer 游戏服务器
 * @constructor
 */
function TableFrame(id, roomInfo, gameServer) {
    //游戏状态
    this.tableID = id; 											        //桌子号
    this.tableUserArray = []; 									        //玩家数组
    this.gameStatus = gameConst.GAME_STATUS_FREE; 					    //游戏状态
    this.gamePlayerCount = roomInfo["ChairCount"]; 						//游戏玩家
    this.gameStart = false;
    this.gameMode = roomInfo["GameMode"];
    this.REVENUE_DENOMINATOR = 1000;
    this.roomInfo = roomInfo;
    this.gameServer = gameServer;
    this.tableFrameSink = new TableFrameSink(this, this.roomInfo);		//桌子逻辑操作
    this.startTime = 0;											            //开始时间
}


var p = TableFrame.prototype;

/**
 * 获取房间信息
 * @returns {*}
 */
p.getRoomInfo = function () {
    return this.roomInfo;
};
/**
 * 开始游戏
 */
p.startGame = function () {
    //游戏没有开始且不是百人游戏的时候设置玩家状态
    if (!this.gameStart && this.gameMode != gameConst.START_MODE_HUNDRED) {
        for (var i = 0; i < this.roomInfo["ChairCount"]; ++i) {
            var userItem = this.getTableUserItem(i);
            if (userItem != null) {
                var userStatus = userItem.getUserStatus();
                if (userStatus != gameConst.US_PLAYING) {
                    userItem.setUserStatus(gameConst.US_PLAYING, this.tableID, i);
                }
            }
        }
    }

    //记录时间
    this.recordStartGameTime();

    this.gameStart = true;
    this.tableFrameSink.onEventStartGame();
};
/**
 * 结束游戏
 * @param gameStatus 为游戏状态
 */
p.concludeGame = function (gameStatus) {
    this.gameStart = false;
    this.gameStatus = gameStatus;

    for (var i = 0; i < this.roomInfo["ChairCount"]; ++i) {
        var userItem = this.tableUserArray[i];
        if (!userItem) {
            continue;
        }
        userItem.setUserStatus(gameConst.US_SIT, this.tableID, i);
    }

    this.tableFrameSink.repositionSink();
    this.sendTableStatus();
};
/**
 * 发送桌子状态
 */
p.sendTableStatus = function () {
    this.broadCastTableData(gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_GAME_STATUS, null, {gameStatus: this.gameStatus});
};
/**
 * 解散游戏
 */
p.dismissGame = function () {

};


/**
 * 坐下操作
 * @param chairID 椅子号
 * @param userItem 用户
 * @returns {boolean}
 */
p.performSitDownAction = function (chairID, userItem) {
    if (userItem instanceof ServerUserItem == false) {
        winston.error("performSitDownAction: userItem not instanceof ServerUserItem");
        return false;
    }

    if (chairID >= this.gamePlayerCount) {
        winston.error("performSitDownAction: chairID >= this.gamePlayerCount");
        return false;
    }

    if (userItem.tableID == null) return;
    if (userItem.chairID == null) return;

    var tableUserItem = this.getTableUserItem(chairID);

    if (tableUserItem != null) {
        winston.info("椅子已经被捷足先登");
        winston.info("椅子上的ID: " + tableUserItem.getUserID() + " 昵称: " + tableUserItem.getNickname() + " 是否为机器人: " + tableUserItem.isAndroid);
        this.gameServer.sendRequestFailure(userItem, "椅子已经被捷足先登");
        return false;
    }
    //坐下条件判断

    winston.info("performSitDownAction, 用户ID: " + userItem.getUserID());

    //坐下
    this.tableUserArray[chairID] = userItem;

    userItem.setUserStatus(gameConst.US_SIT, this.tableID, chairID);

    this.tableFrameSink.onActionUserSitDown(chairID, userItem);

    return true;
};
/**
 * 起立
 * @param userItem
 * @returns {boolean}
 */
p.performStandUpAction = function (userItem) {

    winston.info("performStandUpAction, 用户ID: " + userItem.getUserID());
    if (userItem.tableID != this.tableID) return true;
    if (userItem.chairID == null || userItem.chairID >= this.gamePlayerCount) return true;

    var tableUserItem = this.getTableUserItem(userItem.chairID);

    if (tableUserItem == userItem) {
        if (this.gameStart && (userItem.userStatus == gameConst.US_PLAYING )) {
            //结束游戏
            //这边结束游戏， 可能会触发结算， 比如对战游戏类的， 最后两人， 一人起立了， 另一个就结算了。结算里可能又会因数分数不够， 触发踢人，
            this.tableFrameSink.onEventConcludeGame(userItem.chairID, userItem, gameConst.GER_USER_LEAVE);


            if (this.tableUserArray[userItem.chairID] != userItem) {
                winston.error("此时应该相等 this.tableUserArray[userItem.chairID] != userItem");
                this.gameServer.recordError("起立bug", "此时应该相等 userID:" + userItem.userID);
                return true;
            }
        }


        this.tableFrameSink.onActionUserStandUp(userItem.chairID, userItem);
        this.tableUserArray[userItem.chairID] = null;

        userItem.setUserStatus(gameConst.US_NULL, null, null);


        //此时要nextTick, 因为踢完人后， 才会广播用户离开消息， 如果此时先发了游戏开始， 可能会导致客户端难处理
        process.nextTick(() => {
            if (this.efficacyStartGame()) {
                this.startGame();
            }
        });


        return true;
    }


};

p.performStandUpActionNotNotifyPlaza = function (userItem) {
    if (userItem instanceof ServerUserItem == false) {
        winston.error("userItem not instanceof ServerUserItem");
        return true;
    }
    winston.info("performStandUpActionNotNotifyPlaza, 用户ID: " + userItem.getUserID());
    if (userItem.tableID != this.tableID) return true;
    if (userItem.chairID >= this.gamePlayerCount) return true;

    var tableUserItem = this.getTableUserItem(userItem.chairID);

    if (this.gameStart && userItem.userStatus == gameConst.US_PLAYING) {
        //结束游戏

        this.tableFrameSink.onEventConcludeGame(userItem.chairID, userItem, gameConst.GER_USER_LEAVE);

        //离开
        if (this.tableUserArray[userItem.chairID] != userItem)
            return true;
    }

    //玩家起立(非旁观玩家)
    if (tableUserItem == userItem) {
        this.tableFrameSink.onActionUserStandUp(userItem.chairID, userItem);
        this.tableUserArray[userItem.chairID] = null;

        if (this.efficacyStartGame()) {
            this.startGame();
        }
    }

    return true;
};


/**
 * 用户数量
 */
p.getSitUserCount = function () {
    var userCount = 0;
    for (var i = 0; i < this.gamePlayerCount; ++i) {
        if (this.getTableUserItem(i)) {
            userCount++;
        }
    }

    return userCount;
};

/**
 * 获取位置玩家
 * @param chairID 椅子ID
 * @returns {*}
 */
p.getTableUserItem = function (chairID) {
    if (chairID >= this.gamePlayerCount) return null;
    return this.tableUserArray[chairID];
};


/**
 * 设置游戏状态
 * @param gameStatus
 */
p.setGameStatus = function (gameStatus) {
    this.gameStatus = gameStatus;
};
/**
 * 获取游戏状态
 * @returns {number|*}
 */
p.getGameStatus = function () {
    return this.gameStatus;
};
/**
 * 获得空闲位置
 * @returns
 */
p.getFreeChairID = function () {
    for (var i = 0; i < this.gamePlayerCount; ++i) {
        if (this.tableUserArray[i] == null)
            return i;
    }

    return null;
};
/**
 * 获取随机位置
 * @returns
 */
p.getRandChairID = function () {
    var index = Math.floor(Math.random() * 10);
    for (var i = index; i < this.gamePlayerCount + index; ++i) {
        if (this.tableUserArray[i % this.gamePlayerCount] == null)
            return i % this.gamePlayerCount;
    }

    return null;
};

/**
 * 游戏事件主函数
 * @param subCMD 游戏消息命令
 * @param data 游戏数据
 * @param userItem 消息用户
 * @returns {boolean}
 */
p.onEventSocketGame = function (subCMD, data, userItem) {
    if (userItem == null) return false;
    if (this.tableFrameSink == null) return false;

    return this.tableFrameSink.onGameMessageEvent(subCMD, data, userItem);
};

/**
 * 框架消息主函数
 * @param subCMD 游戏消息命令
 * @param data 数据
 * @param userItem 消息用户
 * @returns {boolean}
 */
p.onEventSocketFrame = function (subCMD, data, userItem) {
    switch (subCMD) {
        case gameCMD.SUB_GF_GAME_OPTION:
            var chairID = userItem.getChairID();

            //发送房间信息
            this.gameServer.sendData(userItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_ROOM_INFO, {
                gameName: this.roomInfo.GameName,
                roomName: this.roomInfo.RoomName,
                tableID: this.tableID
            });
            //发送桌子状态
            this.gameServer.sendData(userItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_GAME_STATUS, {gameStatus: this.gameStatus});

            //场景消息
            this.tableFrameSink.onEventSendGameScene(chairID, userItem, this.gameStatus);
            return true;

        case gameCMD.SUB_GF_USER_READY:
            var chairID = userItem.getChairID();

            if (this.getTableUserItem(chairID) != userItem) {
                return false;
            }

            if (userItem.getUserStatus() != gameConst.US_SIT)
                return true;
            //钩子事件 tableFrameSink的 onActionUserOnReady需要时在补充
            if (!this.efficacyStartGame()) {
                userItem.setUserStatus(gameConst.US_READY, this.tableID, chairID);
            } else {
                this.startGame();
            }

            return true;


    }

    return false;
};


/**
 * 游戏开始判断
 * @returns {boolean}
 */
p.efficacyStartGame = function () {
    //游戏开始或者是百人游戏时，不检测
    if (this.gameStart || this.gameMode == gameConst.START_MODE_HUNDRED) return false;

    var userCount = 0;

    for (var i = 0; i < this.roomInfo["ChairCount"]; ++i) {
        var userItem = this.tableUserArray[i];
        if (userItem == null) continue;

        if (userItem.userStatus != gameConst.US_READY)
            return false;
        userCount++;
    }

    switch (parseInt(this.gameMode)) {
        //桌子上玩家准备好就开始 不要求满桌  如牛牛
        case gameConst.START_MODE_ALL_READY:
            return userCount >= 2;
        //满桌准备好开始游戏 如 斗地主 麻将之类
        case gameConst.START_MODE_FULL_READY:
            return userCount == this.roomInfo["ChairCount"];

        //百人游戏让游戏自己去实现
        case gameConst.START_MODE_HUNDRED:
        default:
            return false;
    }

    return false;
};

/**
 * 记录游戏开始时间
 */
p.recordStartGameTime = function () {
    var date = new Date();
    this.startTime = date.getTime();
};

/**
 * 获取游戏时长
 * @return number 秒数
 */
p.getGameTime = function () {
    var date = new Date();
    var passTime = Math.floor((date.getTime() - this.startTime) / 1000);
    return passTime;
};

/**
 * 广播本桌
 * @param mainCMD
 * @param subCMD
 * @param chairID
 * @param data
 */
p.broadCastTableData = function (mainCMD, subCMD, chairID, data) {
    this.sendTableData(mainCMD, subCMD, chairID, data);
};

/**
 * 发送游戏消息
 * @param mainCMD 主命令
 * @param subCMD 子命令
 * @param chairID 椅子号
 * @param data 数据
 * @returns {boolean}
 */
p.sendTableData = function (mainCMD, subCMD, chairID, data) {
    //构造对象
    if (chairID == null) {
        for (var i = 0; i < this.roomInfo["ChairCount"]; ++i) {
            var userItem = this.getTableUserItem(i);
            if (userItem == null) continue;
            this.gameServer.sendData(userItem, mainCMD, subCMD, data);
        }
        return true;
    } else {
        var userItem = this.getTableUserItem(chairID);
        if (userItem == null) return true;
        this.gameServer.sendData(userItem, mainCMD, subCMD, data);
        return true;
    }
};


/**
 * 游戏场景消息
 * @param userItem 用户
 * @param msg 发送消息
 * @returns {boolean}
 */
p.sendGameScene = function (userItem, msg) {
    if (userItem == null) return false;
    this.gameServer.sendData(userItem, gameCMD.MDM_GF_FRAME, gameCMD.SUB_GF_GAME_SCENE, msg);
    return true;
};


/**
 * 写分操作
 * @param scoreInfoArray 为一个Array, array里面为对象，具体参考writeUserScore
 * @returns {boolean}
 */
p.writeTableScore = function (scoreInfoArray) {

    for (var i in scoreInfoArray) {
        this.writeUserScore(scoreInfoArray[i]);
    }

    return true;
};
/**
 * 个人写分操作
 * @param scoreInfo
 *        具体对象为
 *        {
 * 			Chair:x,
 * 			Score:x, 	//为游戏分数减去税收的值
 * 			Tax:x，
 * 		}
 * @returns {boolean}
 */
p.writeUserScore = function (scoreInfo) {
    if (scoreInfo.Chair >= this.roomInfo["ChairCount"]) {
        winston.error("大BUG   writeUserScore scoreInfo.Chair >= this.roomInfo['ChairCount']", scoreInfo);
        this.gameServer.recordError("写分BUG", "writeUserScore scoreInfo.Chair >= this.roomInfo['ChairCount'] scoreInfo:" + JSON.stringify(scoreInfo));
        return false;
    }

    var userItem = this.getTableUserItem(scoreInfo.Chair);
    if (userItem == null) {
        winston.error("大BUG   writeUserScore userItem==null", scoreInfo);
        this.gameServer.recordError("写分BUG", "writeUserScore userItem==null scoreInfo" + JSON.stringify(scoreInfo));
        return false;
    }

    var o = {};
    o.userID = userItem.getUserID();
    o.score = scoreInfo.Score;
    o.tax = scoreInfo.Tax;
    o.tableID = this.tableID;
    o.chairID = userItem.getChairID();

    userItem.setUserScore(userItem.getUserScore() + o.score);

    if (userItem.score < 0) {
        winston.error("大BUG   writeUserScore 用户分数为负", userItem.userID, userItem.score, scoreInfo);
        this.gameServer.recordError("写分BUG", util.format('userID:%d, score:%d, scoreInfo:%j', userItem.userID, userItem.score, scoreInfo));
    }

    //不是体验房才写分
    if (!gameconfig["FreeMode"]) {
        this.gameServer.sendLCData(corresCMD.WRITE_SCORE, o);
    }


};

/**
 * 检查分数不够退出, 一般正常游戏结束后调用，在this.concludeGame(status)后调用，参数为写分的结构体
 *  * @param scoreInfo
 *        具体对象为
 *        {
 * 			Chair:x,
 * 			Score:x, 	//为游戏分数减去税收的值
 * 			Tax:x
 * 		}
 */
p.checkUserScore = function (chairID) {
    var userItem = this.getTableUserItem(chairID);
    if (userItem == null)  return false;

    var score = userItem.getUserScore();
    if (score < this.roomInfo.MinSitScore) {
        //发送数据
        this.gameServer.sendRequestFailure(userItem, "您的分数不够继续游戏，请关闭游戏窗口", gameConst.KICK_TYPE);
        this.gameServer.deleteUserItem(null, userItem, true);
    }
};

/**
 * 检查个人分数不够退出  一般正常游戏结束后调用，，在this.concludeGame(status)后调用，参数为写分的结构体
 * @param scoreInfoArray 为一个Array, array里面为对象，具体参考writeUserScore
 */
p.checkTableUsersScore = function () {
    for (var i = 0; i < this.gamePlayerCount; ++i) {
        this.checkUserScore(i);
    }

    return true;
};

/**
 * 计算税收
 * @param chair 用户椅子
 * @param score 用户分数
 * @returns {number} 返回税收
 */
p.calculateRevenue = function (chair, score) {
    if (chair >= this.roomInfo["ChairCount"]) return 0;

    if (this.roomInfo["Revenue"] > 0 && score > 0) {
        var userItem = this.getTableUserItem(chair);
        if (userItem == null) return 0;
        var revenue = score * this.roomInfo["Revenue"] / this.REVENUE_DENOMINATOR;
        return Math.floor(revenue);
    }
    return 0;
};


/**
 * 发送用户数据 本桌一个指定的userItem
 * @param mainCMD
 * @param subCMD
 * @param userItem
 * @param data
 */
p.sendTableUserItemData = function (userItem, subCMD, data) {
    if (!userItem) return false;
    if (this.tableID != userItem.getTableID()) return false;

    this.gameServer.sendData(userItem, gameCMD.MDM_GF_GAME, subCMD, data);
    return true;
};

/**
 * 踢出用户
 * @param chairID 椅子号
 * @param msg{string} 踢出原因
 * @param type
 */
p.kickOutUserItem = function (chairID, msg, type) {
    var userItem = this.getTableUserItem(chairID);
    if (userItem == null) return;
    //发送数据
    this.gameServer.sendRequestFailure(userItem, msg, type);
    this.gameServer.deleteUserItem(null, userItem, true);
};

module.exports = TableFrame;
