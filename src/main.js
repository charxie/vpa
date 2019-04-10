/* 
 * Copyright 2015, The Engineering Computation Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

var state = new State();
var logLevel = 0;

var inAnimation = false;
var indexOfSelectedGrain;
var indexOfSelectedActionType;
var selectedEdge;

var dataFolder;
var students;
var segmentFiles;
var timeBegin;
var timeEnd;
var duration;
var intervalCount;
var excludeCameraAction = false;
var excludeNoteAction = false;

var data;
var recordedTypes = []; // an array that holds the types of action recorded in the loaded segment
var originalRecordedTypes = []; // FIXME: This is called only by piechart.js. It may not be necessary
var recordedTypesAttributeMap = {};
var recordedTypesAttributeColor = {};
var numberOfActionTypes;
var actionTypesArray; // an array that holds the number of actions of each type
var actionTimeSeriesArray;
var topCategoryTimeSeriesArray;
var fileTransitionPoints;
var actionDictionary;

var graph = new Graph();

var timeseries;
var scatterplot;
var digraph;
var radarchart;
var piechart;
var heatMap;
var linkograph;

/* helpers */
var screenManager = new ScreenManager();
var geometry = new Geometry();
var message = new Message();
var statistics = new Statistics();
var pngExporter = new PngExporter();
var csvExporter = new CsvExporter();
var dataImporter = new DataImporter();
var stateIO = new StateIO();
var htmlUtil = new HtmlUtil();
var timeTable = new TimeTable();

var sound = new Sound();

function init() {
	var headerLeft = document.getElementById('version-label');
	headerLeft.innerHTML = SOFTWARE.version;
	recall();
	initView();
	$.getJSON(DATA_HOME + '/action-dictionary.json', function(x) {
		actionDictionary = x;
		setGraphStates();
	});
}

function resetPerspectiveToDefault() {
	state = resetState();
	setGraphStates();
}

// the reason that we have nested calls of getJSON is because we need to wait until each JSON is loaded and we are ready to proceed to the next step (each JSON load is an AJAX call)
function loadClass() {
	var classSelection = document.getElementById('classID');
	state.dataset.setClassID(classSelection.options[classSelection.selectedIndex].value);
	var classFolder = DATA_HOME + state.dataset.classID;
	$.getJSON(classFolder + '/studenttable.json', function(x) {
		var s = x[state.dataset.classID];
		students = [];
		for (var i = 0; i < s.length; i++) {
			students.push(new User(s[i].id, s[i].gender));
		}
		createStudentList();
		var studentSelection = document.getElementById('studentID');
		state.dataset.setStudentID(studentSelection.options[studentSelection.selectedIndex].value);
		dataFolder = DATA_HOME + state.dataset.classID + '/' + state.dataset.studentID + '/log/';
		$.getJSON(dataFolder + 'segments.json', function(x) {
			segmentFiles = x;
			createFileList();
			loadSegmentData();
			clearData();
		});
	});
}

function loadStudent() {
	var studentSelection = document.getElementById('studentID');
	state.dataset.setStudentID(studentSelection.options[studentSelection.selectedIndex].value);
	dataFolder = DATA_HOME + state.dataset.classID + '/' + state.dataset.studentID + '/log/';
	$.getJSON(dataFolder + 'segments.json', function(x) {
		segmentFiles = x;
		createFileList();
		loadSegmentData();
		clearData();
	});
}

function loadSegmentData() {
	indexOfSelectedGrain = -1;
	// stop all animations
	if (timeseries)
		timeseries.animate(false);
	var fileSelection = document.getElementById('filename');
	if (fileSelection.selectedIndex < 0)
		fileSelection.selectedIndex = 0;
	state.dataset.setSegmentID(fileSelection.value);
	var file = dataFolder + state.dataset.segmentID;
	$.getJSON(file, function(x) {
		data = x;
		process(file);
	});
}

function loadFirstSegment() {
	var fileSelection = document.getElementById('filename');
	fileSelection.selectedIndex = 0;
	loadSegmentData();
}

function loadPreviousSegment() {
	var fileSelection = document.getElementById('filename');
	if (fileSelection.selectedIndex < 1) {
		alert('No previous segment!');
		return;
	}
	fileSelection.selectedIndex -= 1;
	loadSegmentData();
}

function loadNextSegment() {
	var fileSelection = document.getElementById('filename');
	if (fileSelection.selectedIndex >= fileSelection.length - 1) {
		alert('No further segment!');
		return;
	}
	fileSelection.selectedIndex += 1;
	loadSegmentData();
}

function selectActionType() {
	drawAll(true);
	var actionSelection = document.getElementById('actiontype');
	state.setActionFilter(actionSelection.value);
}

