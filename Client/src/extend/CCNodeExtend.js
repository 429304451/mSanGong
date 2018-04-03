// create by 黄二姐 on 2015/07/27
// var cc = cc || {}
// if (isUseFrameWork != null) {
// 	var cc = {}
	// cc.Node = function() {};
// }


cc.Node.prototype.isVisibleInHierarchy = function() {
	var target = this;
	while (target && target.isVisible())
		target = target.getParent();

	return !target || target.isVisible();
};

cc.Node.prototype.getScene = function() {
	if (this._scene)
		return this._scene;

	var target = this;
	if (target instanceof cc.Scene)
		return this._scene = target;

	while (target) {
		target = target.getParent();
		if (target == null)
			break;
		if (target instanceof cc.Scene)
			return this._scene = target;
	};

	return this._scene = cc.director.getRunningScene();
};

cc.Node.prototype.getSceneOrLayerInParent = function() {
	var target = this;
	while (target) {
		target = target.getParent();
		if (target instanceof cc.Scene || target instanceof cc.Layer)
			return target;
	}
	return null;
};

cc.Node.prototype.to = function(father, zorder, tag) {
	zorder = zorder || 0;
	if (tag != null) {
		father.addChild(this, zorder, tag);
	} else {
		father.addChild(this, zorder);
	}
};
// 从原父结点上脱落， 添加到新节点上去
cc.Node.prototype.exto = function(father, zorder) {
	zorder = zorder || 0;
	var oldFather = this.getParent();

	if (oldFather) {
		this.retain();
		this.removeFromParent(false);
		father.addChild(this, zorder);
		this.release();
	} else {
		this.to(father, zorder);
	}
	return this;
};

cc.Node.prototype.ccp = cc.Node.prototype.getPosition;
// 快捷设置位置
cc.Node.prototype.p = function(xOrCcp, y) {
	var x = xOrCcp;
	if (y == null) {
		y = xOrCcp.y;
		x = xOrCcp.x;
	};
	this.setPosition(x, y);
	return this;
};

cc.Node.prototype.px = function(x) {
	if (x == null) {
		return this.getPositionX();
	}
	this.setPositionX(x);
	return this;
};

cc.Node.prototype.py = function(y) {
	if (y == null) {
		return this.getPositionY();
	}
	this.setPositionY(y);
	return this;
};
//快速设置在父亲结点的百分比位置, 如果没有父亲则使用设计分辨率
cc.Node.prototype.pp = function(pxOrCcp, py) {
	var px = pxOrCcp;
	if (px == null) {
		px = 0.5;
		py = 0.5;
	} else if (py == null) {
		py = pxOrCcp.y;
		px = pxOrCcp.x;
	}
	var winSize = cc.director.getWinSize();
	var pw = winSize.width, ph = winSize.height;
	if (this.getParent() != null) {
		var size = this.getParent().getContentSize();
		pw = size.width;
		ph = size.height;
	}

	this.setPosition(pw*px, ph*py);
	return this;
};
// 快速更换精灵帧
cc.Node.prototype.display = function(fileName) {
	if (fileName === undefined)
		return this.getSpriteFrame();
	else if (cc.isString(fileName)) {
		if (fileName[0] === "#") {
			var frameName = fileName.substr(1, fileName.length - 1);
			var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
			if (spriteFrame)
				this.setSpriteFrame(spriteFrame);
			else
				console.log("%s does not exist", fileName);
		}
	} else if (typeof fileName === "object") {
		if (fileName instanceof cc.Texture2D) {
			// Init  with texture and rect
			this.setTexture(fileName);
		} else if (fileName instanceof cc.SpriteFrame) {
			// Init with a sprite frame
			this.setSpriteFrame(fileName);
		} else if ( (fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement) ) {
			// Init with a canvas or image element
			var texture2d = new cc.Texture2D();
			texture2d.initWithElement(fileName);
			texture2d.handleLoadedTexture();
			this.setTexture(texture2d);
		}
	}
	return this;
};









