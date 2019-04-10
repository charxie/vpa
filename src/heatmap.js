/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function HeatMap(id) {

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
	var cells, cellHits; // two-dimensional arrays
	var maxHits;
	var margin = {
		left : 30,
		right : 30,
		top : 30,
		bottom : 30
	};
	var gap = 4;
	var linkedGraphs = [];

	this.linkGraph = function(g) {
		if (linkedGraphs.indexOf(g) === -1)
			linkedGraphs.push(g);
	}

	this.resize = function() {
		if (id === 'heatmap') {
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
		var menu = document.getElementById('context-menu-heatmap');
		return menu.style.display === 'block';
	}

	this.popupMenu = function(e, b) {
		var menu = document.getElementById('context-menu-heatmap');
		menu.style.display = b ? 'block' : 'none';
		if (e) {
			var position = htmlUtil.getPosition(e);
			menu.style.left = position.x + 'px';
			menu.style.top = position.y + 'px';
		}
	}

	this.setContrast = function(c) {
		var x = parseInt(c);
		if (x > 20) {
			x = 20;
			document.getElementById('heatmap_contrast_textfield').value = x;
		}
		state.heatmap.setContrast(x);
		this.draw();
		screenManager.draw();
	}

	this.setColor = function(c) {
		state.heatmap.setColor(c);
		this.draw();
		screenManager.draw();
	}

	this.draw = function() {

		ctx = canvas.getContext('2d');
		ctx.fillStyle = window.getComputedStyle(canvas, null).backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = 'gray';
		ctx.lineWidth = 1;
		var n = cells.length;
		var cellSize = Math.min(canvas.width - margin.left - margin.right, canvas.height - margin.top - margin.bottom) / n;
		var xOffset = margin.left + (canvas.width - margin.left - margin.right) / 2;
		var yOffset = margin.top + (canvas.height - margin.top - margin.bottom) / 2;
		xOffset -= n * cellSize / 2;
		yOffset -= n * cellSize / 2;
		var hit;
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				if (cells[i][j] == undefined) {
					cells[i][j] = new Rectangle(xOffset + i * cellSize, yOffset + j * cellSize, cellSize, cellSize);
				} else {
					cells[i][j].x = xOffset + i * cellSize;
					cells[i][j].y = yOffset + j * cellSize;
					cells[i][j].width = cellSize;
					cells[i][j].height = cellSize;
				}
				hit = Math.round(255 * (1 - cellHits[i][j] * state.heatmap.contrast)); // use a multiplier to increase the visibility of weak cells
				if (hit < 0)
					hit = 0;
				switch (state.heatmap.color) {
				case 'red':
					ctx.fillStyle = 'rgba(' + 255 + ', ' + hit + ', ' + hit + ', 1)';
					break;
				case 'black':
					ctx.fillStyle = 'rgba(' + hit + ', ' + hit + ', ' + hit + ', 1)';
					break;
				case 'purple':
					ctx.fillStyle = 'rgba(' + 255 + ', ' + hit + ', ' + 255 + ', 1)';
					break;
				}
				ctx.fillRect(cells[i][j].x + gap, cells[i][j].y + gap, cells[i][j].width - 2 * gap, cells[i][j].height - 2 * gap);
			}
		}
		for (var i = 0; i <= n; i++) {
			ctx.beginPath();
			ctx.moveTo(xOffset + i * cellSize, yOffset);
			ctx.lineTo(xOffset + i * cellSize, yOffset + n * cellSize);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(xOffset, yOffset + i * cellSize);
			ctx.lineTo(xOffset + n * cellSize, yOffset + i * cellSize);
			ctx.closePath();
			ctx.stroke();
		}

		ctx.font = FONT.label;
		for (var i = 0; i < n; i++) {
			ctx.save();
			ctx.translate(xOffset + (i + 0.45) * cellSize, yOffset);
			ctx.fillStyle = state.labelColor;
			ctx.textAlign = 'left';
			ctx.rotate(-Math.PI * 0.2);
			ctx.fillText(baseSet[i], 6, 0);
			ctx.restore();
			ctx.save();
			ctx.translate(xOffset, yOffset + (i + 0.5) * cellSize);
			ctx.fillStyle = state.labelColor;
			ctx.textAlign = 'right';
			ctx.rotate(-Math.PI * 0.2);
			ctx.fillText(baseSet[i], -4, 0);
			ctx.restore();
		}

		if (selectedEdge !== null && selectedEdge !== undefined) {
			ctx.font = FONT.normal;
			var cell = cells[selectedEdge.i][selectedEdge.j];
			if (cell) {
				ctx.strokeStyle = 'yellow';
				ctx.lineWidth = state.level === 'Fine' ? 1.5 : 4;
				ctx.beginPath();
				ctx.rect(cell.x, cell.y, cell.width, cell.height);
				ctx.stroke();
				if (selectedEdge.owner instanceof HeatMap) {
					var pair = baseSet[selectedEdge.i] + ' \u2192 ' + baseSet[selectedEdge.j] + ': ' + Math.round(maxHits * cellHits[selectedEdge.i][selectedEdge.j]);
					var pairCenterX = cell.x + cell.width / 2;
					var pairCenterY = cell.y + cell.height / 2;
					ctx.drawTooltip(pairCenterX, pairCenterY - 15, 30, 10, 20, pair, true);
				}
			}
		}

	}

	this.createBaseSet = function() {
		baseSet = [];
		switch (state.level) {
		case 'Top':
			gap = 4;
			// state.heatmap.contrast = 1;
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					baseSet.push(categoryKey);
				}
			}
			break;
		case 'Medium':
			gap = 2;
			// state.heatmap.contrast = 10;
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
			gap = 0;
			for (var i = 0; i < recordedTypes.length; i++) {
				baseSet.push(recordedTypes[i]);
			}
			break;
		}

		populateCells();

	}

	function populateCells() {
		var n = baseSet.length;
		cells = createArray(n, n);
		cellHits = createArray(n, n);
		// erase existing hits if any
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				cellHits[i][j] = 0;
			}
		}
		var e;
		var i, j;
		for (var k = 0; k < graph.edges.length; k++) {
			e = graph.edges[k];
			i = recordedTypes[e.i];
			j = recordedTypes[e.j];
			if (excludeCameraAction && (i === "Camera" || j === "Camera"))
				continue;
			cellHits[getCellIndex(i)][getCellIndex(j)]++;
		}
		// find maximum
		maxHits = -1;
		for (i = 0; i < n; i++) {
			for (j = 0; j < n; j++) {
				if (cellHits[i][j] > maxHits)
					maxHits = cellHits[i][j];
			}
		}
		// normalize the hit array
		for (i = 0; i < n; i++) {
			for (j = 0; j < n; j++) {
				cellHits[i][j] /= maxHits;
			}
		}
		// console.log(JSON.stringify(cellHits));
	}

	function getCellIndex(x) {
		var index = 0;
		switch (state.level) {
		case 'Top':
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					var categoryValue = actionDictionary[categoryKey];
					for ( var type in categoryValue) {
						if (categoryValue.hasOwnProperty(type)) {
							var arr = categoryValue[type];
							for (var k = 0; k < arr.length; k++) {
								if (arr[k] === x)
									return index;
							}
						}
					}
					index++;
				}
			}
			break;
		case 'Medium':
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					var categoryValue = actionDictionary[categoryKey];
					for ( var type in categoryValue) {
						if (categoryValue.hasOwnProperty(type)) {
							var arr = categoryValue[type];
							for (var k = 0; k < arr.length; k++) {
								if (arr[k] === x)
									return index;
							}
							index++;
						}
					}
				}
			}
			break;
		case 'Fine':
			index = recordedTypes.indexOf(x);
			break;
		}
		return index;
	}

	function getSelectedCell(x, y) {
		var n = baseSet.length;
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				if (cells[i][j].contains(x, y)) {
					var edge = new Edge(i, j);
					edge.owner = that;
					return edge;
				}
			}
		}
		return null;
	}

	function move(x, y) {
		if (inAnimation)
			return;
		indexOfSelectedGrain = -1;
		selectedEdge = getSelectedCell(x, y);
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
		selectedEdge = null;
		that.draw();
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
		screenManager.maximize('heatmap');
	}

}