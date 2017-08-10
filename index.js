import Canvas from './canvas';
import Controls from './controls';

/**
 * @prop {Object} objects {name1: object1, name2: ...}
 * @prop {boolean} useDecart - if use decart system with (0,0) in the middle of the screen
 * @prop {Number} multiplier of the size of the canvas
 * @prop {Array/undefined} updates will be filled with the "Update" or "render" methods of each object or both
 *                                 if not set, the objects won't be rendered (and canvas will not be added)
 * 
 * @returns {renderer, controls}
 */
Canvas.setObjectsEnv = function(objects, useDecart, multiplier, updates){
	var renderer = new Canvas(multiplier, !!updates);
	var controls = new Controls(renderer);
	
	if (useDecart) renderer.useDecart = true;
	
	for (var name in objects){
		let obj = objects[name];
		obj.renderer = renderer;
		obj.controls = controls;
		
		if (obj.Start) obj.Start(objects);
		
		// if there is not updates array
		if (updates && (obj.render || obj.Update)){
			let upd;
			
			if (obj.render && !obj.Update) upd = obj.render.bind(obj);
			
			if (!obj.render && obj.Update) upd = obj.Update.bind(obj);
			
			if (obj.render && obj.Update) upd = () => {
				obj.Update();
				obj.render();
			};
			
			updates.push(upd);
			
			if (obj.render) obj.render();
		}
	}
	
	return {renderer, controls};
};

/**
 * @prop {Object} objects {name1: object1, name2: ...}
 * @prop {Number} multiplier of the size of the canvas
 * @prop {boolean} useDecart - if use decart system with (0,0) in the middle of the screen
 */
Canvas.ready = function(objects, multiplier, useDecart){
	global.onload = function(){
		// add renderer and controls as components of the objects
		var updates = [];
		var {renderer, controls} = Canvas.setObjectsEnv(objects, useDecart, multiplier, updates);
		
		// bind mouse, keys and touch events to the objects
		controls.Bind(objects);
		
		// main cycle
		(function render(){
			requestAnimationFrame(render);
			renderer.clear();
			
			for (var i = 0; i < updates.length; i++){
				updates[i]();
			}
		})();
	};
}

export default Canvas;
