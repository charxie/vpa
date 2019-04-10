/* 
 * This is NOT a general implementation of graph. The vertices are from recordedTypes.
 * 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Edge(i, j) {

	this.i = i;
	this.j = j;
	this.owner; // in which object this edge is defined

}

Edge.prototype.toString = function() {
	return "(" + i + ", " + j + ")";
}

TimedEdge.prototype = new Edge();
TimedEdge.prototype.constructor = TimedEdge;

function TimedEdge(i, j, timestamp) {

	this.i = i;
	this.j = j;
	this.timestamp = timestamp; // set this to null if time stamp is not needed

}

TimedEdge.prototype.toString = function() {
	if (timestamp === null || timestamp === undefined)
		return "(" + i + ", " + j + ")";
	return "(" + i + ", " + j + ") : " + timestamp;
}


function Graph() {

	var edges = [];
	var degrees = [];

	this.createEdgeArray = function() {
		this.edges = [];
		this.degrees = createArray(recordedTypes.length);
		for (var i = 0; i < this.degrees.length; i++) {
			this.degrees[i] = 0;
		}
		var n = data.Activities.length;
		var index1, index2;
		for (var i = 0; i < n; i++) {
			var record = data.Activities[i];
			var countKeys = Object.keys(record).length;
			for ( var p in record) {
				if (record.hasOwnProperty(p)) {
					if (p !== 'Timestamp' && p !== 'File') {
						if (p === 'Camera') {
							if (excludeCameraAction || countKeys > 3) // if there are other actions, skip camera
								continue;
						}
						index1 = recordedTypes.indexOf(p);
						if (index1 >= 0) {
							if (index2 !== undefined) {
								this.degrees[index1]++;
								this.degrees[index2]++;
								var timestamp = record.Timestamp;
								var splitTimestamp = timestamp.split(' ');
								var date = new Date(splitTimestamp[0] + 'T' + splitTimestamp[1]);
								var time = (date.getTime() - timeBegin) / 1000;
								this.edges.push(new TimedEdge(index2, index1, time));
							}
							index2 = index1;
						}
					}
				}
			}
		}
	};

	this.countEdge = function(i, j) {
		var count = 0;
		for (var k = 0; k < this.edges.length; k++) {
			var e = this.edges[k];
			if (e.i === i && e.j === j) {
				count++;
			}
		}
		return count;
	}

	this.isEdgeBidirectional = function(i, j) {
		var directionIJ = false;
		for (var k = 0; k < this.edges.length; k++) {
			var e = this.edges[k];
			if (e.i === i && e.j === j) {
				directionIJ = true;
				break;
			}
		}
		var directionJI = false;
		for (var k = 0; k < this.edges.length; k++) {
			var e = this.edges[k];
			if (e.i === j && e.j === i) {
				directionJI = true;
				break;
			}
		}
		return directionIJ && directionJI;
	}

}