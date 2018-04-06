/**
 * Created by coder on 2017/5/26.
 */

var FocusSprite = cc.Sprite.extend(FocusBase).extend({

    _className: "FocusSprite",
    _classPath: "src/extend/FocusSprite.js",


    onClick: function () {
        if (this.isTouchEnabled && this.isTouchEnabled() == false)
            return;
        
        var touch = { getLocation: () => {
                return this.getFingerPosition();
            }
        };
        this.onMouseDown && this.onMouseDown(touch);

        this.onMouseUp && this.onMouseUp(touch);

        this.onTouchBeganCallBack && this.onTouchBeganCallBack(touch);

        this._touchListener && this._touchListener.onTouchEnded && this._touchListener.onTouchEnded(touch);

    }
});
