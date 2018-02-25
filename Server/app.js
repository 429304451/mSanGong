// 游戏服务器启动文件
var winston = require('winston')

var info = winston.info;

winston.info = function() {
    var argArray = [new Date().toLocaleString()];
    for (var i = 0; i < arguments.length; i++) {
        argArray.push(arguments[i]);
    }
    info.apply(this.argArray);
}.bind(winston.info);

var debug = winston.debug;

winston.debug = function() {
    var argArray = [new Date().toLocaleString()];
    for (var i = 0; i < arguments.length; i++) {
        argArray.push(arguments[i]);
    }
    debug.apply(this, argArray);
}.bind(winston.debug)

var gameconfig = require('./gameconfig.js');

// 启动服务
(function() {
    // 初始化
    if (process.argv.length >= 3) {
        winston.info("从" + process.argv[2] + "读取配置");
        var config = require(process.argv[2]);

        for (var key in gameconfig) {
            delete gameconfig[key];
        }

        for (var key in config) {
            gameconfig[key] = config[key];
        }
    } else {
        winston.info("没有外部配置文件，读取默认的 gameconfig.js");
    }
    console.log("arg");

    var GameServer = require('./GameServer');
    // var gameServer = new GameServer();

})();



console.log("w我哦错错错错错");


