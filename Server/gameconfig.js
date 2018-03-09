module.exports = {
	"LoginAddr": "ws://192.168.1.114:8237/Servers",
	"SC_Addr": "wss://127.0.0.1:12722",         //保存配置文件的服务器
	"RoomID": "3",
	"EnableChat": true,
	"Single": true,
	"TempFileDir": "../Temp/",

	"AndroidNum": 5,
	"ChairID": 1,

	"CellScore": 10000,                //底分
	"FreeMode": false,              //是否是体验场
	"FreeModeMoney": 10000000,      //体验房初始金额
	"FreeModeMinScore": 500000      //体验房能坐下继续游戏的最小分数 根据游戏规则自己定义，比如 牛牛 底分*5倍
};