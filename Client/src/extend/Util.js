/**
 * Created by 黄二杰 on 2015/7/28.
 */

Math.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
};

//工具类
var ttutil = {};

ttutil.uint8ArrayToString = function (buf) {
    return String.fromCharCode.apply(null, buf);
};

ttutil.stringToUint8Array = function (str) {
    var buf = new ArrayBuffer(str.length);
    var uint8Array = new Uint8Array(buf);
    for (var i=0; i < str.length; i++) {
        uint8Array[i] = str.charCodeAt(i);
    }

    return uint8Array;
};

ttutil.toHexString = function (data) {
    var hexString = "";

    for(var i = 0; i < data.length; i++)
    {
        var hex = ("00" + data[i].toString(16)).substr(-2).toUpperCase();
        hexString += hex;
    }

    return hexString;
};

ttutil.generateUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

ttutil.encodeURI = function (obj) {
    return Object.keys(obj).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    }).join('&');
};

ttutil.getQRCodeUrl = function (url) {


    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + domain + ":10903/" + url;
    }

    if (cc.game.config.debugMode == 0) {
        if (cc.sys.os == cc.sys.OS_IOS)
            url = "https://" + frontDomain + ":7999/qrcode?url=" + url;
        else
            url = "http://" + frontDomain + ":7998/qrcode?url=" + url;
    }
    else {
        if (cc.sys.os == cc.sys.OS_IOS)
            url = "https://" + domain + ":10903/qrcode?url=" + url;
        else
            url = "http://" + domain + ":10902/qrcode?url=" + url;
    }

    return url;
};

//判断一个点， 是在线的左边， 还是右边
// 负数左边， 0， 刚好线上， 正数右边
//x1, y1, x2, y2, 表示线
//x, y表示点
ttutil.calcInLineSide = function (x1, y1, x2, y2, x, y) {
    var value = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
    return value
};

//dump
ttutil.dump = function (obj, deep, hash) {

    //发布模式就不要打印了
    if (typeof PUBLIC_MODE != "undefined") {
        if (PUBLIC_MODE == 2) {
            return;
        }
    }

    if (cc.sys.isNative) {
        var str = JSON.stringify(obj);

        console.log(str);
        return;
    }
    //var str = JSON.stringify(obj);
    //
    //console.log(str);
    //return ;


    var tab20 = "";
    for (var i = 0; i < 100; ++i) {
        tab20 += "\t";
    }
    deep = deep || 1;
    if (deep == 1) {
        console.log("----------------dump--------------------" + tab20);
    }
    var tab = "";
    for (var i = 0; i < deep - 1; ++i) {
        tab += "\t";
    }
    if (typeof(obj) == "object") {

        hash = hash || [];

        for (var index in hash) {
            if (hash[index] == obj) {
                console.log(tab + "\t" + "hash printed," + tab20);
                return;
            }
        }

        hash.push(obj);

        console.log(tab + "{" + tab20);
        for (var att in obj) {

            var val = obj[att];

            if (typeof(val) == "object") {
                console.log(tab + "\t" + att + ":" + tab20);
                this.dump(val, deep + 1, hash);
            }
            else {
                console.log(tab + "\t" + att + ":" + obj[att] + "," + tab20);
            }
        }
        console.log(tab + "}" + tab20);
    }
    else if (obj != null) {
        console.log(tab + "\t" + obj + tab20);
    }
    else {
        console.log(tab + "\t" + "null" + tab20);
    }
    if (deep == 1) {
        console.log("----------------dump--------------------" + tab20);
    }
};

/**
 * 创建一个果冻动画
 *
 */
ttutil.buildJellyAction = function () {
    return cc.repeat(cc.sequence(cc.scaleTo(0.2, 1.2, 0.8), cc.scaleTo(0.1, 1)), 2);
};

//判断一个点是否在封闭的凸多边形里
//参数起点到终点， 最后两个点是等待检测的点
ttutil.isRectContainPoint = function (points, x, y) {

    var args = this.clone(points);
    args.length += 1;
    var len = args.length;
    args[len - 1] = args[0];
    var count1 = 0, count2 = 0;
    for (var i = 0; i < len - 1; ++i) {
        var value = this.calcInLineSide(args[i].x, args[i].y, args[i + 1].x, args[i + 1].y, x, y);
        if (value > 0)
            count1++;
        else
            count2++;
    }
    var inside = false;
    if (0 == count1 || 0 == count2) {
        inside = true;
    }
    return inside;

};

