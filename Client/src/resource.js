// var res = {
//     HelloWorld_png : "res/HelloWorld.png",
// };
var isUseFrameWork = true;

var res = {
	HelloWorld_png : "res/HelloWorld.png",
    // EXIT_PLIST: "res/sangong/exit.plist",
    BG_PNG: "res/sangong/bg.jpg",
    GAME_PLIST: "res/sangong/game.plist",

    WINNER_JSON: "res/sangong/effect/winner/winner.json",
    TIMER_JSON: "res/sangong/effect/timer/timer.json",
    
    JIESUAN_SHU_JSON: "res/sangong/effect/jiesuan_shu/jiesuan_shu.json",
    JIESUAN_YING_JSON: "res/sangong/effect/jiesuan_ying/jiesuan_ying.json",

    NUM_USER_GOLD: "res/sangong/number/userGold.png",
    NUM_TIMER: "res/sangong/number/timerNum.png",

    RULE_PNG: "res/sangong/rule.png",
    INFO_PNG: "res/sangong/info.png",

    ROOM_FONT: "res/sangong/font/roomFont.fnt",
    tmpniu: "res/sangong/niu_replace.png",
};

var musicRes = {};

var loadingRes = {
    LOADING_PLIST: "res/sangong/loading.plist",
    LOADING_PNG: "res/sangong/loading.png",
};

//加载场景资源， 过后会被释放掉
var g_loading_resources = [];

var web_resources = [
    "res/sangong/allcommon/common.plist",
    "res/sangong/allcommon/common.png",
    "res/sangong/niu_replace.png",
    "res/sangong/bg.jpg",
    // "res/sangong/exit.plist",
    // "res/sangong/exit.png",
    "res/sangong/game.plist",
    "res/sangong/game.png",
    "res/sangong/info.png",
    "res/sangong/loading.plist",
    "res/sangong/loading.png",
    "res/sangong/rule.png",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu.json",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu0.plist",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu0.png",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu1.plist",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu1.png",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu2.plist",
    "res/sangong/effect/jiesuan_shu/jiesuan_shu2.png",
    "res/sangong/effect/jiesuan_ying/jiesuan_ying.json",
    "res/sangong/effect/jiesuan_ying/jiesuan_ying0.plist",
    "res/sangong/effect/jiesuan_ying/jiesuan_ying0.png",

    "res/sangong/effect/timer/timer.json",
    "res/sangong/effect/timer/timer.plist",
    "res/sangong/effect/timer/timer.png",
    "res/sangong/effect/winner/winner.json",
    "res/sangong/effect/winner/winner.plist",
    "res/sangong/effect/winner/winner.png",
    "res/sangong/font/roomFont.fnt",
    "res/sangong/font/roomFont.png",
    "res/sangong/number/timerNum.png",
    "res/sangong/number/userGold.png",
    "res/sangong/sound/bg_music.mp3",
    "res/sangong/sound/clock_count.mp3",
    "res/sangong/sound/fail.mp3",
    "res/sangong/sound/sendCard.mp3",
    "res/sangong/sound/win.mp3",

    "res/sangong/card.png",
    "res/sangong/card.plist"
];

var g_resources = [];

if (!cc.sys.isNative) {
    for (var i in web_resources) {
        g_resources.push(web_resources[i]);
    }
}
//图片资源
for (var i in res) {
    g_resources.push(res[i]);
}
//音乐资源
for (var i in musicRes) {
    g_resources.push(musicRes[i]);
}


for (var i in loadingRes) {
    g_loading_resources.push(loadingRes[i]);
}

// var g_resources = [];
// for (var i in res) {
//     g_resources.push(res[i]);
// }