function drawAll(update) {
	if (update) {
		createActionTimeSeriesArray();
		digraph.updateEdges();
		radarchart.createAxes();
		heatMap.createBaseSet();
		screenManager.prepareFullscreenGraph();
	}
	timeseries.draw();
	scatterplot.draw();
	radarchart.draw();
	digraph.draw();
	piechart.draw();
	heatMap.draw();
	linkograph.draw();
	screenManager.draw();
}

function setActionDataLevel(level) {
	state.setLevel(level);
	state.scatterplot.setSelectedActions([]);
	scatterplot.draw();
	radarchart.createAxes();
	heatMap.createBaseSet();
	radarchart.draw();
	heatMap.draw();
	setRecurrenceUI();
	screenManager.prepareFullscreenGraph();
	screenManager.draw();
}

function sortActionData(type) {
	state.setActionOrder(type);
	digraph.sort();
	screenManager.prepareFullscreenGraph();
	screenManager.draw();
}

function createStudentList() {
	var studentList = document.getElementById('studentID');
	htmlUtil.removeAllOptions(studentList);
	var opt = document.createElement('option');
	for (var i = 0; i < students.length; i++) {
		opt = document.createElement('option');
		opt.innerHTML = students[i].id;
		opt.value = students[i].id;
		studentList.appendChild(opt);
	}
}

function createFileList() {
	var fileList = document.getElementById('filename');
	htmlUtil.removeAllOptions(fileList);
	var opt = document.createElement('option');
	for (var i = 0; i < segmentFiles.length; i++) {
		opt = document.createElement('option');
		opt.innerHTML = segmentFiles[i].substring(0, segmentFiles[i].length - 5);
		opt.value = segmentFiles[i];
		fileList.appendChild(opt);
	}
	document.getElementById('rawdatalink').innerHTML = segmentFiles.length + ' files';
}

function createActionList() {

	var actionTypeList = document.getElementById('actiontype');
	htmlUtil.removeAllOptions(actionTypeList);
	document.getElementById('action_type_label').innerHTML = recordedTypes.length + ' types: ';

	var opt = document.createElement('option');
	opt.innerHTML = 'All';
	opt.value = 'All';
	actionTypeList.appendChild(opt);

	opt = document.createElement('option');
	opt.innerHTML = 'All But Camera';
	opt.value = 'All But Camera';
	actionTypeList.appendChild(opt);

	opt = document.createElement('option');
	opt.innerHTML = 'All But Camera & Note';
	opt.value = 'All But Camera & Note';
	actionTypeList.appendChild(opt);

	for (var i = 0; i < recordedTypes.length; i++) {
		opt = document.createElement('option');
		opt.innerHTML = (i + 1) + ' : ' + recordedTypes[i];
		opt.value = recordedTypes[i];
		actionTypeList.appendChild(opt);
	}

	var options = document.getElementById('actiontype').options;
	var found = false;
	for (var i = 0; i < options.length; i++) {
		if (state.actionFilter === options[i].value) {
			actionTypeList.selectedIndex = i;
			found = true;
			break;
		}
	}
	if (!found) {
		actionTypeList.selectedIndex = 1;
	}

}

function mapRecordedTypesAttribute() {
	for ( var categoryKey in actionDictionary) {
		if (actionDictionary.hasOwnProperty(categoryKey)) {
			var categoryValue = actionDictionary[categoryKey];
			for ( var type in categoryValue) {
				if (categoryValue.hasOwnProperty(type)) {
					for (var i = 0; i < numberOfActionTypes; i++) {
						if (categoryValue[type].indexOf(recordedTypes[i]) >= 0) {
							recordedTypesAttributeMap[recordedTypes[i]] = categoryKey;
						}
					}
				}
			}
		}
	}
}

function alphabetizeActions() {
	recordedTypes.sort();
	createActionTimeSeriesArray();
	digraph.updateEdges();
	heatMap.createBaseSet();
	// update the affected charts
	digraph.draw();
	scatterplot.draw();
	piechart.draw();
	linkograph.draw();
	heatMap.draw();
}

function clusterizeActions() {
	var newArray = [];
	for ( var categoryKey in actionDictionary) {
		if (actionDictionary.hasOwnProperty(categoryKey)) {
			var categoryValue = actionDictionary[categoryKey];
			for ( var type in categoryValue) {
				if (categoryValue.hasOwnProperty(type)) {
					for (var i = 0; i < numberOfActionTypes; i++) {
						if (categoryValue[type].indexOf(recordedTypes[i]) >= 0) {
							newArray.push(recordedTypes[i]);
						}
					}
				}
			}
		}
	}
	if (recordedTypes.length !== newArray.length) {
		alert('Not all actions are counted in clusterization!')
	}
	recordedTypes = newArray;
	originalRecordedTypes = recordedTypes;
	createActionTimeSeriesArray();
	for ( var categoryKey in actionDictionary) {
		recordedTypesAttributeColor[categoryKey] = state.category[categoryKey.toLowerCase()].color;
	}
	digraph.updateEdges();
	heatMap.createBaseSet();
	digraph.draw();
	scatterplot.draw();
	piechart.draw();
	linkograph.draw();
	heatMap.draw();
}