/**
 * 得到一labelAltas
 * @param str
 * @param image
 * @returns {*}
 */
ttutil.newLabelAltas = function (str, image) {

    var sprite = new cc.Sprite(image);
    var contentSize = sprite.getContentSize();
    var labelAtlas = new cc.LabelAtlas(str, image, contentSize.width / str.length, contentSize.height, str[0]);

    return labelAtlas;
};

ttutil.newEaseBezierAction = function (action) {
    //var action = new cc.EaseBezierAction(action);
    action.easing(cc.easeSineInOut());
    //action.setBezierParamer(0.5, 0.5, 1, 1);
    return action;
};

/**
 * 得到数字的长度， 负数会算上负号, 小数会算上小数点
 * @param num
 */
ttutil.getNumLength = function (num) {
    return String(num).length;
};

/**
 * 返回一个rect大小的 layer
 * @param rect
 * @returns {*}
 */
ttutil.buildRect = function (rect) {

    rect = rect || cc.rect(0, 0, V.w, V.h);
    var layer = new cc.LayerColor(cc.color(0xff, 0xff, 0x00, 0x88)).p(rect.x, rect.y);
    layer.setContentSize(rect.width, rect.height);
    return layer;
};


/**
 * 获取两点间距离
 * @param p1
 * @param p2
 * @returns {number}
 */
