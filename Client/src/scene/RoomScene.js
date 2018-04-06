/**
 * Created by Apple on 2016/7/5.
 */

var ParentScene = typeof MPBaseRoomScene == "undefined" ? cc.Scene : MPBaseRoomScene;
var RoomScene = ParentScene.extend({
	_className: "RoomScene",
	_classPath: "src/scene/RoomScene.js",


    moduleID: null,
    roomInfoArray: null,

    listView: null,

    bgSprite: null,

    ctor: function (moduleID, roomInfoArray) {
        this._super(moduleID, roomInfoArray);

        this.roomInfoArray = roomInfoArray;
        this.moduleID = moduleID;

        // this.roomInfoArray = [{enterScore: 0}, {enterScore: 6000},{enterScore: 60000},{enterScore: 600000},{enterScore: 6000000}];
        // new cc.Sprite("#sangong/g/room/3.png").to(this).pp(0.5, 0.5);
        this.initEx();
    },


    initEx: function () {

        this.size(V.w, V.h);

        // this.bgSprite = new cc.Sprite(res.BG_PNG).to(this).pp().qscale(1.1);

        // new cc.Sprite("#sangong/g/room/left.png").to(this).anchor(0, 0).pp(0, 0);
        // new cc.Sprite("#sangong/g/room/right.png").to(this).anchor(1, 0).pp(1, 0);
        this.bgSprite = new cc.Sprite("res/sangong/room/bg1.png").to(this).pp();
        new cc.Sprite("res/sangong/room/bg2.png").to(this).pp();

        this.listView = new FocusListView().to(this).anchor(0.5, 0.5).pp(0.5, 0.5);


        this.listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this.listView.setTouchEnabled(true);
        this.listView.setBounceEnabled(true);
        this.listView.setClippingEnabled(true);
        this.listView.setContentSize(1000, V.h);
        this.listView.setItemsMargin(30);
        // this.listView.addEventListener(this.onRoomEvent.bind(this));


        for (var i = 0; i < this.roomInfoArray.length; i++) {

            var widget = new FocusWidget().size(226, 331);

            this.buildItem(this.roomInfoArray[i].roomID, this.roomInfoArray[i].enterScore).to(widget).pp(0.5, 0.5);

            this.listView.pushBackCustomItem(widget);
            widget.roomInfo = this.roomInfoArray[i];

            widget.setTouchEnabled(true);

            widget.addTouchEventListener(this.touchEventListener);
        }

        // this.qscale(0.5);
    },

    //进入时每次都设置一下分辨率
    onEnter: function () {
        this._super();
        if (typeof mpApp != "undefined") {
            mpApp.switchScreen(native.SCREEN_ORIENTATION_LANDSCAPE, cc.size(V.w, V.h), cc.ResolutionPolicy.SHOW_ALL);
        }
        else {
            cc.view.setFrameSize(V.w, V.h);
            cc.view.setDesignResolutionSize(V.w, V.h, cc.ResolutionPolicy.SHOW_ALL);
        }
    },

    touchEventListener: function (sender, type) {

        if (type == ccui.Widget.TOUCH_BEGAN) {
            sender.setScale(1.05);
        }
        else if (type == ccui.Widget.TOUCH_ENDED) {


            cc.log("room index " + sender.roomInfo);

            if (typeof mpEvent != "undefined") {
                cc.eventManager.dispatchCustomEvent(mpEvent.EnterGameRoom, sender.roomInfo);
            }
            sender.setScale(1.0);
        }
        else if (type == ccui.Widget.TOUCH_CANCELED) {
            sender.setScale(1.0);
        }

    },

    buildItem: function (roomID, enterScore) {
        // var roomArmature = new ccs.Armature("fangjianxuanzhe_buyu");
        // roomArmature.getAnimation().play("Animation" + index);
        // roomArmature.size(200, 400);
        // 140 50000   141 500000   142 1250000   143 2500000
        if (roomID==3) {
            enterScore = null;
            roomID = roomID + 98;
        }
        var roomSprite = new RoomSprite(roomID, enterScore);

        return roomSprite;
    }

});


var RoomSprite = cc.Sprite.extend({
	_className: "RoomSprite",
	_classPath: "src/scene/RoomScene.js",


    ctor: function (roomID, enterScore) {
        this._super("#sangong/g/room/" + (roomID-98) + ".png");

        if (enterScore==null) return;

        var str = GameUtil.formateEnterScore(enterScore);
        new cc.LabelBMFont(str, res.ROOM_FONT).to(this).anchor(0.5, 0).pp(0.5, 0.05);
    }
});