function process(file) {

	var n = data.Activities.length;
	recordedTypes = [];

	var firstNote = true; // Fix a bug in the logger
	for (var i = 0; i < n; i++) {

		var record = data.Activities[i];
		var timestamp = record.Timestamp;
		var splitTimestamp = timestamp.split(' ');
		var date = new Date(splitTimestamp[0] + 'T' + splitTimestamp[1]);
		if (i === 0)
			timeBegin = date.getTime();
		else if (i === n - 1)
			timeEnd = date.getTime();

		for ( var p in record) {
			if (record.hasOwnProperty(p)) {
				if (p === 'Note' && firstNote) {
					firstNote = false;
					continue;
				}
				if (p !== 'Timestamp' && p !== 'File' && p !== 'Project') {
					if (recordedTypes.indexOf(p) < 0)
						recordedTypes.push(p);
				}
			}
		}

	}

	originalRecordedTypes = recordedTypes;
	recordedTypes.sort();
	numberOfActionTypes = recordedTypes.length;

	mapRecordedTypesAttribute();
	var firstTime = timeseries === undefined;
	if (firstTime) {
		timeseries = new TimeSeries('timeseries');
		timeseries.init();
		scatterplot = new Scatterplot('scatterplot');
		scatterplot.init();
		digraph = new Digraph('digraph');
		digraph.init();
		radarchart = new RadarChart('radarchart');
		radarchart.init();
		piechart = new Piechart('piechart');
		piechart.init();
		heatMap = new HeatMap('heatmap');
		heatMap.init();
		linkograph = new Linkograph('linkograph');
		linkograph.init();
		timeseries.linkGraph(scatterplot);
		timeseries.linkGraph(digraph);
		timeseries.linkGraph(piechart);
		scatterplot.linkGraph(timeseries);
		scatterplot.linkGraph(digraph);
		scatterplot.linkGraph(radarchart);
		scatterplot.linkGraph(piechart);
		digraph.linkGraph(scatterplot);
		digraph.linkGraph(radarchart);
		radarchart.linkGraph(scatterplot);
		radarchart.linkGraph(digraph);
		heatMap.linkGraph(linkograph);
		linkograph.linkGraph(heatMap);
	}
	createActionList();
	drawAll(true);
	digraph.updateEdges();
	digraph.sort();
	if (screenManager.isFullscreen()) {
		if (screenManager.fullscreenGraph instanceof Digraph) {
			screenManager.fullscreenGraph.updateEdges();
			screenManager.fullscreenGraph.sort();
		}
		screenManager.fullscreenGraph.draw();
	}

	var infoLabel = document.getElementById('info_label');
	if (file.startsWith(DATA_HOME)) {
		var studentSelection = document.getElementById('studentID');
		var fileSelection = document.getElementById('filename');
		var date = fileSelection.value.substring(0, fileSelection.value.length - 5);
		var start;
		var stop;
		for (var i = 0; i < timeTable.classes.length; i++) {
			var periods = (timeTable.classes[i])[state.dataset.classID];
			if (periods) {
				for (var j = 0; j < periods.length; j++) {
					if ((periods[j])['date'] === date) {
						start = periods[j].start;
						stop = periods[j].stop;
						break;
					}
				}
			}
		}
		var period = ' (period: ' + (start ? start : '?') + ' - ' + (stop ? stop : '?');
		timeTable.selectedSessionLength = (Date.parse('1970/01/01 ' + stop) - Date.parse('1970/01/01 ' + start)) / 1000;
		var sid = studentSelection.value + ' (' + (students[studentSelection.selectedIndex].gender === 'M' ? '&#9794;' : '&#9792;') + '): ';
		var lnk = '<a style=\"text-decoration: none; color: white\" href=\"' + file + '\" target=\"_blank\">' + fileSelection.value + '</a>';
		infoLabel.innerHTML = sid + lnk + period + ', actual: ' + (state.interval * intervalCount) + ' s, ' + data.Activities.length + ' records, ' + recordedTypes.length + ' types)';
	} else {
		infoLabel.innerHTML = file + ' (' + (state.interval * intervalCount) + ' s, ' + data.Activities.length + ' records, ' + recordedTypes.length + ' types)';
	}
	resize();
	setUiState();

}