ttutil.getDistance = function (p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * 获取角度
 * @param p1
 * @param p2
 * @returns {number}
 */
ttutil.getAngle = function (p1, p2) {
    return this.radiansToDegrees(Math.atan2((p2.x - p1.x), (p2.y - p1.y)));
};

/**
 * 弧度转角度
 * @param radians
 * @returns {number}
 */
ttutil.radiansToDegrees = function (radians) {
    return 180 / Math.PI * radians;
};

/**
 * 角度转弧度
 * @param degrees
 * @returns {number}
 * @constructor
 */
ttutil.DegreesToRadians = function (degrees) {
    return Math.PI / 180 * degrees;
};


/**
 * 创建一动画动作
 * @param prefix  前缀
 * @param num 数量
 * @param interval 播放间隔时间 默认 1/12;
 * @param extension 后缀 默认 .png
 * @param occupying 占位， 表示需要几位， 如果是零则不处理， 1表示帧标号只有一位， 2表示两位  fish8_07.png 比如像这样的， 前缀一般填 fish8， 1到9就需要补一个0， 10以上就不需要补零
 * @param start 起始位置，默认从1开始。。
 * @returns {cc.Animate}
 */
ttutil.buildAnimate = function (prefix, num, interval, extension, occupying, start = 1) {

    interval = interval || 1 / 12;
    extension = extension || ".png";
    occupying = occupying || 0;
    var animation = new cc.Animation();

    var getSpriteFrame = null;
    if (prefix[0] == '#') {
        prefix = prefix.substring(1);
        getSpriteFrame = function (frameName) {
            //console.log("frameName" + "\t" + frameName);
            return cc.spriteFrameCache.getSpriteFrame(frameName);
        }
    }
    else {
        getSpriteFrame = function (frameName) {
            return new cc.SpriteFrame(frameName);
        }
    }


    var numLength = String(num).length;

    for (var i = 0; i < num; ++i) {
        var index = i + start;

        if (occupying != 0) {
            var zeorNum = occupying - String(index).length;
            for (var j = 0; j < zeorNum; ++j) {
                index = "0" + index;
            }
        }

        var frameName = prefix + index + extension;
        var spriteFrame = getSpriteFrame(frameName);
        animation.addSpriteFrame(spriteFrame);
    }

    animation.setDelayPerUnit(interval);           //设置两个帧播放时间
    return cc.animate(animation);
};

/**
 * 判断 点是否在矩形内
 * @param rect {{lt: (*|cc.Point), rt: (*|cc.Point), lb: (*|cc.Point), rb: (*|cc.Point)}}
 * @param point cc.Point
 * @returns {boolean}
 */
ttutil.isPointInRect = function (rect, point) {

    return ttutil.calcInLineSide(rect.lt.x, rect.lt.y, rect.rt.x, rect.rt.y, point.x, point.y)
        *
        ttutil.calcInLineSide(rect.lb.x, rect.lb.y, rect.rb.x, rect.rb.y, point.x, point.y) <= 0
        &&
        ttutil.calcInLineSide(rect.lt.x, rect.lt.y, rect.lb.x, rect.lb.y, point.x, point.y)
        *
        ttutil.calcInLineSide(rect.rt.x, rect.rt.y, rect.rb.x, rect.rb.y, point.x, point.y) <= 0;

};

/**
 * 判断两条线段是否相交
 * @param l1p1 线段1点1
 * @param l1p2 线段1点2
 * @param l2p1 线段2点1
 * @param l2p2 线段2点2
 * @returns {boolean}
 */
ttutil.lineCollisionDetection = function (l1p1, l1p2, l2p1, l2p2) {

    return ttutil.calcInLineSide(l1p1.x, l1p1.y, l1p2.x, l1p2.y, l2p1.x, l2p1.y)
        *
        ttutil.calcInLineSide(l1p1.x, l1p1.y, l1p2.x, l1p2.y, l2p2.x, l2p2.y) <= 0
        &&
        ttutil.calcInLineSide(l2p1.x, l2p1.y, l2p2.x, l2p2.y, l1p1.x, l1p1.y)
        *
        ttutil.calcInLineSide(l2p1.x, l2p1.y, l2p2.x, l2p2.y, l1p2.x, l1p2.y) <= 0;


};

/**
 * 判断两个矩形是否碰撞
 * @param rect1 {{lt: (*|cc.Point), rt: (*|cc.Point), lb: (*|cc.Point), rb: (*|cc.Point)}}
 * @param rect2 {{lt: (*|cc.Point), rt: (*|cc.Point), lb: (*|cc.Point), rb: (*|cc.Point)}}
 * @returns {boolean}
 */
ttutil.rectCollisionDetection = function (rect1, rect2) {

    var ps1 = [rect1.lt, rect1.rt, rect1.rb, rect1.lb, rect1.lt];
    var ps2 = [rect2.lt, rect2.rt, rect2.rb, rect2.lb, rect2.lt];

    //判断是否有一矩形顶点在另一矩形内, 判断一个顶点就好， 主要是防止一个矩形完全在另一个矩形内， 其它相交方式由下面的判断解决（判断矩形边是否跟另一矩形边有相交）


    if (ttutil.isPointInRect(rect1, ps2[0]) || ttutil.isPointInRect(rect2, ps1[0])) {
        return true;
    }

    //for (var i = 0; i < 4; ++i) {
    //    if (ttutil.isPointInRect(rect1, ps2[i])) {
    //        return true;
    //    }
    //}
    //for (var i = 0; i < 4; ++i) {
    //    if (ttutil.isPointInRect(rect2, ps1[i])) {
    //        return true;
    //    }
    //}
    //判断矩形边是否跟另一矩形边有相交

    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (ttutil.lineCollisionDetection(ps1[i], ps1[i + 1], ps2[j], ps2[j + 1])) {
                return true;
            }
        }
    }

    return false;
};

/**
 * 得到结点的矩形， 支持旋转后的
 * @param node
 * @param percent  百分比， 比如需要缩小些， 就填0.8， 就缩小到原来的0.8， 暂时按中心点缩小（后面改成按锚点）， 各连长为原来的0.8
 * @returns {{lt: (*|cc.Point), rt: (*|cc.Point), lb: (*|cc.Point), rb: (*|cc.Point)}}
 */
ttutil.getRect = function (node, pOrCpp, size) {
    var lt, rt, lb, rb;

    var xScale, yScale;
    if (pOrCpp == null) {
        xScale = yScale = 1;
    } else if (pOrCpp.x == null) {
        xScale = yScale = pOrCpp;
    } else {
        xScale = pOrCpp.x;
        yScale = pOrCpp.y;
    }

    var facX = (1 - xScale) / 2;
    var facY = (1 - yScale) / 2;

    size = size || node.size();
    lt = node.convertToWorldSpace(cc.p(size.width * facX, size.height * (1 - facY)));
    rt = node.convertToWorldSpace(cc.p(size.width * (1 - facX), size.height * (1 - facY)));
    lb = node.convertToWorldSpace(cc.p(size.width * facX, size.height * facY));
    rb = node.convertToWorldSpace(cc.p(size.width * (1 - facX), size.height * facY));

    return {lt: lt, rt: rt, lb: lb, rb: rb};
};

