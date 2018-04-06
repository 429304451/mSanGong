/**
 * Created by grape on 2017/8/22.
 */

var FocusClick = {
    _className: "FocusClick",
    _classPath: "src/extend/FocusClick.js",
    _enabled: true,            ///< Highest control of widget

    ctor: function () {
        this._super.apply(this, arguments);
    },
    //////////////
    //事件监听
    addTouchEventListener: function (selector, target) {
        this._super(selector, target);

        this.onTouchCallback = target ? selector.bind(target) : selector;
    },

    addClickEventListener: function (callback) {
        this._super(callback);

        this.onClickCallback = callback;
    },
    setEnabled: function (enabled) {
        this._enabled = enabled;
        if (this.setBright != undefined)
            this.setBright(enabled);
    },
    isEnabled: function () {
        return this._enabled;
    },

    onClick: function (canLongPress) {
        if(!this.isEnabled())
            return;

        this.onTouchCallback && !canLongPress && this.onTouchCallback(this, ccui.Widget.TOUCH_BEGAN);
        this.onTouchCallback && !canLongPress && this.onTouchCallback(this, ccui.Widget.TOUCH_ENDED);
        this.onClickCallback && this.onClickCallback(this);
    }
};