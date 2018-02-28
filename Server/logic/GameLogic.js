/**
 * Created by changwei on 2017/8/11.
 */

var CardGroupType = {
    DaSanGong: 6,           // 大三公
    XiaoSanGong: 5,         // 小三公
    HunSanGong: 4,          // 混三公
    NineDot: 3,             // 九点
    EightDot: 2,            // 八点
    SingleCard: 1,          // 单牌
};

function CardGroup(cardArray, isSort) {
	// 从大到小排列
	if (isSort) {
        cardArray.sort(function (a, b) {
            return (b & 0x0f) - (a & 0x0f);
        });
    }

    this.type;                 //类型
    this.value = 0;            //类型值
    this.cardData = cardArray; //牌数组

    var weight = [1];   //下标6， value 为 20的6次方
    for (var i = 1; i <= 6; ++i) {
        weight[i] = 20 * weight[i - 1];
    }

    var cvalue = [cardArray[0] & 0x0f, cardArray[1] & 0x0f, cardArray[2] & 0x0f];  // 牌的数值 1-13
    var ccolor = [(cardArray[0] & 0xf0) >> 4, (cardArray[1] & 0xf0) >> 4, (cardArray[2] & 0xf0) >> 4];  // 牌的颜色
    // 单牌点数
    this.singleCardValue = 10;
    // 是否大三公
    if (cvalue[0] == cvalue[1] && cvalue[1] == cvalue[2]) {
        if (cvalue[2] > 10) {
            this.type = CardGroupType.DaSanGong;
        } else {
            this.type = CardGroupType.XiaoSanGong;
        }
    } else if (cvalue[2] > 10) {
        // 混三公 
        this.type = CardGroupType.HunSanGong;
    } else {
        // 9 8 0-7
        var value = 0;
        for (var i = 0; i < cvalue.length; i++) {
            if (cvalue[i] < 10) {
                value += cvalue[i];
            }
        }
        value = value % 10;
        if (value == 9) {
            this.type = CardGroupType.NineDot;
        } else if (value == 8) {
            this.type = CardGroupType.EightDot;
        } else {
            this.type = CardGroupType.SingleCard;
        }
        this.singleCardValue = value;
    } 
    // 类型 单牌点数 最大牌 最大牌花值 依次比较
    this.value = this.type*1000000 + this.singleCardValue*10000 + cvalue[0]*100 + ccolor[0];
    // 牌的数字
    this.cvalue = cvalue;
    // 翻倍倍数
    this.times = this.type;
}

CardGroup.prototype.typeDesc = {
    1: "单牌",
    2: "八点",
    3: "九点",
    4: "混三公",
    5: "小三公",
    6: "大三公",
};
CardGroup.prototype.cardTypeDesc = {
    0: "方块",
    1: "梅花",
    2: "红桃",
    3: "黑桃",
};

CardGroup.prototype.cardValueDesc = {
    2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8",
    9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 1: "A"
};

CardGroup.prototype.PrintString = function () {
    var str = "{类型:" + this.typeDesc[this.type] + "\t";
    str += "类型值:" + this.value + "\t";
    str += " cardData:[" +
        this.cardTypeDesc[(this.cardData[0] & 0xf0) >> 4] + this.cardValueDesc[this.cardData[0] & 0x0f] + "," +
        this.cardTypeDesc[(this.cardData[1] & 0xf0) >> 4] + this.cardValueDesc[this.cardData[1] & 0x0f] + "," +
        this.cardTypeDesc[(this.cardData[2] & 0xf0) >> 4] + this.cardValueDesc[this.cardData[2] & 0x0f] + "]}\t";
    console.log(str);
};

//扑克逻辑操作
function GameLogic(){
    this.LOGIC_MASK_COLOR   = 0xF0;     //花色掩码
    this.LOGIC_MASK_VALUE   = 0x0F;     //数值掩码
    this.MAX_COUNT          = 5;
    this.randCardData       = [];       //剩余扑克数据
};

var p = GameLogic.prototype;

//扑克数据 固定数据 排除大小王
p.cardData = [
    0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,	//方块 A - K
    0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,	//梅花 A - K
    0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,	//红桃 A - K
    0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D	//黑桃 A - K
];

/**
 * 洗牌， 直接对原数组进行操作
 * @param cardData
 */
p.shuffle = function (cardData) {
    for (var i = 1, len = cardData.length; i < len; i++) {
        var rnd = Math.floor(Math.random() * (i + 1)); //返回0到i
        var temp = cardData[i];
        cardData[i] = cardData[rnd];
        cardData[rnd] = temp;
    }
};
// 发牌
p.dealCard = function (playerNum, isSort) {
    var cardData = [];
    //拷贝
    for (var i = 0; i < this.cardData.length; ++i) {
        cardData.push(this.cardData[i]);
    }
    //洗牌
    this.shuffle(cardData);

    var cardGroupArray = [];
    var index = 0;

    for (var i = 0; i < playerNum; ++i) {
        var cardGroup = new CardGroup([cardData[index], cardData[index + 1], cardData[index + 2]], isSort);
        index += 3;
        cardGroupArray.push(cardGroup);
    }
    return cardGroupArray;
};

//混乱扑克发牌: cardDataArray为一个Array,  playerCount为玩家数目
p.randCardList = function (playerCount) {
    return this.dealCard(playerCount, true);
};


module.exports = GameLogic;



