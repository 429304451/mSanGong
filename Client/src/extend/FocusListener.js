/**
 * Created by grape on 2017/8/31.
 */
/**
 * Created by coder on 2017/6/6.
 */
var FocusListener = cc.Scene.extend(FocusBase).extend({

    isMenuMode: false,

    _className: "FocusListener",
    _classPath: "src/scene/FocusListener.js",

    ctor:function (){
        this._super();
        //TV 清空按钮数组 可能冗余
        // this.clearDefaultSelectArray();
        // mpApp.bindBackButtonEvent(this);
        // this.setFingerPPos({x:-1, y:0});
    },
    /*
    // 如果出现特殊情况按钮不见了 废弃
    setSelectDefault: function () {
    },

    //暂停键盘， 保留手指到场景上
    pauseFocus: function(){
        this.setFocusSelected(this);
    },

    refreshFocus: function () {
    },
    */
    onEnterTransitionDidFinish: function () {
        this._super();

        if (!this.useKeyboard)
            return;

        this.setSelectDefault();
        this.keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {
                console.log("onKeyPressed, cc.KEY",  code);
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        this.refreshFocus();
                        var nextFocus = this.shared.selected.nextFocusArray[code];
                        this.setFocusSelected(nextFocus);
                        break;
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }

            }.bind(this),
            onKeyReleased: function (code, event) {
                console.log("onKeyReleased, cc.KEY", code);
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        if (this.shared.selected)
                            this.shared.selected.onNextClick(code);
                        break;
                    case cc.KEY.dpadCenter:
                    case cc.KEY.enter:
                        this.shared.selected.onClick && this.shared.selected.onClick();
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }
            }.bind(this)
        });
        cc.eventManager.addListener(this.keyboardListener, -1);
    },
    onExit: function () {
        this._super();
        if (this.keyboardListener)
            cc.eventManager.removeListener(this.keyboardListener);
    }
});