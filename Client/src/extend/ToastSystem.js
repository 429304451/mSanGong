/**
 * Created by 黄二杰 on 2015/8/25.
 */

//toast系统
var ToastSystem = function (parent, zorder) {

    var self = this;

    //toast 队列
    self.toastQueue = [];
    self.isWork = false;

    //存在的toast队列
    self.existsToastQueue = [];

    self.clearToastQueue = function (config) {
        self.toastQueue.clear();
    };

    //填充config
    self.fillConfig = function (config) {
        var initConfig = {
            parent: null,               //为空则默认为cc.director.getRunningScene()
            zorder: 999999999,          //
            text: "toast内容",        //toast内容
            delayTime: 3,              //停留时间， 默认3秒
            fadeInTime: 0.5,           //淡入时间， 默认0.5秒
            fadeOutTime: 0.5,          //淡出时间， 默认0.5秒
            textFontSize: 34,          //内容字体大小
            bg: true,                   //是否需要背景
            float: true,                //是否浮动
            mutexTime: 1.5,           //在漂浮状态下， 默认为1.5， 非浮动， 时间为fadeInTime+fadeOutTime+delayTime
            moveTime: 1,                 //在float情况下， 飘移时间， 默认1秒
            moveDis: 100,                // 飘动距离
        };

        for (var arr in config) {
            initConfig[arr] = config[arr];
        }
        return initConfig;
    };


    /**
     * {
     *      text:"内容",              //内容
     *      delayTime:3,              //停留时间， 默认3秒
     *      fadeInTime:0.2,           //淡入时间， 默认0.2秒
     *      fadeOutTime:0.5,          //淡出时间， 默认0.5秒
     *      textFontSize:30,          //内容字体大小
     * }
     * @param config
     */
    self.buildToast = function (config) {


        if (typeof(config) == "string") {
            if (self.isExists(config)) {
                return;
            }
            self.toastQueue.push({text: config});
        }
        else {
            if (self.isExists(config.text)) {
                return;
            }
            self.toastQueue.push(config);
        }


        self.work();
        return self;
    };

    self.isExists = function (text) {

        var len = self.toastQueue.length;
        for (var i = 0; i < len; ++i) {
            var config = self.toastQueue[i];
            if (config.text == text) {
                return true;
            }
        }
        return false;
    };

    self.work = function () {

        // if (self.isWork) {
        //     return;
        // }
        if (self.toastQueue <= 0) {
            return;
        }

        self.isWork = true;
        var config = self.toastQueue.shift();
        config = self.fillConfig(config);

        //-------toast容器------------
        //
        var winSize = cc.director.getWinSize();
        //ttutil.dump(winSize);

        var parent = config.parent ? config.parent : cc.director.getRunningScene();

        if (!parent) {
            console.error("toast parent为空");
            return;
        }

        var toastContainer = new cc.Node().to(parent, config.zorder).p(winSize.width / 2, winSize.height / 2);
        toastContainer.setCascadeOpacityEnabled(true);      //使透明之类的可以影响到子结点
        //------toast文字----------------------------------------------------------------
        //var text = new cc.LabelTTF(config.text, new cc.FontDefinition({
        //    fontName: "Arial",
        //    fontSize: config.textFontSize,
        //    fillStyle: cc.color(255, 255, 255, 255)
        //}));

        var text = new cc.LabelTTF(config.text, GFontDef.fontName, config.textFontSize, cc.color(255, 255, 255, 255));


        text.to(toastContainer, 1).p(0, 0);
        //------------------------------------------------------------

        var textSize = text.getContentSize();
        //-----------如果需要背景--------------------------------------
        if (config.bg) {


            if (!cc.spriteFrameCache.getSpriteFrame("res/common981/gui-wz-ts-bj.png")) {
                var textSize = text.getContentSize();
                var layerGradient;
                if (cc.sys.isNative) {
                    layerGradient = new cc.LayerGradient(cc.color(128, 128, 255, 255), cc.color(128, 128, 255, 255), cc.p(1, 0));
                }
                else {
                    layerGradient = new cc.LayerGradient(cc.color(128, 128, 255, 255), cc.color(128, 128, 255, 255), cc.p(1, 0)
                        ,
                        [{p: 0, color: cc.color(128, 128, 255, 0)},
                            {p: 0.2, color: cc.color(128, 128, 255, 128)},
                            {p: 0.8, color: cc.color(128, 128, 255, 128)},
                            {p: 1, color: cc.color(128, 128, 255, 0)}]
                    );
                }
                layerGradient.to(toastContainer).anchor(0.5, 0.5);


                layerGradient.ignoreAnchorPointForPosition(false);
                layerGradient.setContentSize(textSize.width * 1.2, textSize.height * 1.2);

            }
            else {
                var bg = new ccui.Scale9Sprite();
                bg.initWithSpriteFrameName("res/common981/gui-wz-ts-bj.png");
                bg.size(textSize.width + 100, textSize.height + 20);
                bg.to(toastContainer).pp();
            }


        }
        ////////////-------------------------------------------------------

        //------------toast的动作--------------------------------------------

        var fadeIn = cc.fadeIn(config.fadeInTime);          //淡入
        var fadeOut = cc.fadeOut(config.fadeOutTime);       //淡出
        var delayTime = cc.delayTime(config.delayTime);       //等待

        var removeSelf = cc.removeSelf();                       //删除自身
        var action = null;

        //如果浮动
        if (config.float) {
            var action1 = cc.sequence(fadeIn, delayTime, fadeOut);
            var action2 = cc.sequence(cc.delayTime(config.mutexTime));
            var moveBy = cc.moveBy(config.moveTime, cc.p(0, config.moveDis));
            action = cc.sequence(cc.spawn(action1, action2, moveBy), removeSelf);

            self.existsToastFloat(moveBy);
        }
        else {
            action = cc.sequence(fadeIn, delayTime, fadeOut, removeSelf);
        }
        toastContainer.runAction(action);


        //结束自己的排它时间， 其它toast可以工作了
        toastContainer.onExit = (function () {

            cc.Node.prototype.onExit.apply(this);

            ttutil.arrayRemove(self.existsToastQueue, toastContainer);

            self.isWork = false;
            self.work();
        }).bind(toastContainer);

        self.existsToastQueue.push(toastContainer);


        //////////////////////////////////////////////////////////////////////////////////
    };

    self.existsToastFloat = function (floatAction) {

        for (var toastID in self.existsToastQueue) {
            var toast = self.existsToastQueue[toastID];
            toast.runAction(floatAction.clone());
        }

    }
};

//预定义了一个
var ToastSystemInstance = new ToastSystem();

// 屏幕打印   一般调试的时候用
var print_pos_diff = 15;

var mlog = function () {
    var mstr = "";
    for (var i in arguments) {
        if (i == 0) {
            mstr += arguments[i];
        } else {
            mstr += " , " + arguments[i];
        }
    }
    if (print_pos_diff > 1) {
        print_pos_diff -= 1; 
    } else {
        print_pos_diff = 15;
    }
    var scene = cc.director.getRunningScene();
    var node = new cc.LabelTTF(mstr, "Arial", 31);
    node.to(scene, 9999).p(V.w / 2, print_pos_diff * 30);
    node.setFontFillColor(cc.color(255, 255, 250));
    var action = cc.sequence(
        cc.spawn(
            cc.fadeOut(3.5),
            cc.moveBy(3.5, cc.p(0, 200))
        ),
        cc.removeSelf()
        );
    node.runAction(action);
};