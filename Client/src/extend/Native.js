/**
 * Created by 黄二杰 on 2016/2/1.
 */



var native = {};

native.INIT_SCREEN_ORIENTATION = 0;
//横屏
native.SCREEN_ORIENTATION_LANDSCAPE = 0;
//竖屏
native.SCREEN_ORIENTATION_PORTRAIT = 1;
//其它自己看API
/////////////////////////////////////////////////////////
//吐丝 时间长短
native.toastLengthShort = 0;
native.toastLengthLong = 1;

//////////////////////////////////////////////////
//showConfirmDialog的回调函数引用
native.showConfirmDialogCallback = null;

//showQueryDialog的确定回调函数引用
native.showQueryDialogConfirmCallback = null;
//showQueryDialog的取消回调函数引用
native.showQueryDialogCancelCallback = null;

//微信登录后， 获得code码后的回调函数
native.onWXLoginCodeJSCF = null;

//微信分享后的回调函数
native.onWXShareJSCF = null;

/**
 * 设置屏幕方向
 * @param requestedOrientation
 */
native.setRequestedOrientation = function (requestedOrientation) {
    cc.log("native.setRequestedOrientation\t" + requestedOrientation);
    if (native.INIT_SCREEN_ORIENTATION == requestedOrientation) return;

    if (cc.sys.platform == cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "setRequestedOrientation", "(I)V", requestedOrientation);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "setOrientation:", requestedOrientation);
    }

    native.INIT_SCREEN_ORIENTATION = requestedOrientation;
};
















