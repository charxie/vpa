/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Statistics() {

	this.getMean = function(arr) {
		var sum = 0;
		if (arr instanceof Array) {
			sum = arr.reduce(function(a, b) {
				return a + b;
			});
		} else {
			for (var i = 0; i < arr.length; i++) {
				sum += arr[i];
			}
		}
		return sum / arr.length;
	};

	this.getMaximum = function(arr) {
		if (arr instanceof Array)
			return Math.max.apply(null, arr);
		var max = -Number.MAX_VALUE;
		for (var i = 0; i < arr.length; i++) {
			if (max < arr[i])
				max = arr[i];
		}
		return max;
	};

	this.getMinimum = function(arr) {
		if (arr instanceof Array)
			return Math.min.apply(null, arr);
		var min = Number.MAX_VALUE;
		for (var i = 0; i < arr.length; i++) {
			if (min > arr[i])
				min = arr[i];
		}
		return min;
	};

	// since the mean value is most likely calculated before calling this, we should just pass it in to avoid recalculating it
	this.getVariance = function(arr) {
		var sum = 0;
		var mean;
		if (arguments[1]) {
			mean = arguments[1];
		} else {
			mean = this.getMean(arr);
		}
		var tmp;
		for (var i = 0; i < arr.length; i++) {
			tmp = arr[i] - mean;
			sum += tmp * tmp;
		}
		return sum / arr.length;
	};

}