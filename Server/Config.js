


var gameconfig = require("./gameconfig.js");
var fs = require('fs');
var SocketIO = require("socket.io-client");

var AndroidConfig = function () {
    this.timerStartGame = 1;        //开始定时器
    this.timerOpenCard = 2;         //开牌时间

    this.startGameTime = 3;         //开始时间
    this.openCardTime = 3;          //开牌时间
};

function ControlConfig() {

    this.nowStock = 50000000;      //当前库存
    this.nowTax = 0;               //当前税收
    this.taxRate = 0.05;    	   //税收比例

    //----------------------------------------------------------------------------------
    //进阶库存控制, 游戏通过 this.nowWater这个值的状态来 倾斜概率天平，  高水位时， 玩家赢的概率大于50%， 低水位时玩家赢的概率小于50%， 正常水位接近50%， 低水位玩家输钱的速度应该要大于抽水的比率， 这样库存才能上涨。
    this.highWater   = 100000000;       //库存 高水位
    this.normalWater = 50000000;        //正常水位
    this.lowWater    = 10000000;        //低水位
    this.nowWater    = 0;               // 0表示正常水位， 1表示 高水位（库存降到正常水位时就会变成0）， -1表示低水位（库存升到正常水位时就会变成0），
    //----------------------------------------------------------------------------------
    this.controlDesc = "";              //控制描述, 主要写给管理员看。

    /////////////////////////////  游戏自身配置 ////////////////////////////////////////

    this.cardCount = 5;     //每个玩家牌数
    this.fleeTimes = 6;     //逃跑扣分倍数 * 底注 + 底注
    this.androidConfig = new AndroidConfig();

    ////////////////////////定时器//////////////////////////////////
    this.timerOpenCard = 1;         //开牌定时器
    this.openCardTime = 20;         //开牌时间
    this.netDelayTime = 0.5;        //网络延迟补偿

    //配置文件保存名
    this.configFileName = "Config_" + gameconfig["RoomID"] + ".json";

    if (gameconfig["TempFileDir"]) {
        this.configFileName = gameconfig["TempFileDir"] + this.configFileName;
    }


    if (!gameconfig["Single"]) {
        this.socketIO;
        this.isConn = false;
        this.initSocketIO();
    }

    this.loadConfig();
}
var p = ControlConfig.prototype;

/**
 * 获取控制配置
 * 此方法为框架调用的方法，如果有控制配置，需要把控制的信息传返回
 * @returns {Array}
 */
p.onGetContronlCofig = function () {

    this.updateWaterLevel();
    /**
     *
     * @param key   所配置的key值 ， 不会在界面上显示， 会原样传回来
     * @param value 会在界面上显示
     * @param desc  对key值的描述
     * @param attr  wr这两种属性可选 ， r为必选， w可选 ， 没有w， 则表示只读， 不能修改
     * @returns {{key: *, value: *, desc: *, attr: (*|string)}}
     */
    var configItem = function (key, value, desc, attr) {
        return {key: key, value: value, desc: desc, attr: attr || "r"};
    };

    var configArray = [];
    //返回这种格式的
    configArray.push(configItem("controlDesc", this.controlDesc, "游戏控描述", "r"));
    configArray.push(configItem("nowStock", this.nowStock, "当前库存", "wr"));
    configArray.push(configItem("nowTax", this.nowTax, "当前抽水综合", "r"));
    configArray.push(configItem("taxRate", this.taxRate, "抽水比率", "wr"));
    //------------------------------------------------------------------------------------------
    configArray.push(configItem("highWater", this.highWater, "高水位", "wr"));
    configArray.push(configItem("normalWater", this.normalWater, "正常水位", "wr"));
    configArray.push(configItem("lowWater", this.lowWater, "低水位", "wr"));
    configArray.push(configItem("nowWater", this.nowWater, "当前水位状态", "wr"));
    //-------------------------------------------------------------------------------------------

    //水位
    return configArray;
};

/**
 * 转换数组参数为对象
 */
p.convertConfigArray = function (configArray) {

	var tempData = {};

	for (var i = 0; i < configArray.length; ++i) {
		var key = configArray[i].key;
		var value = configArray[i].value;
		var attr = configArray[i].attr;
		tempData[key] = {value: value, attr: attr};
	}
	return tempData;
};

/**
 * 检查且 格式化 配置数组， 把配置可写的value全转成数字， 不能转return false
 * @param configArray       //配置数据
 * @returns {*}
 */
p.checkAndFormatConfig = function (configArray) {

	var otherConfig = this.convertConfigArray(configArray);     //外部传进来的配置
	var oldConfig = this.convertConfigArray(this.onGetContronlCofig()); //得到一份旧的， 好做比较

	//如果oldConfig有， 且不是只读， 而otherConfig 没有， 或非法， 即不是数字， 则return false
	var resData = {};
	for (var key in oldConfig) {
        //这个特殊值不处理
        if (key == "controlDesc") {
            continue;
        }
        //可写
        if (oldConfig[key].attr.indexOf("w") != -1) {
            if (otherConfig[key]) {
                var value = Number(otherConfig[key].value);
                if (isNaN(value)) {
                    return false;
                }
                resData[key] = value;
            }
            else {
                return false;
            }
        }
        else {
            //只读的字段也存入进来， 这部分是为  从文件中读取配置考虑
            if (otherConfig[key]) {
                var value = Number(otherConfig[key].value);
                if (isNaN(value)) {
                    return false;
                }
                resData[key] = value;
            }
        }
    }

    return resData;
};

