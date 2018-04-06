var GD = {
    gameEngine: null,               //游戏场景
    mainScene: null,                //主场景
    gameLogic: new GameLogic(),     //逻辑
    selfViewID: 3                   //自己的视图位置
};
var G_OPEN_CONNECT_SERVER = true;
var G_PLATFORM_TV = false;

// 游戏通用资源
var commonRes = {
    btnClick: "res/allcommon/btnClick.mp3",
    winCoin: "res/allcommon/mega_win_coins.mp3",
    commonPlist: "res/allcommon/common.plist",
};

var app = {

    plazaArgs: {},           //大厅传过来的参数
    //框架加载完JsFiles里的JS文件后， 会调用此函数， 其它都没做
    runMain: function (userID, ip, port, uuid, other /*{}*/) {

        if(cc.sys.isNative)
            cc.Image.setPVRImagesHavePremultipliedAlpha(true);

        this.plazaArgs.userID = userID;
        this.plazaArgs.ip = ip;
        this.plazaArgs.port = port;

        this.plazaArgs.uuid = uuid;     //用来验证这用户是不是被假冒
        this.plazaArgs.other = other;


        /////////////////////////////////////////////////////////////////////////////////////////////
        var URL = "wss://" + this.plazaArgs.ip + ":" + this.plazaArgs.port;
        var clientKernel = new ClientKernel(this.plazaArgs.userID, this.plazaArgs.uuid);
        var gameEngine = new GameEngine();


        clientKernel.startConnect(URL, gameEngine);

        GD.clientKernel = clientKernel;
        GD.gameEngine = gameEngine;

        ////////////////////////////////////////////////////////////////////////////////////////////

        var self = this;
        cc.loader.load(g_loading_resources, function () {
            self.runLoadingScene();
        })
    },
    runLoadingScene: function () {

        var loadingScene = new LoadingScene(g_resources, this.runMainScene.bind(this));
        typeof mpApp != "undefined" && mpApp.bindBackButtonEvent(loadingScene, this.closeSubGame.bind(this), "您确定要退出子游戏吗");
        cc.director.runScene(loadingScene);
    },

    runMainScene: function () {


        var mainScene = new MainScene();

        mainScene.clientKernel = GD.clientKernel;
        GD.mainScene = mainScene;
        GD.clientKernel.onClientReady();
        mainScene.retain();

        typeof mpApp != "undefined" && mpApp.bindBackButtonEvent(mainScene, this.closeSubGame.bind(this), "您确定要退出子游戏吗");

        //这边不能运行， 要等到接收到场景消息后才能运行， 因为还原场景可能要一段时间， 为了给用户更好的 体验， 这段时间还是继续显示加载动画
        // cc.director.pushScene(mainScene);
        
    },

    /**
     * 大厅会调用 该函数尝试运行 房间场景 ， 如果该函数返回false, 则大厅会默认进入 第一个房间
     * 运行房间场景
     * @param moduleID
     * @param roomInfoArray
     */
    runRoomScene: function (moduleID, roomInfoArray) {

        //这个先返回false, 直接进入第一个房间
        //return false;

        //
        //加载资源

        cc.spriteFrameCache.addSpriteFrames(res.GAME_PLIST);
        // ccs.armatureDataManager.addArmatureFileInfo("res/sangong/effect/fangjianxuanzhe_buyu.ExportJson");
        var scene = new RoomScene(moduleID, roomInfoArray);
        cc.director.pushScene(scene);

        //返回true， 大厅才不会调用 默认动作
        return true;
    },

    //创建一个消息框层
    buildMessageBoxLayer: function (title, message, type, sureCallback, cancelCallback, parent) {
        if (typeof MPMessageBoxLayer != "undefined") {
            new MPMessageBoxLayer(title, message, type, sureCallback, cancelCallback).to(parent || cc.director.getRunningScene(), 1000);
        }
        else {
            ToastSystemInstance.buildToast({
                text: "这本是个messageBox!" + "title:" + title + " message:" + message,
                parent: parent
            });
            if (!cancelCallback && sureCallback) {
                cc.director.getRunningScene().runAction(cc.sequence(cc.delayTime(3), cc.callFunc(sureCallback)));
            }

        }
    },

    //关闭子游戏
    closeSubGame: function () {

        if (GD.gameEngine) {
            GD.gameEngine.stopWebSocket();
        }
        GD.activeExit = true;

        //因为一开始GD.mainScene就多retain了一次， 收到场景消息时会release, 如果玩家在还没收到场景消息时， 就已经要closeSubGame， 就要调用 GD.mainScene.release()一次， 
        if (GD.mainScene && !GD.mainScene.isRunning()) {
            GD.mainScene.onExit();  //手动调出
            GD.mainScene.cleanup();  //手动清理
            GD.mainScene.release();
        }

        if (typeof mpApp != "undefined") {
            mpApp.comeToPlaza();
        }
        else {
            cc.director.end();
        }

    },
    //得到子游戏配置
    getConfig: function () {

        return {
            //设计分辨率
            designResolutionSize: cc.size(V.w, V.h),
            //设置是横屏还是竖屏 （native.SCREEN_ORIENTATION_PORTRAIT 竖屏）（native.SCREEN_ORIENTATION_LANDSCAPE 横屏）
            requestedOrientation: native.SCREEN_ORIENTATION_LANDSCAPE,
            //屏幕适配模式
            resolutionPolicy: cc.ResolutionPolicy.SHOW_ALL,
        };

    },
};
