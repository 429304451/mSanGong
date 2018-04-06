/**
 * Created by grape on 2017/8/15.
 */
var FocusCheckBox = ccui.CheckBox.extend(FocusBase).extend({
    _className: "FocusCheckBox",
    _classPath: "src/extend/FocusCheckBox.js",

    onClick: function () {
        // this._super();
        if(cc.sys.isNative) {
            var wPos = this.getParent().convertToWorldSpace(this.ccp());
            wPos.y = mpV.h - wPos.y;
            ttutil.analogClick(wPos);
        }else {
            // this._super();
            this._releaseUpEvent();
        }
    }
});

var FocusWidget = ccui.Widget.extend(FocusBase).extend(FocusClick).extend({
    _className: "FocusWidget",
    _classPath: "src/extend/FocusWidget.js",
});

var FocusArmature = ccs.Armature.extend(FocusBase).extend(FocusClick).extend({
    _className: "FocusArmature",
    _classPath: "src/extend/FocusArmature.js",
});

var FocusNode = cc.Node.extend(FocusBase).extend(FocusClick).extend({
    _className: "FocusNode",
    _classPath: "src/extend/FocusNode.js",
});

var FocusLabelTTF = cc.LabelTTF.extend(FocusBase).extend(FocusClick).extend({
    _className: "FocusLabelTTF",
    _classPath: "src/extend/FocusLabelTTF.js"
});

var FocusText  = ccui.Text.extend(FocusBase).extend(FocusClick).extend({
    _className: "FocusText",
    _classPath: "src/extend/FocusText.js",
});