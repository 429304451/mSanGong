/**
 * Created by orange on 2016/8/15.
 */
var MainLayer = cc.Layer.extend({
	_className: "MainLayer",
	_classPath: "src/layer/MainLayer.js",


    userFrames: [],

    ctor: function () {
        this._super();

        new cc.Sprite(res.BG_PNG).to(this).pp(0.5, 0.5);
        
        this.initEx();
    },

    initEx: function () {

    	for (var i = 0; i < gameConst.GAME_PLAYER_NUM; ++i) {
            var vertical = !!(i==2 || i==5);
            this.userFrames[i] = new UserFrame(vertical).to(this).hide();
        }

        this.userFrames[0].p(470, this.ch()-70);
        this.userFrames[1].p(this.cw()/2+ 210, this.ch() - 70);
        this.userFrames[2].p(this.cw()-90, this.ch()/2);
        this.userFrames[3].p(this.cw()/2+ 210, 70);
        this.userFrames[4].p(470, 70);
        this.userFrames[5].p(90, this.ch()/2);
    },

    onUpdateUserInfo: function (viewID, info) {
        var userFrame = this.userFrames[viewID];
        userFrame && userFrame.onUpdateInfo(info);
    },

    showUserFrame: function (viewID, show) {
        var userFrame = this.userFrames[viewID];
        userFrame && userFrame.setVisible(show);
    }
});