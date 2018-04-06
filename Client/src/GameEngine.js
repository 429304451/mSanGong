/**
 * Created by Administrator on 2015/7/3.
 */

//游戏逻辑引擎
var GameEngine = GameFrameEngine.extend({
	_className: "GameEngine",
	_classPath: "src/GameEngine.js",

    kickData: null,   //服务端发送的 KICK_TYPE 类型消息的暂存

    player: null,               //玩家,

    checkAutoLeave: false,      //检测是否自动离开

    ctor: function (mainScene) {
        this._super();

        this.init();
    },


    init: function () {
        this.player = [];
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.player[i] = new Player(i);
        }
    },



    reset: function () {
        this.resetPlayer();
        GD.mainScene.cardLayer.reset();
    },

    resetPlayer: function () {
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            this.player[i].reset();
        }
    },
    /**
     * 框架消息 太渣最终还是耦合了
     * @param data
     */
    onEventFrameMessage: function (subCMD, data) {
        this._super();

        // if (!GD.mainScene && subCMD != gameCMD.SUB_GF_FORCE_CLOSE && subCMD != gameCMD.SUB_GF_REQUEST_FAILURE) {
        //     return true;
        // }
        if (!GD.mainScene) {
            return true;
        }

        switch (subCMD) {
            // 103 房间信息
            case gameCMD.SUB_GF_ROOM_INFO:
                var gameName = data["gameName"];
                var roomName = data["roomName"];
                var tableID = data["tableID"] + 1;
                break;
            // 请求失败 106
            case gameCMD.SUB_GF_REQUEST_FAILURE:
                if (data.type == gameConst.KICK_TYPE) {
                    this.kickData = data;
                } else {
                    this.onRequestFailure(data);
                }
                break;
            // 强制关闭窗口 105
            case gameCMD.SUB_GF_FORCE_CLOSE:            //强制关闭客户端
                this.closeWindow();
                break;
            // tip消息 108
            case gameCMD.SUB_GF_TOAST_MSG:
                ToastSystemInstance.buildToast(data["message"]);
                break;
        }
        return true;
    },

    /**
     * 返回请求失败的弹出框， 如果是KICK_TYPE类型 （即分数不够服务端踢人的消息），则需要自行在游戏结束处理完后调用，this.onRequestFailure(this.kickData) 来弹出消息
     * @param data
     */
    onRequestFailure: function (data) {
        if (data == null) return;

        if (GD.mainScene && GD.mainScene.isRunning()) {
            app.buildMessageBoxLayer("通知", data["message"], 0, this.closeWindow.bind(this));
        }
        else {
            ToastSystemInstance.buildToast(data.message);
            cc.director.getRunningScene().runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.closeWindow.bind(this))));
        }
    },

    /**
     * 场景消息
     * @param gameStatus
     * @param data
     * @returns {boolean}
     */
    onEventSceneMessage: function (gameStatus, data) {
        this._super();

        GD.mainScene.UILayer.onUpdateCell(data.cellScore);

        //配置消息跟场景消息一起发下来
        switch (gameStatus) {
            // 空闲状态
            case subGameMSG.GS_FREE:
                GD.mainScene.UILayer.showReadyBtn(true);
                this.checkUserAutoLeave();
                break;
            // 游戏状态
            case subGameMSG.GS_PLAYING:

                for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
                    if (!data.playerStatus[i]) continue;
                    var viewID = this.switchViewChairID(i);
                    GD.mainScene.cardLayer.showControlCount(viewID, 5);
                    if (data.isOpenCard[i]) {
                        GD.mainScene.cardLayer.doOpenCard(viewID);
                    }
                }

                GD.mainScene.timerLayer.setTimer(data.statusLeftTime, null);

                break;

           default :
               return true;
        }

        //可能你刚好请求场景消息时， 然后给换桌了， 结果服务端就发了两次场景消息？
        if (!GD.mainScene.isRunning()) {
            //加载完场景再显示出来
            cc.director.getRunningScene().runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(function () {
                cc.log("cc.director.runScene(GD.mainScene);");

                //cc.director.replaceScene(new cc.TransitionFadeBL(1, GD.mainScene));
                cc.director.runScene(GD.mainScene);
                GD.mainScene.release();         //因为前面有retain过， 所以要释放掉

            })));
        }

        this.onSetBackToHall("您正在游戏中如果强退要扣游戏底注的7倍分数，您确定要强退吗?");

        return true;
    },
    /**
     * 游戏消息事件
     * @param subCMD 子游戏命令
     * @param data 数据
     * @returns {boolean}
     */
    onEventGameMessage: function (subCMD, data) {
        this._super();

        if (!GD.mainScene) {
            return true;
        }
        console.log(data);
        switch (subCMD) {
            // 游戏开始 100
            case subGameMSG.S_GAME_START:
                this.onSubGameStart(data);
                console.log("游戏开始");
                break;
            // 单个玩家开牌 101
            case subGameMSG.S_SINGLE_OPEN_CARD:
                this.onSubSingleOpenCard(data);
                console.log("单个玩家开牌");
                break;
            // 所有玩家开牌 102
            case subGameMSG.S_ALL_OPEN_CARD:
                this.onSubAllOpenCard(data);
                console.log("所有玩家开牌");
                break;
            // 玩家逃跑
            case subGameMSG.S_PLAYER_EXIT:
                console.log("玩家逃跑");
                this.onSubPlayerExit(data);
                break;
            // 游戏结束
            case subGameMSG.S_GAME_END:
                console.log("游戏结束");
                this.onSubGameEnd(data);
                break;

            default :
                return true;
        }
    },

    /**
     * 游戏开始
     * @param data
     */
    onSubGameStart: function (data) {

        this.reset();

        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            var userItem = this.getTableUserItem(i);
            userItem && (this.player[i].isPlaying = true);
        }
        
        // 修改版
        for (var i = 0; i < data.cardGroupArray.length; ++i) {
            this.player[i].cardGroup = data.cardGroupArray[i];
        }

        GD.mainScene.cardLayer.onSendCardData(data.cardGroupArray);
        GD.mainScene.UILayer.showOpenCardBtn(true);

        var meChairID = this.getMeChairID();
        if (this.player[meChairID].isPlaying) {
            GD.mainScene.timerLayer.setTimer(TimerConst.openCardTime, this.onTimerOpenCard.bind(this));
        } else {
            GD.mainScene.timerLayer.setTimer(TimerConst.openCardTime, null);
        }
    },

    /**
     * 单人开牌
     * @param data
     */
    onSubSingleOpenCard: function (data) {

        var viewID = this.switchViewChairID(data.chairID);

        GD.mainScene.cardLayer.doOpenCard(viewID);

    },

    /**
     * 所有人都开牌
     * @param data
     */
    onSubAllOpenCard: function (data) {
        // console.log("所有玩家都开牌");
        // console.log(data);
        // 这里第一呢 我已经一开始获取了全部的牌组信息 现在只要知道还有谁在 就可以了  这里要全部换成服务端给你的数据展示
        
        GD.mainScene.timerLayer.killTimer();

        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            var cardData = data.cardGroup[i].cardData;
            if (cardData == undefined) continue; 

            var viewID = this.switchViewChairID(i);
            GD.mainScene.cardLayer.setControlData(viewID, cardData);
            GD.mainScene.cardLayer.doOpenCard(viewID);
        }
    },

    /**
     * 玩家退出
     * @param data
     */
    onSubPlayerExit: function (data) {
        var userItem = this.getTableUserItem(data.chairID);
        if (userItem==null) return;
        ToastSystemInstance.buildToast("玩家 " + userItem.getNickname() + " 逃跑" );
        var viewID = this.switchViewChairID(data.chairID);
        GD.mainScene.cardLayer.showControlCount(viewID, 0);
    },

    /**
     * 游戏结束
     * @param data
     */
    onSubGameEnd: function (data) {
        GD.mainScene.timerLayer.killTimer();
        GD.mainScene.gameEndLayer.onGameEnd(data);
        GD.mainScene.UILayer.showOpenCardBtn(false);

        this.resetPlayer();
    },

    ///////////////////////////////////////////////////////////////////////////
    onTimerOpenCard: function () {

        GD.mainScene.UILayer.autoBtn.onClick();
        
    },



    //////////////////////////////////////////////////////////////////////////

    getSex: function (chairID) {
        var userItem = this.getTableUserItem(chairID);
        if (userItem==null) return 0;

        //faceId为零的时候会有BUG
        var faceID = userItem.getFaceID();
        return (faceID%2);
    },


    /**
     * 开牌按钮事件
     */
    onSendOpenCard: function () {
        this.sendSocketData(subGameMSG.C_OPEN_CARD, null);
        GD.mainScene.timerLayer.setCallback(null);
    },

    /**
     * 设置返回大厅的回调
     */
    onSetBackToHall: function (msg) {
        GD.mainScene.exitLayer.setBackToHallCallback(this.onBackToHallCallBack.bind(this, msg));
    },

    onBackToHallCallBack: function (msg) {
        if (!this.player[this.getMeChairID()].isPlaying) {
            app.closeSubGame();
            return;
        }

        app.buildMessageBoxLayer("提示", msg, 1, this.closeWindow.bind(this));
    },

    /**
     * 游戏结束动画播放完成
     */
    onGameEndFinish: function () {
        this.checkUserAutoLeave();
    },
    

    onReadyBtn: function () {
        var userItem = this.getMeUserItem();
        if (userItem.getUserStatus() < gameConst.US_READY)
            GD.gameEngine.sendUserReady();
    },

    /**
     * 测试倒计时未准备离开
     */
    checkUserAutoLeave: function () {

        var playerCnt = 0;
        for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            if (!this.getTableUserItem(i)) continue;
            playerCnt++;
        }

        var userItem = this.getMeUserItem();
        if (userItem.getUserStatus() >= gameConst.US_READY) {
            return true;
        }

        if (playerCnt>=2) {
            GD.mainScene.timerLayer.setTimer(TimerConst.autoLeaveTime, this.onTimerAutoLeave.bind(this));
            this.checkAutoLeave = true;
        }

        return true;

    },

    onTimerAutoLeave: function () {
        var cnt = 0;
        for (var i = 0; i  < gameConst.GAME_PLAYER_NUM; ++i) {
            if (this.getTableUserItem(i) != null) {
                cnt++;
            }
        }

        if (cnt != 1) {
            this.closeWindow();
        }
    },

    /**
     * 玩家进入
     * @param userItem 玩家
     * @returns {boolean}
     */
    onEventUserEnter: function (userItem) {
        this._super(userItem);


        var viewID = this.switchViewChairID(userItem.getChairID());

        var updateInfo = {};
        updateInfo.name = userItem.getNickname();
        updateInfo.faceID = userItem.getFaceID();
        updateInfo.score = userItem.getUserScore();
        updateInfo.memberOrder = userItem.getMemberOrder();
        GD.mainScene.mainLayer.onUpdateUserInfo(viewID, updateInfo);
        GD.mainScene.mainLayer.showUserFrame(viewID, true);

        if (userItem.getUserStatus() == gameConst.US_READY) {
            GD.mainScene.UILayer.showReadyText(viewID, true);
        }

        if (this.getMeUserItem() != null) {
            this.checkUserAutoLeave();
        }

        return true;
    },

    /**
     * 玩家离开
     * @param userItem 玩家
     * @returns {boolean}
     */
    onEventUserLeave: function (userItem) {
        this._super(userItem);

        var viewID = this.switchViewChairID(userItem.getChairID());
        GD.mainScene.mainLayer.showUserFrame(viewID, false);
        GD.mainScene.UILayer.showReadyText(viewID, false);

        this.checkUserAutoLeave();
        return true;
    },

    /**
     * 用户分数改变
     * @param userItem
     * @returns {boolean}
     */
    onEventUserScore: function (userItem) {
        this._super(userItem);


        var viewID = this.switchViewChairID(userItem.getChairID());
        GD.mainScene.mainLayer.onUpdateUserInfo(viewID, {score: userItem.getUserScore()});

        return true;
    },

    /**
     * 用户状态改变
     * @param userItem
     * @returns {boolean}
     */
    onEventUserStatus: function (userItem) {
        this._super(userItem);


        var viewID = this.switchViewChairID(userItem.getChairID());
        if (userItem.getUserStatus() == gameConst.US_READY) {
            GD.mainScene.UILayer.showReadyText(viewID, true);
            
            if (viewID == GD.selfViewID){
                this.checkAutoLeave = false;
                GD.mainScene.timerLayer.killTimer();
            }

        } else {
            GD.mainScene.UILayer.showReadyText(viewID, false);
        }


        return true;
    },

    /**
     * 自己先进入 switchViewID函数才有效
     * @param userItem
     * @returns {boolean}
     */
    onEventSelfEnter: function (userItem) {
        this._super(userItem);


        return true;
    },

    /**
     * 关闭窗口
     */
    closeWindow: function () {

        app.closeSubGame();
    },


    /**
     * 链接断开，只有链接成功后，断开才会触发
     */
    onEventDisconnect: function () {
        var message = "与服务器连接断开,请关闭客户端!";
        app.buildMessageBoxLayer("通知", message, 0, this.closeWindow.bind(this));
    }
});