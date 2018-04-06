/**
 * Created by coder on 2017/5/26.
 */

var FocusScrollView = ccui.ScrollView.extend(FocusBase).extend({

    upKeyPressed: false,
    downKeyPressed: false,
    leftKeyPressed: false,
    rightKeyPressed: false,

    deltaPercent: null,
    addTime: 0,

    _className: "FocusScrollView",
    _classPath: "src/extend/FocusScrollView.js",

    // stopPropagation: function (code, event) {
    //     if (!this.isVisibleInHierarchy())
    //         return;
    //     switch (code) {
    //         case cc.KEY.up:
    //         case cc.KEY.dpadUp:
    //         case cc.KEY.down:
    //         case cc.KEY.dpadDown:
    //         case cc.KEY.left:
    //         case cc.KEY.dpadLeft:
    //         case cc.KEY.right:
    //         case cc.KEY.dpadRight:
    //             event.stopPropagation();
    //             break;
    //     }
    // },
    // 水平移动
    scrollHorizontal: function (direction) {
        var innerPos = this.getInnerContainerPosition();
        var innerSize = this.getInnerContainerSize();
        var contenSize = this.getContentSize();
        var mWidth = innerSize.width - contenSize.width;
        // 说明整个界面已经能完全显示了  不需要移动
        if (mWidth <= 0)
            return;
        var delta = 100 * (contenSize.width / innerSize.width);
        if (this.deltaPercent)
            delta = this.deltaPercent;
        var nowPercent = 100 * (innerSize.width + innerPos.y - contenSize.width) / mWidth;
        // 每次移动到底要多少才算正常  如果长条的 2% 可以  如果短条的就太不正常了  所以这里做一步计算  当然如果你设定了固定 deltaPercent 按你的来
        nowPercent -= delta * direction;
        if (nowPercent < 0.0) {
            nowPercent = 0.0; 
        } else if (nowPercent > 100.0) {
            nowPercent = 100.0
        }
        this.scrollToPercentHorizontal(nowPercent, 0.15, false);
    },
    // 竖直移动 鼠标 上下键
    scrollVertical: function (direction) {
        var innerPos = this.getInnerContainerPosition();
        var innerSize = this.getInnerContainerSize();
        var contenSize = this.getContentSize();
        var mHeight = innerSize.height - contenSize.height;
        // 说明整个界面已经能完全显示了  不需要移动
        if (mHeight <= 0)
            return;
        var delta = 100 * (contenSize.height / innerSize.height);
        if (this.deltaPercent)
            delta = this.deltaPercent;
        var nowPercent = 100 * (innerSize.height + innerPos.y - contenSize.height) / mHeight;
        // 每次移动到底要多少才算正常  如果长条的 2% 可以  如果短条的就太不正常了  所以这里做一步计算  当然如果你设定了固定 deltaPercent 按你的来
        nowPercent -= delta * direction;
        if (nowPercent < 0.0) {
            nowPercent = 0.0; 
        } else if (nowPercent > 100.0) {
            nowPercent = 100.0
        }
        this.scrollToPercentVertical(nowPercent, 0.15, false);
    },
    onEnterTransitionDidFinish: function () {
        this._super();
        // 竖直方向 1  水平方向  2
        this.m_direction = this.getDirection();

        var mouseEventListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseScroll: function (event) {
                var scrollY = event.getScrollY();
                if (this.m_direction == 1) {
                    this.scrollVertical(scrollY / 300);
                }

                event.stopPropagation();
            }.bind(this)
        });
        cc.eventManager.addListener(mouseEventListener, this);

        if (!this.useKeyboard)
            return;

        var keyboardEventListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.dpadUp:
                        this.upKeyPressed = true;
                        if (this.m_direction == 1) {
                            this.scrollVertical(1);
                        }
                        break;
                    case cc.KEY.down:
                    case cc.KEY.dpadDown:
                        this.downKeyPressed = true;
                        if (this.m_direction == 1) {
                            this.scrollVertical(-1);
                        }
                        break;
                    case cc.KEY.left:
                    case cc.KEY.dpadLeft:
                        this.leftKeyPressed = true;
                        if (this.m_direction == 2) {
                            this.scrollHorizontal(1);
                        }
                        break;
                    case cc.KEY.right:
                    case cc.KEY.dpadRight:
                        this.rightKeyPressed = true;
                        if (this.m_direction == 2) {
                            this.scrollHorizontal(-1);
                        }
                        break;
                }

                // this.stopPropagation(code, event);
            }.bind(this),
            onKeyReleased: function (code, event) {
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.dpadUp:
                        this.upKeyPressed = false;
                        break;
                    case cc.KEY.down:
                    case cc.KEY.dpadDown:
                        this.downKeyPressed = false;
                        break;

                    case cc.KEY.left:
                    case cc.KEY.dpadLeft:
                        this.leftKeyPressed = false;
                        break;
                    case cc.KEY.right:
                    case cc.KEY.dpadRight:
                        this.rightKeyPressed = false;
                        break;
                }

                // this.stopPropagation(code, event);
            }.bind(this)
        });
        cc.eventManager.addListener(keyboardEventListener, this);
        
    },
});