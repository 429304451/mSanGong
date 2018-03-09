/**
 * Created by Apple on 2016/12/28.
 */


var crypto = require('crypto');
var winston = require('winston');
var ttutil = {};


ttutil.md5 = function (text) {
    return crypto.createHash('md5').update(text, "utf-8").digest('hex');
};

ttutil.hmac = function (key, text) {
    return crypto.createHmac('md5', key).update(text, "utf-8").digest('hex');
};


ttutil.arrayRemove = function (array, element) {
    for (var i = 0, len = array.length; i < len; ++i) {
        if (array[i] == element) {
            array.splice(i, 1);
            return true;
        }
    }
    return false;
};


/**
 * 检查数据包是否合法
 * @param last981MsgID
 * @param data
 * @returns {boolean}
 */
ttutil.check981Data = function (last981MsgID, data) {
    if (!data || typeof data != "object" || typeof data._981_msgID != 'number') {
        winston.error("数据包类型错误", data);
        return false;
    }

    ///////////////////////////////////////////////
    //已经处理过的msgID
    if (last981MsgID >= data._981_msgID) {
        winston.error("数据包msgID错误", data);
        return false;
    }
    ////////////////////////////////////////
    //验证签名

    var _981_sign = data._981_sign;
    delete data._981_sign;

    //验证签名失败
    if (_981_sign != ttutil.hmac("%R&gE$%27fG^&Rf^(#*&FDF", JSON.stringify(data))) {
        winston.error("数据包签名错误", data);
        return false;
    }

    return true;
};

module.exports = ttutil;