/**
 * Created by orange on 2016/8/15.
 */
var GameUtil = {};

/**
 * 判断字符串长度
 * @param value 两个中文算一个长度，英文名一个
 * @returns {number}
 */
GameUtil.getByteLen = function (value) {
    if (value == null) return 0;
    var len = 0;
    for (var i = 0; i < value.length; ++i) {
        if (value[i].match(/[^x00-xff]/ig) != null) //全角
            len += 2;
        else
            len += 1;
    }
    return len;
};

/**
 * 长数值点表示
 * @param value
 * @param length
 */
GameUtil.replacePoint = function (value, length) {
    if (value == null) return 0;
    if (!length || length<5) length = 5;
    var len = 0;

    if (this.getByteLen(value) <= length) {
        return value;
    }

    for (var i = 0; i < value.length; ++i) {
        if (value[i].match(/[^x00-xff]/ig) != null) //全角
            len += 2;
        else
            len += 1;

        if (len>length-4) {
            value = value.substr(0, i+1);
            value += "...";
            return value;
        }
    }

    return value;
};

GameUtil.formateEnterScore = function (enterScore) {

    var str = "入场 ";
    
    if (enterScore == null) {
        enterScore = 0;
        str += enterScore;
    } else if (enterScore < 10000) {
        str += enterScore;
    } else {
        str += Math.floor(enterScore / 10000) + "万";
    }

    return str;
};