/* 
 * Copyright 2015, The Engineering Computation Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Scatterplot(id) {

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
	var margin = {
		left : 40,
		right : 20,
		top : 20,
		bottom : 40
	};
	var highlightColors = [ 'Moccasin', 'Orange', 'LawnGreen' ];
	var tickLength;
	var tickmarkLength = 5;
	var showAnnotations = false;
	var dy;
	var horizontalAxisY;
	var numberOfTickmarksOfYAxis = 5;
	var scaleY;
	var mouseContained = false;
	var linkedGraphs = [];

	this.linkGraph = function(g) {
		if (linkedGraphs.indexOf(g) === -1)
			linkedGraphs.push(g);
	}

	this.resize = function() {
		if (id === 'scatterplot') {
			setTableCanvasSize(canvas);
			showAnnotations = false;
		} else {
			screenManager.setFullscreenPositionAndSize(canvas);
			showAnnotations = true;
		}
		this.draw();
	}

	this.getCanvas = function() {
		return canvas;
	}

	this.isFullscreen = function() {
		return screenManager.getCanvas() === canvas;
	}

	this.saveImage = function() {
		that.popupMenu(null, false);
		pngExporter.saveAs(screenManager.isFullscreen() ? screenManager.getCanvas() : canvas);
	}

	this.isPopupMenuVisible = function() {
		var menu = document.getElementById('context-menu-scatterplot');
		return menu.style.display === 'block';
	}

	this.popupMenu = function(e, b) {
		var menu = document.getElementById('context-menu-scatterplot');
		menu.style.display = b ? 'block' : 'none';
		if (e) {
			var position = htmlUtil.getPosition(e);
			menu.style.left = position.x + 'px';
			menu.style.top = position.y + 'px';
			var options = document.getElementById('scatterplot-action-selector');
			htmlUtil.removeAllOptions(options);
			switch (state.level) {
			case 'Top':
				for (var i = 0; i < topCategoryTimeSeriesArray.length; i++) {
					var opt = document.createElement('option');
					opt.value = Object.getPropertyByIndex(i, actionDictionary);
					opt.innerHTML = opt.value;
					options.appendChild(opt);
				}
				break;
			case 'Medium':
				for ( var categoryKey in actionDictionary) {
					if (actionDictionary.hasOwnProperty(categoryKey)) {
						var categoryValue = actionDictionary[categoryKey];
						for ( var type in categoryValue) {
							if (categoryValue.hasOwnProperty(type)) {
								var opt = document.createElement('option');
								opt.value = type;
								opt.innerHTML = type;
								options.appendChild(opt);
							}
						}
					}
				}
				break;
			case 'Fine':
				for (var i = 0; i < recordedTypes.length; i++) {
					var opt = document.createElement('option');
					opt.innerHTML = (i + 1) + ' : ' + recordedTypes[i];
					opt.value = recordedTypes[i];
					options.appendChild(opt);
				}
				break;
			}
			var o = state.scatterplot.selectedActions;
			if (o) {
				if (o.indexOf(',') != -1) {
					o = o.split(',');
				}
				o = [].concat(o);
			}
			for (var i = 0; i < options.length; i++) {
				options[i].selected = false;
				if (o) {
					for (var j = 0; j < o.length; j++) {
						if (o[j] === options[i].value) {
							options[i].selected = true;
						}
					}
				}
			}
		}
	}

	this.draw = function() {

		ctx = canvas.getContext('2d');
		ctx.fillStyle = window.getComputedStyle(canvas, null).backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		horizontalAxisY = canvas.height - margin.bottom;
		dy = (canvas.height - margin.top - margin.bottom) / (1 + numberOfActionTypes);

		switch (state.scatterplot.plotType) {
		case 'ScatterPlotAbsolute':
		case 'ScatterPlotRelative':
			drawColorBands();
			break;
		}

		// draw file transition
		ctx.fillStyle = state.labelColor;
		ctx.font = FONT.label;
		ctx.textAlign = 'left';
		for ( var t in fileTransitionPoints) {
			if (fileTransitionPoints.hasOwnProperty(t)) {
				ctx.fillText(fileTransitionPoints[t], margin.left + t * tickLength, margin.top - 8);
			}
		}
		if (Object.keys(fileTransitionPoints).length > 1) {
			for ( var t in fileTransitionPoints) {
				if (fileTransitionPoints.hasOwnProperty(t)) {
					if (t !== '0') {
						ctx.save();
						ctx.setLineDash([ 3 ]);
						ctx.strokeStyle = state.labelColor;
						ctx.beginPath();
						var xFileTransition = margin.left + t * tickLength;
						ctx.moveTo(xFileTransition, margin.top);
						ctx.lineTo(xFileTransition, horizontalAxisY);
						ctx.closePath();
						ctx.stroke();
						ctx.restore();
					}
				}
			}
		}

		drawHorizontalAxis();

		switch (state.scatterplot.plotType) {
		case 'ScatterPlotAbsolute':
			drawScatterPlot(0);
			break;
		case 'ScatterPlotRelative':
			drawScatterPlot(1);
			break;
		case 'CumulativeLines':
			drawCumulativeLines();
			break;
		}

		drawGraphWindow();

	}

	function drawColorBands() {
		if (state.actionOrder === 'Clusterized') {
			var previousColor;
			for (var i = 0; i < numberOfActionTypes; i++) {
				var yi = horizontalAxisY - i * dy;
				ctx.beginPath();
				ctx.rect(margin.left, yi - 1.5 * dy, canvas.width - margin.left - margin.right, dy);
				var hexColor = recordedTypesAttributeColor[recordedTypesAttributeMap[recordedTypes[i]]];
				if (hexColor !== undefined) {
					var rgb = hexToRgb(hexColor);
					ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.9)';
				}
				ctx.fill();
				ctx.closePath();
				if (previousColor !== undefined && hexColor !== previousColor) {
					ctx.save();
					ctx.strokeStyle = 'yellow';
					ctx.setLineDash([ 3 ]);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(margin.left, yi - .5 * dy);
					ctx.lineTo(canvas.width - margin.right, yi - .5 * dy);
					ctx.stroke();
					ctx.closePath();
					ctx.restore();
				}
				previousColor = hexColor;
			}
		}
	}

	// draw the horizontal axis (tickmarks and labels)
	function drawHorizontalAxis() {
		ctx.save();
		ctx.textAlign = 'center';
		tickLength = (canvas.width - margin.left - margin.right) / intervalCount;
		var step = 10;
		while (intervalCount < step) {
			step /= 2;
		}
		for (var i = 0; i < intervalCount; i++) {
			ctx.strokeStyle = state.labelColor;
			if (i % step === 0) {
				var xTickmark = margin.left + tickLength * i;
				var yTickmark = horizontalAxisY;
				ctx.fillStyle = state.labelColor;
				ctx.fillText(i * state.interval, xTickmark, yTickmark + 16);
				ctx.beginPath();
				ctx.moveTo(xTickmark, yTickmark);
				ctx.lineTo(xTickmark, yTickmark + tickmarkLength);
				ctx.closePath();
				ctx.stroke();
			}
			if (i === indexOfSelectedGrain) {
				ctx.beginPath();
				ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
				ctx.fillRect(margin.left + tickLength * i, margin.top, tickLength, canvas.height - margin.top - margin.bottom);
				ctx.strokeStyle = 'gray';
				ctx.beginPath();
				ctx.moveTo(margin.left + tickLength * (i + 0.5), margin.top);
				ctx.lineTo(margin.left + tickLength * (i + 0.5), canvas.height - margin.bottom);
				ctx.stroke();
			}
		}
		ctx.fillStyle = state.labelColor;
		ctx.font = FONT.axisName;
		ctx.fillText('Time (seconds)', canvas.width / 2, horizontalAxisY + 32);
		ctx.restore();
	}

	function drawScatterPlot(dataPointStyle) {

		ctx.save();

		ctx.font = FONT.label;
		mouseContained = false;
		for (var i = 1; i <= numberOfActionTypes; i++) {
			var yTickValue = i * dy;
			var yi = horizontalAxisY - yTickValue;
			if (i === indexOfSelectedActionType + 1) {
				ctx.beginPath();
				ctx.rect(margin.left, yi - dy + 4, canvas.width - margin.left - margin.right, 2 * dy - 8);
				var gradient = ctx.createLinearGradient(margin.left, yi - dy + 4, margin.left, yi + dy - 4);
				gradient.addColorStop(0, 'rgba(255, 0, 0, 0.25)');
				gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
				gradient.addColorStop(1, 'rgba(255, 0, 0, 0.25)');
				ctx.fillStyle = gradient;
				ctx.fill();
			}
			ctx.lineWidth = 1;
			ctx.fillStyle = state.labelColor;
			ctx.textAlign = 'center';
			ctx.fillText(i, margin.left - 12, yi + 4);
			ctx.beginPath();
			ctx.moveTo(margin.left, yi);
			ctx.lineTo(canvas.width - margin.right, yi);
			ctx.closePath();
			ctx.strokeStyle = 'lightGray';
			ctx.stroke();
			var size;
			for (var j = 0; j < intervalCount; j++) {
				var aij = actionTimeSeriesArray[i - 1][j];
				if (aij > 0) {
					switch (dataPointStyle) {
					case 0:
						ctx.beginPath();
						var scale = that.isFullscreen() ? 0.75 * screenManager.getCanvas().width / scatterplot.getCanvas().width : 1;
						size = Math.sqrt(aij) * scale; // have to use square root so that area more accurately represents data value
						ctx.arc(margin.left + tickLength * (j + 0.5), yi, size, 0, 2 * Math.PI, false);
						ctx.closePath();
						break;
					case 1:
						ctx.beginPath();
						var actionCount = timeseries.getActionCount(j);
						size = (aij / actionCount) * tickLength;
						ctx.rect(margin.left + tickLength * (j + 0.5) - size / 2, yi - dy / 4, size, dy / 2);
						ctx.closePath();
						break;
					}
					var r = Math.floor(i / numberOfActionTypes * 255);
					var g = 128;
					var b = 255 - r;
					ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';
					ctx.fill();
					ctx.lineWidth = 0.5;
					ctx.strokeStyle = state.labelColor;
					ctx.stroke();
					if (i === indexOfSelectedActionType + 1) {
						switch (dataPointStyle) {
						case 0:
							size += 2;
							ctx.beginPath();
							ctx.arc(margin.left + tickLength * (j + 0.5), yi, size, 0, 2 * Math.PI, false);
							ctx.closePath();
							break;
						case 1:
							// TODO
							break;
						}
						ctx.strokeStyle = state.labelColor;
						ctx.stroke();
						if (j === indexOfSelectedGrain) {
							mouseContained = true;
						}
					}
				}
			}
			ctx.textAlign = 'left';
			if (showAnnotations) {
				if (i === indexOfSelectedActionType + 1) {
					ctx.fillStyle = 'yellow';
				} else {
					var rgb = hexToRgb(state.labelColor);
					ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)';
				}
				ctx.fillText(recordedTypes[i - 1], margin.left + 5, yi - 2);
			} else {
				if (i === indexOfSelectedActionType + 1) {
					ctx.fillStyle = state.labelColor;
					ctx.fillText(recordedTypes[indexOfSelectedActionType], margin.left + 5, yi - 2);
				}
			}
		}

		if (indexOfSelectedGrain >= 0 && indexOfSelectedActionType >= 0 && indexOfSelectedActionType < numberOfActionTypes) {
			var count = actionTimeSeriesArray[indexOfSelectedActionType][indexOfSelectedGrain];
			if (count > 0) {
				var tipH = 20;
				var tipX = margin.left + tickLength * (indexOfSelectedGrain + 0.5) - tipH * 2;
				var tipY = horizontalAxisY - indexOfSelectedActionType * dy - tipH;
				ctx.drawTooltip(tipX, tipY, tipH, 5, 10, count, false);
			}
		}

		ctx.fillStyle = state.labelColor;
		ctx.translate(15, canvas.height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.font = FONT.axisName;
		ctx.textAlign = 'center';
		ctx.fillText('Action Type', 0, 0);
		ctx.restore();

	}

	function drawCumulativeLines() {

		ctx.save();

		var maximumHeight = state.timeseries.maximumHeight;
		var yi = margin.top + 20;
		switch (state.level) {
		case 'Top':
			maximumHeight = state.timeseries.maximumHeight * 10;
			scaleY = (canvas.height - margin.top - margin.bottom) / maximumHeight;
			var categoryCount = Object.size(actionDictionary);
			for (var i = 0; i < topCategoryTimeSeriesArray.length; i++) {
				var points = createArray(intervalCount);
				var cumu = 0;
				for (var j = 0; j < intervalCount; j++) {
					var aij = topCategoryTimeSeriesArray[i][j];
					if (aij > 0) {
						cumu += aij;
					}
					points[j] = new Point(margin.left + tickLength * (j + 0.5), horizontalAxisY - cumu * scaleY);
				}
				var categoryKey = Object.getPropertyByIndex(i, actionDictionary);
				var hexColor = recordedTypesAttributeColor[categoryKey];
				if (hexColor !== undefined) {
					var rgb = hexToRgb(hexColor);
					ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.9)';
				}
				var highlighted = state.scatterplot.selectedActions.indexOf(categoryKey) >= 0;
				ctx.lineWidth = highlighted ? 4 : 2;
				drawStraightLine(points);
				ctx.fillStyle = ctx.strokeStyle;
				ctx.fillText('\u00B7 ' + categoryKey, margin.left + 10, yi);
				yi += 12;
			}
			ctx.fillStyle = state.labelColor;
			break;
		case 'Medium':
			maximumHeight = state.timeseries.maximumHeight * 5;
			scaleY = (canvas.height - margin.top - margin.bottom) / maximumHeight;
			var actionTypeElement = document.getElementById('actiontype');
			var selectedActionType = actionTypeElement.value;
			var k = 0;
			for ( var categoryKey in actionDictionary) {
				if (actionDictionary.hasOwnProperty(categoryKey)) {
					var categoryValue = actionDictionary[categoryKey];
					for ( var type in categoryValue) {
						if (categoryValue.hasOwnProperty(type)) {
							var arr = categoryValue[type];
							var points = createArray(intervalCount);
							var cumu = 0;
							for (var j = 0; j < intervalCount; j++) {
								if (selectedActionType === undefined || selectedActionType === 'All' || selectedActionType.indexOf('All But Camera') === 0) {
									for (var i = 0; i < recordedTypes.length; i++) {
										if (arr.indexOf(recordedTypes[i]) >= 0) {
											cumu += actionTimeSeriesArray[i][j];
										}
									}
								} else {
									if (arr.indexOf(selectedActionType) >= 0) {
										var i = recordedTypes.indexOf(selectedActionType);
										if (i >= 0)
											cumu += actionTimeSeriesArray[i][j];
									}
								}
								points[j] = new Point(margin.left + tickLength * (j + 0.5), horizontalAxisY - cumu * scaleY);
							}
							var highlighted = state.scatterplot.selectedActions.indexOf(type) >= 0;
							ctx.lineWidth = highlighted ? 3 : 1;
							ctx.strokeStyle = highlighted ? highlightColors[k] : 'white';
							drawStraightLine(points);
							if (highlighted)
								k++;
						}
					}
				}
			}
			break;
		case 'Fine':
			maximumHeight = state.timeseries.maximumHeight * 2;
			scaleY = (canvas.height - margin.top - margin.bottom) / maximumHeight;
			var k = 0;
			for (var i = 0; i < numberOfActionTypes; i++) {
				var points = createArray(intervalCount);
				var cumu = 0;
				for (var j = 0; j < intervalCount; j++) {
					var aij = actionTimeSeriesArray[i][j];
					if (aij > 0) {
						cumu += aij;
					}
					points[j] = new Point(margin.left + tickLength * (j + 0.5), horizontalAxisY - cumu * scaleY);
				}
				var highlighted = state.scatterplot.selectedActions.indexOf(recordedTypes[i]) >= 0;
				ctx.lineWidth = highlighted ? 3 : 1;
				ctx.strokeStyle = highlighted ? highlightColors[k] : 'white';
				drawStraightLine(points);
				if (highlighted)
					k++;
			}
			break;
		}
		if (state.level !== 'Top') {
			var o = state.scatterplot.selectedActions;
			if (o) {
				if (o.indexOf(',') != -1) {
					o = o.split(',');
				}
				o = [].concat(o);
				if (o.length > 0) {
					ctx.fillText('Highlighted:', margin.left + 10, yi);
					yi += 10;
					for (var j = 0; j < o.length; j++) {
						ctx.fillStyle = highlightColors[j];
						ctx.fillText('\u00B7 ' + o[j], margin.left + 20, yi + (j + 1) * 12);
					}
					ctx.fillStyle = state.labelColor;
				}
			}
		}

		// draw the vertical axis (tickmarks and labels)
		ctx.beginPath();
		ctx.strokeStyle = state.labelColor;
		ctx.font = FONT.label;
		var dy = maximumHeight / numberOfTickmarksOfYAxis;
		for (var i = 0; i <= numberOfTickmarksOfYAxis; i++) {
			var yTickValue = i * dy;
			var yi = horizontalAxisY - yTickValue * scaleY;
			ctx.fillText(yTickValue, margin.left - 18, yi + 4);
			ctx.moveTo(margin.left, yi);
			ctx.lineTo(margin.left + tickmarkLength, yi);
			ctx.stroke();
		}

		ctx.fillStyle = state.labelColor;
		ctx.translate(15, canvas.height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.font = FONT.axisName;
		ctx.textAlign = 'center';
		ctx.fillText('Action Count', 0, 0);

		ctx.restore();

	}

	function drawStraightLine(points) {
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.stroke();
		ctx.closePath();
	}

	// draw the graph window
	function drawGraphWindow() {
		ctx.save();
		ctx.strokeStyle = state.labelColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(margin.left, horizontalAxisY);
		ctx.lineTo(canvas.width - margin.right, horizontalAxisY);
		ctx.lineTo(canvas.width - margin.right, margin.top);
		ctx.lineTo(margin.left, margin.top);
		ctx.closePath();
		ctx.stroke();
		if (showAnnotations) {
			var currentX = margin.left + tickLength * (indexOfSelectedGrain + 0.5);
			var ts = new Date(timeBegin + indexOfSelectedGrain * state.interval * 1000);
			var timestampString = (ts.getFullYear() + '-' + addZero(ts.getMonth() + 1) + '-' + addZero(ts.getDate()) + '-' + addZero(ts.getUTCHours()) + '-' + addZero(ts.getMinutes()) + '-' + addZero(ts.getSeconds()));
			ctx.drawTooltip(currentX, canvas.height - 25, 20, 8, 10, timestampString, true);
		}
		ctx.restore();
	}

	this.plotAs = function(type) {
		state.scatterplot.setPlotType(type);
		this.draw();
		screenManager.draw();
	}

	this.selectActions = function(selection) {
		state.scatterplot.setSelectedActions(selection);
		this.draw();
		screenManager.draw();
	}

	function move(x, y) {
		if (inAnimation)
			return;
		if (y < margin.top || y > canvas.height - margin.bottom)
			return;
		y = horizontalAxisY - y;
		indexOfSelectedActionType = Math.round(y / dy - 0.5);
		indexOfSelectedGrain = Math.floor(x / tickLength);
		that.draw();
		drawLinkedGraphs(linkedGraphs);
	}

	function onMouseMove(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left - margin.left;
		var y = event.clientY - rect.top;
		move(x, y);
		event.target.style.cursor = mouseContained ? 'help' : 'default';
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
				var x = touch.clientX - rect.left - margin.left;
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
		screenManager.maximize('scatterplot');
	}
}