/**
 * 得到结点的矩形， 支持旋转后的, 该方法相对 ttutil.getRect， 不能处理node的位置不是世界坐标
 * @param node
 * @param percent  百分比， 比如需要缩小些， 就填0.8， 就缩小到原来的0.8， 暂时按中心点缩小（后面改成按锚点）， 各连长为原来的0.8
 * @returns {{lt: (*|cc.Point), rt: (*|cc.Point), lb: (*|cc.Point), rb: (*|cc.Point)}}
 */
ttutil.getRectFast = function (node, percent) {
    var lt = {}, rt = {}, lb = {}, rb = {};

    var size = node.size();

    size.width = size.width * percent / 2;
    size.height = size.height * percent / 2;
    var angle = node.getRotation();
    var pos = node.getPosition();
    var sint = Math.sin(angle);
    var cost = Math.cos(angle);
    var hotX1 = -size.width;
    var hotY1 = -size.height;
    var hotX2 = size.width;
    var hotY2 = size.height;

    lt.x = hotX1 * cost - hotY1 * sint + pos.x;
    lt.y = hotX1 * sint - hotY1 * cost + pos.y;
    rt.x = hotX2 * cost - hotY1 * sint + pos.x;
    rt.y = hotX2 * sint - hotY1 * cost + pos.y;
    rb.x = hotX2 * cost - hotY2 * sint + pos.x;
    rb.y = hotX2 * sint - hotY2 * cost + pos.y;
    lb.x = hotX1 * cost - hotY2 * sint + pos.x;
    lb.y = hotX1 * sint - hotY2 * cost + pos.y;

    return {lt: lt, rt: rt, lb: lb, rb: rb};
};

/**
 * 通过帧名称数组创建一动画动作
 * @param framePathArray  帧名称数组
 * @param interval 播放间隔时间 默认 1/12;
 * @param extension 后缀 默认 .png
 * @returns {cc.Animate}
 */
ttutil.buildAnimateByArray = function (framePathArray, interval, extension) {

    interval = interval || 1 / 12;
    extension = extension || ".png";
    var animation = new cc.Animation();

    for (var i = 0; i < framePathArray.length; ++i) {
        var frameName = framePathArray[i];
        if (frameName[0] == "#") {
            frameName = frameName.substring(1);
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName + extension);
            animation.addSpriteFrame(spriteFrame);
        }
        else {
            var spriteFrame = new cc.SpriteFrame(frameName + extension);
            animation.addSpriteFrame(spriteFrame);
        }
    }
    animation.setDelayPerUnit(interval);           //设置两个帧播放时间
    return cc.animate(animation);
};

/**
 * 简单的toast， 淡入后， 停留time时间后 再淡出, 默认添加在场景的最上层，
 * @param str
 * @param time
 */
ttutil.toast = function (str, time, pos) {

    time = time || 3;

    var scene = cc.director.getRunningScene();
    if (!scene) {
        return;
    }

    var oldToast = scene.getChildByTag(12366687);
    //把旧的toast删除掉
    if (oldToast) {
        oldToast.removeFromParent();
    }

    pos = pos || cc.p(V.w / 2, V.h / 2);
    var toastContainer = new cc.Node().to(scene, 1000000).p(pos);
    toastContainer.setTag(12366687);

    var layerGradient = new cc.LayerGradient(cc.color(128, 128, 255, 255), cc.color(128, 128, 255, 255), cc.p(1, 0)
        ,
        [{p: 0, color: cc.color(128, 128, 255, 0)},
            {p: 0.2, color: cc.color(128, 128, 255, 128)},
            {p: 0.8, color: cc.color(128, 128, 255, 128)},
            {p: 1, color: cc.color(128, 128, 255, 0)}]
    ).to(toastContainer).anchor(0.5, 0.5);

    var text = new cc.LabelTTF(str, GFontDef.fontName,
        30,
        cc.color(255, 0, 255, 255)
    );

    var textSize = text.getContentSize();

    layerGradient.ignoreAnchorPointForPosition(false);
    layerGradient.setContentSize(textSize.width * 1.2, textSize.height * 1.2);

    text.to(toastContainer, 1).p(0, 0);
    var action = cc.sequence(cc.fadeIn(0.5), cc.delayTime(time), cc.fadeOut(0.5), cc.removeSelf());

    toastContainer.setCascadeOpacityEnabled(true);
    toastContainer.runAction(action);
};


