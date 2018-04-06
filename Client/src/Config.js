/**
 * Created by 黄二杰 on 2015/11/27.
 */


//设计分辨率
var V = {
    w: 1344,
    h: 750
};

/**
 * 通用信息字体
 * @type {{}}
 */
var GameFontDef = {
    fontName: "宋体",
    fontSize: 24,
    textAlign: cc.TEXT_ALIGNMENT_LEFT,
    fillStyle: cc.color(255, 244, 200, 255)
};

var GFontDef = {
    fontName: "宋体",
    fontSize: 22,
    fillStyle: cc.color(66, 209, 244, 255)
};

var CardConst = {
    maxCount: 3,        //最多5张牌
    xSpace: 33,         //x间隔
    ySpace: 20,         //y间隔
    openSpace: 20       //开牌第三张与第四张的间隔
};


var TimerConst = {
    openCardTime: 20,
    readyTime: 15,
    autoLeaveTime: 15
};

var CardSetting = {
    value: { 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 1: "A"},
    color: { 0: "#sangong/UI_KP_fangk.png", 1: "#sangong/UI_KP_meih.png", 2: "#sangong/UI_KP_hongt.png", 3: "#sangong/UI_KP_heit.png"},
    tab1: [[0.5, 0.5]],
    tab2: [[0.5, 0.8], [0.5, 0.2, true]],
    tab3: [[0.5, 0.8], [0.5, 0.5], [0.5, 0.2, true]],
    tab4: [[0.3, 0.8], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.2, true]],
    tab5: [[0.3, 0.8], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.2, true], [0.5, 0.5]],
    tab6: [[0.3, 0.8], [0.3, 0.5], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.5], [0.7, 0.2, true]],
    tab7: [[0.3, 0.8], [0.3, 0.5], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.5], [0.7, 0.2, true], [0.5, 0.65]],
    tab8: [[0.3, 0.8], [0.3, 0.6], [0.3, 0.4, true], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.6], [0.7, 0.4, true], [0.7, 0.2, true]],
    tab9: [[0.3, 0.8], [0.3, 0.6], [0.3, 0.4, true], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.6], [0.7, 0.4, true], [0.7, 0.2, true], [0.5, 0.5]],
    tab10: [[0.3, 0.8], [0.3, 0.6], [0.3, 0.4, true], [0.3, 0.2, true], [0.7, 0.8], [0.7, 0.6], [0.7, 0.4, true], [0.7, 0.2, true], [0.5, 0.7], [0.5, 0.3, true]],
    kp: {0: "fangk", 1: "meih", 2: "hongt", 3: "heit"}
}