/**
 * Created by grape on 2017/8/15.
 */
var FocusEditBox = cc.EditBox.extend(FocusBase).extend(FocusClick).extend({
    isTouch: false,

    _className: "FocusEditBox",
    _classPath: "src/extend/FocusEditBox.js",

    ctor: function () {
        this._super.apply(this, arguments);
        this.clickState = false;

        this.fingerPPos = {x: 0.5, y: 0.3};
        this.fingerZoder = 100;
    },
    onClick:function () {
        if(cc.sys.isNative) {
            var wPos = this.getParent().convertToWorldSpace(this.ccp());
            wPos.y = mpV.h - wPos.y;
            ttutil.analogClick(wPos);
        }else {
            if (this.clickState == true) {
                this._renderCmd._endEditing();
                this.clickState = false;
            } else {
                this._onTouchEnded();
                this.clickState = true;
            }
        }
    },
    onExit: function () {
        this._super();
        // cc.eventManager.removeListeners(this);
    }
});