/**
 * 修改控制配置
 * 此方法为框架调用，如果有更新新的控制配置信息，会有新的配置，游戏逻辑自己更新配置
 */
p.onModifyControlConfig = function (data, readFromFile) {

    var configArray = JSON.parse(data);
    var tempData = this.checkAndFormatConfig(configArray);

    if (!tempData) {
        console.error("----------------------------------------------------");
        console.error("配置数组不合法， 转换失败");
        console.error(readFromFile ? "从文件中读取， 所以请联系本游戏作者" : "从web后台传过来，所以请联系web后台管理人员");
        console.error("原始数据如下");
        console.error(data);
        console.error("----------------------------------------------------");
        return false;
    }
    //------------------------------------------------------------------------------
    console.info("---------------------------------");
    console.info("转换配置数组成功");
    console.info(tempData);
    console.info("---------------------------------");
    //------------------------------------------------------------------------------
    //------------------------------------------------------------------------------
    this.nowStock = tempData.nowStock;
    this.nowTax = readFromFile ? tempData.nowTax : this.nowTax;//当前税收, 从文件中读取的才配置进去， 管理员配置的不管
    this.taxRate = tempData.taxRate;                    //抽水比率
    //------------------------------------------------------------------------------
    this.highWater = tempData.highWater;                //高水位
    this.normalWater = tempData.normalWater;            //正常水位
    this.lowWater = tempData.lowWater;                  //低水位
    this.nowWater = tempData.nowWater;                  //当前水位状态
    //------------------------------------------------------------------------------


    //保存一下配置文件
    !readFromFile && this.saveConfig();
    return true;
};

/**
 *  更新水位, 每次 计算结果时都要调用
 */
p.updateWaterLevel = function () {
    //更新一下水位
    //先判定当前水位
    if (this.nowWater == -1 && this.nowStock >= this.normalWater) {
        //恢复到正常水位
        this.nowWater = 0;
    }
    else if (this.nowWater == 1 && this.nowStock <= this.normalWater) {
        //恢复到正常水位
        this.nowWater = 0;
    }
    else if (this.nowWater == 0) {
        if (this.nowStock > this.highWater) {
            //切换到高水位
            this.nowWater = 1;
        }
        else if (this.nowStock < this.lowWater) {
            //切换到低水位
            this.nowWater = -1;
        }
    }
};

/**
 * 获取当前水位
 */
p.getNowWater = function () {
    this.updateWaterLevel();
    return this.nowWater;
};

/**
 *  读取配置
 */
p.loadConfig = function () {

    if (gameconfig["Single"]) {
        var self = this;
        fs.readFile(this.configFileName, function (err, data) {
            try {
                if (err) {
                    console.info("读取配置文件失败， 可能是第一次启动， 将使用默认配置文件");
                    return;
                }
                self.onModifyControlConfig(data, true);
            }
            catch (e) {
                console.error(e);
            }

        });
    }
    else {
        //socketket 连接上时就会发消息了

    }
};

/**
 * 保存配置文件， 在逻辑中要自己在适应时机保存一下
 */
p.saveConfig = function () {

    //体验服就不保存了
    if (gameconfig["FreeMode"]) {
        return ;
    }

    var saveData = this.onGetContronlCofig();

    if (gameconfig["Single"]) {
        fs.writeFile(this.configFileName, JSON.stringify(saveData), function (err) {
            if (err) {
                console.error("保存配置文件失败");
            }
        });
    }
    else {
        if (this.isConn) {
            this.socketIO.emit("saveConfig", {roomID: gameconfig["RoomID"], configArray: saveData});
        }
    }

};

p.initSocketIO = function () {
    this.socketIO = SocketIO(gameconfig["SC_Addr"], {query:'roomID=' + gameconfig["RoomID"]});

    var first = true;
    var self = this;
    //链接事件
    this.socketIO.on("connect", function (data) {
        console.info("连接SC服成功");
        self.isConn = true;
        if (first) {
            self.socketIO.emit("readConfig", {roomID: gameconfig["RoomID"]});
            first = false;
        }

    });
    //断开事件
    this.socketIO.on("disconnect", function () {
        console.info("与SC服断开连接");
        self.isConn = false;
    });

    this.socketIO.on("readConfig", this.onReadConfig.bind(this));
    this.socketIO.on("saveConfig", function (data) {

        console.info(data);
    })
};

p.onReadConfig = function (data) {
    try {
        if (!data) {
            console.info("读取配置文件失败， 可能是第一次启动， 将使用默认配置文件");
            console.info("保存默认配置文件");
            this.saveConfig();
            return;
        }
        this.onModifyControlConfig(data, true);
    }
    catch (e) {
        console.error(e);
        console.error(data);
    }
};

//控制配置
module.exports.controlConfig = new ControlConfig();