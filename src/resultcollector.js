/* 
 * Copyright 2016, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function ResultCollector() {

	var that = this;

	this.resultSet = {}; // key is ID, value is an array of numeric data. This converts to a CSV format.

	this.createID = function() {
		return state.dataset.classID + '.' + state.dataset.studentID + '.' + state.dataset.segmentID;
	};

	this.getRows = function() {
		return Object.size(this.resultSet);
	}

	this.getColumns = function() {
		if (this.getRows() <= 0)
			return 0;
		var first = Object.getFirstValue(this.resultSet);
		return first.length;
	}

	this.collect = function() {
		var n = arguments.length;
		if (n === 0)
			return;
		var data = [];
		for (var i = 0; i < arguments.length; i++)
			data[i] = arguments[i];
		var id = this.createID();
		this.resultSet[id] = data;
	};

	this.sort = function() {
		var orderedResultSet = {};
		Object.keys(this.resultSet).sort().forEach(function(key) {
			orderedResultSet[key] = that.resultSet[key];
		});
		this.resultSet = orderedResultSet;
	}

	this.clear = function() {
		this.resultSet = {};
	};

	this.toArray = function() {
		var rows = this.getRows();
		if (rows <= 0)
			return null;
		var cols = this.getColumns();
		if (cols <= 0)
			return null;
		cols++;
		var arr = new Array(cols);
		for (var i = 0; i < cols; i++) {
			arr[i] = new Array(rows);
		}
		for (var j = 0; j < rows; j++) {
			arr[0][j] = Object.getPropertyByIndex(j, this.resultSet); // first column stores the keys of the result set
			var r = this.resultSet[arr[0][j]];
			for (var i = 0; i < r.length; i++) {
				arr[i + 1][j] = r[i];
			}
		}
		return arr;
	};

}