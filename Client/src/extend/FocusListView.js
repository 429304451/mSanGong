/**
 * Created by changwei on 2017/8/23.
 */

var FocusListView = ccui.ListView.extend(FocusBase).extend({
    upKeyPressed: false,
    downKeyPressed: false,
    leftKeyPressed: false,
    rightKeyPressed: false,

    deltaPercent: 2,

    _className: "FocusListView",
    _classPath: "src/extend/FocusListView.js",
    // 事件吞噬
    stopPropagation: function (code, event) {
        if (!this.isVisibleInHierarchy())
            return;

        switch (code) {
            case cc.KEY.up:
            case cc.KEY.dpadUp:
            case cc.KEY.down:
            case cc.KEY.dpadDown:
            case cc.KEY.left:
            case cc.KEY.dpadLeft:
            case cc.KEY.right:
            case cc.KEY.dpadRight:
                event.stopPropagation();
                break;
        }
    },

    onEnterTransitionDidFinish: function () {
        this._super();
        if (!this.useKeyboard)
            return;
        this.bounceEnabled = false;
        // ccui.ScrollView.DIR_VERTICAL 这里竟然是undefined ?
        // this.m_direction = this.getDirection();

        var keyboardEventListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.dpadUp:
                        this.upKeyPressed = true;
                        break;

                    case cc.KEY.down:
                    case cc.KEY.dpadDown:
                        this.downKeyPressed = true;
                        break;

                    case cc.KEY.left:
                    case cc.KEY.dpadLeft:
                        this.leftKeyPressed = true;
                        break;

                    case cc.KEY.right:
                    case cc.KEY.dpadRight:
                        this.rightKeyPressed = true;
                        break;
                }

                // this.stopPropagation(code, event);
            }.bind(this),
            onKeyReleased: function (code, event) {
                this.reFocusSync(code);
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

    reFocusSync: function (code) {
        switch (code) {
            case cc.KEY.up:
            case cc.KEY.dpadUp:
            case cc.KEY.down:
            case cc.KEY.dpadDown:
            case cc.KEY.left:
            case cc.KEY.dpadLeft:
            case cc.KEY.right:
            case cc.KEY.dpadRight:
                var temp = this.isOnFinger();
                if (temp != -1) {
                    this.scrollToItem(temp, cc.p(0.5, 0.5), cc.p(0.5, 0.5));
                }
                break;
        }
    },

    isOnFinger: function () {
    	var count = -1;
		var arrayItems = this.getItems();
		for (var i = 0; i < arrayItems.length; i++) {
            var item = arrayItems[i];
            if (this.shared.selected == item) {
            	count = i;
            	break;
            }
        }
    	return count;
    },
    // 这里需要传入上下要去的地方  至于左右就
    bindNextFocus: function (up, down) {
        var arrayItems = this.getItems();
        for(var i = 0; i < arrayItems.length; i++){
            arrayItems[i].setNextFocus(up, down, i == 0?null:arrayItems[i - 1], i == arrayItems.length?null:arrayItems[i + 1]);
        }
    }

});