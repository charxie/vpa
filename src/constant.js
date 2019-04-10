/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

var SOFTWARE = {
	name : 'Visual Process Analytics',
	abbreviation : 'VPA',
	version : 'Version 0.3'
}

var DATA_HOME = 'data/AHS2015-3/';

var FONT = {
	label : '9px Arial',
	normal : '10px Arial',
	axisName : '12px Arial',
	highlight : '14px Arial'
}

// log calculation is expensive, cache the result here
var LOG_SCALE_FACTOR = 1 / Math.log(1.5);