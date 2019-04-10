/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Guanhua Chen
 *
 */

'use strict';

function Piechart(id) {

	this.id = id;

	this.init = function() {
		canvas = document.getElementById(id);
		if (id === 'canvas-popup') {
			canvas = htmlUtil.cloneElement(id);
		}
		canvas.addEventListener('dblclick', onMouseDoubleClick, false);
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('touchmove', onTouchMove, false);
	}

	var that = this;
	var canvas;
	var ctx;
	var margin = {
		left : 50,
		right : 50,
		top : 50,
		bottom : 50
	};
	var data = []; // [30,90,100, 40,100]
	var labels;
	var colors = [ '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf' ];
	var color;
	var innerCircle = 5;
	var theta;
	var radius;
	var centerX;
	var centerY;
	var startingAngleOfEachSlice = [];
	var salientDegree = 3;
	var highlight = '#FF0000';
	var lowlight = '#FFDAB9';
	var sum;
	var localIndexOfSelectedActionType;

	this.resize = function() {
		if (id === 'piechart') {
			setTableCanvasSize(canvas);
		} else {
			screenManager.setFullscreenPositionAndSize(canvas);
		}
		this.draw();
	}

	this.draw = function() {

		data = [];
		startingAngleOfEachSlice = [];
		labels = [];
		color = 0;
		sum = 0;
		localIndexOfSelectedActionType = -1;

		ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (indexOfSelectedGrain >= 0 && indexOfSelectedGrain < intervalCount) {
			for (var i = 0; i < actionTypesArray.length; i++) {
				if (actionTimeSeriesArray[i][indexOfSelectedGrain] > 0) {
					sum += actionTimeSeriesArray[i][indexOfSelectedGrain];
				}
			}
			for (var i = 0; i < actionTypesArray.length; i++) {
				if (actionTimeSeriesArray[i][indexOfSelectedGrain] > 0) {
					data.push(actionTimeSeriesArray[i][indexOfSelectedGrain] / sum * 360);
					labels.push(originalRecordedTypes[i]);
				}
			}
			if (sum > 0)
				ctx.drawTooltip(10, canvas.height - 40, 30, 10, 20, sum + ' actions', false);
		} else {
			if ($('#actiontype').has('option').length === 0 || $('#actiontype :selected').text() === 'All') {
				for (var i = 0; i < numberOfActionTypes; i++) {
					sum += actionTypesArray[i];
					data.push(actionTypesArray[i]);
					labels.push(recordedTypes[i]);
				}
				data = data.map(function(elem) {
					return elem / sum * 360;
				});
			} else if ($('#actiontype :selected').text() === 'All But Camera') {
				for (var i = 0; i < numberOfActionTypes; i++) {
					if (recordedTypes[i] === 'Camera') {
						continue;
					}
					sum += actionTypesArray[i];
					data.push(actionTypesArray[i]);
					labels.push(recordedTypes[i]);
				}
				data = data.map(function(elem) {
					return elem / sum * 360;
				});
			} else {
				data.push(360);
				labels.push(originalRecordedTypes[$('#actiontype').get(0).selectedIndex - 2]);
			}
		}

		if (state.actionOrder === 'Clusterized') {

			var dataTemp = [];
			var labelsTemp = [];
			for (var i = 0; i < recordedTypes.length; i++) {
				for (var j = 0; j < labels.length; j++) {
					if (recordedTypes[i] === labels[j]) {
						dataTemp.push(data[j]);
						labelsTemp.push(labels[j]);
					}
				}
			}

			var dataCategory = [];
			var labelsCategory = [];
			colors = [];
			var sumOfCategory = dataTemp[0];
			for (var i = 1; i < dataTemp.length; i++) {
				if (recordedTypesAttributeMap[labelsTemp[i - 1]] === recordedTypesAttributeMap[labelsTemp[i]]) {
					sumOfCategory += dataTemp[i];
				} else {
					dataCategory.push(sumOfCategory);
					labelsCategory.push(recordedTypesAttributeMap[labelsTemp[i - 1]]);
					var hexColor = recordedTypesAttributeColor[recordedTypesAttributeMap[labelsTemp[i - 1]]];
					if (hexColor !== undefined) {
						var rgb = hexToRgb(hexColor);
						colors.push('rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.25)');
						sumOfCategory = dataTemp[i];
					}
				}
			}
			dataCategory.push(sumOfCategory);
			labelsCategory.push(recordedTypesAttributeMap[labelsTemp[i - 1]]);
			colors.push(recordedTypesAttributeColor[recordedTypesAttributeMap[labelsTemp[i - 1]]]);

			data = dataCategory;
			// labels = labelsCategory;

			radius = Math.min(canvas.width, canvas.height) / 2.2;
			drawPieChart();

			// draw a circle to separate inner circle and outer circle
			var cX = canvas.width / 2;
			var cY = canvas.height / 2;
			ctx.beginPath();
			ctx.arc(cX, cY, Math.min(canvas.width, canvas.height) / 2.4, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'white';
			ctx.fill();

			data = dataTemp;
			// labels = labelsTemp;
			startingAngleOfEachSlice = [];

		}

		if (indexOfSelectedActionType > -1) {
			localIndexOfSelectedActionType = labels.indexOf(recordedTypes[indexOfSelectedActionType]);
			colors = [ lowlight ];
		} else {
			colors = [ '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf' ];
		}

		radius = Math.min(canvas.width, canvas.height) / 2.6;
		drawPieChart();

	}

	function drawPieChart() {
		centerX = margin.left + (canvas.width - margin.left - margin.right) / 2;
		centerY = margin.top + (canvas.height - margin.top - margin.bottom) / 2;
		if (state.actionOrder !== 'Clusterized') {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		for (var i = 0; i < data.length; i++) {
			drawSegment(i);
		}
		startingAngleOfEachSlice.push(2 * Math.PI);
	}

	function drawSegment(i) {
		ctx.save();

		if (radius < 10) {
			radius = 10;
		}

		var startingAngle = geometry.toRadians(sumTo(data, i));
		var arcSize = geometry.toRadians(data[i]);
		var endingAngle = startingAngle + arcSize;
		var theta = startingAngle + arcSize / 2;
		var dx = innerCircle * Math.cos(theta);
		var dy = innerCircle * Math.sin(theta);

		startingAngleOfEachSlice.push(startingAngle);
		ctx.beginPath();
		var infoX;
		if (localIndexOfSelectedActionType === i) {
			dx = salientDegree * dx;
			dy = salientDegree * dy;
			var category = recordedTypesAttributeMap[labels[i]];
			infoX = labels[i] + ' ' + (data[i] / 360 * 100).toFixed(1) + '%' + (category === undefined ? '' : ' (' + category + ')');
			ctx.fillStyle = highlight;
			color++;
			ctx.moveTo(centerX + dx, centerY + dy);
			ctx.arc(centerX + dx, centerY + dy, radius, startingAngle, endingAngle, false);
		} else {
			if (color != 0 && color % colors.length === 0) {
				color = color - colors.length;
			}
			if (color >= colors.length) {
				color = colors.length - 1;
			}
			ctx.fillStyle = colors[color];
			color++;
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
		}

		ctx.closePath();

		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'gray';
		ctx.stroke();
		ctx.restore();
		// FIXME: We want to draw labels no matter what the action order is
		// if (indexOfSelectedGrain >= 0 && state.actionOrder !== 'Clusterized') {
		if (indexOfSelectedGrain >= 0) {
			drawSegmentLabel(i, theta);
		}

		if (infoX)
			ctx.drawTooltip(10, canvas.height - 40, 30, 10, 20, infoX, false);

	}

	function drawSegmentLabel(i, theta) {
		ctx.save();
		var x = Math.floor(canvas.width / 2);
		var y = Math.floor(canvas.height / 2);

		var rLabel = Math.min(canvas.width, canvas.height) / (state.actionOrder === 'Clusterized' ? 2.2 : 2.6);
		x += rLabel * Math.cos(theta);
		y += rLabel * Math.sin(theta);

		var dx;
		var dy = 0;
		ctx.translate(x, y);
		if (theta >= Math.PI / 2 && theta < Math.PI * 3 / 2) {
			ctx.textAlign = 'right';
			ctx.rotate(theta - Math.PI);
			dx = -6;
			if (localIndexOfSelectedActionType === i) {
				dx *= salientDegree;
			}
		} else {
			ctx.textAlign = 'left';
			ctx.rotate(theta);
			dx = 6;
			if (localIndexOfSelectedActionType === i) {
				dx *= salientDegree;
			}
		}

		ctx.font = FONT.label;
		ctx.fillText(labels[i], dx, dy);

		ctx.restore();
	}

	function sumTo(a, i) {
		var sum = 0;
		for (var j = 0; j < i; j++) {
			sum += a[j];
		}
		return sum;
	}

	function getIndexOfSelectedActionType(x, y) {
		for (var i = 0; i < labels.length; i++) {
			var dx = x - centerX;
			var dy = y - centerY;
			var radi = Math.atan2(dy, dx);
			if (radi < 0) {
				radi = radi + 2 * Math.PI;
			}
			if (startingAngleOfEachSlice[i] < radi && radi < startingAngleOfEachSlice[i + 1] && dx * dx + dy * dy < radius * radius) {
				colors = [ lowlight ];
				return recordedTypes.indexOf(labels[i]);
			}
		}
		colors = [ '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf' ];
		return -1;
	}

	function move(x, y) {
		indexOfSelectedActionType = getIndexOfSelectedActionType(x, y);
		that.draw();
	}

	function onMouseMove(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		move(x, y);
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

	function onMouseDoubleClick(event) {
		event.preventDefault();
		screenManager.maximize('piechart');
	}

}