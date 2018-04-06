// create by 黄二姐 on 2015/07/27
// var cc = cc || {}
// if (cc.Node == null) {
// 	cc.Node = function() {};
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
	return this;
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
		} else {
			this.setTexture(fileName);
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

cc.Node.prototype.showHelp = function() {
	var size = this.getContentSize();
	var layer = new cc.LayerColor(cc.color(255, 0, 0, 88), size.width, size.height).to(this, 10);
	return this;
};

cc.Node.prototype.cw = function() {
	var size = this.getContentSize();
	return size.width;
};

cc.Node.prototype.ch = function() {
	var size = this.getContentSize();
	return size.height;
};

cc.Node.prototype.size = function(widthOrSize, height) {
	if (widthOrSize == null) {
		return this.getContentSize();
	}
	if (height == null) {
		this.setContentSize(widthOrSize.width, widthOrSize.height);
	} else {
        this.setContentSize(widthOrSize, height);
	}
	return this;
};

cc.Node.prototype.hide = function() {
	this.setVisible(false);
	return this;
};

cc.Node.prototype.show = function() {
	this.setVisible(true);
	return this;
};

cc.Node.prototype.bindTouch = function(args) {
	if (!args) {
		return this;
	}
	this.unbindTouch();
	this._touchListener = cc.EventListener.create({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: args.swallowTouches,
	});

	var onTouchBeganCallBack = null;
	if (args.onTouchBegan != undefined) {
		onTouchBeganCallBack = args.onTouchBegan.bind(this);
		// 便于onClick直接调用该node的点击事件
		this.onTouchBeganCallBack = onTouchBeganCallBack;
	}
	this._touchListener.onTouchBegan = function(touch, event) {
		var target = event.getCurrentTarget();
		// Get the position of the current point relative to the button
		var locationInNode = target.convertToNodeSpace(touch.getLocation());
		var s = target.getContentSize();
		var rect = cc.rect(0, 0, s.width, s.height);
		// Check the click area
		if (target.isVisible() && cc.rectContainsPoint(rect, locationInNode)) {
			// target.opacity = 180
			if (onTouchBeganCallBack != null) {
				return onTouchBeganCallBack(touch, event);
			}
			return true;
		}
		return false;
	};

	if (args.onTouchMoved != undefined) {
		this._touchListener.onTouchMoved = args.onTouchMoved.bind(this);
	}
	if (args.onTouchEnded != undefined) {
		this._touchListener.onTouchEnded = args.onTouchEnded.bind(this);
	}

	cc.eventManager.addListener(this._touchListener, this);
	return this;
};

cc.Node.prototype.unbindTouch = function(args) {
	if (this._touchListener) {
		cc.eventManager.removeListener(this._touchListener);
		this._touchListener = null;
	}
	return this;
};

cc.Node.prototype.qrotate = function(angle) {
	angle = angle || 0;
	this.setRotation(angle);
	return this;
};

cc.Node.prototype.qcolor = function(r, g, b) {
	r = r == null ? 255 : r;
	g = g == null ? 255 : g;
	b = b == null ? 255 : b;
	this.setColor(cc.color(r, g, b));
	return this;
};

cc.Node.prototype.qscale = function (x, y) {
    y = y == null ? x : y;
    this.setScale(x, y);
    return this;
};

cc.Node.prototype.qopacity = function (opacity) {

    this.setOpacity(opacity);
    return this;
};

cc.Node.prototype.anchor = function(xOrCcp, y) {
    if (y === undefined) {
		this.setAnchorPoint(xOrCcp.x, xOrCcp.y);
	} else {
		this.setAnchorPoint(xOrCcp, y);
	}
	return this;
};
//吞噬掉一切点击
cc.Node.prototype.swallowTouch = function() {
	var touchListener = cc.EventListener.create({
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: true,
		onTouchBegan: function(touch, event) {
			if (event.getCurrentTarget().isVisible()) {
				return true;
			}
			return false;
		},
	});
	cc.eventManager.addListener(touchListener, this);
	return this;
};

//吞噬掉一切键盘事件,。
cc.Node.prototype.swallowKeyboard = function(onBackCallback) {
	var eventListener = cc.EventListener.create({
		event: cc.EventListener.KEYBOARD,
		onKeyPressed: function(code, event) {
			switch (code) {
				case cc.KEY.back:
				case cc.KEY.escape:
					onBackCallback && onBackCallback();
			}
			event.stopPropagation();
		},
		onKeyReleased: function(code, event) {
			event.stopPropagation();
		}
	});
	cc.eventManager.addListener(eventListener, this);
	return this;
};

cc.Node.prototype.bindTouchLocate = function() {
	var self = this;
	this.bindTouch({
		swallowTouches: true,
		onTouchBegan: function(touch, event) {
			self.lBeganPos_ = self.getPosition();
			self.lBeganPoint_ = touch.getLocation();
			return true;
		},
		onTouchMoved: function(touch, event) {
			self.p(cc.pAdd(self.lBeganPos_, cc.pSub(touch.getLocation(), self.lBeganPoint_)));
		},
		onTouchEnded: function(touch, event) {
			var winSize = cc.director.getWinSize();
			var pw = winSize.width, ph = winSize.height;
			if (this.getParent() != null) {
				var size = this.getParent().getContentSize();
				pw = size.width;
				ph = size.height;
			}
			console.log("Node Location: ", this.getPositionX(), this.getPositionY(), "Percentage:", this.getPositionX()/pw, this.getPositionY()/ph);
		},
	});
	return this;
};

// 快速绑定点击函数
cc.Node.prototype.quickBt = function(fn) {
	var self = this;
	this.bindTouch({
		swallowTouches: true,
		onTouchBegan: function(touch, event) {
            if (self._touchEnabled == false)
				return false;
			self.BeganScale_ = self.getScale();
			self.BeganOpacity_ = self.getOpacity();

			self.setScale(self.BeganScale_*0.8);
			self.setOpacity(self.BeganOpacity_*0.8);

			SoundEngine.playEffect(commonRes.btnClick);
			return true;
		},
		onTouchEnded: function(touch, event) {
			self.setScale(self.BeganScale_);
			self.setOpacity(self.BeganOpacity_);
			// 判断是否在区域范围 才执行函数
			var target = event.getCurrentTarget();
			// Get the position of the current point relative to the button.
			var locationInNode = target.convertToNodeSpace(touch.getLocation());
			var s = target.getContentSize();
			var rect = cc.rect(0, 0, s.width, s.height);
			// Check the click area
			if (target.isVisible() && cc.rectContainsPoint(rect, locationInNode)) {
                fn && fn(touch, event);
			}
		},
	});
    return this;
};
