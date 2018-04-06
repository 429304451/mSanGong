/**
 * Created by 黄二杰 on 2015/10/21.
 */

/**
 * 声音引擎, 没有提供结束所有， 暂停所有 音效这类的， 因为捕鱼项目没有用到。如果支持了， 则要多维护一个数组， 且还要每个播放完后都设置回调？， 影响其它的效率， 没有必要
 * 只是区分了背景音乐跟音效， 则各自音量
 * @type {{}}
 */
var __SoundEngine = function () {
	var audioEngine;
	if (cc.sys.isNative) {
		audioEngine = jsb.AudioEngine;
	} else {
		audioEngine = cc.audioEngine;
	}
	// 最后播放的时间
	var lastPlayTick = [];
	this.stopAll = function() {
		audioEngine.stopAll();
	};

	if (cc.sys.isNative) {
		// 背景音乐ID
		this.backgroundMusicID = null;
		this.effectVolume = 0.5; // 音效音量
		this.musicVolume = 0.5; // 背景声音音量

		this.setEffectsVolume = function(effectVolume) {
			this.effectVolume = effectVolume;
		};

		this.getEffectsVolume = function() {
			return this.effectVolume;
		};
		this.setBackgroundMusicVolume = function(musicVolume) {
			this.musicVolume = musicVolume;

			if (this.backgroundMusicID != null) {
				audioEngine.setVolume(this.backgroundMusicID, this.musicVolume);
			}
		};

		this.getBackgroundMusicVolume = function() {
			return this.musicVolume;
		};

		this.stop = function(soundID) {
			return audioEngine.stop(soundID);
		};
		// 播放音效
		this.playEffect = function(soundPath, isLoop, volume, audioProfile) {
			if (!lastPlayTick[soundPath]) {
				if (Date.now() - lastPlayTick[soundPath] < 20) {
					return;
				}
			}
			lastPlayTick[soundPath] = Date.now();

			var v = volume == null ? this.effectVolume * 1 : this.effectVolume * volume;
			v = v > 1 ? 1 : v;
			v = v < 0 ? 0 : v;
			// jsb 可不识别空参数 你有传 他就会试着解析 所以..
			if (audioProfile) {
				return audioEngine.play2d(soundPath, isLoop == null ? false : isLoop, v, audioProfile);
			}
			return audioEngine.play2d(soundPath, isLoop == null ? false : isLoop, v);
		};

		this.stopBackgroundMusic = function() {
			if (this.backgroundMusicID != null) {
				audioEngine.stop(this.backgroundMusicID);
				this.backgroundMusicID = null;
			}
		};
        /**
         * 播放背景音乐
         * @param soundPath
         * @param isLoop
         * @param volume
         * @param audioProfile
         * @returns {*|int}
         */
		this.playBackgroundMusic = function(soundPath, isLoop, volume, audioProfile) {
			if (this.backgroundMusicID != null) {
				audioEngine.stop(this.backgroundMusicID);
			}
            //jsb可不识别空参数， 你有传， 他就会试着解析， 所以。。
			if (audioProfile) {
				return this.backgroundMusicID = audioEngine.play2d(soundPath, isLoop, volume == null ? this.musicVolume : volume, audioProfile);
			}
			return this.backgroundMusicID = audioEngine.play2d(soundPath, isLoop, volume == null ? this.musicVolume : volume);
		};

		this.pauseAll = function() {
			audioEngine.pauseAll();
		};
		this.resumeAll = function() {
			audioEngine.resumeAll();
		};
		this.setAllVolume = function(volume) {
			audioEngine.setAllVolume(volume);
		};
		this.resumeBackgroundMusic = function() {
			if (this.backgroundMusicID != null) {
				audioEngine.resume(this.backgroundMusicID);
			}
		};
		this.pauseBackgroundMusic = function() {
			if (this.backgroundMusicID != null) {
				audioEngine.pause(this.backgroundMusicID);
			}
		};
	} else {
		// 背景音乐ID 
		this.backgroundMusicID = null;
		this.effectVolume = 1;
		this.musicVolume = 1;

		this.setEffectsVolume = function(effectVolume) {
			this.effectVolume = effectVolume;
			audioEngine.setEffectsVolume(this.effectVolume);
		};

		this.getEffectsVolume = function() {
			return this.effectVolume;
		};

		this.setBackgroundMusicVolume = function(musicVolume) {
			this.musicVolume = musicVolume;
			return audioEngine.setMusicVolume(musicVolume);
		};
		this.getBackgroundMusicVolume = function() {
			return this.musicVolume;
		};
		this.stop = function(soundID) {
            return audioEngine.stopEffect(soundID);
		};
		// 播放音效
		this.playEffect = function(soundPath, isLoop, volume, audioProfile) {
			return audioEngine.playEffect(soundPath, isLoop);
		};
		this.stopBackgroundMusic = function() {
			return audioEngine.stopMusic();
		};
        /**
         * 播放背景音乐
         * @param soundPath
         * @param isLoop
         * @param volume
         * @param audioProfile
         * @returns {*|int}
         */
		this.playBackgroundMusic = function(soundPath, isLoop, volume, audioProfile) {
			return audioEngine.playMusic(soundPath, isLoop);
		};
		this.resumeBackgroundMusic = function() {
			return audioEngine.resumeMusic();
		};
		this.pauseBackgroundMusic = function() {
			return audioEngine.pauseMusic();
		};
	}

	this.stopEffect = this.stop;
	this.pauseMusic = this.pauseBackgroundMusic;
	this.resumeMusic = this.resumeBackgroundMusic;
	this.playMusic = this.playBackgroundMusic;
	this.stopMusic = this.stopBackgroundMusic;
	this.getMusicVolume = this.getBackgroundMusicVolume;
    this.setMusicVolume = this.setBackgroundMusicVolume;
};

var SoundEngine = new __SoundEngine();

