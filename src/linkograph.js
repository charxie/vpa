/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Guanhua Chen
 *
 */

'use strict';

function Linkograph(id) {

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
	var xRect;
	var yRect;
	var incre;
	var rectHeight;
	var selectedAction = -1;
	var selectedSemicircle;
	var semicircles = [];
	var shorterSideOfCanvas;
	var offset;
	var linkedGraphs = [];

	this.linkGraph = function(g) {
		if (linkedGraphs.indexOf(g) === -1)
			linkedGraphs.push(g);
	}

	this.resize = function() {
		if (id === 'linkograph') {
			setTableCanvasSize(canvas);
		} else {
			screenManager.setFullscreenPositionAndSize(canvas);
		}
		shorterSideOfCanvas = Math.min(canvas.width, canvas.height);
		offset = (canvas.width - shorterSideOfCanvas) / 2;
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
		var menu = document.getElementById('context-menu-linkograph');
		return menu.style.display === 'block';
	}

	this.popupMenu = function(e, b) {
		var menu = document.getElementById('context-menu-linkograph');
		menu.style.display = b ? 'block' : 'none';
		if (e) {
			var position = htmlUtil.getPosition(e);
			menu.style.left = position.x + 'px';
			menu.style.top = position.y + 'px';
		}
	}

	this.setWithinColor = function(color) {
		state.linkograph.setWithinColor(color);
		this.draw();
		screenManager.draw();
	}

	this.setBetweenColor = function(color) {
		state.linkograph.setBetweenColor(color);
		this.draw();
		screenManager.draw();
	}

	this.draw = function() {

		var clusterized = state.actionOrder === 'Clusterized';

		ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// draw rectangles
		rectHeight = canvas.height / 20;
		xRect = offset;
		yRect = canvas.height / 2 - rectHeight;
		incre = shorterSideOfCanvas / recordedTypes.length;
		var xBox1 = xRect;
		for (var i = 0; i < recordedTypes.length; i++) { // do NOT use for...in to loop through an array
			if (i > 0 && recordedTypesAttributeMap[recordedTypes[i - 1]] !== recordedTypesAttributeMap[recordedTypes[i]]) {
				drawRect(xRect, yRect, incre, rectHeight, state.canvasBackground, false, 0);
				if (clusterized)
					xBox1 = drawBox(xBox1);
			}
			var count;
			if (recordedTypes[i] === 'Camera') { // skip camera actions
				count = 0;
			} else {
				count = graph.countEdge(i, i);
			}
			var actionTypeColor = recordedTypesAttributeColor[recordedTypesAttributeMap[recordedTypes[i]]];
			if (selectedAction === i) {
				var text = recordedTypes[i] + ' \u2192 ' + recordedTypes[i] + ': ' + count;
				ctx.drawTooltip(10, 10, 30, 10, 20, text, false);
				drawRect(xRect, yRect, incre, rectHeight, actionTypeColor, true, count);
			} else {
				drawRect(xRect, yRect, incre, rectHeight, actionTypeColor, false, count);
			}
			xRect += incre;
		}
		if (clusterized)
			drawBox(xBox1);

		// draw arcs
		semicircles = [];
		for (var i = 0; i < recordedTypes.length; i++) {
			for (var j = i + 1; j < recordedTypes.length; j++) {
				if (recordedTypes[i] === 'Camera' || recordedTypes[j] === 'Camera') // skip camera actions
					continue;
				var count1 = graph.countEdge(i, j);
				var count2 = graph.countEdge(j, i);
				if (count1 === 0 && count2 === 0)
					continue;
				var r = (j - i) * incre / 2;
				var xi = offset + (i + 1 / 2) * incre + r;
				var highlight = selectedAction === i || selectedAction === j;
				var sameCategory = recordedTypesAttributeMap[recordedTypes[i]] === recordedTypesAttributeMap[recordedTypes[j]];
				var arcColor = sameCategory ? state.linkograph.withinColor : state.linkograph.betweenColor;
				if (count1 !== 0) {
					var sc = new Semicircle(xi, yRect, r, i, j, count1);
					semicircles.push(sc);
					drawSemicircle(sc, false, arcColor, highlight);
				}
				if (count2 !== 0) {
					var sc = new Semicircle(xi, yRect + rectHeight, r, j, i, count2);
					semicircles.push(sc);
					drawSemicircle(sc, true, arcColor, highlight);
				}
			}
		}

		if (selectedEdge) {
			if (state.level === 'Fine') {
				selectedAction = -1;
				selectedSemicircle = null;
				if (selectedEdge.i === selectedEdge.j) {
					selectedAction = selectedEdge.i;
				} else {
					for (var i = 0; i < semicircles.length; i++) {
						var sc = semicircles[i];
						if (sc.nodeContains(selectedEdge.i, selectedEdge.j)) {
							selectedSemicircle = sc;
							break;
						}
					}
				}
			}
		}

		highlightSelection();

	}

	function drawBox(xBox1) {
		ctx.save();
		// ctx.setLineDash([ 3 ]);
		ctx.beginPath();
		var xBox2 = xRect;
		var yBox = yRect - rectHeight;
		ctx.rect(xBox1, yBox, xBox2 - xBox1, 3 * rectHeight);
		ctx.closePath();
		var rgb = hexToRgb(state.labelColor);
		ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)';
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
		return xBox2;
	}

	function drawRect(x, y, width, height, color, highlight, count) {
		ctx.beginPath();
		ctx.rect(x + 5, y, width - 10, height);
		if (count > 0) {
			ctx.lineWidth = count > 1 ? 1 + Math.log(count) * LOG_SCALE_FACTOR : 1;
			ctx.strokeStyle = state.linkograph.withinColor;
			ctx.stroke();
		}
		ctx.fillStyle = highlight ? state.linkograph.highlightColor : color;
		ctx.fill();
	}

	function drawSemicircle(semicircle, ccw, color, highlight) {
		drawArc(semicircle.x, semicircle.y, semicircle.r, ccw, color, semicircle.count, highlight);
	}

	function drawArc(x, y, r, ccw, color, count, highlight) {
		var startAngle = Math.PI;
		var endAngle = 2 * Math.PI;
		ctx.beginPath();
		ctx.arc(x, y, r, startAngle, endAngle, ccw);
		ctx.lineWidth = count > 1 ? 1 + Math.log(count) * LOG_SCALE_FACTOR : 1;
		ctx.save();
		ctx.globalAlpha = 0.2;
		if (highlight) {
			ctx.fillStyle = state.linkograph.highlightColor;
			ctx.fill();
			ctx.restore();
			ctx.strokeStyle = state.linkograph.highlightColor;
		} else {
			var rgb = hexToRgb(color);
			var rgbaString = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + count / 5 + ')';
			ctx.fillStyle = rgbaString;
			ctx.fill();
			ctx.restore();
			ctx.strokeStyle = rgbaString;
		}
		ctx.stroke();
		drawArrow(x, y, ccw, r);
	}

	function drawArrow(cx, cy, ccw, r) {
		var arrowLength = 10;
		var x = cx;
		var y;
		var wx;
		var wy;
		if (ccw) {
			y = cy + r;
			wx = arrowLength * Math.cos(Math.PI / 6);
		} else {
			y = cy - r;
			wx = -arrowLength * Math.cos(Math.PI / 6);
		}
		wy = arrowLength * Math.sin(Math.PI / 6);
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + wx, y + wy);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + wx, y - wy);
		ctx.closePath();
		ctx.stroke();
	}

	function highlightSelection() {
		if (selectedSemicircle) {
			var i = selectedSemicircle.i;
			var j = selectedSemicircle.j;
			var text = recordedTypes[i] + ' \u2192 ' + recordedTypes[j] + ': ' + selectedSemicircle.count;
			ctx.drawTooltip(10, 10, 30, 10, 20, text, false);
			drawRect(offset + i * incre, yRect, incre, rectHeight, state.linkograph.highlightColor, true, graph.countEdge(i, i));
			drawRect(offset + j * incre, yRect, incre, rectHeight, state.linkograph.highlightColor, true, graph.countEdge(j, j));
			var xi = ((i < j ? i : j) + 0.5) * incre;
			var ri = Math.abs((j - i) / 2) * incre;
			drawArc(offset + xi + ri, selectedSemicircle.y, ri, selectedSemicircle.y === yRect + rectHeight, state.linkograph.highlightColor, selectedSemicircle.count, true);
		}
	}

	function move(x, y) {
		if (inAnimation)
			return;
		selectedAction = -1;
		selectedSemicircle = undefined;
		selectedEdge = undefined;
		for (var i = 0; i < recordedTypes.length; i++) {
			if (yRect < y && y < yRect + rectHeight && offset + i * incre < x && x < offset + (i + 1) * incre) {
				selectedAction = i;
				if (state.level === 'Fine') {
					selectedEdge = new Edge(i, i);
					selectedEdge.owner = that;
				}
				break;
			}
		}
		if (selectedAction === -1) {
			for (var i = 0; i < semicircles.length; i++) {
				var sc = semicircles[i];
				if (sc.lineContains(x, y)) {
					// only consider the upper semicircles and the lower semicircles, which are identified by their y coordinates
					if ((sc.y === yRect && y < yRect) || (sc.y === yRect + rectHeight && y > yRect + rectHeight)) {
						selectedSemicircle = sc;
						if (state.level === 'Fine') {
							selectedEdge = new Edge(sc.i, sc.j);
							selectedEdge.owner = that;
						}
					}
					break;
				}
			}
		}
		that.draw();
		drawLinkedGraphs(linkedGraphs);
	}

	function onMouseMove(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		move(x, y);
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
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		move(x, y);
	}

	function onMouseClick(event) {
		event.preventDefault();
		that.popupMenu(event, false);
	}

	function onMouseDoubleClick(event) {
		event.preventDefault();
		screenManager.maximize('linkograph');
	}

}

function Semicircle(x, y, r, i, j, count) {

	var threshold1 = 0.1;
	var threshold2 = 100;

	this.x = x;
	this.y = y;
	this.r = r; // radius
	this.i = i; // node
	this.j = j; // node
	this.count = count; // multiplicity

	this.lineContains = function(a, b) {
		var dx = a - x;
		var dy = b - y;
		if (r <= 50)
			return Math.abs(dx * dx + dy * dy - r * r) < threshold2;
		return Math.abs(dx * dx + dy * dy - r * r) / (r * r) < threshold1;
	}

	// contains nodes in the specific order
	this.nodeContains = function(i, j) {
		return this.i === i && this.j === j;
	}

}