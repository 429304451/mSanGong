/**
 * Created by Changwei on 2017/8/07
 */
var FocusLoadingScene = cc.Scene.extend(FocusBase).extend({

    _className: "FocusLoadingScene",
    _classPath: "src/extend/FocusLoadingScene.js",

	ctor:function (){
		this._super();
	},
    refreshFingerFocus: function () {
        if (!this.useKeyboard)
            return;
    },
	onEnterTransitionDidFinish: function () {

		this._super();

        if (!this.useKeyboard)
            return;

        this.keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        // 上下左右 按下状态
                        this.refreshFingerFocus();
                        var nextFocus = this.shared.selected.getNextFocus(code);
                        if (nextFocus && nextFocus.isVisible())
                            this.setFocusSelected(nextFocus);
                        break;
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        break;
                }
                
            }.bind(this),
            onKeyReleased: function (code, event) {

                switch (code) {
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                    	this.shared.selected.onClick && this.shared.selected.onClick();
                        break;
                }
            }.bind(this),
        });
        
        cc.eventManager.addListener(this.keyboardListener, -1);
    },
    onExit: function () {
        this._super();
        if (this.keyboardListener)
            cc.eventManager.removeListener(this.keyboardListener); 
    }
});

