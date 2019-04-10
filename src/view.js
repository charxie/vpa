/* 
 * Copyright 2015, The Engineering Computation Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

var canvasTableSpacing = 24;

var canvasTableSpecs = {
	rows : 2,
	columns : 2
};

function initView() {
	var canvasTable = document.getElementById('canvas_table');
	if (canvasTable !== undefined) {
		canvasTableSpecs.rows = canvasTable.rows.length;
		canvasTableSpecs.columns = canvasTable.rows[0].cells.length;
	}
	window.addEventListener('resize', resize, false); // resize the canvas to fill browser window dynamically
	var browserInfo = navigator.sayswho;
	var best = browserInfo.startsWith("Chrome") || browserInfo.startsWith("Firefox") || browserInfo.startsWith("Edge");
	document.getElementById('brand_name').innerHTML = SOFTWARE.name + ' ' + SOFTWARE.version + (best ? '' : ' (Best on Chrome, Edge, & Firefox)') + ', The Engineering Computation Laboratory, The Concord Consortium, &copy; ' + new Date().getFullYear();
	if (stateFileName === undefined) {
		document.title = SOFTWARE.name + ' (' + SOFTWARE.abbreviation + ')' + ' - ' + SOFTWARE.version;
	}
	if (!best) {
		message.warnBrowser(browserInfo);
	}
}

function resize() {
	if (timeseries)
		timeseries.resize();
	if (scatterplot)
		scatterplot.resize();
	if (digraph)
		digraph.resize();
	if (radarchart)
		radarchart.resize();
	if (piechart)
		piechart.resize();
	if (heatMap)
		heatMap.resize();
	if (linkograph)
		linkograph.resize();
	screenManager.resize();
	var canvasTable = document.getElementById('canvas_table');
	var centerY = (canvasTable.offsetTop + canvasTable.offsetHeight / 2 - 24) + 'px';
	var previousButton = document.getElementById('previous_button');
	if (previousButton) {
		previousButton.style.top = centerY;
	}
	var nextButton = document.getElementById('next_button');
	if (nextButton) {
		nextButton.style.top = centerY;
	}
	var recurrenceJSelector = document.getElementById('recurrence_j');
	recurrenceJSelector.style.top = timeseries.getCanvas().height / 2 + 'px';
}

function setTableCanvasSize(canvas) {
	var canvasTable = document.getElementById('canvas_table');
	canvas.width = (window.innerWidth - canvasTable.offsetLeft - canvasTableSpacing * (canvasTableSpecs.columns - 1)) / canvasTableSpecs.columns + 3;
	canvas.height = (window.innerHeight - canvasTable.offsetTop - canvasTableSpacing * (canvasTableSpecs.rows - 1) - 20) / canvasTableSpecs.rows; // for some reason, we have to add some space to avoid scroll bar
}

function setCanvasBackgroundColor(color) {
	var rules = document.styleSheets[0].cssRules;
	for (var i = 0; i < rules.length; i++) {
		if ('canvas' === rules[i].selectorText) {
			rules[i].style.backgroundColor = color;
		}
	}
	document.getElementById('radarchart_results').style.backgroundColor = color;
	drawAll(false);
}

function changeCategoryColor(id, c) {
	recordedTypesAttributeColor[id] = c;
	switch (id) {
	case 'Construction':
		state.category.construction.setColor(c);
		break;
	case 'Analysis':
		state.category.analysis.setColor(c);
		break;
	case 'Parameter':
		state.category.parameter.setColor(c);
		break;
	case 'View':
		state.category.view.setColor(c);
		break;
	case 'Reflection':
		state.category.reflection.setColor(c);
		break;
	case 'Misc':
		state.category.misc.setColor(c);
		break;
	}
	drawAll(false);
}

function setCategoryVisible(id, b) {
	switch (id) {
	case 'Construction':
		state.category.construction.setVisible(b);
		break;
	case 'Analysis':
		state.category.analysis.setVisible(b);
		break;
	case 'Parameter':
		state.category.parameter.setVisible(b);
		break;
	case 'View':
		state.category.view.setVisible(b);
		break;
	case 'Reflection':
		state.category.reflection.setVisible(b);
		break;
	case 'Misc':
		state.category.misc.setVisible(b);
		break;
	}
	timeseries.draw();
	screenManager.draw();
}

function drawLinkedGraphs(linkedGraphs) {
	var numberOfLinkedGraphs = linkedGraphs.length;
	if (numberOfLinkedGraphs > 0) {
		for (var i = 0; i < numberOfLinkedGraphs; i++) {
			linkedGraphs[i].draw();
		}
	}
}

function setRecurrenceUI() {
	var recurrenceISelector = document.getElementById('recurrence_i_selector');
	var recurrenceJSelector = document.getElementById('recurrence_j_selector');
	htmlUtil.removeAllOptions(recurrenceISelector);
	htmlUtil.removeAllOptions(recurrenceJSelector);
	htmlUtil.addOption(recurrenceISelector, 'All');
	htmlUtil.addOption(recurrenceJSelector, 'All');
	switch (state.level) {
	case 'Top':
		for ( var categoryKey in actionDictionary) {
			htmlUtil.addOption(recurrenceISelector, categoryKey);
			htmlUtil.addOption(recurrenceJSelector, categoryKey);
		}
		break;
	case 'Medium':
		break;
	case 'Fine':
		break;
	}
	recurrenceISelector.value = state.timeseries.recurrenceI;
	recurrenceJSelector.value = state.timeseries.recurrenceJ;
}

function setLabelColor(c) {
	document.getElementById('label_color').value = c;
	document.getElementById('timeseries_max_height_label').style.color = c;
	document.getElementById('timeseries_interval_label').style.color = c;
	document.getElementById('spline_tension_label').style.color = c;
	document.getElementById('recurrence_epsilon_label').style.color = c;
	document.getElementById('recurrence_idle_valid_label').style.color = c;
	document.getElementById('radarchart_results').style.color = c;
	document.getElementById('popup_opacity_label').style.color = c;
	drawAll(false);
}

function deleteCanvasCell(type) {
	var canvasTable = document.getElementById('canvas_table');
	for (var i = 0; i < canvasTable.rows.length; i++) {
		var row = canvasTable.rows[i];
		var cell = row.cells.namedItem(type);
		if (cell !== null) {
			row.deleteCell(cell.cellIndex);
		}
	}
}
