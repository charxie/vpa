/* 
 * Time series analysis and visualization.
 * 
 * Copyright 2015, The Engineering Computation Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function TimeSeries(id) {

	var that = this;

	this.id = id;

	this.init = function() {
		canvas = document.getElementById(id);
		if (id === 'canvas-popup') { // making a clone of this canvas is, at this point, the easiest workaround to remove all existing event listeners from an element
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
	var numberOfTickmarksOfYAxis = 5;
	var margin = {
		left : 40,
		right : 20,
		top : 20,
		bottom : 40
	};
	var squareLength;
	var dotRadius = 0.5;
	var symbolSize = 2;
	var numberOfLegendColumns = 3;
	var activateOnlyGraphWindow = true;
	var symbol = true;
	var grainSum;
	var totalAction;
	var horizontalAxisY;
	var scaleY;
	var tickLength;
	var tickmarkLength = 5;
	var splineSteps = 10;
	var splinePx;
	var splinePy;
	var linkedGraphs = [];
	var raf;
	var sonificationIntervalID;
	var resultCollector = new ResultCollector();

	this.linkGraph = function(g) {
		if (linkedGraphs.indexOf(g) === -1)
			linkedGraphs.push(g);
	}

	this.resize = function() {
		if (id === 'timeseries') {
			setTableCanvasSize(canvas);
			dotRadius = 0.5;
			symbolSize = 2;
			numberOfLegendColumns = 3;
			activateOnlyGraphWindow = true;
		} else {
			screenManager.setFullscreenPositionAndSize(canvas);
			dotRadius = 2;
			symbolSize = 4;
			numberOfLegendColumns = 6;
			activateOnlyGraphWindow = false;
		}
		squareLength = Math.min(canvas.width - margin.left - margin.right, canvas.height - margin.top - margin.bottom) - 50;
		this.draw();
	}

	this.getCanvas = function() {
		return canvas;
	}

	this.saveImage = function() {
		that.popupMenu(null, false);
		pngExporter.saveAs(screenManager.isFullscreen() ? screenManager.getCanvas() : canvas);
	}

	this.exportGraphData = function() {
		that.popupMenu(null, false);
		var arr = new Array(2);
		for (var i = 0; i < arr.length; i++) {
			arr[i] = new Array(intervalCount);
		}
		for (var j = 0; j < intervalCount; j++) {
			arr[0][j] = state.interval * j;
			arr[1][j] = grainSum[j];
		}
		csvExporter.saveAs(arr, 'data');
	}

	this.clearCollectedResults = function() {
		that.popupMenu(null, false);
		resultCollector.clear();
	}

	this.exportCollectedResults = function() {
		that.popupMenu(null, false);
		var rows = resultCollector.getRows();
		if (rows <= 0)
			return;
		resultCollector.sort();
		var cols = resultCollector.getColumns();
		if (cols <= 0)
			return;
		var arr = resultCollector.toArray();
		if (arr !== null)
			csvExporter.saveAs(arr, 'result');
	}

	this.getActionCount = function(i) {
		return grainSum[i];
	}

	this.isPopupMenuVisible = function() {
		var menu = document.getElementById('context-menu-timeseries');
		return menu.style.display === 'block';
	}

	this.popupMenu = function(e, b) {
		var menu = document.getElementById('context-menu-timeseries');
		menu.style.display = b ? 'block' : 'none';
		if (e) {
			var position = htmlUtil.getPosition(e);
			menu.style.left = position.x + 'px';
			menu.style.top = position.y + 'px';
			var item = document.getElementById('menu-item-export-collected-results');
			item.innerHTML = 'Export collected results (' + resultCollector.getRows() + '&times;' + resultCollector.getColumns() + ')...';
		}
	}

	this.enterMaximumHeight = function(v, e) {
		if (e.keyCode === 13) { // Enter key is hit
			var x = parseFloat(v);
			if (x < 1) {
				x = 1;
				document.getElementById('timeseries_max_height').value = x;
			}
			state.timeseries.setMaximumHeight(x);
			this.draw();
			drawLinkedGraphs(linkedGraphs);
		}
	}

	this.enterInterval = function(v, e) {
		if (e.keyCode === 13) { // Enter key is hit
			var x = parseFloat(v);
			if (x < 2) {
				x = 2;
				document.getElementById('timeseries_interval').value = x;
			}
			state.setInterval(x);
			createActionTimeSeriesArray();
			this.draw();
			drawLinkedGraphs(linkedGraphs);
		}
	}

	this.enterSplineTension = function(v, e) {
		if (e.keyCode === 13) { // Enter key is hit
			var x = parseFloat(v);
			if (x > 1) {
				x = 1;
				document.getElementById('spline_tension').value = x;
			} else if (x < 0) {
				x = 0;
				document.getElementById('spline_tension').value = x;
			}
			state.timeseries.setSplineTension(x);
			this.draw();
		}
	}

	this.enterRecurrenceEpsilon = function(v, e) {
		if (e.keyCode === 13) { // Enter key is hit
			var x = parseFloat(v);
			if (x < 0) {
				x = 0;
				document.getElementById('recurrence_epsilon').value = x;
			}
			state.timeseries.setRecurrenceEpsilon(x);
			this.draw();
		}
	}

	this.setIdleValid = function(b) {
		state.timeseries.setRecurrenceIdleValid(b);
		this.draw();
	}

	this.setRecurrenceI = function(i) {
		state.timeseries.setRecurrenceI(i);
		this.draw();
	}

	this.setRecurrenceJ = function(j) {
		state.timeseries.setRecurrenceJ(j);
		this.draw();
	}

	this.setLineColor = function(color) {
		state.timeseries.setLineColor(color);
		this.draw();
	}

	this.setFillColor = function(color) {
		state.timeseries.setFillColor(color);
		this.draw();
	}

	this.animate = function(on) {
		inAnimation = on;
		if (on) {
			indexOfSelectedGrain = 0;
			raf = window.requestAnimationFrame(run);
		} else {
			window.cancelAnimationFrame(raf);
		}
	}

	this.setSoundInterval = function(interval) {
		state.sound.setInterval(interval);
		this.sonify(false);
	}

	this.setSoundPitch = function(pitch) {
		state.sound.setPitch(pitch);
		this.sonify(false);
	}

	this.setSoundAttack = function(attack) {
		state.sound.setAttack(attack);
		this.sonify(false);
	}

	this.setSoundDecay = function(decay) {
		state.sound.setDecay(decay);
		this.sonify(false);
	}

	this.setSoundOscillatorType = function(type) {
		state.sound.setOscillatorType(type);
		this.sonify(false);
	}

	this.sonify = function(on) {

		inAnimation = on;
		if (on) {
			sonificationIntervalID = setInterval(function() {
				var freq = grainSum[indexOfSelectedGrain] * state.sound.pitch;
				if (freq) {
					sound.createOscillator(freq);
				}
				indexOfSelectedGrain++;
				if (indexOfSelectedGrain > intervalCount) {
					indexOfSelectedGrain = 0;
					clearInterval(sonificationIntervalID);
					document.getElementById('sonify_timeseries').checked = false;
					inAnimation = false;
				}
				update();
			}, state.sound.interval * state.interval);
		} else {
			if (sonificationIntervalID) {
				clearInterval(sonificationIntervalID);
				document.getElementById('sonify_timeseries').checked = false;
			}
		}

	}

	function run() {
		indexOfSelectedGrain++;
		if (indexOfSelectedGrain > intervalCount) {
			indexOfSelectedGrain = 0;
			that.animate(false); // private method (run) cannot access a privileged method (animate) directly
			document.getElementById('animate_timeseries').checked = false;
		} else {
			update();
			raf = window.requestAnimationFrame(run);
		}
	}

	function update() {
		that.draw();
		screenManager.draw();
		drawLinkedGraphs(linkedGraphs);
	}

	this.draw = function() {

		totalAction = 0;
		grainSum = new Int16Array(intervalCount);
		for (var j = 0; j < intervalCount; j++) {
			grainSum[j] = 0;
			for (var i = 0; i < numberOfActionTypes; i++) {
				if (actionTimeSeriesArray[i][j] > 0)
					grainSum[j] += actionTimeSeriesArray[i][j];
			}
			totalAction += grainSum[j];
		}

		ctx = canvas.getContext('2d');
		ctx.fillStyle = window.getComputedStyle(canvas, null).backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		switch (state.timeseries.plotType) {
		case 'Correlogram':
		case 'CategoryCorrelograms':
		case 'CategoryCrossCorrelograms':
			drawCorrelograms(state.timeseries.plotType);
			break;
		case 'Periodogram':
			drawPeriodograms(state.timeseries.plotType);
			break;
		case 'RecurrencePlot':
			drawRecurrencePlot();
			break;
		default:
			drawXyGraph();
			break;
		}

	}

	function drawPeriodograms(type) {

		horizontalAxisY = canvas.height - margin.bottom;
		var frequencyIntervalCount = 100;
		tickLength = (canvas.width - margin.left - margin.right) / frequencyIntervalCount;

		// draw the horizontal axis (tickmarks and labels)
		ctx.textAlign = 'center';
		ctx.strokeStyle = state.labelColor;
		ctx.fillStyle = state.labelColor;
		ctx.beginPath();
		var step = 10;
		var maxFrequency = 1 / state.interval;
		var delFrequency = maxFrequency / frequencyIntervalCount;
		for (var i = 0; i < frequencyIntervalCount; i++) {
			if (i % step === 0) {
				var xTickmark = margin.left + tickLength * i;
				var yTickmark = horizontalAxisY;
				ctx.fillText(i * delFrequency, xTickmark, yTickmark + 16);
				ctx.moveTo(xTickmark, yTickmark);
				ctx.lineTo(xTickmark, yTickmark + tickmarkLength);
				ctx.stroke();
			}
		}
		ctx.closePath();
		ctx.font = FONT.axisName;
		ctx.fillText('Frequency (Hz)', canvas.width / 2, horizontalAxisY + 32);
		ctx.moveTo(margin.left, horizontalAxisY);
		ctx.lineTo(canvas.width - margin.right, horizontalAxisY);
		ctx.stroke();

		// draw the vertical axis (tickmarks and labels)
		ctx.beginPath();
		ctx.fillStyle = state.labelColor;
		ctx.font = FONT.label;
		var max = 100;
		var dy = max / numberOfTickmarksOfYAxis;
		scaleY = (canvas.height - margin.top - margin.bottom) / max;
		for (var i = -numberOfTickmarksOfYAxis; i <= numberOfTickmarksOfYAxis; i++) {
			var yTickValue = i * dy;
			var yi = horizontalAxisY - yTickValue * scaleY;
			if (yi < horizontalAxisY) {
				ctx.fillText(yTickValue, margin.left - 12, yi + 4);
				ctx.moveTo(margin.left, yi);
				ctx.lineTo(margin.left + tickmarkLength, yi);
				ctx.stroke();
			}
		}

		ctx.strokeStyle = state.timeseries.lineColor;
		ctx.lineWidth = 1.5;

		var yAxisName;
		switch (type) {
		case 'Periodogram':
			yAxisName = 'Amplitude';
			var s = new Float32Array(frequencyIntervalCount);
			var cos, sin, kin;
			var max = statistics.getMaximum(grainSum);
			for (var k = 0; k < frequencyIntervalCount; k++) {
				s[k] = 0;
				cos = 0;
				sin = 0;
				kin = Math.PI * k * delFrequency;
				for (var i = 0; i < intervalCount; i++) {
					cos += grainSum[i] * Math.cos(i * kin);
					sin -= grainSum[i] * Math.sin(i * kin);
				}
				cos /= max;
				sin /= max;
				s[k] = state.interval / intervalCount * (cos * cos + sin * sin);
			}
			var points = createArray(frequencyIntervalCount);
			for (var i = 0; i < frequencyIntervalCount; i++) {
				points[i] = new Point(margin.left + tickLength * i, horizontalAxisY - s[i] * scaleY);
			}
			drawCatmullRomSpline(points, 0);
			break;
		}

		drawGraphWindow();

		ctx.save();
		ctx.translate(15, canvas.height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.font = FONT.axisName;
		ctx.fillText(yAxisName, 0, 0);
		ctx.restore();

	}

	function drawCorrelograms(type) {

		horizontalAxisY = canvas.height - margin.bottom - (canvas.height - margin.top - margin.bottom) / 2;
		tickLength = (canvas.width - margin.left - margin.right) / intervalCount;

		// draw the horizontal axis (tickmarks and labels)
		ctx.textAlign = 'center';
		ctx.strokeStyle = state.labelColor;
		ctx.fillStyle = state.labelColor;
		ctx.beginPath();
		var step = 10;
		while (intervalCount < step) {
			step /= 2;
		}
		for (var i = 0; i < intervalCount; i++) {
			if (i % step === 0) {
				var xTickmark = margin.left + tickLength * i;
				var yTickmark = canvas.height - margin.bottom;
				ctx.fillText(i * state.interval, xTickmark, yTickmark + 16);
				ctx.moveTo(xTickmark, yTickmark);
				ctx.lineTo(xTickmark, yTickmark + tickmarkLength);
				ctx.stroke();
			}
		}
		ctx.closePath();
		ctx.font = FONT.axisName;
		ctx.fillText('Lag (seconds)', canvas.width / 2, canvas.height - margin.bottom + 32);
		ctx.moveTo(margin.left, horizontalAxisY);
		ctx.lineTo(canvas.width - margin.right, horizontalAxisY);
		ctx.stroke();

		// draw the vertical axis (tickmarks and labels)
		ctx.beginPath();
		ctx.fillStyle = state.labelColor;
		ctx.font = FONT.label;
		var max = 2.5;
		var dy = max / numberOfTickmarksOfYAxis;
		scaleY = (canvas.height - margin.top - margin.bottom) / max;
		for (var i = -numberOfTickmarksOfYAxis; i <= numberOfTickmarksOfYAxis; i++) {
			var yTickValue = i * dy;
			var yi = horizontalAxisY - yTickValue * scaleY;
			if (yi < canvas.height - margin.bottom) {
				ctx.fillText(yTickValue, margin.left - 12, yi + 4);
				ctx.moveTo(margin.left, yi);
				ctx.lineTo(margin.left + tickmarkLength, yi);
				ctx.stroke();
			}
		}

		ctx.strokeStyle = state.timeseries.lineColor;
		ctx.lineWidth = 1.5;

		var yAxisName;
		switch (type) {
		case 'Correlogram':
			yAxisName = 'Autocorrelation';
			var mean = statistics.getMean(grainSum);
			var variance = statistics.getVariance(grainSum, mean);
			var acf = new Float32Array(intervalCount);
			for (var i = 0; i < intervalCount; i++) {
				acf[i] = 0;
				for (var j = 0; j < intervalCount; j++) {
					if (j + i >= intervalCount)
						break;
					acf[i] += (grainSum[j] - mean) * (grainSum[j + i] - mean);
				}
				acf[i] /= intervalCount * variance;
			}
			var points = createArray(intervalCount);
			for (var i = 0; i < intervalCount; i++) {
				points[i] = new Point(margin.left + tickLength * i, horizontalAxisY - acf[i] * scaleY);
			}
			drawCatmullRomSpline(points, 1);
			break;
		case 'CategoryCorrelograms':
			yAxisName = 'Category Autocorrelations';
			var count = 0;
			for (var categoryIndex = 0; categoryIndex < topCategoryTimeSeriesArray.length; categoryIndex++) {
				var categoryKey = Object.getPropertyByIndex(categoryIndex, actionDictionary);
				if (!state.category[categoryKey.toLowerCase()].visible)
					continue;
				var mean = statistics.getMean(topCategoryTimeSeriesArray[categoryIndex]);
				var variance = statistics.getVariance(topCategoryTimeSeriesArray[categoryIndex], mean);
				var acf = new Float32Array(intervalCount);
				for (var i = 0; i < intervalCount; i++) {
					acf[i] = 0;
					for (var j = 0; j < intervalCount; j++) {
						if (j + i >= intervalCount)
							break;
						acf[i] += (topCategoryTimeSeriesArray[categoryIndex][j] - mean) * (topCategoryTimeSeriesArray[categoryIndex][j + i] - mean);
					}
					acf[i] /= intervalCount * variance;
				}
				ctx.strokeStyle = recordedTypesAttributeColor[categoryKey];
				var points = createArray(intervalCount);
				for (var i = 0; i < intervalCount; i++) {
					points[i] = new Point(margin.left + tickLength * i, horizontalAxisY - acf[i] * scaleY);
				}
				drawCatmullRomSpline(points, 1);
				ctx.save();
				var countRemainder = count % numberOfLegendColumns;
				var xLegend = margin.left + 20 + countRemainder * 150;
				var yLegend = canvas.height - margin.bottom - 20 * (Math.floor(count / numberOfLegendColumns) + 1);
				ctx.beginPath();
				ctx.moveTo(xLegend, yLegend);
				ctx.lineTo(xLegend + 20, yLegend);
				ctx.closePath();
				ctx.stroke();
				ctx.fillStyle = state.labelColor;
				ctx.font = FONT.label;
				ctx.textAlign = 'left';
				ctx.fillText(categoryKey, xLegend + 30, yLegend + 2);
				ctx.restore();
				count++;
			}
			break;
		case 'CategoryCrossCorrelograms':
			yAxisName = 'Category Cross-correlations';
			var count = 0;
			for (var category1 = 0; category1 < topCategoryTimeSeriesArray.length; category1++) {
				for (var category2 = 0; category2 < topCategoryTimeSeriesArray.length; category2++) {
					if (category1 === category2)
						continue;
					var categoryKey1 = Object.getPropertyByIndex(category1, actionDictionary);
					if (!state.category[categoryKey1.toLowerCase()].visible)
						continue;
					var color1 = recordedTypesAttributeColor[categoryKey1];
					var categoryKey2 = Object.getPropertyByIndex(category2, actionDictionary);
					if (!state.category[categoryKey2.toLowerCase()].visible)
						continue;
					var color2 = recordedTypesAttributeColor[categoryKey2];
					var mean1 = statistics.getMean(topCategoryTimeSeriesArray[category1]);
					var variance1 = statistics.getVariance(topCategoryTimeSeriesArray[category1], mean1);
					var mean2 = statistics.getMean(topCategoryTimeSeriesArray[category2]);
					var variance2 = statistics.getVariance(topCategoryTimeSeriesArray[category2], mean2);
					var sqrtVariance12 = Math.sqrt(variance1 * variance2);
					var ccf = new Float32Array(intervalCount);
					for (var i = 0; i < intervalCount; i++) {
						ccf[i] = 0;
						for (var j = 0; j < intervalCount; j++) {
							if (j + i >= intervalCount)
								break;
							ccf[i] += (topCategoryTimeSeriesArray[category1][j] - mean1) * (topCategoryTimeSeriesArray[category2][j + i] - mean2);
						}
						ccf[i] /= intervalCount * sqrtVariance12;
						variance1;
					}
					ctx.save();
					ctx.setLineDash([ category1 * 2 + 1, category2 * 2 + 1 ]);
					ctx.strokeStyle = getAverageColor(color1, color2);
					ctx.lineWidth = category1 + 1;
					var points = createArray(intervalCount);
					for (var i = 0; i < intervalCount; i++) {
						points[i] = new Point(margin.left + tickLength * i, horizontalAxisY - ccf[i] * scaleY);
					}
					drawCatmullRomSpline(points, 1);
					var countRemainder = count % numberOfLegendColumns;
					var xLegend = margin.left + 20 + countRemainder * 150;
					var yLegend = canvas.height - margin.bottom - 20 * (Math.floor(count / numberOfLegendColumns) + 1);
					ctx.beginPath();
					ctx.moveTo(xLegend, yLegend);
					ctx.lineTo(xLegend + 20, yLegend);
					ctx.closePath();
					ctx.stroke();
					ctx.fillStyle = state.labelColor;
					ctx.font = FONT.label;
					ctx.textAlign = 'left';
					ctx.fillText(categoryKey1 + '-' + categoryKey2, xLegend + 30, yLegend + 2);
					ctx.restore();
					count++;
				}
			}
			break;
		}

		drawGraphWindow();

		ctx.save();
		ctx.translate(15, canvas.height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.font = FONT.axisName;
		ctx.fillText(yAxisName, 0, 0);
		ctx.restore();

	}

	function drawRecurrencePlot() {

		var squareOffsetX = (canvas.width - squareLength) / 2;
		var squareOffsetY = (canvas.height - squareLength) / 2;
		ctx.fillStyle = 'white';
		ctx.fillRect(squareOffsetX, squareOffsetY, squareLength, squareLength);

		var dotArray = createArray(intervalCount, intervalCount); // store the results in a 2D array in case we need to use it for some calculations
		var ri, rj;
		if (state.timeseries.recurrenceIdleValid) {
			for (var i = 0; i < intervalCount; i++) {
				for (var j = 0; j < intervalCount; j++) {
					ri = -1;
					if (state.timeseries.recurrenceI === 'All') {
						ri = grainSum[i];
					} else {
						switch (state.level) {
						case 'Top':
							ri = topCategoryTimeSeriesArray[Object.indexOf(state.timeseries.recurrenceI, actionDictionary)][i];
							break;
						}
					}
					rj = -1;
					if (state.timeseries.recurrenceJ === 'All') {
						rj = grainSum[j];
					} else {
						switch (state.level) {
						case 'Top':
							rj = topCategoryTimeSeriesArray[Object.indexOf(state.timeseries.recurrenceJ, actionDictionary)][j];
							break;
						}
					}
					if (ri >= 0 && rj >= 0) {
						dotArray[i][j] = Math.abs(ri - rj) <= state.timeseries.recurrenceEpsilon ? 1 : 0;
					}
				}
			}
		} else {
			for (var i = 0; i < intervalCount; i++) {
				for (var j = 0; j < intervalCount; j++) {
					ri = -1;
					if (state.timeseries.recurrenceI === 'All') {
						ri = grainSum[i];
					} else {
						switch (state.level) {
						case 'Top':
							ri = topCategoryTimeSeriesArray[Object.indexOf(state.timeseries.recurrenceI, actionDictionary)][i];
							break;
						}
					}
					rj = -1;
					if (state.timeseries.recurrenceJ === 'All') {
						rj = grainSum[j];
					} else {
						switch (state.level) {
						case 'Top':
							rj = topCategoryTimeSeriesArray[Object.indexOf(state.timeseries.recurrenceJ, actionDictionary)][j];
							break;
						}
					}
					if (ri >= 0 && rj >= 0) {
						dotArray[i][j] = ri * rj > 0 && Math.abs(ri - rj) <= state.timeseries.recurrenceEpsilon ? 1 : 0;
					}
				}
			}
		}
		ctx.fillStyle = 'gray';
		var delta = squareLength / intervalCount;
		var dotDiameter = 2 * dotRadius;
		var squareOffsetX2 = squareOffsetX - dotRadius;
		var squareOffsetY2 = squareOffsetY - dotRadius + squareLength;
		for (var i = 0; i < intervalCount; i++) {
			for (var j = 0; j < intervalCount; j++) {
				if (dotArray[i][j] > 0) {
					ctx.fillRect(squareOffsetX2 + (i + 0.5) * delta, squareOffsetY2 - (j + 0.5) * delta, dotDiameter, dotDiameter);
				}
			}
		}

		ctx.textAlign = 'center';
		ctx.fillStyle = state.labelColor;
		ctx.strokeStyle = state.labelColor;
		ctx.font = FONT.label;
		var step = 50;
		while (intervalCount < step) {
			step /= 2;
		}
		var stepLength = squareLength / intervalCount;
		for (var i = 0; i < intervalCount; i++) {
			if (i % step === 0) {

				var xTickmark = squareOffsetX2 + stepLength * i;
				var yTickmark = squareOffsetY2;
				ctx.fillText(i * state.interval, xTickmark, yTickmark + 16);
				ctx.beginPath();
				ctx.moveTo(xTickmark, yTickmark);
				ctx.lineTo(xTickmark, yTickmark + stepLength);
				ctx.closePath();
				ctx.stroke();

				xTickmark = squareOffsetX2;
				yTickmark = squareOffsetY2 - stepLength * i;
				ctx.fillText(i * state.interval, xTickmark - 16, yTickmark + 4);
				ctx.beginPath();
				ctx.moveTo(xTickmark, yTickmark);
				ctx.lineTo(xTickmark - stepLength, yTickmark);
				ctx.closePath();
				ctx.stroke();

			}
		}

		ctx.strokeStyle = 'lightGray';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.rect(squareOffsetX - 2, squareOffsetY - 2, squareLength + 4, squareLength + 4);
		ctx.closePath();
		ctx.stroke();

	}

	function drawXyGraph() {

		horizontalAxisY = canvas.height - margin.bottom;
		tickLength = (canvas.width - margin.left - margin.right) / intervalCount;

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

		// draw the horizontal axis (tickmarks and labels)
		ctx.textAlign = 'center';
		ctx.strokeStyle = state.labelColor;
		ctx.beginPath();
		var step = 10;
		while (intervalCount < step) {
			step /= 2;
		}
		for (var i = 0; i < intervalCount; i++) {
			if (i % step === 0) {
				var xTickmark = margin.left + tickLength * i;
				var yTickmark = horizontalAxisY;
				ctx.fillText(i * state.interval, xTickmark, yTickmark + 16);
				ctx.moveTo(xTickmark, yTickmark);
				ctx.lineTo(xTickmark, yTickmark + tickmarkLength);
				ctx.stroke();
			}
		}
		ctx.closePath();
		ctx.font = FONT.axisName;
		ctx.fillText('Time (seconds)', canvas.width / 2, horizontalAxisY + 32);

		// draw the vertical axis (tickmarks and labels)
		ctx.beginPath();
		ctx.fillStyle = state.labelColor;
		ctx.font = FONT.label;
		var dy = state.timeseries.maximumHeight / numberOfTickmarksOfYAxis;
		scaleY = (canvas.height - margin.top - margin.bottom) / state.timeseries.maximumHeight;
		for (var i = 0; i <= numberOfTickmarksOfYAxis; i++) {
			var yTickValue = i * dy;
			var yi = horizontalAxisY - yTickValue * scaleY;
			ctx.fillText(yTickValue, margin.left - 12, yi + 4);
			ctx.moveTo(margin.left, yi);
			ctx.lineTo(margin.left + tickmarkLength, yi);
			ctx.stroke();
		}

		ctx.save();
		ctx.translate(15, canvas.height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.font = FONT.axisName;
		ctx.fillText('Action Count', 0, 0);
		ctx.restore();

		// plot time series
		ctx.strokeStyle = state.timeseries.lineColor;

		switch (state.timeseries.plotType) {
		case 'Histogram':
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (var i = 0; i < intervalCount; i++) {
				if (i === indexOfSelectedGrain) {
					ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
				} else {
					var rgb = hexToRgb(state.timeseries.fillColor);
					ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)';
				}
				var tmpX = margin.left + tickLength * i;
				var tmpY = grainSum[i] * scaleY;
				ctx.fillRect(tmpX, horizontalAxisY - tmpY, tickLength, tmpY);
				ctx.rect(tmpX, horizontalAxisY - tmpY, tickLength, tmpY);
				ctx.stroke();
			}
			drawActivenessResults();
			drawTips();
			break;
		case 'Line':
			drawHighlightBar();
			ctx.lineWidth = 1.5;
			var points = createArray(intervalCount);
			for (var i = 0; i < intervalCount; i++) {
				points[i] = new Point(margin.left + tickLength * (i + 0.5), horizontalAxisY - grainSum[i] * scaleY);
			}
			if (state.timeseries.splineTension > 0) {
				drawCatmullRomSpline(points);
			} else {
				drawStraightLine(points);
			}
			if (symbol) {
				drawSymbols(points);
			}
			drawTips();
			break;
		case 'CategoryLines':
			drawHighlightBar();
			ctx.lineWidth = 2;
			for (var categoryIndex = 0; categoryIndex < topCategoryTimeSeriesArray.length; categoryIndex++) {
				var categoryKey = Object.getPropertyByIndex(categoryIndex, actionDictionary);
				if (!state.category[categoryKey.toLowerCase()].visible)
					continue;
				ctx.strokeStyle = recordedTypesAttributeColor[categoryKey];
				var points = createArray(intervalCount);
				for (var i = 0; i < intervalCount; i++) {
					points[i] = new Point(margin.left + tickLength * (i + 0.5), horizontalAxisY - topCategoryTimeSeriesArray[categoryIndex][i] * scaleY);
				}
				if (state.timeseries.splineTension > 0) {
					drawCatmullRomSpline(points);
				} else {
					drawStraightLine(points);
				}
				if (symbol) {
					drawSymbols(points);
				}
			}
			drawTips();
			break;
		}

		drawGraphWindow();

	}

	function drawGraphWindow() {
		ctx.strokeStyle = state.labelColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(margin.left, canvas.height - margin.bottom);
		ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
		ctx.lineTo(canvas.width - margin.right, margin.top);
		ctx.lineTo(margin.left, margin.top);
		ctx.closePath();
		ctx.stroke();
	}

	function drawSymbols(points) {
		if (points.length * symbolSize * 2 > canvas.width - margin.left - margin.right)
			return;
		var symbolSize2;
		for (var i = 0; i < points.length; i++) {
			ctx.beginPath();
			if (i === indexOfSelectedGrain) {
				ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
				symbolSize2 = symbolSize + 4;
			} else {
				var rgb = hexToRgb(state.timeseries.fillColor);
				ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)';
				symbolSize2 = symbolSize;
			}
			if (points[i].y !== horizontalAxisY) {
				ctx.arc(points[i].x, points[i].y, symbolSize2, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.stroke();
			}
			ctx.closePath();
		}
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

	function drawCatmullRomSpline(points) {
		var t;
		if (arguments[1]) {
			t = arguments[1];
		} else {
			t = state.timeseries.splineTension;
		}
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		var u;
		var sx, sy;
		var index;
		var n = points.length;
		if (splinePx === undefined)
			splinePx = new Float32Array(4);
		if (splinePy === undefined)
			splinePy = new Float32Array(4);
		for (var i = 2; i < n; i++) {
			for (var j = 0; j < 4; j++) { // Initialize points m-2, m-1, m, m+1
				index = i + j - 2;
				if (index < n) {
					splinePx[j] = points[index].x;
					splinePy[j] = points[index].y;
				}
			}
			for (var k = 0; k < splineSteps; k++) {
				u = k / splineSteps;
				sx = geometry.catmullRom(-2, u, t) * splinePx[0] + geometry.catmullRom(-1, u, t) * splinePx[1] + geometry.catmullRom(0, u, t) * splinePx[2] + geometry.catmullRom(1, u, t) * splinePx[3];
				sy = geometry.catmullRom(-2, u, t) * splinePy[0] + geometry.catmullRom(-1, u, t) * splinePy[1] + geometry.catmullRom(0, u, t) * splinePy[2] + geometry.catmullRom(1, u, t) * splinePy[3];
				if (sy <= canvas.height - margin.bottom)
					ctx.lineTo(sx, sy);
			}
		}
		ctx.lineTo(points[n - 1].x, points[n - 1].y);
		ctx.stroke();
		ctx.closePath();
	}

	function drawHighlightBar() {
		if (indexOfSelectedGrain < 0)
			return;
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
		ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
		var tmpX = margin.left + tickLength * indexOfSelectedGrain;
		var tmpY = grainSum[indexOfSelectedGrain] * scaleY;
		ctx.fillRect(tmpX, horizontalAxisY - tmpY, tickLength, tmpY);
		ctx.rect(tmpX, horizontalAxisY - tmpY, tickLength, tmpY);
		ctx.stroke();
		ctx.closePath();
		if (tmpX < canvas.width - margin.right) {
			ctx.beginPath();
			ctx.setLineDash([ 5, 2, 1, 2 ]);
			ctx.moveTo(tmpX + tickLength / 2, margin.top);
			ctx.lineTo(tmpX + tickLength / 2, horizontalAxisY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.closePath();
		}
		ctx.restore();
	}

	function drawActivenessResults() {
		var activeness = totalAction / duration;
		var activeTimePercentage = duration / timeTable.selectedSessionLength * 100;
		resultCollector.collect(duration, activeTimePercentage, totalAction, activeness);
		ctx.save();
		ctx.textAlign = 'right';
		ctx.fillStyle = state.labelColor;
		var ypos = 20;
		ctx.fillText('Total duration = ' + timeTable.selectedSessionLength + ' seconds', canvas.width - margin.right - 10, margin.top + ypos);
		ypos += 12;
		ctx.fillText('Active duration = ' + duration + ' seconds (' + activeTimePercentage.toPrecision(3) + '%)', canvas.width - margin.right - 10, margin.top + ypos);
		ypos += 12;
		ctx.fillText('Total actions = ' + totalAction, canvas.width - margin.right - 10, margin.top + ypos);
		ypos += 12;
		ctx.fillText('Activeness = ' + activeness.toPrecision(2) + ' actions/second', canvas.width - margin.right - 10, margin.top + ypos);
		ctx.restore();
	}

	function drawTips() {
		if (indexOfSelectedGrain >= 0) {
			switch (state.timeseries.plotType) {
			case 'Histogram':
			case 'Line':
				var v = grainSum[indexOfSelectedGrain];
				if (v > 0) {
					ctx.fillStyle = state.labelColor;
					ctx.textAlign = 'center';
					var currentX = margin.left + tickLength * (indexOfSelectedGrain + 0.5);
					var currentY = horizontalAxisY - v * scaleY - 8;
					ctx.fillText(v, currentX, currentY);
				}
				break;
			case 'CategoryLines':
				var v = '';
				for (var categoryIndex = 0; categoryIndex < topCategoryTimeSeriesArray.length; categoryIndex++) {
					v += (categoryIndex > 0 ? ', ' : '') + topCategoryTimeSeriesArray[categoryIndex][indexOfSelectedGrain];
				}
				ctx.fillStyle = state.labelColor;
				ctx.textAlign = 'center';
				var currentX = margin.left + tickLength * (indexOfSelectedGrain + 0.5);
				var currentY = horizontalAxisY - grainSum[indexOfSelectedGrain] * scaleY - 8;
				ctx.fillText(v, currentX, currentY);
				break;
			}
			var ts = new Date(timeBegin + indexOfSelectedGrain * state.interval * 1000);
			var timestampString = (ts.getFullYear() + '-' + addZero(ts.getMonth() + 1) + '-' + addZero(ts.getDate()) + '-' + addZero(ts.getUTCHours()) + '-' + addZero(ts.getMinutes()) + '-' + addZero(ts.getSeconds()));
			ctx.drawTooltip(currentX, canvas.height - 25, 20, 8, 10, timestampString, true);
		}
	}

	this.plotAs = function(type) {
		state.timeseries.setPlotType(type);
		this.draw();
		screenManager.draw();
		switch (type) {
		case 'Histogram':
			htmlUtil.show('timeseries_max_height_label');
			htmlUtil.show('timeseries_max_height');
			htmlUtil.show('timeseries_interval_label');
			htmlUtil.show('timeseries_interval');
			htmlUtil.hide('spline_tension_label');
			htmlUtil.hide('spline_tension');
			htmlUtil.hide('recurrence_epsilon_label');
			htmlUtil.hide('recurrence_epsilon');
			htmlUtil.hide('recurrence_idle_valid_label');
			htmlUtil.hide('recurrence_idle_valid_checkbox');
			htmlUtil.hide('recurrence_i');
			htmlUtil.hide('recurrence_j');
			document.getElementById('timeseries_left_side_ui').style.left = '50px';
			break;
		case 'Line':
		case 'CategoryLines':
			htmlUtil.show('timeseries_max_height_label');
			htmlUtil.show('timeseries_max_height');
			htmlUtil.show('timeseries_interval_label');
			htmlUtil.show('timeseries_interval');
			htmlUtil.show('spline_tension_label');
			htmlUtil.show('spline_tension');
			htmlUtil.hide('recurrence_epsilon_label');
			htmlUtil.hide('recurrence_epsilon');
			htmlUtil.hide('recurrence_idle_valid_label');
			htmlUtil.hide('recurrence_idle_valid_checkbox');
			htmlUtil.hide('recurrence_i');
			htmlUtil.hide('recurrence_j');
			document.getElementById('timeseries_left_side_ui').style.left = '50px';
			break;
		case 'Periodogram':
		case 'Correlogram':
		case 'CategoryCorrelograms':
		case 'CategoryCrossCorrelograms':
			htmlUtil.hide('timeseries_max_height_label');
			htmlUtil.hide('timeseries_max_height');
			htmlUtil.show('timeseries_interval_label');
			htmlUtil.show('timeseries_interval');
			htmlUtil.hide('spline_tension_label');
			htmlUtil.hide('spline_tension');
			htmlUtil.hide('recurrence_epsilon_label');
			htmlUtil.hide('recurrence_epsilon');
			htmlUtil.hide('recurrence_idle_valid_label');
			htmlUtil.hide('recurrence_idle_valid_checkbox');
			htmlUtil.hide('recurrence_i');
			htmlUtil.hide('recurrence_j');
			document.getElementById('timeseries_left_side_ui').style.left = '50px';
			break;
		case 'RecurrencePlot':
			htmlUtil.hide('timeseries_max_height_label');
			htmlUtil.hide('timeseries_max_height');
			htmlUtil.show('timeseries_interval_label');
			htmlUtil.show('timeseries_interval');
			htmlUtil.hide('spline_tension_label');
			htmlUtil.hide('spline_tension');
			htmlUtil.show('recurrence_epsilon_label');
			htmlUtil.show('recurrence_epsilon');
			htmlUtil.show('recurrence_idle_valid_label');
			htmlUtil.show('recurrence_idle_valid_checkbox');
			htmlUtil.show('recurrence_i');
			htmlUtil.show('recurrence_j');
			document.getElementById('timeseries_left_side_ui').style.left = '10px';
			break;
		}
	}

	function move(x, y) {
		if (inAnimation)
			return;
		if (activateOnlyGraphWindow && (y < margin.top + 0.25 * (canvas.height - margin.top - margin.bottom) || y > canvas.height - margin.bottom))
			return;
		if (state.timeseries.plotType === 'Histogram' || state.timeseries.plotType === 'Line' || state.timeseries.plotType === 'CategoryLines') {
			indexOfSelectedActionType = -1;
			indexOfSelectedGrain = Math.floor(x / tickLength);
		}
		that.draw();
		drawLinkedGraphs(linkedGraphs);
	}

	function onMouseMove(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left - margin.left;
		var y = event.clientY - rect.top;
		move(x, y);
	}

	function onMouseLeave(event) {
		if (inAnimation)
			return;
		event.preventDefault();
		indexOfSelectedGrain = -1;
		that.draw();
		drawLinkedGraphs(linkedGraphs);
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
		screenManager.maximize('timeseries');
	}

}