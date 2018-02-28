// 游戏常亮定义
var gameConst = {
	// 玩家状态
	US_NULL: 0x00,			//没有状态
	US_FREE: 0x01,			//站立状态
	US_SIT: 0x02,			//坐下状态
	US_READY: 0x03,			//同意状态
	US_PLAYING: 0x05,	    //游戏状态
	// 桌子状态
	GAME_STATUS_FREE: 0, 			//空闲状态
    GAME_STATUS_PLAY: 100,			//游戏状态
    GAME_STATUS_WAIT: 200,			//等待状态
    //游戏结束原因
    GER_NORMAL: 0x00,			//常规结束
    GER_DISMISS: 0x01,			//游戏解散
    GER_USER_LEAVE: 0x02,		//用户离开
    GER_NETWORK_ERROR: 0x03,	//网络错误
    //游戏模式
    START_MODE_ALL_READY: 0x00, 		//所有准备
    START_MODE_FULL_READY: 0x01,   		//满人开始
    START_MODE_HUNDRED: 0x02,           //百人游戏
    //请求失败类型
    KICK_TYPE: 0x01,                //踢人
};

//框架消息
var gameCMD = {
    //登入命令
    MDM_GR_LOGON: 1,			//登入主命令
	//请求
	SUB_GR_LOGON_ACCOUNTS: 1,      		//帐号登入
	//返回
	SUB_GR_LOGON_SUCCESS: 100,			//登录成功
    SUB_GR_LOGON_FAILURE: 101,			//登录失败
    //用户命令
	MDM_GR_USER: 2, 			//用户主命令
	//请求
	SUB_GR_USER_SIT_DOWN: 1,  		//坐下命令
    SUB_GR_USER_STANDUP: 2,			//起立命令
    //返回
    SUB_GR_USER_STATUS: 100,		//用户状态
    SUB_GR_USER_ENTER: 101,			//用户进入
    SUB_GR_USER_SCORE: 102,			//用户分数
	//游戏命令
	MDM_GF_GAME: 3,			//游戏主命令
	//框架命令
	MDM_GF_FRAME: 4,	  		//框架主命令
	//用户命令
    SUB_GF_GAME_OPTION: 1,      	//游戏配置
    SUB_GF_USER_READY: 2,			//用户准备

	SUB_GF_GAME_STATUS: 100,    	//游戏状态
    SUB_GF_GAME_SCENE: 101,      	//游戏场景
    SUB_GF_ROOM_INFO: 103,			//房间信息

    SUB_GF_FORCE_CLOSE: 105,			//强制关闭窗口
    SUB_GF_REQUEST_FAILURE: 106,		//请求失败

    SUB_GF_TOAST_MSG: 108,			//tip消息
    SUB_GF_FISH_NOTICE: 111,        //捕鱼消息， 用于 同房间不同桌子之间的类似公告的通知， 放在框架这占个坑， 防止后面框架用于111
};

//协调服事件
var corresCMD = {
	ROOM_INFO: "RoomInfo",			//房间信息
    USER_SIT_DOWN: "UserSitDown",  	//用户坐下
    USER_STATUS: "UsersStatus",		//用户状态
    USER_LEAVE: "UserLeave",        //用户离开
    WRITE_SCORE: "WriteScore",	    //玩家写分
    OPEN_OK: "OpenOK",				//房间开启成功

    /////////////////////////////////////////////////////////////////
    RECORD_ERROR: "RecordError",            //可以让大厅把错误的日记记录到数据库中去

    ///////////////控制信息/////////////////////////
    MODIFY_USER_WEIGHT: "ModifyUserWeight",	//修改用户权重
    GET_ROOM_CONTROL: "GetRoomControl",		//获取房间控制配置
    MODIFY_ROOM_CONTROL: "ModifyRoomControl"//修改房间配置
};

//内部流通的事件
var gameEvent = {
    EVENT_USER_STATUS: "user_status",		//玩家状态
    EVENT_USER_SCORE: "user_score",         //玩家分数
    EVENT_ANDROID: "event_android"		//机器人事件
};


module.exports.gameConst = gameConst;
module.exports.gameCMD = gameCMD;
module.exports.gameEvent = gameEvent;
module.exports.corresCMD = corresCMD;