function createActionTimeSeriesArray() {

	var numberOfRecords = data.Activities.length;
	var actionTypeElement = document.getElementById('actiontype');
	var selectedActionType = actionTypeElement.value;

	duration = (timeEnd - timeBegin) / 1000;
	intervalCount = Math.round(duration / state.interval + 1);
	if (logLevel > 0)
		console.log('Duration = ' + duration + ' seconds, interval count = ' + intervalCount);
	actionTypesArray = new Int16Array(numberOfActionTypes);
	for (var i = 0; i < numberOfActionTypes; i++) {
		actionTypesArray[i] = countActionOfType(recordedTypes[i]);
	}

	var categoryCount = Object.size(actionDictionary);
	topCategoryTimeSeriesArray = createArray(categoryCount, intervalCount);
	for (var i = 0; i < categoryCount; i++) {
		for (var j = 0; j < intervalCount; j++) {
			topCategoryTimeSeriesArray[i][j] = 0;
		}
	}
	actionTimeSeriesArray = createArray(numberOfActionTypes, intervalCount);
	excludeCameraAction = selectedActionType.indexOf('All But Camera') === 0;
	excludeNoteAction = selectedActionType === 'All But Camera & Note';
	var record;
	for (var i = 0; i < numberOfActionTypes; i++) {
		if (selectedActionType === undefined || selectedActionType === 'All' || selectedActionType.indexOf('All But Camera') === 0 || selectedActionType == recordedTypes[i]) {
			// console.log(i + ': ' + recordedTypes[i]);
			if (excludeCameraAction && recordedTypes[i] === 'Camera')
				continue;
			if (excludeNoteAction && recordedTypes[i] === 'Note')
				continue;
			for (var j = 0; j < intervalCount; j++) {
				actionTimeSeriesArray[i][j] = 0;
			}
			for (var k = 0; k < numberOfRecords; k++) {
				record = data.Activities[k];
				if (record.hasOwnProperty(recordedTypes[i])) {
					var timestamp = record.Timestamp;
					var splitTimestamp = timestamp.split(' ');
					var date = new Date(splitTimestamp[0] + 'T' + splitTimestamp[1]);
					var time = (date.getTime() - timeBegin) / 1000;
					var j = Math.round(time / state.interval);
					actionTimeSeriesArray[i][j]++;
					var category = recordedTypesAttributeMap[recordedTypes[i]];
					var indexOfCategory = Object.indexOf(category, actionDictionary);
					topCategoryTimeSeriesArray[indexOfCategory][j]++;
				}
			}
		}
	}

	fileTransitionPoints = {};
	record = data.Activities[0];
	fileTransitionPoints['0'] = record.File.substring(0, record.File.length - 4);
	var previousFile = record.File;
	for (var k = 1; k < numberOfRecords; k++) {
		record = data.Activities[k];
		if (record.File !== previousFile) {
			var timestamp = record.Timestamp;
			var splitTimestamp = timestamp.split(' ');
			var date = new Date(splitTimestamp[0] + 'T' + splitTimestamp[1]);
			var time = (date.getTime() - timeBegin) / 1000;
			var i = Math.round(time / state.interval);
			fileTransitionPoints[i.toString()] = record.File.substring(0, record.File.length - 4);
			previousFile = record.File;
		}
	}

}

function countActionOfType(type) {
	var numberOfRecords = data.Activities.length;
	var record;
	var count = 0;
	for (var k = 0; k < numberOfRecords; k++) {
		record = data.Activities[k];
		if (record.hasOwnProperty(type)) {
			count++;
		}
	}
	return count;
}

function clearData() {
	timeseries.clearCollectedResults();
	if (screenManager.fullscreenGraph instanceof TimeSeries) {
		screenManager.fullscreenGraph.clearCollectedResults();
	}
}

document.onkeydown = function(evt) {
	evt = evt || window.event;
	switch (evt.keyCode) {
	case 27: // escape
		if (timeseries.isPopupMenuVisible()) {
			timeseries.popupMenu(null, false);
		} else if (digraph.isPopupMenuVisible()) {
			digraph.popupMenu(null, false);
		} else if (radarchart.isPopupMenuVisible()) {
			radarchart.popupMenu(null, false);
		} else if (scatterplot.isPopupMenuVisible()) {
			scatterplot.popupMenu(null, false);
		} else if (linkograph.isPopupMenuVisible()) {
			linkograph.popupMenu(null, false);
		} else if (heatMap.isPopupMenuVisible()) {
			heatMap.popupMenu(null, false);
		} else {
			screenManager.closeFullscreen();
		}
		break;
	}
};

// window.onkeydown = function(e) {
// e.preventDefault();
// var key = e.keyCode ? e.keyCode : e.which;
// if (e.ctrlKey && key === 79) {
// openVpaFileFromDisk();
// } else if (e.ctrlKey && key === 83) {
// saveToDisk();
// }
// }
