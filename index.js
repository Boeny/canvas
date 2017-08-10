import Canvas from './canvas';
import Controls from './controls';

function obj_key(obj, i = 0){
	return Object.keys(obj)[i];
}

Canvas.createObjects = function(models){
	if (!models) return;
	
	var objects = {};
	
	if (models instanceof Array){
		for (var i = 0; i < models.length; i++)
		{
			let obj = models[i];// {className: class}
			let className = obj_key(obj);
			objects[className.toLowerCase()] = new obj[className]();
		}
	}
	else{
		for (var name in models)
		{
			let obj = models[name];// {className: class}
			objects[name] = new obj[obj_key(obj)]();
		}
	}
	
	return objects;
};

Canvas.setObjectsEnv = function(objects, useDecart, multiplier, updates){
	var renderer = new Canvas(multiplier, !!updates);
	if (useDecart) renderer.useDecart = true;
	
	var controls = new Controls(renderer);
	
	for (var name in objects){
		let obj = objects[name];
		obj.renderer = renderer;
		obj.controls = controls;
		
		if (obj.Start) obj.Start(objects);
		
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
 * @prop {Array} models [ {className: class}, ... ]
 * @prop {Number} multiplier of the size of the canvas
 * @prop {boolean} if use decart system with (0,0) in the middle of the screen
 */
Canvas.ready = function(models, multiplier, useDecart){
	var objects = Canvas.createObjects(models);
	
	global.onload = function(){
		var updates = [];
		var {renderer, controls} = Canvas.setObjectsEnv(objects, useDecart, multiplier, updates);
		
		controls.Bind(objects);
		
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