/**
 * 获取url后的参数
 * @returns {Object}
 */
ttutil.getArgmuent = function () {

    if (typeof location == "undefined") {
        return [];
    }

    var url = location.search; //获取url中"?"符后的字串
    var theRequest = {};
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0].toLowerCase()] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
};

/**
 * 初始随机种子
 * @type {number}
 */
var randseek = (new Date().getTime()) & 0x7fff;

/**
 * 设置随机种子
 * @param seek
 */
ttutil.srand = function (seek) {
    randseek = seek;
};

ttutil.RandMax = 233280;

/**
 * 产生 0到ttutil.RandMax的伪随机数， 随机质量不如 js自带， 仅用于， 减少网络io， 服务端下发随机种子， 客户端依此产生随机数控制， 保证各客户端一致
 * @returns {number}
 */
ttutil.random = function () {
    //randseek = (((randseek * 214013 + 2531011) >> 16) & 0x7fff);
    randseek = (randseek * 9301 + 49297) % ttutil.RandMax;
    return randseek;
};

ttutil.calcRotation = function (st, ed) {

    var angle = Math.atan2(ed.y - st.y, ed.x - st.x);
    var rotation = -angle * 180.0 / Math.PI;
    return rotation;
};

/**
 * 把角度变换在0到Math.PI*2之间
 * @param angle
 * @returns {*}
 */
ttutil.angleRange = function (angle) {

    var t = Math.PI * 2;

    while (angle < 0) {
        angle += t;
    }

    while (angle > t) {
        angle -= t;
    }
    return angle;
};

/**
 * 通过所在点， 及角度， 计算， 按这个角度出发， 会在哪个点游出屏幕外
 * @param angle
 * @param src
 */
ttutil.getTargetPoint = function (angle, src) {

    var target = cc.p();
    angle = ttutil.angleRange(angle);

    var t = 300;

    if (angle == 0 || angle == Math.PI * 2) {
        target.x = -t;
        target.y = src.y;
    }
    else if (angle == Math.PI / 2) {
        target.x = src.x;
        target.y = -t;
    }
    else if (angle == Math.PI) {

        target.x = V.w + t;
        target.y = src.y;
    }
    else if (angle == Math.PI / 2 * 3) {

        target.x = src.x;
        target.y = V.h + t;
    }
    else if (angle > 0 && angle < Math.PI / 2) {
        target.x = -t;
        target.y = src.y - (src.x + t) * Math.tan(angle);
    }
    else if (angle > Math.PI / 2 && angle < Math.PI) {
        target.x = V.w + t;
        target.y = src.y + (V.w - src.x + t) * Math.tan(angle);

    }
    else if (angle > Math.PI && angle < 3 * Math.PI / 2) {

        target.x = V.w + t;
        target.y = src.y + (V.w - src.x + t) * Math.tan(angle);
    }
    else {
        target.x = -t;
        target.y = src.y - (src.x + t) * Math.tan(angle);
    }

    return target;
};


ttutil.getShakeAction = function (shakeBaseValue, shakeRandomValue, dt, times) {

    shakeBaseValue = shakeBaseValue == null ? 5 : shakeBaseValue;
    shakeRandomValue = shakeRandomValue == null ? 3 : shakeRandomValue;
    dt = dt == null ? 0.05 : dt;
    times = times == null ? 10 : times;


    //var sumX = 0, sumY = 0;
    var shakeAction = null;
    for (var i = 0; i < times; ++i) {

        var x = Math.random() > 0.5 ? shakeBaseValue + Math.random() * shakeRandomValue : -shakeBaseValue - Math.random() * shakeRandomValue;
        var y = Math.random() > 0.5 ? shakeBaseValue + Math.random() * shakeRandomValue : -shakeBaseValue - Math.random() * shakeRandomValue;

        //sumX += x;
        //sumY += y;
        var action = cc.moveBy(0, x, y);
        //shakeAction = shakeAction ? cc.sequence(action,action.reverse(), shakeAction) : cc.sequence(action, action.reverse());
        shakeAction = shakeAction ? cc.sequence(cc.delayTime(dt), action, shakeAction) : cc.sequence(cc.delayTime(dt), action);
    }
    //
    //shakeAction = cc.sequence(shakeAction, cc.moveBy(dt, -sumX, -sumY));
    //shakeAction.setTag(1234);

    return shakeAction;
};
/**
 * 格式化钱数， 支持小数， 三位带一个splitChar
 * @param moneyValue
 * @param splitChar
 * @returns {string}
 */
