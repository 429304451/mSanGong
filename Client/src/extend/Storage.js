// Create by changwei on 2018

var ClassStorage = function(fileName) {
	var basePath;
	if (cc.game.config.debugMode == 0) {
		basePath = jsb.fileUtils.getWritablePath() + "release/";
	} else {
		basePath = jsb.fileUtils.getWritablePath() + "debug/";
	}

	this.savePath = cc.sys.isNative ? (basePath + fileName) : fileName;
	this.dataRoot = null;
	this.loadFromFile();
};

var p = ClassStorage.prototype;
p.loadFromFile = function() {
	var str = jsb.fileUtils.getStringFromFile(this.savePath);

	try {
		if (str) {
			this.dataRoot = JSON.parse(str);
		} else {
			this.dataRoot = {};
		}
	} catch (e) {
		console.log("解析错误." + str);
		this.dataRoot = {};
	}

	if (typeof this.dataRoot != "object") {
		console.log(JSON.stringify(this.dataRoot));
		console.log("非 object, 将初始化{}");
		this.dataRoot = {};
	}

	console.log(JSON.stringify(this.dataRoot));
};

p.saveToFile = function() {
	this.dump(this.dataRoot);
};

p.setValue = function(key, value, isFlush) {
	this.dataRoot[key] = value;
	isFlush && this.saveToFile();
};

p.delKey = function(key, isFlush) {
	delete this.dataRoot[key];
	isFlush && this.saveToFile();
};

p.getValue = function(key) {
	return this.dataRoot[key];
};

p.flush = p.saveToFile;



