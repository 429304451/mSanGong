/**
 * Created by Administrator on 2015/7/10.
 */

var GameUserManager = cc.Class.extend({
	_className: "GameUserManager",
	_classPath: "src/core/GameUserManager.js",

    tableUserItem: null,
    clientKernel: null,

    ctor: function (clientKernel) {
        this.tableUserItem = [];
        this.clientKernel = clientKernel;
    },


    //删除用户
    deleteUserItem: function (clientUserItem) {
        if (clientUserItem == null || clientUserItem.getChairID() >= this.tableUserItem.length) {
            return false;
        }


        var chairID = clientUserItem.getChairID();
        if (this.tableUserItem[chairID] != clientUserItem) {
            return false;
        }
        this.tableUserItem[chairID] = null;
        this.clientKernel.onUserItemDelete(clientUserItem);


        return true;
    },
    //创建玩家
    createNewUserItem: function (userInfo) {


        var userItem = new ClientUserItem(userInfo);


        this.tableUserItem[userInfo.chairID] = userItem;


        this.clientKernel.onUserItemActive(userItem);
        return userItem;
    },
    /*
     *信息更新
     */

    //更新分数
    updateUserItemScore: function (clientUserItem, userScore) {
        clientUserItem.score = userScore;
        this.clientKernel.onUserItemUpdateScore(clientUserItem, userScore);
    },
    //更新状态
    updateUserItemStatus: function (clientUserItem, statusInfo) {
        clientUserItem.tableID = statusInfo.tableID;
        clientUserItem.chairID = statusInfo.chairID;
        clientUserItem.userStatus = statusInfo.userStatus;
        this.clientKernel.onUserItemUpdateStatus(clientUserItem, statusInfo);
    },

    /*
     *查找操作
     */

    //通过游戏ID查找用户
    getUserByUserID: function (userID) {
        //桌子用户
        for (var i = 0; i < this.tableUserItem.length; ++i) {
            var userItem = this.tableUserItem[i];
            if ((userItem != null) && (userItem.getUserID() == userID)) {
                return userItem;
            }
        }

        return null;
    },
    //桌子玩家
    getTableUserItem: function (chairID) {
        return this.tableUserItem[chairID];
    },
    //通过昵称查找玩家
    getUserByGameID: function (gameID) {
        //玩家用户
        for (var i = 0; i < this.tableUserItem.length; ++i) {
            var userItem = this.tableUserItem[i];
            if ((userItem != null) && (userItem.getGameID() == gameID)) {
                return userItem;
            }
        }

        return null;
    }
});