ttutil.formatMoney = function (moneyValue, splitChar) {

    splitChar = splitChar == null ? "," : splitChar;
    var str = String(moneyValue);

    var result = "";
    //带小数点
    if (Math.floor(moneyValue) != moneyValue) {
        var len = str.length;
        for (var i = len - 1; i >= 0; --i) {
            result = str[i] + result;
            if (str[i] == ".")
                break;
        }
        str = String(Math.floor(moneyValue));
    }

    var len = str.length;
    for (var i = len - 1, count = 0; i >= 0; --i, ++count) {

        if (count % 3 == 0 && count != 0 && str[i] != '-' && str[i] != '+') {
            result = splitChar + result;
        }
        result = str[i] + result;
    }

    return result;
};

ttutil.clone = function (obj) {
    // Cloning is better if the new object is having the same prototype chain
    // as the copied obj (or otherwise, the cloned object is certainly going to
    // have a different hidden class). Play with C1/C2 of the
    // PerformanceVirtualMachineTests suite to see how this makes an impact
    // under extreme conditions.
    //
    // Object.create(Object.getPrototypeOf(obj)) doesn't work well because the
    // prototype lacks a link to the constructor (Carakan, V8) so the new
    // object wouldn't have the hidden class that's associated with the
    // constructor (also, for whatever reasons, utilizing
    // Object.create(Object.getPrototypeOf(obj)) + Object.defineProperty is even
    // slower than the original in V8). Therefore, we call the constructor, but
    // there is a big caveat - it is possible that the this.init() in the
    // constructor would throw with no argument. It is also possible that a
    // derived class forgets to set "constructor" on the prototype. We ignore
    // these possibities for and the ultimate solution is a standardized
    // Object.clone(<object>).
    var newObj = (obj.constructor) ? new obj.constructor : {};

    // Assuming that the constuctor above initialized all properies on obj, the
    // following keyed assignments won't turn newObj into dictionary mode
    // becasue they're not *appending new properties* but *assigning existing
    // ones* (note that appending indexed properties is another story). See
    // CCClass.js for a link to the devils when the assumption fails.
    for (var key in obj) {
        var copy = obj[key];
        // Beware that typeof null == "object" !
        if (((typeof copy) === "object") && copy && !(copy instanceof cc.Node)) {
            newObj[key] = ttutil.clone(copy);
        } else {
            newObj[key] = copy;
        }
    }
    return newObj;
};
/**
 * 复制
 */
ttutil.cloneObj = function (oldObj) {
    if (typeof(oldObj) != 'object') return oldObj;
    if (oldObj == null) return oldObj;
    var newObj = {};
    for (var i in oldObj)
        newObj[i] = ttutil.cloneObj(oldObj[i]);
    return newObj;
};

/**
 * 扩展对象
 */
ttutil.extendObj = function () {
    var args = arguments;
    if (args.length < 2) return;
    var temp = ttutil.cloneObj(args[0]);
    for (var n = 1; n < args.length; n++) {
        for (var i in args[n]) {
            temp[i] = args[n][i];
        }
    }
    return temp;
};

/**
 * 根据两点确定一条直线 两点的x，y不能相同
 * @param point1
 * @param point2
 * @param x
 * @return y
 */
ttutil.getPointByLineFunction = function (point1, point2, x) {
    if (point1.x == point2.x || point1.y == point2.y) {
        return 0;
    }
    //斜率
    var k = (point1.y - point2.y) / (point1.x - point2.x);

    //方程式
    var y = k * (x - point1.x) + point1.y;
    return y;
};
/**
 * 返回 st到 ed之间的整数， 最小st， 最大ed-1
 * @param st
 * @param ed
 * @returns {number}
 */
