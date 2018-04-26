/**
 * Created by orange on 2016/8/12.
 */
var Config = require("../Config").controlConfig;
var winston = require("winston");
var gameconfig = require("../gameconfig");
var nowGameCount = 1;

function GameControl (tableSink) {
    this.tableSink = tableSink;
};

var p = GameControl.prototype;

p.beginControl = function(cardGroupArray) {

    var tableFrame = this.tableSink.tableFrame;
    var gameLogic = this.tableSink.gameLogic;
    var player = this.tableSink.player;

    // 是否全为玩家或者机器人
    var allAndroid = true;
    // 是否全部是玩家
    var allPlayer = true;
    // 有多少正在游戏中的玩家
    var playerCount = 0;

    var weightInfo = [];
    var totalWeight = 0;
    // 机器人数组 真人数组
    var androidArray = [];
    var personArray = [];
    // 所有人一样的权重
    var sameWeight = true;

    var index = 0;
    for (var i = 0; i < player.length; ++i) {
    	if (player[i].isPlaying == false) continue;
    	var userItem = tableFrame.getTableUserItem(player[i].chairID);
    	if (userItem == null) continue;
    	// console.log("玩家 "+ userItem.getNickname() + " 椅子号：" +  player[i].chairID+ " 未调整权重: " +  userItem.getWeight());

    	var info = {};
    	info.chairID = player[i].chairID;
    	var weight = this.calculateWeight(userItem.getWeight(), userItem.isAndroid);
    	if (weight != 1) {
            sameWeight = false;
        }
        info.weight = weight;
        // console.log(userItem.getWeight(), userItem.isAndroid);
        weightInfo.push(info);

        //所有权重
        totalWeight += info.weight;
        // winston.info("调整后权重：" +　info.weight);
        playerCount++;

        if (userItem.isAndroid) {
            allPlayer = false;
            androidArray.push(index);
            // console.log("机器人 " + userItem.getNickname() + " 椅子号：" + player[i].chairID + "调整后权重：" + info.weight);
        } else  {
            allAndroid = false;
            personArray.push(index);
            // console.log("玩家 " + userItem.getNickname() + " 椅子号：" + player[i].chairID + "调整后权重：" + info.weight);
        }
        index ++;
    }

    this.androidLength = androidArray.length;
    this.personLength = personArray.length;

    // 目前这幅牌直接分发下去的话赢家椅子号 赢家在该牌组第几
    var winnerIndex = 0;
    // 赢家坐在哪个椅子
    var winnerChair = 0;
    // 赢家
    var winner = null;
    // 找出目前这个牌组的赢家是谁
    for (var i = 0; i < cardGroupArray.length; i++) {
        if (cardGroupArray[i].value > cardGroupArray[winnerIndex].value)
            winnerIndex = i;
    }
    index = 0;
    for (var i = 0; i < this.tableSink.chairCount; ++i) {
        var player = this.tableSink.player[i];
        if (player.isPlaying) {
            if (winnerIndex == index) {
                winnerChair = i;
                winner = player;
                break;
            }
            index++;
        }
    }

    this.allAndroid = allAndroid;
    console.log("一局开始的发牌", nowGameCount);
    nowGameCount = nowGameCount + 1
    // 全是机器人 或者全是真人 直接返回 不需要控制
    if (allAndroid || allPlayer){
        if (allPlayer)
            winston.info("全是真人，不需要控制");
        return;
    } else {
        winston.info("-----------beginControl--nowStock--------", Config.nowStock, Config.nowWater );
    }

    // 正常水位 普通人和机器人权重一样 不需要控制
    if (sameWeight) {
        winston.info("正常水位 所有人权重一致 不需要控制 就让它顺其自然好了");
        return;
    }

    // 如果水位很低 那一定要让机器人赢啦 把最大牌组给机器人就对了
    var winScore = cardGroupArray[winnerIndex].times * (playerCount-1) * this.tableSink.cellScore;
    // 不能让水位为负数
    if (Config.nowStock - winScore < 0) {
        if (winner.isAndroid == 0) {
            winston.info("不想让水位为负数  所以这种情况就要把赢的牌交给机器人");
            machineWinner = Math.floor(Math.random() * androidArray.length);
            var cardGroup = cardGroupArray[androidArray[machineWinner]];
            // 交换牌型
            cardGroupArray[androidArray[machineWinner]]  = cardGroupArray[winnerIndex];
            cardGroupArray[winnerIndex] = cardGroup;
        }
        return;
    }

    /////////////////////////////////// 符合库存 根据权重来定输赢 ///////////////////////////////////
    // 根据权重值让第几个人赢
    var WeightWinnerIndex = null;
    var winWeight = Math.random() * totalWeight;

    var nowWeight = 0;
    for (var i = 0; i < weightInfo.length; ++i) {
        nowWeight += weightInfo[i].weight;
        if (winWeight <= nowWeight) {
            WeightWinnerIndex = i;
            break;
        }
    }

    if (WeightWinnerIndex == null) {
        winston.info("没有根据权重找到给哪个人赢，哪里出错了？");
        return;
    } else if (WeightWinnerIndex != winnerIndex) {
        winston.info("根据权重重新定义赢家", winnerIndex, WeightWinnerIndex);
        // 交换牌型
        var cardGroup = cardGroupArray[WeightWinnerIndex];
        cardGroupArray[WeightWinnerIndex]  = cardGroupArray[winnerIndex];
        cardGroupArray[winnerIndex] = cardGroup;
    }

};

// 根据库存 重新定义人和机器人的权重
p.calculateWeight = function (weight, isAndroid) {
    var nowWater = Config.getNowWater();
    var mlevel = 0.2;

    switch  (nowWater) {
        case  -1:
            return isAndroid ? (weight + mlevel*weight) : (weight - mlevel*weight);

        case 1:
            return isAndroid ? (weight - mlevel*weight ) : (weight + mlevel*weight );

        default:
            return weight;
    }
};

/**
 * 更新库存
 * @param changeScore
 */
p.updateStorage = function (changeScore) {
    if (changeScore == 0) {
        winston.info("库存变量为0， 不需要写文件");
        return;
    }

    Config.nowTax += Math.max(0, changeScore*Config.taxRate);
    Config.nowStock += Math.min(changeScore, (1-Config.taxRate) * changeScore);

    winston.info("库存变动: " + changeScore + " 当前库存: " + Config.nowStock + " 库存税收: " + Config.nowTax);
    Config.saveConfig();
};

module.exports = GameControl;



