import Vector2 from 'vector2';

export default class Canvas
{
	constructor(mult = 1, addToPage){
		this.DOM = {};
		this.multiplier = mult;
		if (addToPage) this.createDOM();
		this.setSize();
		this.useDecart = false;
	}
	
	createDOM(){
		this.DOM = document.createElement('canvas');
		document.body.appendChild(this.DOM);
		this.canvas = this.DOM.getContext('2d');
	}
	
	setSize(){
		this.DOM.width = this.multiplier * global.innerWidth;
		this.DOM.height = this.multiplier * global.innerHeight;
		
		this.width = this.DOM.width;
		this.height = this.DOM.height;
		
		this.width2 = this.width / 2;
		this.height2 = this.height / 2;
	}
	
	addEvent(event, handler){
		this.DOM.addEventListener(event, handler);
	}
	
	//-------------------------------------- IMAGE DATA
	
	createData(w,h){
		return this.canvas.createImageData(w || this.width, h || this.height);
	}
	renderData(img, x,y){
		this.canvas.putImageData(img, x || 0, y || 0);
	}
	clear(){
		this.renderData(this.createData());
	}
	
	getColorAtIndex(img,i){
		return {
			r: img.data[i] || 0,
			g: img.data[i+1] || 0,
			b: img.data[i+2] || 0,
			a: img.data[i+3] || 0
		};
	}
	setColorAtIndex(img,i,c){
		c = c || {};
		
		img.data[i] = c.r === undefined ? 0 : c.r;
		img.data[i+1] = c.g === undefined ? 0 : c.g;
		img.data[i+2] = c.b === undefined ? 0 : c.b;
		img.data[i+3] = c.a === undefined ? 255 : c.a;
	}
	
	getColorAt(img, x,y){
		return this.getColorAtIndex(img, 4*(x + y * this.DOM.width));
	}
	setColorAt(p, x,y, c){
		var i = 4*(x + y * this.DOM.width);
		this.setColorAtIndex(p,i,c);
	}
	
	//-------------------------------------- DRAWING
	
	decart(p){
		if (!this.useDecart) return p;
		return new Vector2(p.x - this.width2, this.height2 - p.y);
	}
	
	setColor(color){
		if (!color) return;
		if (typeof color != 'object') color = {fill: color, stroke: color};
		if (color.stroke) this.canvas.strokeStyle = color.stroke;
		if (color.fill) this.canvas.fillStyle = color.fill;
	}
	
	render(){
		this.canvas.closePath();
		this.canvas.stroke();
	}
	
	drawLine(p1, p2, width){
		p1 = this.decart(p1);
		p2 = this.decart(p2);
		
		if (width) this.canvas.lineWidth = width;
		this.canvas.beginPath();
		
		this.canvas.moveTo(p1.x+0.5, p1.y+0.5);
		this.canvas.lineTo(p2.x+0.5, p2.y+0.5);
		
		this.render();
	}
	drawLineTo(p, init, width){
		if (init) this.init_point = init;
		this.drawLine(this.init_point, p, width);
		this.init_point = p;
	}
	drawLines(points, width){
		if (!points.length) return;
		
		this.init_point = points[0];
		
		for (var i = 1; i < points.length; i++){
			this.drawLineTo(points[i], null, width);
		}
	}
	
	drawRect(p1, p2){
		p1 = this.decart(p1);
		p2 = this.decart(p2);
		
		this.canvas.beginPath();
		this.canvas.fillRect(p1.x+0.5, p1.y+0.5, p2.x+0.5, p2.y+0.5);
		this.render();
	}
	drawPoly(points, width){
		this.drawLines(points, width);
		this.drawLineTo(points[0], null, width);// close path
	}
	drawCircle(p, radius, width){
		p = this.decart(p);
		
		this.canvas.beginPath();
		this.canvas.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
		this.canvas.fill();
		if (width) this.canvas.lineWidth = width;
		this.render();
	}
	
	drawText(text, p, font){
		p = this.decart(p);
		if (font) this.canvas.font = font;
		this.canvas.fillText(text, p.x, p.y);
	}
	drawTexts(texts){
		for (var i = 0; i < texts.length; i++){
			let t = texts[i];
			this.drawText(t[0], t[1], t[2]);
		}
	}
}
