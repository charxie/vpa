/* 
 * Copyright 2016, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function TimeTable() {

	var that = this;
	this.classes = [];
	this.selectedSessionLength;

	(function() {

		$.getJSON(DATA_HOME + '/timetable.json', function(x) {
			that.classes = x['Classes'];
		});

	}());

}