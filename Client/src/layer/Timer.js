/**
 * Created by orange on 2016/8/17.
 */
var TimerLayer = cc.Layer.extend({
	_className: "TimerLayer",
	_classPath: "src/layer/Timer.js",


    clock: null,
    timerAramture: null,
    timer: null,

    leftTimer: 0,       //剩余时间
    leftRealTimer: 0,   //实际数值
    isClock: false,     //是否闹钟了,

    needClock: false,   //是否需要闹钟

    callback: null,     //回调函数

    clockCountID: null, //滴答声音

    ctor: function () {
        this._super();

        this.clock = new cc.Sprite("#sangong/g/clock.png").to(this).p(this.cw()/2, this.ch()/2 + 60).hide();
        this.timer = new cc.LabelAtlas("0", res.NUM_TIMER, 26, 34, "0123456789").to(this.clock).anchor(0.5, 0.5).pp(0.5, 0.5);
        //骨骼动画x与y偏移了5像素
        this.timerAramture = new ccs.Armature("timer").to(this).p(this.cw()/2+5, this.ch()/2 + 60+5).hide();
    },

    update: function (dt) {
        this.leftRealTimer -= dt;
        this.leftTimer = Math.floor(this.leftRealTimer);
        this.timer.setString(this.leftTimer>0 ? this.leftTimer : 0);

        if (this.leftTimer<=5 && !this.isClock && this.needClock) {
            this.startClock();
            this.clockCountID = SoundEngine.playEffect("res/sangong/sound/clock_count.mp3", true);
        }

        if (this.leftRealTimer <= 0.5) {
            this.unscheduleUpdate();
            this.stopTimerSound();
            this.clock.hide();
            this.callback && this.callback();
            this.callback = null;
        }
    },

    stopTimerSound: function () {
        if (this.clockCountID != null) {
            SoundEngine.stop(this.clockCountID);
            this.clockCountID = null;
        }
    },

    setCallback: function (callback) {
        this.callback = callback;
    },

    startClock: function () {
        this.isClock = true;
        this.clock.hide();
        this.timerAramture.getAnimation().setMovementEventCallFunc(null);
        this.timerAramture.getAnimation().play("Animation1");
        this.timerAramture.show();
        this.timerAramture.getAnimation().setMovementEventCallFunc(function (){
            //this.clock.show();
            this.timerAramture.hide();
        }, this);
    },

    setTimer: function (leftTimer, callback) {
        this.leftTimer = leftTimer;
        this.leftRealTimer = leftTimer;
        this.needClock = (this.leftTimer >= 5);
        this.isClock = false;
        this.callback = callback;

        this.clock.show();
        this.scheduleUpdate();
        this.stopTimerSound();
    },

    killTimer: function () {
        this.leftTimer = 0;
        this.leftRealTimer = 0;
        this.needClock = false;
        this.isClock = false;
        this.callback = null;
        this.clock.hide();
        this.timer.setString(0);
        this.timerAramture.hide();
        this.unscheduleUpdate();

        this.stopTimerSound();
    }
});