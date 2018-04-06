/**
 * Created by coder on 2017/6/6.
 */

var FocusBase = {

    useKeyboard: null,
    nextFocusArray: null,

    fingerPPos: null,
    fingerZoder: null,

    shared: {
        selected: null,
        finger: null,
        lastSelected: null,
        defaultSelect: null
    },

    _onClickUp: null,
    _onClickDown: null,
    _onClickLeft: null,
    _onClickRight: null,

    _className: "FocusBase",
    _classPath: "src/extend/FocusBase.js",

    ctor: function () {
        this._super.apply(this, arguments);
        this.nextFocusArray = {};
        this.defaultSelectArray = [];
        this.fingerPPos = {x: 0.5, y: 0.5};
        this.fingerZoder = 0;

        this.useKeyboard = this.isTVDevice();
    },
    reCtor: function(){
        this.nextFocusArray = {};
        this.defaultSelectArray = [];
        this.fingerPPos = {x: 0.5, y: 0.3};
        this.fingerZoder = 0;
    },
    onNextClick: function (code) {
        console.log("onNextClick",code);
        switch (code) {
            case cc.KEY.up:
            case cc.KEY.dpadUp:
                if (this._onClickUp != null)
                    this._onClickUp();
                break;
            case cc.KEY.dpadDown:
            case cc.KEY.down:
                if (this._onClickDown != null)
                    this._onClickDown();
                break;
            case cc.KEY.left:
            case cc.KEY.dpadLeft:
                
                if (this._onClickLeft)
                    this._onClickLeft();
                break;
            case cc.KEY.right:
            case cc.KEY.dpadRight:
                if (this._onClickRight)
                    this._onClickRight();
                break;
        }
    },

    setNextFocus: function (up, down, left, right) {
        this.nextFocusArray[cc.KEY.up] = up;
        this.nextFocusArray[cc.KEY.down] = down;
        this.nextFocusArray[cc.KEY.left] = left;
        this.nextFocusArray[cc.KEY.right] = right;

        this.nextFocusArray[cc.KEY.dpadUp] = up;
        this.nextFocusArray[cc.KEY.dpadDown] = down;
        this.nextFocusArray[cc.KEY.dpadLeft] = left;
        this.nextFocusArray[cc.KEY.dpadRight] = right;
    },

    setNextFocusUp: function (up, bothway) {
        this.nextFocusArray[cc.KEY.up] = up;
        this.nextFocusArray[cc.KEY.dpadUp] = up;

        if (bothway) {
            up.nextFocusArray[cc.KEY.down] = this;
            up.nextFocusArray[cc.KEY.dpadDown] = this;
        }
    },

    setNextFocusDown: function (down, bothway) {
        this.nextFocusArray[cc.KEY.down] = down;
        this.nextFocusArray[cc.KEY.dpadDown] = down;

        if (bothway) {
            down.nextFocusArray[cc.KEY.up] = this;
            down.nextFocusArray[cc.KEY.dpadUp] = this;
        }
    },

    setNextFocusLeft: function (left, bothway) {
        this.nextFocusArray[cc.KEY.left] = left;
        this.nextFocusArray[cc.KEY.dpadLeft] = left;

        if (bothway) {
            left.nextFocusArray[cc.KEY.right] = this;
            left.nextFocusArray[cc.KEY.dpadRight] = this;
        }
    },

    setNextFocusRight: function (right, bothway) {
        this.nextFocusArray[cc.KEY.right] = right;
        this.nextFocusArray[cc.KEY.dpadRight] = right;

        if (bothway) {
            right.nextFocusArray[cc.KEY.left] = this;
            right.nextFocusArray[cc.KEY.dpadLeft] = this;
        }
    },

    getNextFocus: function (keycode) {
        return this.nextFocusArray[keycode];
    },

    //暂停键盘， 保留手指到场景上
    pauseFocus: function(){
        this.setFocusSelected(this);
    },

    setFocusSelected: function (target) {
        // if (!this.useKeyboard || target == null)
        //     return;
        if (!this.isTVDevice() || target == null)
            return;

        if (this.shared.selected == target)
            return;

        try {
            console.log("setFocusSelected " + JSON.stringify(target));
        }
        catch (e) {
            console.log("setFocusSelected " + target);
        }

        this.shared.finger.exto(target, target.fingerZoder);

        // 动作被停止之后的恢复操作
        if(!this.shared.finger.getActionByTag(1))
            this.runCycleAction(this.shared.finger);

        target.setFingerPosition();
        this.shared.lastSelected = this.shared.selected || target;
        this.shared.selected = target;
        //子游戏适配
        this.selectedNoed = target;
        // 手指
        if(this.isTVDevice())
            this.shared.finger.show();
        else
            this.shared.finger.hide();
    },

    createTvFinger: function () {
        if(this.shared.finger)
            return;
        this.shared.finger = new cc.Sprite("#tvfinger/five/10001.png");
        this.runCycleAction(this.shared.finger);
        this.shared.finger.retain();
    },

    // 手指循环动作
    runCycleAction: function (node) {
        var allFrame = [];
        for(var i = 1; i <= 6; i++){
            var str = "tvfinger/five/1000" + i+ ".png";
            var allf = cc.spriteFrameCache.getSpriteFrame(str);
            allFrame.push(allf);
        }
        var cycleAction = cc.repeatForever(cc.animate(new cc.Animation(allFrame, 0.2)));
        cycleAction.setTag(1);
        node.runAction(cycleAction);
    },

    isTVDevice: function () {
        return G_PLATFORM_TV;
    },

    restoreLastSelected: function () {
        this.setFocusSelected(this.shared.lastSelected);
    },

    getFingerPosition: function () {
        return this.shared.selected.convertToWorldSpace(this.shared.finger.getPosition());
    },

    setFingerPPos: function (pPos) {
        this.fingerPPos = pPos;
    },

    //手指在结点上层级
    setFingerZoder: function (zoder) {
        this.fingerZoder = zoder;
    },

    setFingerPosition: function () {
        this.shared.finger.pp(this.fingerPPos);
    },

    pushDefaultSelectArray: function (obj) {
        this.defaultSelectArray.push(obj);
    },

    popDefaultSelectArray: function(){
        if(this.defaultSelectArray.length == 0)return;
        this.setFocusSelected(this.defaultSelectArray.pop());
    },

    clearDefaultSelectArray: function () {
        this.defaultSelectArray = [];
    },

};

