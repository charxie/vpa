/* 
 * This file contains objects and methods that have to do with geometry.
 * 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Rectangle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.contains = function(px, py) {
		return px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height;
	}
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Geometry() {

	/* calculate the area and center of a polygon based on the coordinates of the vertices */
	this.getPolygonInfo = function(x, y) {

		var a = 0;
		var cx = 0, cy = 0;
		var p, x1, y1, x2, y2;
		var n = x.length;

		for (var i = 0; i < n - 1; i++) {
			x1 = x[i];
			x2 = x[i + 1];
			y1 = y[i];
			y2 = y[i + 1];
			p = x1 * y2 - x2 * y1;
			a += p;
			cx += p * (x1 + x2);
			cy += p * (y1 + y2);
		}
		x1 = x[n - 1];
		x2 = x[0];
		y1 = y[n - 1];
		y2 = y[0];
		p = x1 * y2 - x2 * y1;
		a += p;
		a /= 2;
		if (a == 0) // avoid zero area case
			a = 0.000001;
		cx += p * (x1 + x2);
		cy += p * (y1 + y2);
		cx /= 6 * a;
		cy /= 6 * a;

		return {
			area : Math.abs(a),
			xCenter : cx,
			yCenter : cy
		};

	};

	this.toRadians = function(x) {
		return x * Math.PI / 180;
	};

	/* Catmull-Rom spline function: https://www.cs.cmu.edu/~462/projects/assn2/assn2/catmullRom.pdf */
	this.catmullRom = function(i, u, tension) {
		switch (i) {
		case -2:
			return u * tension * (-1 + u * (2 - u));
		case -1:
			return 1 + u * u * ((tension - 3) + (2 - tension) * u);
		case 0:
			return u * (tension + u * ((3 - 2 * tension) + (tension - 2) * u));
		case 1:
			return tension * u * u * (-1 + u);
		}
		return 0;
	};

}