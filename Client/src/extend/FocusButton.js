/**
 * Created by coder on 2017/5/26.
 */

var FocusButton = ccui.Button.extend(FocusBase).extend({

    normalImage: null,
    selectedImage: null,
    texType: null,

    onClickCallback: null,
    onTouchCallback: null,

    _className: "FocusButton",
    _classPath: "src/extend/FocusButton.js",

    ctor: function (normalImage, selectedImage, disableImage, texType, useImage) {
        this._super(normalImage, this.useKeyboard ? "" : selectedImage, disableImage, texType);

        this.normalImage = normalImage;
        this.selectedImage = selectedImage;
        this.texType = texType || ccui.Widget.LOCAL_TEXTURE;
    },

    setNormalTexture: function () {
        this.loadTextureNormal(this.normalImage, this.texType);
    },

    setSelectedTexture: function () {
        this.loadTextureNormal(this.selectedImage, this.texType);
    },

    setNormalColor: function () {
        this.getRendererNormal().setColor(new cc.Color(255, 255, 255));
    },

    setSelectedColor: function () {
        this.getRendererNormal().setColor(new cc.Color(255, 128, 128));
    },

    setNormal: function () {
        if (this.selectedImage != null && this.selectedImage != "")
            this.setNormalTexture();
        else
            this.setNormalColor();
    },

    setSelected: function () {
        if (this.selectedImage != null && this.selectedImage != "")
            this.setSelectedTexture();
        else
            this.setSelectedColor();
    },

    addTouchEventListener: function (selector, target) {
        this._super(selector, target);

        this.onTouchCallback = target ? selector.bind(target) : selector;
    },

    addClickEventListener: function (callback) {
        this._super(callback);

        this.onClickCallback = callback;
    },

    onClick: function (canLongPress) {
        if(!this.isEnabled())
            return;
        if (this.isTouchEnabled && this.isTouchEnabled() == false)
            return;

        this.onTouchCallback && !canLongPress && this.onTouchCallback(this, ccui.Widget.TOUCH_BEGAN);
        this.onTouchCallback && !canLongPress && this.onTouchCallback(this, ccui.Widget.TOUCH_ENDED);

        this.onClickCallback && this.onClickCallback(this);
    }
});