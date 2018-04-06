/**
 * Created by coder on 2017/6/8.
 */

var FocusSlider = cc.Sprite.extend(FocusBase).extend({

    leftKeyPressed: false,
    rightKeyPressed: false,

    deltaPercent: 0.02,

    isTouch: false,

    oldTextureRect: null,

    onValueChanged: null,

    _className: "FocusSlider",
    _classPath: "src/extend/FocusSlider.js",

    ctor: function () {
        this._super.apply(this, arguments);

        this.oldTextureRect = this.getTextureRect();

        var _percent = 1;

        this.setPercent = function (percent) {

            percent = Math.clamp(percent, 0, 1);

            var width = this.oldTextureRect.width * percent;

            this.setTextureRect(cc.rect(this.oldTextureRect.x, this.oldTextureRect.y, width, this.oldTextureRect.height), this.isTextureRectRotated(), cc.size(width, this.oldTextureRect.height));

            this.onValueChanged && this.onValueChanged(percent);

            _percent = percent;
        };

        this.getPercent = function () {
            return _percent;
        };
    },

    onEnterTransitionDidFinish: function () {
        this._super();

        var keyboardEventListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                if (!this.isVisibleInHierarchy())
                    return;

                if (this.shared.selected != this)
                    return;

                switch (code) {
                    case cc.KEY.left:
                    case cc.KEY.dpadLeft:
                        this.leftKeyPressed = true;
                        this.setPercent(this.getPercent() - this.deltaPercent);
                        event.stopPropagation();
                        break;

                    case cc.KEY.right:
                    case cc.KEY.dpadRight:
                        this.leftKeyPressed = true;
                        this.setPercent(this.getPercent() + this.deltaPercent);
                        event.stopPropagation();
                        break;
                }
            }.bind(this),
            onKeyReleased: function (code, event) {

                if (!this.isVisibleInHierarchy())
                    return;

                if (this.shared.selected != this)
                    return;

                switch (code) {
                    case cc.KEY.left:
                    case cc.KEY.dpadLeft:
                        this.leftKeyPressed = false;
                        event.stopPropagation();
                        break;

                    case cc.KEY.right:
                    case cc.KEY.dpadRight:
                        this.leftKeyPressed = false;
                        event.stopPropagation();
                        break;
                }
            }.bind(this)
        });
        cc.eventManager.addListener(keyboardEventListener, this);

        var mouseEventListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseDown: function (event) {
                var locationInNode = this.convertToNodeSpace(event.getLocation());
                var rect = cc.rect(0, 0, this.oldTextureRect.width, this.oldTextureRect.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    this.isTouch = true;
                    mouseEventListener.onMouseMove(event);
                }
            }.bind(this),
            onMouseMove: function (event) {

                if (!this.isTouch)
                    return;

                var locationInNode = this.convertToNodeSpace(event.getLocation());
                var width = Math.min(locationInNode.x, this.oldTextureRect.width);

                this.setPercent(width / this.oldTextureRect.width);

                event.stopPropagation();
            }.bind(this),
            onMouseUp: function (event) {

                if (!this.isTouch)
                    return;

                this.isTouch = false;
                event.stopPropagation();
            }.bind(this)
        });
        cc.eventManager.addListener(mouseEventListener, this);
    },

    setFingerPosition: function () {
        this.shared.finger.p(this.oldTextureRect.width / 2, this.oldTextureRect.height / 2);
    }
});