ttutil.rand = function (st, ed) {

    if (ed == null) {
        ed = st;
        st = 0;
    }

    return Math.floor(Math.random() * (ed - st) + st);
};

/**
 * 把rect缩小
 * @param rect
 * @param scaleX
 * @param scaleY
 * @returns {*}
 */
ttutil.scaleBoundingBox = function (rect, scaleX, scaleY) {
    scaleY = scaleY || scaleX;

    var cx = rect.x + rect.width / 2;
    var cy = rect.y + rect.height / 2;

    rect.width = rect.width * scaleX;
    rect.height = rect.height * scaleY;

    rect.x = cx - rect.width / 2;
    rect.y = cy - rect.height / 2;

    return rect;
};


/**
 * 深度拷贝属性
 * @param dest
 * @param src
 * @returns {*|{}}
 */
ttutil.copyAttr = function (dest, src) {


    for (var attr in src) {

        if (src[attr] instanceof Array) {
            dest[attr] = dest[attr] || [];
            this.copyAttr(dest[attr], src[attr]);
        }
        else if (src[attr] === 'object') {
            dest[attr] = dest[attr] || {};
            this.copyAttr(dest[attr], src[attr]);
        }
        else {
            dest[attr] = src[attr];
        }
    }
};


/**
 *
 对Date的扩展，将 Date 转化为指定格式的String
 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 例子：
 ttutil.formatDate(new Date(),"yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 ttutil.formatDate(new Date(),"yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 * @param date
 * @param fmt
 */
ttutil.formatDate = function (date, fmt) {
    fmt = fmt || "yyyy-M-d hh:mm:ss";
    var o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;

};

/**
 *判断是否是手机号码
 * @param mobileNum
 * @returns {boolean}
 */
ttutil.isMobileNum = function (mobileNum) {
    return /^1\d{10}$/.test(mobileNum);
};

/**
 * 格式化  妮称， 超过部分用。。。
 */
ttutil.formatNickname = function (nickname) {
    if (nickname.length > 7) {
        nickname = nickname.slice(0, 5) + "...";
    }
    return nickname;
};


/**
 * 返回字符的字节长度（汉字算2个字节）
 * @param {string}
 * @returns {number}
 */
ttutil.getByteLen = function (val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        if (val[i].match(/[^\x00-\xff]/ig) != null) //全角
            len += 2;
        else
            len += 1;
    }
    return len;
};

/**
 * 金额小写转大写
 * @param n
 * @returns {*}
 */
ttutil.convertMoneyToCapitals = function (n) {
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
        return "数据非法";
    var unit = "万千百拾亿千百拾万千百拾元角分", str = "";
    n += "00";
    var p = n.indexOf('.');
    if (p >= 0)
        n = n.substring(0, p) + n.substr(p + 1, 2);
    unit = unit.substr(unit.length - n.length);
    for (var i = 0; i < n.length; i++)
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
    return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
};


/**
 * 删除指定的元素, 有删除到， 返回true, 没有返回false
 * @param array
 * @param element
 * @returns {boolean}
 */
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
 * 随机数组索引
 * @param array
 * @returns {*}
 */
