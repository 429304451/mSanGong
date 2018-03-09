var define = require('./define');
var gameConst = define.gameConst;
var gameEvent = define.gameEvent;

function ServerUserItem(socket, gameServer) {
    this.userID = null;							//用户ID
    this.gameID = null;                           //游戏ID
    this.tableID = null;		//桌子号
    this.chairID = null;		//椅子号
    this.faceID = 0;							//玩家头像ID
    this.userStatus = gameConst.US_FREE;			//玩家状态
    this.socket = socket;						//玩家socket
    this.gameServer = gameServer;					//游戏服务器
    this.score = 0;							//分数
    this.nickname = "";							//玩家昵称
    this.sex = 0;							//0：男 1：女
    this.isAndroid = 0;							//是否是机器人
    this.memberOrder = 0;                   //会员等级
    this.weight = 1.0;							//输赢权值
    this.otherInfo = null;                    //其它信息
    this.markDelete = false;                //是否标志要被删除了
}

var p = ServerUserItem.prototype;

p.setInfo = function (info) {
    this.userID = info["userID"];
    this.gameID = info["gameID"];
    this.faceID = info["faceID"];
    this.tableID = info["tableID"];
    this.chairID = info["chairID"];
    this.score = info["score"];
    this.nickname = info["nickname"];
    this.sex = info["sex"];
    this.isAndroid = info["isAndroid"];
    this.memberOrder = info["memberOrder"];
    this.otherInfo = info["otherInfo"];
    this.weight = info["weight"] == null ? 1.0 : info["weight"];
};
/**
 * 设置用户状态
 * @param userStatus 状态
 * @param tableID 桌子号
 * @param chairID 椅子号
 */
p.setUserStatus = function (userStatus, tableID, chairID) {
    var oldTableID = this.tableID;
    var oldChairID = this.chairID;
    var oldStatus = this.userStatus;
    //新的信息
    this.tableID = tableID;
    this.chairID = chairID;
    this.userStatus = userStatus;
    //提交玩家变化事件
    //this.gameserver.emit(gameEvent.EVENT_USER_STATUS, this, oldTableID, oldChairID, oldStatus);
    this.gameServer.eventUserItemStatus(this, oldTableID, oldChairID, oldStatus);
};

/**
 * 设置用户状态不通知服务器
 */
p.setUserStatusNoNotify = function (userStatus, tableID, chairID) {
    //新的信息
    this.tableID = tableID;
    this.chairID = chairID;
    this.userStatus = userStatus;
};

/**
 * 设置用户分数
 * @param newScore 新分数
 */
p.setUserScore = function (newScore) {
    this.score = newScore;
    this.gameServer.emit(gameEvent.EVENT_USER_SCORE, this);
};

p.getUserID = function () {
    return this.userID;
};

p.getNickname = function () {
    return this.nickname;
};

p.getSex = function () {
    return this.sex;
};


p.getChairID = function () {
    return this.chairID;
};

p.getTableID = function () {
    return this.tableID;
};

p.getUserScore = function () {
    return this.score;
};

p.getUserStatus = function () {
    return this.userStatus;
};

p.getMemberOrder = function () {
    return this.memberOrder;
};


p.getOtherInfo = function () {
    return this.otherInfo;
};


p.getWeight = function () {
    return this.weight;
};

p.setWeight = function (weight) {
    this.weight = weight;
};


module.exports = ServerUserItem;