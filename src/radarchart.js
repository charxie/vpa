/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function RadarChart(id) {

	var that = this;

	this.id = id;

	this.init = function() {
		canvas = document.getElementById(id);
		if (id === 'canvas-popup') {
			canvas = htmlUtil.cloneElement(id);
		}
		canvas.addEventListener('click', onMouseClick, false);
		canvas.addEventListener('dblclick', onMouseDoubleClick, false);
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mouseleave', onMouseLeave, false);
		canvas.addEventListener('touchmove', onTouchMove, false);
		canvas.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			that.popupMenu(e, true);
		});
	}

	var canvas;
	var ctx;
	var baseSet = [];
	var baseSetSizePercent = [];
	var totalBaseSetSize;
	var margin = {
		left : 30,
		right : 30,
		top : 30,
		bottom : 30
	};
	var size = 4;
	var numberOfTicks = 10;
	var fillAlphaValue = 0.25;
	var linkedGraphs = [];
	var xAction, yAction;
	var xVertex, yVertex;
	var indexOfSelectedAction = -1;

	this.linkGraph = function(g) {
		if (linkedGraphs.indexOf(g) === -1)
			linkedGraphs.push(g);
	}

	this.resize = function() {
		if (id === 'radarchart') {
			setTableCanvasSize(canvas);
		} else {
			screenManager.setFullscreenPositionAndSize(canvas);
		}
		this.draw();
	}

	this.getCanvas = function() {
		return canvas;
	}

	this.saveImage = function() {
		that.popupMenu(null, false);
		pngExporter.saveAs(screenManager.isFullscreen() ? screenManager.getCanvas() : canvas);
	}

	this.isPopupMenuVisible = function() {
		var menu = document.getElementById('context-menu-radarchart');
		return menu.style.display === 'block';
	}

	this.popupMenu = function(e, b) {
		var menu = document.getElementById('context-menu-radarchart');
		menu.style.display = b ? 'block' : 'none';
		if (e) {
			var position = htmlUtil.getPosition(e);
			menu.style.left = position.x + 'px';
			menu.style.top = position.y + 'px';
		}
	}

	this.enterScaleFactor = function(v, e) {
		if (e.keyCode === 13) { // Enter key is hit
			state.radarchart.setScaleFactor(parseFloat(v));
			this.draw();
			screenManager.draw();
		}
	}

	this.setFillColor = function(c) {
		state.radarchart.setFillColor(c);
		this.draw();
		screenManager.draw();
	}

	this.draw = function() {

		ctx = canvas.getContext('2d');
		ctx.fillStyle = window.getComputedStyle(canvas, null).backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		var xCenter = margin.left + (canvas.width - margin.left - margin.right) / 2;
		var yCenter = margin.top + (canvas.height - margin.top - margin.bottom) / 2;
		ctx.font = FONT.label;

		var numberOfDimensions = baseSet.length;
		var theta = 2 * Math.PI / numberOfDimensions;
		xAction = new Float32Array(numberOfDimensions);
		yAction = new Float32Array(numberOfDimensions)
		xVertex = new Float32Array(numberOfDimensions);
		yVertex = new Float32Array(numberOfDimensions)
		var aAction = new Float32Array(numberOfDimensions);
		var radius = Math.min(canvas.width - margin.left - margin.right, canvas.height - margin.top - margin.bottom) / 2;
		var tickLength = radius / numberOfTicks;
		for (var i = 0; i < numberOfDimensions; i++) {
			aAction[i] = i * theta;
			xAction[i] = xCenter + Math.cos(aAction[i]) * radius;
			yAction[i] = yCenter + Math.sin(aAction[i]) * radius;
		}

		for (var i = 0; i < numberOfDimensions; i++) {
			if (i === indexOfSelectedAction) {
				ctx.beginPath();
				ctx.arc(xAction[i], yAction[i], size * 2, 0, 2 * Math.PI, false);
				ctx.closePath();
				var gradient = ctx.createRadialGradient(xAction[i], yAction[i], 0, xAction[i], yAction[i], size * 2);
				gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
				gradient.addColorStop(1, 'rgba(255, 255, 0, 0.5)');
				ctx.fillStyle = gradient;
				ctx.fill();
			}
			ctx.beginPath();
			ctx.moveTo(xAction[i], yAction[i]);
			ctx.lineTo(xCenter, yCenter);
			ctx.closePath();
			ctx.strokeStyle = 'gray';
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.fillStyle = state.labelColor;
			ctx.save();
			ctx.translate(xAction[i], yAction[i]);
			if (aAction[i] <= Math.PI / 2 || aAction[i] >= 3 * Math.PI / 2) {
				ctx.textAlign = 'left';
				ctx.rotate(aAction[i]);
				ctx.fillText(baseSet[i], size * 1.2, size * 0.5);
			} else {
				ctx.textAlign = 'right';
				ctx.rotate(Math.PI + aAction[i]);
				ctx.fillText(baseSet[i], -size * 1.2, size * 0.5);
			}
			ctx.restore();
		}

		ctx.strokeStyle = 'lightgray';
		for (var i = 0; i < numberOfTicks; i++) {
			ctx.beginPath();
			ctx.arc(xCenter, yCenter, radius - tickLength * i, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.stroke();
		}

		ctx.beginPath();
		var length = radius * state.radarchart.scaleFactor;
		var MIN_POINT = 0.01; // to avoid zero area formed by a line that immediately goes back to the origin from a non-zero value
		var delta = Math.max(MIN_POINT, baseSetSizePercent[0]);
		var actionLength = delta * length;
		var xr = xCenter + actionLength * Math.cos(aAction[0]);
		var yr = yCenter + actionLength * Math.sin(aAction[0]);
		xVertex[0] = delta * Math.cos(aAction[0]);
		yVertex[0] = delta * Math.sin(aAction[0]);
		ctx.moveTo(xr, yr);
		ctx.arc(xr, yr, 2, 0, 2 * Math.PI, false);
		for (var i = 1; i < numberOfDimensions; i++) {
			delta = Math.max(MIN_POINT, baseSetSizePercent[i]);
			actionLength = delta * length;
			xr = xCenter + actionLength * Math.cos(aAction[i]);
			yr = yCenter + actionLength * Math.sin(aAction[i]);
			xVertex[i] = delta * Math.cos(aAction[i]);
			yVertex[i] = delta * Math.sin(aAction[i]);
			ctx.lineTo(xr, yr);
			ctx.arc(xr, yr, 2, 0, 2 * Math.PI, false);
		}
		ctx.closePath();
		var rgb = hexToRgb(state.radarchart.fillColor);
		ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + fillAlphaValue + ')';
		ctx.fill();
		ctx.strokeStyle = state.labelColor;
		ctx.stroke();

		var info = geometry.getPolygonInfo(xVertex, yVertex);
		xr = info.xCenter * length + xCenter;
		yr = info.yCenter * length + yCenter;
		document.getElementById('radarchart_results').innerHTML = '<b>Normalized</b>:<hr>Area: ' + info.area.toPrecision(5) + '<br>Center: (' + info.xCenter.toPrecision(3) + ', ' + (-info.yCenter).toPrecision(3) + ')' + '<br><br><b>Original</b>:<hr>Area: ' + (totalBaseSetSize * info.area).toPrecision(5) + '<br>Center: (' + (totalBaseSetSize * info.xCenter).toPrecision(3) + ', ' + (-totalBaseSetSize * info.yCenter).toPrecision(3) + ')';

		var centroidRadius = 8;
		var gradient = ctx.createRadialGradient(xr, yr, 0, xr, yr, centroidRadius);
		gradient.addColorStop(0, 'rgba(255, 0, 0, 0.9)');
		gradient.addColorStop(1, 'rgba(0, 255, 255, 0.9)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(xr, yr, centroidRadius, 0, 2 * Math.PI, false);
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(xr - centroidRadius, yr);
		ctx.lineTo(xr + centroidRadius, yr);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(xr, yr - centroidRadius);
		ctx.lineTo(xr, yr + centroidRadius);
		ctx.closePath();
		ctx.stroke();

		if (indexOfSelectedAction >= 0) {
			var info = baseSet[indexOfSelectedAction] + ' (' + (baseSetSizePercent[indexOfSelectedAction] * 100).toFixed(2) + '%)';
			ctx.drawTooltip(10, canvas.height - 40, 30, 10, 20, info, false);
		}

	}

	this.createAxes = function() {
		baseSet = [];
		switch (state.level) {
		case 'Top':
			size = 12;
			state.radarchart.scaleFactor = 1;
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					baseSet.push(categoryKey);
				}
			}
			break;
		case 'Medium':
			size = 8;
			state.radarchart.scaleFactor = 5;
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					var categoryValue = actionDictionary[categoryKey];
					for ( var type in categoryValue) {
						if (categoryValue.hasOwnProperty(type)) {
							baseSet.push(type);
						}
					}
				}
			}
			break;
		case 'Fine':
			size = 4;
			state.radarchart.scaleFactor = 10;
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					var categoryValue = actionDictionary[categoryKey];
					for ( var type in categoryValue) {
						if (categoryValue.hasOwnProperty(type)) {
							var act = categoryValue[type];
							for (var i = 0; i < act.length; i++) {
								baseSet.push(act[i]);
							}
						}
					}
				}
			}
			break;
		}
		document.getElementById('radarchart_scale_factor').value = state.radarchart.scaleFactor;
		if (baseSetSizePercent.length != baseSet.length)
			baseSetSizePercent = new Float32Array(baseSet.length);
		totalBaseSetSize = 0;
		for (var i = 0; i < baseSet.length; i++) {
			baseSetSizePercent[i] = getBaseSetSize(baseSet[i]);
			totalBaseSetSize += baseSetSizePercent[i];
		}
		for (var i = 0; i < baseSet.length; i++) {
			baseSetSizePercent[i] /= totalBaseSetSize;
		}
	}

	function getBaseSetSize(parent) {

		var count = 0;
		switch (state.level) {
		case 'Top':
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					if (parent === categoryKey) {
						var categoryValue = actionDictionary[categoryKey];
						for ( var type in categoryValue) {
							if (categoryValue.hasOwnProperty(type)) {
								var arr = categoryValue[type];
								for (var k = 0; k < arr.length; k++) {
									for (var i = 0; i < numberOfActionTypes; i++) {
										if (arr[k] === recordedTypes[i] && recordedTypes[i] !== 'Camera') {
											count += actionTypesArray[i];
										}
									}
								}
							}
						}
					}
				}
			}
			break;
		case 'Medium':
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					var categoryValue = actionDictionary[categoryKey];
					for ( var type in categoryValue) {
						if (parent === type) {
							if (categoryValue.hasOwnProperty(type)) {
								var arr = categoryValue[type];
								for (var k = 0; k < arr.length; k++) {
									for (var i = 0; i < numberOfActionTypes; i++) {
										if (arr[k] === recordedTypes[i] && recordedTypes[i] !== 'Camera') {
											count += actionTypesArray[i];
										}
									}
								}
							}
						}
					}
				}
			}
			break;
		case 'Fine':
			if (parent !== 'Camera')
				count = countActionOfType(parent);
			break;
		}
		return count;
	}

	function getIndexOfSelectedAction(x, y) {
		for (var i = 0; i < baseSet.length; i++) {
			var dx = x - xAction[i];
			var dy = y - yAction[i];
			if (dx * dx + dy * dy < size * size)
				return i;
		}
		return -1;
	}

	function move(x, y) {
		if (inAnimation)
			return;
		indexOfSelectedGrain = -1;
		indexOfSelectedAction = getIndexOfSelectedAction(x, y);
		that.draw();
		drawLinkedGraphs(linkedGraphs);
	}

	function onMouseMove(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		move(x, y);
		event.target.style.cursor = indexOfSelectedAction >= 0 ? 'help' : 'default';
	}

	function onMouseLeave(event) {
		event.preventDefault();
		var r = canvas.getBoundingClientRect();
		var x = event.clientX;
		var y = event.clientY;
		if (x < r.left || x > r.right || y < r.top || y > r.bottom) {
			that.popupMenu(event, false);
		}
	}

	function onTouchMove(event) {
		event.preventDefault();
		for (var i = 0; i < event.touches.length; i++) {
			var touch = event.touches[i];
			if (i === 0) {
				var rect = canvas.getBoundingClientRect();
				var x = touch.clientX - rect.left;
				var y = touch.clientY - rect.top;
				move(x, y);
			}
		}
	}

	function onMouseClick(event) {
		event.preventDefault();
		that.popupMenu(event, false);
	}

	function onMouseDoubleClick(event) {
		event.preventDefault();
		screenManager.maximize('radarchart');
	}

}