ttutil.arrayShuffle = function (array) {
    let m = array.length, i;
    while (m) {
        i = (Math.random() * m--) >>> 0;
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
};

/**
 * 判断数组是否含有某个元素
 * @param array
 * @param obj
 * @returns {number}
 */
ttutil.arrayContains = function (array, obj) {
    let m = array.length;
    while (m--) {
        if (array[m].toString() === obj.toString()) {
            return m;
        }
    }
    return -1;
};

/**
 * 数组去重
 * @param array
 * @returns {Array}
 */
ttutil.arrayUnique = function (array) {
    let tempArray = [];
    let tempJson = {};
    for (let i = 0; i < array.length; i++) {
        if (!tempJson[array[i]]) {
            tempArray.push(array[i]);
            tempJson[array[i]] = 1;
        }
    }
    return tempArray;
};

/**
 * 判断两个数组是否相等
 * @param array1
 * @param array2
 * @returns {boolean}
 */
ttutil.arrayEquals = function (array1, array2) {
    if (!array1 || !array2) return false;
    if (array1.length !== array2.length) return false;

    for (var i = 0; i < array1.length; i++) {
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            if (!this(array1[i], array2[i])) {
                return false;
            }
        } else if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
};



/**
 * 创建头像
 * @param faceID
 */
ttutil.buildHeadIcon = function (faceID) {

    var widget = new FocusWidget().anchor(0.5, 0.5);

    var iconBox = new cc.Sprite("#personal/female_bg.png").to(widget);
    widget.size(iconBox.size());
    iconBox.pp();
    // var iconBg = new cc.Sprite("#res/common981/gui-main-toux-bj.png").to(iconBox, -1).pp();
    var icon = new cc.Sprite(ttutil.getHeadIconName(faceID)).to(iconBox, 1).pp(0.5,0.51).qscale(0.6666);

    widget.icon = icon;
    widget.iconBox = iconBox;
    widget.setScale(1.1);
    return widget;
};

/**
 * 得到头像资源名字。。
 * @param faceID
 * @returns {string}
 */
ttutil.getHeadIconName = function (faceID) {
    return "#res/common981/gui-icon-head-" + faceID + ".png";
};

/**
 * Object对象拼接为string。{key1: value1, key2: value2...} -> "key1:value1,key2:value2..."
 * @param obj
 * @returns {string}
 */
ttutil.obj2Str = function (obj) {
    // 非空Object才操作
    if (Object.keys(obj).length > 0) {
        var strArr = [];
        for (var key in obj) {
            var str = key + ":" + obj[key];
            strArr.push(str);
        }
        return strArr.toString();
    }

    return "";
};


/**
 * 判断是否是个合法的URL， 只是简单判断
 * @param str
 * @returns {boolean}
 */
ttutil.isUrl = function (str) {
    var reg = /[a-z]+:\/\/[a-z0-9_\-\/.%]+/i;
    return str.match(reg) != null;
};

ttutil.loadRemoteImg = function (base64, type, callback) {
    type = type || "png";

    if (cc.sys.isNative) {
        var sprite = new cc.Sprite();
        sprite.initWithBase64(base64);

        callback(sprite);

        return;
    }

    cc.loader.loadImg("data:image/" + type + ";base64," + base64, {isCrossOrigin: true}, function (err, img) {
        if (err) {
            console.error("验证码加载失败");
            return;
        }

        var sprite = new cc.Sprite(img);

        callback(sprite);
    });
};

/**
 * 模拟点击
 * @param touchPos
 * @constructor
 */
ttutil.analogClick = function (touchPos) {
    if (!cc.sys.isNative)
        return;

    var id = 0;
    var x = touchPos.x;
    var y = touchPos.y;
    var touch = new cc.Touch();
    touch.setTouchInfo(id, x, y);
    var event1 = new cc.EventTouch();
    event1.setEventCode(cc.EventTouch.EventCode.BEGAN);
    event1.setTouches([touch]);
    cc.eventManager.dispatchEvent(event1);

    var event2 = new cc.EventTouch();
    event2.setEventCode(cc.EventTouch.EventCode.ENDED);
    event2.setTouches([touch]);
    cc.eventManager.dispatchEvent(event2);
};

//模拟输入
ttutil.analogInput = function (keyCode) {
    if (!cc.sys.isNative)
        return;

    cc.eventManager.dispatchEvent(new cc.EventKeyboard(keyCode, 1));
    cc.eventManager.dispatchEvent(new cc.EventKeyboard(keyCode, 0));
};

/**
 * 给节点绑定拖动打印坐标
 * @param touchPos
 * @constructor
 */
ttutil.adjustNodePos = function (node) {
    node.bindTouch({
        swallowTouches:true,
        onTouchBegan:function (touch, event) {
            this.startPos = touch.getLocation();

            return true;
        },

        onTouchMoved:function (touch, event) {
            this.setPosition(touch.getLocation());
        },

        onTouchEnded:function (touch, event) {
            this.endPos = touch.getLocation();
            cc.log("======== new pos " + this.endPos.x + "," + this.endPos.y);
        }
    })
};

// 产生指定范围的随机数
ttutil.randNum = function(min, max, isInt){
    var offset = max - min;
    var num = min + Math.random() * offset;

    return isInt ? Math.floor(num) : num;
};

if (typeof module != "undefined") {
    module.exports = ttutil;
}