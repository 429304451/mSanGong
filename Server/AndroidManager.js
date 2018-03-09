/**
 * Created by Administrator on 2015/7/26.
 */
// 机器人列表管理
var AndroidItem = require('./AndroidItem');
var gameEvent = require('./define').gameEvent;
var ttutil = require("./ttutil");  // 验证数据签名

function AndroidManager(gameServer) {
    this.androidItemArray = [];
    this.gameServer = gameServer;
}

var p = AndroidManager.prototype;

p.createAndroidItem = function (userItem) {
    var androidItem = new AndroidItem(userItem, this);
    this.androidItemArray.push(androidItem);
};

p.deleteAndroidUserItem = function (userItem) {
    var androidItem = this.searchAndroidByUserItem(userItem);
    if (androidItem != null) androidItem.clearAllTimer();

    ttutil.arrayRemove(this.androidItemArray, androidItem);
};

p.clearAll = function () {
    for (var i = 0; i < this.androidItemArray.length; ++i) {
        this.androidItemArray[i].clearAllTimer();
    }
    this.androidItemArray.length = 0;
};

p.broadToClient = function (mainCMD, subCMD, data) {
    process.nextTick(() => {
        //防止要发送消息时， 因为nextTick的原因， 导致实际操作时， userItem已经离开了
        for (var i = 0; i < this.androidItemArray.length; ++i) {
            var androidItem = this.androidItemArray[i];
            if (!androidItem.serverUserItem.markDelete) {
                androidItem.emit(gameEvent.EVENT_ANDROID, mainCMD, subCMD, data);
            }
        }
    });
};
/**
 * @param userItem is a ServerUserItem
 * @param mainCMD
 * @param subCMD
 * @param data
 */
p.sendDataToClient = function (userItem, mainCMD, subCMD, data) {
    var android = this.searchAndroidByUserItem(userItem);
    if (android == null) {
        return false
    } else {
        process.nextTick(() => {
            //防止要发送消息时， 因为nextTick的原因， 导致实际操作时， userItem已经离开了

            if (!userItem.markDelete) {
                android.emit(gameEvent.EVENT_ANDROID, mainCMD, subCMD, data);
            }
        });
        return true;
    }
};
/**
 *  发送数据到服务端
 * @param userItem
 * @param mainCMD
 * @param subCMD
 * @param data
 */
p.sendDataToServer = function (userItem, mainCMD, subCMD, data) {
    var msg = {};
    msg.mainCMD = mainCMD;
    msg.subCMD = subCMD;
    msg.data = data;
    process.nextTick(() => {
        //防止要发送消息时， 因为nextTick的原因， 导致实际操作时， userItem已经离开了
        if (!userItem.markDelete) {
            this.gameServer.emit(gameEvent.EVENT_ANDROID, msg, null, userItem);
        }

    });
};

/**
 * it search the android by serveritem
 * @param userItem
 */
p.searchAndroidByUserItem = function (userItem) {
    for (var i = 0; i < this.androidItemArray.length; ++i) {
        if (this.androidItemArray[i].getMeUserItem() == userItem) {
            return this.androidItemArray[i];
        }
    }
    return null;
};

p.searchAndroidByUserID = function (userID) {
    for (var i = 0; i < this.androidItemArray.length; ++i) {
        if (this.androidItemArray[i].getUserID() == userID) {
            return this.androidItemArray[i];
        }
    }
    return null;
};

module.exports = AndroidManager;














