/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Digraph(id) {

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

	var COSA = Math.cos(geometry.toRadians(30));
	var SINA = Math.sin(geometry.toRadians(30));

	var canvas;
	var ctx;
	var margin = {
		left : 30,
		right : 30,
		top : 30,
		bottom : 30
	};
	var size = 6;
	var selfLoopSize = 20;
	var highlightCircleRadius = 8;
	var reducedEdges = [];
	var linkedGraphs = [];
	var xAction, yAction;

	this.linkGraph = function(g) {
		if (linkedGraphs.indexOf(g) === -1)
			linkedGraphs.push(g);
	}

	this.resize = function() {
		if (id === 'digraph') {
			setTableCanvasSize(canvas);
		} else {
			screenManager.setFullscreenPositionAndSize(canvas);
		}
		size = Math.min(canvas.height, canvas.width) / 50;
		selfLoopSize = size * 4;
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
		var menu = document.getElementById('context-menu-digraph');
		return menu.style.display === 'block';
	}

	this.popupMenu = function(e, b) {
		var menu = document.getElementById('context-menu-digraph');
		menu.style.display = b ? 'block' : 'none';
		if (e) {
			var position = htmlUtil.getPosition(e);
			menu.style.left = position.x + 'px';
			menu.style.top = position.y + 'px';
		}
	}

	this.updateEdges = function() {
		graph.createEdgeArray();
		reduceEdges();
	}

	this.showSelfLoops = function(b) {
		state.digraph.setShowSelfLoops(b);
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

		var theta = 2 * Math.PI / numberOfActionTypes;
		xAction = new Float32Array(numberOfActionTypes);
		yAction = new Float32Array(numberOfActionTypes)
		var aAction = new Float32Array(numberOfActionTypes);
		var radius = Math.min(canvas.width - margin.left - margin.right, canvas.height - margin.top - margin.bottom) / 2;
		for (var i = 0; i < numberOfActionTypes; i++) {
			aAction[i] = i * theta;
			xAction[i] = xCenter + Math.cos(aAction[i]) * radius;
			yAction[i] = yCenter + Math.sin(aAction[i]) * radius;
		}

		ctx.strokeStyle = 'lightgray';

		var x1, y1, x2, y2;
		// FIXME: loop through the original edges first so that individual edges at a given time interval can be shown. There is a lot of redundancy here.
		for (var k = 0; k < graph.edges.length; k++) {
			var e = graph.edges[k];
			x1 = xAction[e.i];
			y1 = yAction[e.i];
			ctx.lineWidth = 1;
			ctx.strokeStyle = indexOfSelectedActionType === e.i || indexOfSelectedActionType === e.j ? state.labelColor : 'rgba(204, 204, 204, 0.25)';
			if (indexOfSelectedGrain >= 0 && e.timestamp <= (indexOfSelectedGrain + 1) * state.interval && e.timestamp >= indexOfSelectedGrain * state.interval) {
				ctx.strokeStyle = 'red';
				ctx.lineWidth = 1;
			} else {
				var cij = graph.countEdge(e.i, e.j);
				ctx.lineWidth = cij > 1 ? 1 + Math.log(cij) * LOG_SCALE_FACTOR : 1;
			}
			if (e.i === e.j) {
				if (state.digraph.showSelfLoops) {
					var dx = x1 - xCenter;
					var dy = y1 - yCenter;
					var r = Math.sqrt(dx * dx + dy * dy);
					dx = x1 - selfLoopSize * dx / r;
					dy = y1 - selfLoopSize * dy / r;
					ctx.beginPath();
					ctx.arc(dx, dy, selfLoopSize, 0, 2 * Math.PI, false);
					ctx.closePath();
					ctx.stroke();
				}
			} else {
				x2 = xAction[e.j];
				y2 = yAction[e.j];
				if (graph.isEdgeBidirectional(e.i, e.j)) {
					var dx = x2 - x1;
					var dy = y2 - y1;
					var r = Math.sqrt(dx * dx + dy * dy);
					var shiftX = dx / r;
					var shiftY = dy / r;
					r = size / 4;
					x1 += r * shiftY;
					y1 -= r * shiftX;
					x2 += r * shiftY;
					y2 -= r * shiftX;
				}
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.closePath();
				ctx.stroke();
				drawArrowOnLine(x1, y1, x2, y2);
			}
		}

		var previousCategoryKey;
		for (var i = 0; i < numberOfActionTypes; i++) {
			ctx.beginPath();
			if (i === indexOfSelectedActionType) {
				ctx.arc(xAction[i], yAction[i], size * 2, 0, 2 * Math.PI, false);
				var gradient = ctx.createRadialGradient(xAction[i], yAction[i], 0, xAction[i], yAction[i], size * 2);
				gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
				gradient.addColorStop(1, 'rgba(255, 255, 0, 0.5)');
				ctx.fillStyle = gradient;
			} else {
				ctx.arc(xAction[i], yAction[i], size, 0, 2 * Math.PI, false);
				ctx.fillStyle = 'white';
			}
			ctx.fill();

			if (state.actionOrder === 'Clusterized') {
				ctx.save();
				ctx.beginPath();
				var gap = 0.25;
				if (i === 0 || recordedTypesAttributeMap[recordedTypes[i]] !== previousCategoryKey) {
					ctx.arc(xCenter, yCenter, radius - selfLoopSize, (i - 0.5 + gap) * theta, (i + 0.5) * theta, false);
				} else {
					ctx.arc(xCenter, yCenter, radius - selfLoopSize, (i - 0.5) * theta, (i + 0.5) * theta, false);
				}
				var hexColor = recordedTypesAttributeColor[recordedTypesAttributeMap[recordedTypes[i]]];
				if (hexColor !== undefined) {
					var rgb = hexToRgb(hexColor);
					ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)';
				}
				ctx.lineWidth = selfLoopSize * 2;
				ctx.stroke();
				ctx.restore();
			}

			ctx.strokeStyle = state.labelColor;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(xAction[i], yAction[i], size, 0, 2 * Math.PI, false);
			ctx.stroke();
			ctx.fillStyle = state.labelColor;
			ctx.save();
			ctx.translate(xAction[i], yAction[i]);
			if (aAction[i] <= Math.PI / 2 || aAction[i] >= 3 * Math.PI / 2) {
				ctx.textAlign = 'left';
				ctx.rotate(aAction[i]);
				ctx.fillText(recordedTypes[i], size * 1.5, size * 0.5);
			} else {
				ctx.textAlign = 'right';
				ctx.rotate(Math.PI + aAction[i]);
				ctx.fillText(recordedTypes[i], -size * 1.5, size * 0.5);
			}
			ctx.restore();

			previousCategoryKey = recordedTypesAttributeMap[recordedTypes[i]];

		}

		ctx.fillStyle = state.labelColor;
		for (var k = 0; k < reducedEdges.length; k++) {
			var e = reducedEdges[k];
			x1 = xAction[e.i];
			y1 = yAction[e.i];
			var actionTypeSelected = indexOfSelectedActionType === e.i || indexOfSelectedActionType === e.j;
			ctx.font = FONT.label;
			var cij = graph.countEdge(e.i, e.j);
			var dx, dy;
			if (e.i === e.j) {
				dx = x1 - xCenter;
				dy = y1 - yCenter;
				var r = Math.sqrt(dx * dx + dy * dy);
				dx = x1 - 2 * selfLoopSize * dx / r;
				dy = y1 - 2 * selfLoopSize * dy / r;
			} else {
				x2 = xAction[e.j];
				y2 = yAction[e.j];
				dx = (x1 + x2) / 2;
				dy = (y1 + y2) / 2;
				if (graph.isEdgeBidirectional(e.i, e.j)) {
					var lx = x1 - x2;
					var ly = y1 - y2;
					var l = Math.sqrt(lx * lx + ly * ly);
					var offset = 0.1;
					dx += offset * lx;
					dy += offset * ly;
				}
			}
			if (e.i !== e.j || state.digraph.showSelfLoops) {
				if (actionTypeSelected) {
					ctx.beginPath();
					ctx.fillStyle = 'yellow';
					ctx.arc(dx, dy, highlightCircleRadius, 0, 2 * Math.PI, false);
					ctx.fill();
					ctx.strokeStyle = state.labelColor;
					ctx.stroke();
					ctx.fillStyle = 'gray';
				} else {
					ctx.fillStyle = 'lightGray';
				}
				ctx.fillText(cij, dx - ctx.measureText(cij).width / 2, dy + 4);
			}
		}

		if (state.actionOrder === 'Clusterized') { // draw color keys for clusters
			var countKey = 0;
			for ( var k in recordedTypesAttributeColor) {
				if (recordedTypesAttributeColor.hasOwnProperty(k)) {
					var rgb = hexToRgb(recordedTypesAttributeColor[k]);
					ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)';
					ctx.fillRect(canvas.width - margin.right - 75, countKey * 12 + 10, 20, 10);
					ctx.fillStyle = state.labelColor;
					ctx.fillText(k, canvas.width - margin.right - 50, countKey * 12 + 20);
					countKey++;
				}
			}
		}

		ctx.fillStyle = state.labelColor;
		ctx.fillText('|A(G)| = ' + graph.edges.length, 4, 12);
		var degmax = Math.max.apply(null, graph.degrees);
		var imax = graph.degrees.indexOf(degmax);
		var degmin = Math.min.apply(null, graph.degrees);
		var imin = graph.degrees.indexOf(degmin);
		if (degmin === 0) {
			degmin = Number.MAX_SAFE_INTEGER;
			for (var i = 0; i < graph.degrees.length; i++) {
				if (graph.degrees[i] <= 0)
					continue;
				if (graph.degrees[i] < degmin) {
					degmin = graph.degrees[i];
					imin = i;
				}
			}
		}
		ctx.fillText('\u2206(G) = ' + degmax + ' (' + recordedTypes[imax] + ')', 4, 24);
		ctx.fillText('\u03B4(G) = ' + degmin + ' (' + recordedTypes[imin] + ')', 4, 36);

		if (indexOfSelectedActionType >= 0)
			ctx.drawTooltip(10, canvas.height - 40, 30, 10, 20, recordedTypes[indexOfSelectedActionType], false);

	}

	function reduceEdges() {
		reducedEdges = [];
		for (var k = 0; k < graph.edges.length; k++) {
			var e1 = graph.edges[k];
			var contained = false;
			for (var l = 0; l < reducedEdges.length; l++) {
				var e2 = reducedEdges[l];
				if (e1.i === e2.i && e1.j === e2.j) { // ignore the timestamp
					contained = true;
					break;
				}
			}
			if (!contained)
				reducedEdges.push(e1);
		}
	}

	function drawArrowOnLine(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		if (dx === 0 && dy === 0)
			return;
		var cx = (x1 + x2) / 2;
		var cy = (y1 + y2) / 2;
		var dr = Math.sqrt(dx * dx + dy * dy);
		var arrowX = dx / dr;
		var arrowY = dy / dr;
		cx -= 1.5 * highlightCircleRadius * arrowX;
		cy -= 1.5 * highlightCircleRadius * arrowY;
		var arrowLength = 6;
		var wx = arrowLength * (arrowX * COSA + arrowY * SINA);
		var wy = arrowLength * (arrowY * COSA - arrowX * SINA);
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx - wx, cy - wy);
		ctx.closePath();
		ctx.stroke();
		wx = arrowLength * (arrowX * COSA - arrowY * SINA);
		wy = arrowLength * (arrowY * COSA + arrowX * SINA);
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx - wx, cy - wy);
		ctx.closePath();
		ctx.stroke();
	}

	this.sort = function() {
		switch (state.actionOrder) {
		case 'Alphabetical':
			alphabetizeActions();
			break;
		case 'Clusterized':
			clusterizeActions();
			break;
		}
	}

	function getIndexOfSelectedActionType(x, y) {
		for (var i = 0; i < numberOfActionTypes; i++) {
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
		indexOfSelectedActionType = getIndexOfSelectedActionType(x, y);
		that.draw();
		drawLinkedGraphs(linkedGraphs);
	}

	function onMouseMove(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		move(x, y);
		event.target.style.cursor = indexOfSelectedActionType >= 0 ? 'help' : 'default';
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
		screenManager.maximize('digraph');
	}

}