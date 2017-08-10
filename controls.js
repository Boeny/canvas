import Vector2 from 'vector2';

function merge(o1, o2){
	if (!o1) o1 = {};
	var keys = Object.keys(o2 || {});
	
	for (var i = 0; i < keys.length; i++){
		o1[keys[i]] = o2[keys[i]];
	}
	return o1;
}

function in_array(e, arr){
	return arr.indexOf(e) > -1;
}

var defaults = {
	enabled: false,
	enableKeys: true,
	enableMouse: true,
	enableTouch: true,
	
	keys: {
		SPACE: 32,
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
		W: 87,
		A: 65,
		S: 83,
		D: 68,
		CTRL: false
	},
	mouse: {
		LEFT: 0,
		WHEEL: 1,
		MIDDLE: 1,
		RIGHT: 2
	},
	
	handlers: {
		keydown: 'onKeyDown',
		keyup: 'onKeyUp',
		
		mousemove: 'onMouseMove',
		mousedown: 'onMouseDown',
		mouseup: 'onMouseUp',
		click: 'onClick',
		wheel: 'onMouseWheel',
		contextmenu: 'onContextMenu',
		
		touchstart: 'onTouchStart',
		touchend: 'onTouchEnd',
		touchmove: 'onTouchMove',
	}
};

export default class Controls
{
	constructor(renderer){
		merge(this, defaults);
		this.renderer = renderer;
	}
	
	Bind(objects){
		for (var name in objects){
			let obj = objects[name];
			
			for (let eventName in this.handlers){
				let handlerName = this.handlers[eventName];
				
				if (obj[handlerName]){
					document.body.addEventListener(eventName, (e) => {
						if (!this.enabled) return;
						this.keys.CTRL = e.ctrlKey;
						this.eventHandler(e, obj, handlerName);
					}, false);
				}
			}
		}
		
		global.addEventListener('resize', () => {
			this.renderer.setSize();
		}, false);
		
		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', (e) => this.onPointerLockingChange(e), false);
		document.addEventListener('mozpointerlockchange', (e) => this.onPointerLockingChange(e), false);
		document.addEventListener('webkitpointerlockchange', (e) => this.onPointerLockingChange(e), false);
		
		document.addEventListener('pointerlockerror', (e) => this.onPointerLockingError(e), false);
		document.addEventListener('mozpointerlockerror', (e) => this.onPointerLockingError(e), false);
		document.addEventListener('webkitpointerlockerror', (e) => this.onPointerLockingError(e), false);
	}
	
	eventHandler(e, obj, handlerName){
		var handler = obj[handlerName].bind(obj);
		
		if (!in_array(handlerName, ['onTouchStart','onTouchMove','onTouchEnd'])){
			e.preventDefault();
			e.stopPropagation();
		}
		
		switch (handlerName){
			case 'onKeyDown':
			case 'onKeyUp':
				if (!this.enableKeys) return;
				return handler(e.keyCode);
			
			case 'onMouseMove':
				if (!this.enableMouse) return;
				return handler(
					new Vector2(e.clientX, e.clientY),
					new Vector2(
						e.movementX || e.mozMovementX || e.webkitMovementX || 0,
						e.movementY || e.mozMovementY || e.webkitMovementY || 0
					)
				);
			
			case 'onMouseWheel':
				if (!this.enableMouse) return;
				return handler(e.deltaY);
			
			case 'onClick':
			case 'onMouseUp':
			case 'onMouseDown':
				if (!this.enableMouse) return;
				return handler(e.button, new Vector2(e.clientX, e.clientY));
			
			case 'onTouchStart':
			case 'onTouchMove':
			case 'onTouchEnd':
				if (!this.enableTouch) return;
				let points = new Array(e.touches.length);
				
				for (var i = 0; i < points.length; i++){
					points[i] = new Vector2(e.touches[i].pageX, e.touches[i].pageY);
				}
				
				return handler(points);
			
			default:
				return handler();
		}
	}
	
	onPointerLockingError(){}
	onPointerLockingChange(){}
	
	// Ask the browser to lock the pointer
	lockPointer(elem){
		let lock = elem.requestPointerLock || elem.mozRequestPointerLock || elem.webkitRequestPointerLock;
		lock && lock();
	}
	isPointerLocked(elem){
		return document.pointerLockElement === elem || document.mozPointerLockElement === elem || document.webkitPointerLockElement === elem;
	}
}
