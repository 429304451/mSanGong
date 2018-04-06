/**
 * Created by Changwei on 2017/8/16
 */
var FocusScene = cc.Scene.extend(FocusBase).extend({

	ctor:function (){
		this._super();

        this.setFingerPPos({x:-1, y:0});
	},

    setSelectPanal: function () {
        // 按钮:下拉
        var showPanelBtn = this.exitLayer.showPanelBtn.isVisible() ? this.exitLayer.showPanelBtn : null;
        // 按钮:上拉
        var hidePanelBtn = this.exitLayer.hidePanelBtn.isVisible() ? this.exitLayer.hidePanelBtn : null;
        var nextFocus = showPanelBtn || hidePanelBtn;
        this.setFocusSelected(nextFocus);
    },
    refreshFingerFocus: function () {
        console.log("refreshFingerFocus");
        if (!this.useKeyboard)
            return;
        // 下拉按钮
        var showPanelBtn = this.exitLayer.showPanelBtn.isVisible() ? this.exitLayer.showPanelBtn : null;
        // 上拉按钮
        var hidePanelBtn = this.exitLayer.hidePanelBtn.isVisible() ? this.exitLayer.hidePanelBtn : null;
        // 规则
        var ruleBtn = this.UILayer.ruleBtn;
        // 准备
        var readyBtn = this.UILayer.readyBtn.isVisible() ? this.UILayer.readyBtn : null;
        // 开牌
        var openCardBtn = this.UILayer.openCardBtn.isVisible() ? this.UILayer.openCardBtn : null;
        //二维码
        var qrcodeBtn = this.UILayer.qrcodeBtn?this.UILayer.qrcodeBtn:null;
        // 自动
        var autoBtn = this.UILayer.autoBtn.isVisible() ? this.UILayer.autoBtn : null;
        // 取消自动
        var cancelBtn = this.UILayer.cancelBtn.isVisible() ? this.UILayer.cancelBtn : null;
        // ### 开始分层级
        var first_layer = showPanelBtn || hidePanelBtn;
        var second_layer = readyBtn || qrcodeBtn || openCardBtn || cancelBtn || autoBtn;
        var auto = autoBtn || cancelBtn;
        // ### 开始绑定规则
        if (showPanelBtn)
            showPanelBtn.setNextFocus(null, second_layer, null, ruleBtn);
        if (hidePanelBtn){
            this.exitLayer.refreshFingerFocus();
            this.exitLayer.layer1.setNextFocus(null, this.exitLayer.layer2, null, ruleBtn);
            this.exitLayer.layer2.setNextFocus(this.exitLayer.layer1, this.exitLayer.layer3, null, null);
            this.exitLayer.layer3.setNextFocus(this.exitLayer.layer2, this.exitLayer.layer4, null, null);
            this.exitLayer.layer4.setNextFocus(this.exitLayer.layer3, null, null, null);
        }
        ruleBtn.setNextFocus(null, second_layer, first_layer, null);
        if (readyBtn)
            readyBtn.setNextFocus(first_layer, auto, qrcodeBtn, null);
        if (openCardBtn)
            openCardBtn.setNextFocus(first_layer, auto, null, null);
        auto.setNextFocus(openCardBtn || readyBtn || first_layer, null, qrcodeBtn, null);
        qrcodeBtn.setNextFocus(readyBtn || first_layer, null, null, openCardBtn || cancelBtn || autoBtn);
    },

    onEnterTransitionDidFinish: function () {
        this._super();
        return;
        // if (!this.useKeyboard)
        //     return

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
                        if (!this.useKeyboard)
                            break;
                        console.log('onKeyPressed')
                        // 上下左右 按下状态
                        this.refreshFingerFocus();
                        var nextFocus = this.shared.selected.getNextFocus(code);

                        if (nextFocus && nextFocus.isVisible())
                            this.setFocusSelected(nextFocus);
                        break;

                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        break;
                    case cc.KEY.back:
                    case cc.KEY.escape:
                        if (this.UILayer.helpLayer) {
                            event.stopPropagation();
                        }
                        break;
                }
                
            }.bind(this),
            onKeyReleased: function (code, event) {

                switch (code) {

                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        if (!this.useKeyboard)
                            break;
                        this.shared.selected.onClick && this.shared.selected.onClick();
                        // 操作后如果不可见
                        if(!this.shared.selected.isVisible())
                        {
                            this.setSelectPanal();
                        }
                        break;
                    case cc.KEY.back:
                    case cc.KEY.escape:
                        if (this.UILayer.helpLayer) {
                            this.UILayer.helpLayer.onDelete();
                            event.stopPropagation();
                        }
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
