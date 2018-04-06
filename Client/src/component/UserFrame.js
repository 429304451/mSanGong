/**
 * Created by orange on 2016/8/15.
 * 玩家信息
 */

var UserFrame = cc.Sprite.extend({
	_className: "UserFrame",
	_classPath: "src/component/UserFrame.js",

    isVertical: false,          //垂直还是水平背景框
    face: null,                 //头像
    gold: null,                 //金币
    name: null,                 //名字
    vipIcon: null,              //等级图标

    ctor: function (isVertical) {
        this.isVertical = !!isVertical;
        var bg = !!isVertical ? "#sangong/g/face_frame_v.png" : "#sangong/g/face_frame_h.png";
        this._super(bg);

        this.initEx();
    },

    initEx: function () {
        if (this.isVertical) {
            this.gold = new cc.LabelAtlas("9876543210", res.NUM_USER_GOLD, 19, 30, "0123456789").to(this).anchor(0, 0.5).p(32, 28);
            this.gold.setScale(0.65);

            this.name = new cc.LabelTTF("平野绫", GameFontDef.fontName, GameFontDef.fontSize - 4).to(this).p(this.cw() / 2, this.ch() - 30);
            this.name.setColor(GameFontDef.fillStyle);
            //
            this.face = new cc.Sprite().to(this).p(this.cw() / 2, this.ch()/2-1);
            this.face.setScale(0.58);

            this.vipIcon = new cc.Sprite("#gui-vip-icon-0.png").to(this).pp(0.5, 0.28);
            this.vipIcon.num = new cc.Sprite("#gui-vip-num-0-hui.png").to(this.vipIcon).pp(0.5, 0.6);
            this.vipIcon.setScale(0.6);

        } else {
            this.gold = new cc.LabelAtlas("9876543210", res.NUM_USER_GOLD, 19, 30, "0123456789").to(this).anchor(0, 0.5).p(this.cw() / 2, 28);
            this.gold.setScale(0.65);

            this.name = new cc.LabelTTF("平野绫", GameFontDef.fontName, GameFontDef.fontSize - 4).to(this).anchor(0, 0.5).p(this.cw() / 2 - 30, this.ch() - 40);
            this.name.setColor(GameFontDef.fillStyle);

            this.face = new cc.Sprite().to(this).p(55, this.ch()/2-1);
            this.face.setScale(0.58);

            this.vipIcon = new cc.Sprite("#gui-vip-icon-0.png").to(this).pp(0.75, 0.28);
            this.vipIcon.num = new cc.Sprite("#gui-vip-num-0-hui.png").to(this.vipIcon).pp(0.5, 0.6);
            this.vipIcon.setScale(0.6);
        }
    },

    onUpdateInfo: function (info) {
        (info.name!=null) && this.setUserName(info.name);
        (info.faceID!=null) && this.setHead(info.faceID);
        (info.memberOrder!=null) && this.setVIPLevel(info.memberOrder);
        (info.score!=null) && this.gold.setString(info.score);
    },

    setHead: function (faceID) {
        if (faceID==null || faceID<0 || faceID>10) return;
        this.face.display(ttutil.getHeadIconName(faceID));
    },

    setUserName: function (name) {
        if (name==null) return;
        this.name.setString(GameUtil.replacePoint(name, 15));
    },

    setVIPLevel: function (level) {
        this.vipIcon.display("#gui-vip-icon-" + level + ".png");
        this.vipIcon.num.display("#gui-vip-num-" + level + ".png");
        this.vipIcon.pp(0.3, 0.23);
        if (this.isVertical) {
            this.vipIcon.pp(0.7, 0.35);
        }

        if (level < 6) {
            this.vipIcon.num.pp(0.5, 0.6);
            if (level === 0) {
                this.vipIcon.num.display("#gui-vip-num-" + level + "-hui.png");
            }
        } else {
            this.vipIcon.num.pp(0.5, 0.4);
        }
    }
});