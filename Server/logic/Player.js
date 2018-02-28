/**
 * Created by orange on 2016/8/11.
 */


function Player(chairID) {
    this.isOpenCard = false;    //是否开牌
    this.chairID = chairID;     //椅子ID
    this.isPlaying = false;     //是否有效
    this.cardTimes = 1;         //牌的倍数
    this.cardData = [];         //牌的数据
    this.isAndroid = false;     //是否是机器人
}

var p = Player.prototype;

p.reset = function () {
    this.isOpenCard = false;    //是否开牌
    this.isPlaying = false;     //是否有效
    this.cardTimes = 1;         //牌的倍数
    this.cardData = [];         //牌的数据
    this.isAndroid = false;     //是否是机器人
};

module.exports = Player;