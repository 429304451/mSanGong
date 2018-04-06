
var jsListFramework = [
	"src/extend/Storage.js",
    "src/extend/CCNodeExtend.js",
    "src/extend/SoundEngine.js",
    "src/extend/ToastSystem.js",
    "src/extend/Util.js",
    "src/extend/Native.js",
    "src/extend/ClassPool.js",
    "src/extend/md5.js",
    "src/extend/sha1.js",
    "src/extend/crypto-js.js",
    "src/extend/Encrypt.js",

    "src/extend/FocusClick.js",
    "src/extend/FocusBase.js",
    "src/extend/FocusListener.js",
    "src/extend/FocusButton.js",
    "src/extend/FocusSprite.js",
    "src/extend/FocusScrollView.js",
    "src/extend/FocusListView.js",
    "src/extend/FocusSlider.js",
    "src/extend/FocusExtend.js",
    "src/extend/FocusEditBox.js",
    "src/extend/FocusLoadingScene.js",

    "src/extend/core/ClientKernel.js",
];

var jsListGame = [
	"src/resource.js",
	"src/core/define.js",
	"src/core/ClientUserItem.js",
	"src/core/GameFrameEngine.js",
	"src/core/GameUserManager.js",

	"src/logic/GameLogic.js",
    "src/logic/GameUtil.js",
    "src/logic/Player.js",

    "src/Config.js",
    "src/Hello.js",
    "src/app.js",

    "src/scene/LoadingScene.js",
    "src/scene/MainScene.js",

    "src/GameEngine.js",
];



if (typeof module != "undefined") {
    module.exports.jsListFramework = jsListFramework;
    module.exports.jsListGame = jsListGame;
}