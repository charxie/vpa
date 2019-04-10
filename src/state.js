/* 
 * This file contains objects and methods that save and retrieve a state of data mining.
 * 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

var stateFileName;

/* This object should define the entire state of the program. In order for the change to be stored locally, call the corresponding setter. */

function State() {

	this.dataset = {

		classID : 'C',
		getClassIDName : function() { // use function to return the UID of a variable because we don't want to persist the UID
			return 'vpa.dataset.classID';
		},
		setClassID : function(id) {
			this.classID = id;
			localStorage.setItem(this.getClassIDName(), id);
		},

		studentID : 'C01',
		getStudentIDName : function() {
			return 'vpa.dataset.studentID';
		},
		setStudentID : function(id) {
			this.studentID = id;
			localStorage.setItem(this.getStudentIDName(), id);
		},

		segmentID : '2015-03-09.json',
		getSegmentIDName : function() {
			return 'vpa.dataset.segmentID';
		},
		setSegmentID : function(id) {
			this.segmentID = id;
			localStorage.setItem(this.getSegmentIDName(), id);
		}

	};

	this.sound = {

		interval : 5, // relative to the length of the time bin specified by state.interval
		getIntervalName : function() {
			return 'vpa.sound.interval';
		},
		setInterval : function(i) {
			this.interval = i;
			localStorage.setItem(this.getIntervalName(), i);
		},

		pitch : 100,
		getPitchName : function() {
			return 'vpa.sound.pitch';
		},
		setPitch : function(s) {
			this.pitch = s;
			localStorage.setItem(this.getPitchName(), s);
		},

		attack : 10, // in milliseconds
		getAttackName : function() {
			return 'vpa.sound.attack';
		},
		setAttack : function(a) {
			this.attack = a;
			localStorage.setItem(this.getAttackName(), a);
		},

		decay : 250, // in milliseconds
		getDecayName : function() {
			return 'vpa.sound.decay';
		},
		setDecay : function(d) {
			this.decay = d;
			localStorage.setItem(this.getDecayName(), d);
		},

		oscillatorType : 'sine',
		getOscillatorTypeName : function() {
			return 'vpa.sound.oscillator.type';
		},
		setOscillatorType : function(t) {
			this.oscillatorType = t;
			localStorage.setItem(this.getOscillatorTypeName(), t);
		}

	};

	this.interval = 50;
	this.getIntervalName = function() {
		return 'vpa.interval';
	};
	this.setInterval = function(i) {
		this.interval = i;
		localStorage.setItem(this.getIntervalName(), i);
	};

	this.actionFilter = 'All But Camera';
	this.getActionFilterName = function() {
		return 'vpa.actionFilter';
	};
	this.setActionFilter = function(o) {
		this.actionFilter = o;
		localStorage.setItem(this.getActionFilterName(), o);
	};

	this.actionOrder = 'Clusterized';
	this.getActionOrderName = function() {
		return 'vpa.actionOrder';
	};
	this.setActionOrder = function(o) {
		this.actionOrder = o;
		localStorage.setItem(this.getActionOrderName(), o);
	};

	this.level = 'Fine';
	this.getLevelName = function() {
		return 'vpa.level';
	};
	this.setLevel = function(l) {
		this.level = l;
		localStorage.setItem(this.getLevelName(), l);
	};

	this.labelColor = '#ffffff';
	this.getLabelColorName = function() {
		return 'vpa.labelColor';
	};
	this.setLabelColor = function(c) {
		this.labelColor = c;
		localStorage.setItem(this.getLabelColorName(), c);
	};

	this.canvasBackground = '#006699';
	this.getCanvasBackgroundName = function() {
		return 'vpa.canvasBackground';
	};
	this.setCanvasBackground = function(c) {
		this.canvasBackground = c;
		localStorage.setItem(this.getCanvasBackgroundName(), c);
	};

	this.popupBackgroundAlpha = 0.9;
	this.getPopupBackgroundAlphaName = function() {
		return 'vpa.popBackgroundAlpha';
	};
	this.setPopupBackgroundAlpha = function(a) {
		this.popupBackgroundAlpha = a;
		localStorage.setItem(this.getPopupBackgroundAlphaName(), a);
	};

	this.timeseries = {

		plotType : 'Histogram',
		getPlotTypeName : function() {
			return 'vpa.timeseries.plotType';
		},
		setPlotType : function(type) {
			this.plotType = type;
			localStorage.setItem(this.getPlotTypeName(), type);
		},

		splineTension : 0,
		getSplineTensionName : function() {
			return 'vpa.timeseries.splineTension';
		},
		setSplineTension : function(t) {
			this.splineTension = t;
			localStorage.setItem(this.getSplineTensionName(), t);
		},

		recurrenceI : 'All',
		getRecurrenceIName : function() {
			return 'vpa.timeseries.recurrenceI';
		},
		setRecurrenceI : function(i) {
			this.recurrenceI = i;
			localStorage.setItem(this.getRecurrenceIName(), i);
		},

		recurrenceJ : 'All',
		getRecurrenceJName : function() {
			return 'vpa.timeseries.recurrenceJ';
		},
		setRecurrenceJ : function(j) {
			this.recurrenceJ = j;
			localStorage.setItem(this.getRecurrenceJName(), j);
		},

		recurrenceEpsilon : 0,
		getRecurrenceEpsilonName : function() {
			return 'vpa.timeseries.recurrenceEpsilon';
		},
		setRecurrenceEpsilon : function(e) {
			this.recurrenceEpsilon = e;
			localStorage.setItem(this.getRecurrenceEpsilonName(), e);
		},

		recurrenceIdleValid : true,
		getRecurrenceIdleValidName : function() {
			return 'vpa.timeseries.recurrenceIdleValid';
		},
		setRecurrenceIdleValid : function(e) {
			this.recurrenceIdleValid = e;
			localStorage.setItem(this.getRecurrenceIdleValidName(), e);
		},

		maximumHeight : 25,
		getMaximumHeightName : function() {
			return 'vpa.timeseries.maximumHeight';
		},
		setMaximumHeight : function(h) {
			this.maximumHeight = h;
			localStorage.setItem(this.getMaximumHeightName(), h);
		},

		lineColor : '#000000',
		getLineColorName : function() {
			return 'vpa.timeseries.lineColor';
		},
		setLineColor : function(c) {
			this.lineColor = c;
			localStorage.setItem(this.getLineColorName(), c);
		},

		fillColor : '#cccccc',
		getFillColorName : function() {
			return 'vpa.timeseries.fillColor';
		},
		setFillColor : function(c) {
			this.fillColor = c;
			localStorage.setItem(this.getFillColorName(), c);
		}

	};

	this.scatterplot = {

		plotType : 'ScatterPlotAbsolute',
		getPlotTypeName : function() {
			return 'vpa.scatterplot.plotType';
		},
		setPlotType : function(type) {
			this.plotType = type;
			localStorage.setItem(this.getPlotTypeName(), type);
		},

		selectedActions : [],
		getSelectedActionsName : function() {
			return 'vpa.scatterplot.selectedActions';
		},
		setSelectedActions : function(selected) {
			this.selectedActions = selected;
			localStorage.setItem(this.getSelectedActionsName(), selected);
		}

	}

	this.digraph = {

		showSelfLoops : true,
		getShowSelfLoopsName : function() {
			return 'vpa.digraph.showSelfLoops';
		},
		setShowSelfLoops : function(b) {
			this.showSelfLoops = b;
			localStorage.setItem(this.getShowSelfLoopsName(), b);
		}

	};

	this.radarchart = {

		scaleFactor : 1,
		getScaleFactorName : function() {
			return 'vpa.radarchart.scaleFactor';
		},
		setScaleFactor : function(s) {
			this.scaleFactor = s;
			localStorage.setItem(this.getScaleFactorName(), s);
		},

		fillColor : '#00ff00',
		getFillColorName : function() {
			return 'vpa.radarchart.fillColor';
		},
		setFillColor : function(c) {
			this.fillColor = c;
			localStorage.setItem(this.getFillColorName(), c);
		}

	};

	this.heatmap = {

		color : 'red', // this must not use hex code: only three options: red, black, and purple
		getColorName : function() {
			return 'vpa.heatmap.color';
		},
		setColor : function(c) {
			this.color = c;
			localStorage.setItem(this.getColorName(), c);
		},

		contrast : 1,
		getContrastName : function() {
			return 'vpa.heatmap.contrast';
		},
		setContrast : function(c) {
			this.contrast = c;
			localStorage.setItem(this.getContrastName(), c);
		}

	};

	this.linkograph = {

		highlightColor : '#ffff00',

		withinColor : '#ff8080',
		getWithinColorName : function() {
			return 'vpa.linkograph.withinColor';
		},
		setWithinColor : function(c) {
			this.withinColor = c;
			localStorage.setItem(this.getWithinColorName(), c);
		},

		betweenColor : '#80ff80',
		getBetweenColorName : function() {
			return 'vpa.linkograph.betweenColor';
		},
		setBetweenColor : function(c) {
			this.betweenColor = c;
			localStorage.setItem(this.getBetweenColorName(), c);
		}

	};

	this.category = {

		construction : {

			visible : true,
			getVisibleName : function() {
				return 'vpa.category.construction.visible';
			},
			setVisible : function(b) {
				this.visible = b;
				localStorage.setItem(this.getVisibleName(), b);
			},

			color : '#b22222', // fire brick
			getColorName : function() {
				return 'vpa.category.construction.color';
			},
			setColor : function(c) {
				this.color = c;
				localStorage.setItem(this.getColorName(), c);
			}

		},

		analysis : {

			visible : true,
			getVisibleName : function() {
				return 'vpa.category.analysis.visible';
			},
			setVisible : function(b) {
				this.visible = b;
				localStorage.setItem(this.getVisibleName(), b);
			},

			color : '#006400', // dark green
			getColorName : function() {
				return 'vpa.category.analysis.color';
			},
			setColor : function(c) {
				this.color = c;
				localStorage.setItem(this.getColorName(), c);
			}

		},

		parameter : {

			visible : true,
			getVisibleName : function() {
				return 'vpa.category.parameter.visible';
			},
			setVisible : function(b) {
				this.visible = b;
				localStorage.setItem(this.getVisibleName(), b);
			},

			color : '#000080', // navy
			getColorName : function() {
				return 'vpa.category.parameter.color';
			},
			setColor : function(c) {
				this.color = c;
				localStorage.setItem(this.getColorName(), c);
			}

		},

		view : {

			visible : true,
			getVisibleName : function() {
				return 'vpa.category.view.visible';
			},
			setVisible : function(b) {
				this.visible = b;
				localStorage.setItem(this.getVisibleName(), b);
			},

			color : '#8b008b', // dark magenta
			getColorName : function() {
				return 'vpa.category.view.color';
			},
			setColor : function(c) {
				this.color = c;
				localStorage.setItem(this.getColorName(), c);
			}

		},

		reflection : {

			visible : true,
			getVisibleName : function() {
				return 'vpa.category.reflection.visible';
			},
			setVisible : function(b) {
				this.visible = b;
				localStorage.setItem(this.getVisibleName(), b);
			},

			color : '#ff4500', // orange red
			getColorName : function() {
				return 'vpa.category.reflection.color';
			},
			setColor : function(c) {
				this.color = c;
				localStorage.setItem(this.getColorName(), c);
			}

		},

		misc : {

			visible : true,
			getVisibleName : function() {
				return 'vpa.category.misc.visible';
			},
			setVisible : function(b) {
				this.visible = b;
				localStorage.setItem(this.getVisibleName(), b);
			},

			color : '#000000',
			getColorName : function() {
				return 'vpa.category.misc.color';
			},
			setColor : function(c) {
				this.color = c;
				localStorage.setItem(this.getColorName(), c);
			}

		}

	};

}

function resetState() {

	var newState = new State();

	localStorage.setItem(state.category.construction.getColorName(), newState.category.construction.color);
	localStorage.setItem(state.category.analysis.getColorName(), newState.category.analysis.color);
	localStorage.setItem(state.category.parameter.getColorName(), newState.category.parameter.color);
	localStorage.setItem(state.category.view.getColorName(), newState.category.view.color);
	localStorage.setItem(state.category.reflection.getColorName(), newState.category.reflection.color);
	localStorage.setItem(state.category.misc.getColorName(), newState.category.misc.color);

	localStorage.setItem(state.category.construction.getVisibleName(), newState.category.construction.visible);
	localStorage.setItem(state.category.analysis.getVisibleName(), newState.category.analysis.visible);
	localStorage.setItem(state.category.parameter.getVisibleName(), newState.category.parameter.visible);
	localStorage.setItem(state.category.view.getVisibleName(), newState.category.view.visible);
	localStorage.setItem(state.category.reflection.getVisibleName(), newState.category.reflection.visible);
	localStorage.setItem(state.category.misc.getVisibleName(), newState.category.misc.visible);

	localStorage.setItem(state.dataset.getClassIDName(), newState.dataset.classID);
	localStorage.setItem(state.dataset.getStudentIDName(), newState.dataset.studentID);
	localStorage.setItem(state.dataset.getSegmentIDName(), newState.dataset.segmentID);

	localStorage.setItem(state.sound.getIntervalName(), newState.sound.interval);
	localStorage.setItem(state.sound.getPitchName(), newState.sound.pitch);
	localStorage.setItem(state.sound.getAttackName(), newState.sound.attack);
	localStorage.setItem(state.sound.getDecayName(), newState.sound.decay);
	localStorage.setItem(state.sound.getOscillatorTypeName(), newState.sound.oscillatorType);

	localStorage.setItem(state.getIntervalName(), newState.interval);
	localStorage.setItem(state.getActionFilterName(), newState.actionFilter);
	localStorage.setItem(state.getActionOrderName(), newState.actionOrder);
	localStorage.setItem(state.getLevelName(), newState.level);

	localStorage.setItem(state.getLabelColorName(), newState.labelColor);
	localStorage.setItem(state.getCanvasBackgroundName(), newState.canvasBackground);
	localStorage.setItem(state.getPopupBackgroundAlphaName(), newState.popupBackgroundAlpha);

	localStorage.setItem(state.timeseries.getPlotTypeName(), newState.timeseries.plotType);
	localStorage.setItem(state.timeseries.getSplineTensionName(), newState.timeseries.splineTension);
	localStorage.setItem(state.timeseries.getRecurrenceIName(), newState.timeseries.recurrenceI);
	localStorage.setItem(state.timeseries.getRecurrenceJName(), newState.timeseries.recurrenceJ);
	localStorage.setItem(state.timeseries.getRecurrenceEpsilonName(), newState.timeseries.recurrenceEpsilon);
	localStorage.setItem(state.timeseries.getRecurrenceIdleValidName(), newState.timeseries.recurrenceIdleValid);
	localStorage.setItem(state.timeseries.getMaximumHeightName(), newState.timeseries.maximumHeight);
	localStorage.setItem(state.timeseries.getLineColorName(), newState.timeseries.lineColor);
	localStorage.setItem(state.timeseries.getFillColorName(), newState.timeseries.fillColor);

	localStorage.setItem(state.scatterplot.getPlotTypeName(), newState.scatterplot.plotType);
	localStorage.setItem(state.scatterplot.getSelectedActionsName(), newState.scatterplot.selectedActions);

	localStorage.setItem(state.digraph.getShowSelfLoopsName(), newState.digraph.showSelfLoops);

	localStorage.setItem(state.radarchart.getScaleFactorName(), newState.radarchart.scaleFactor);
	localStorage.setItem(state.radarchart.getFillColorName(), newState.radarchart.fillColor);

	localStorage.setItem(state.heatmap.getColorName(), newState.heatmap.color);
	localStorage.setItem(state.heatmap.getContrastName(), newState.heatmap.contrast);

	localStorage.setItem(state.linkograph.getWithinColorName(), newState.linkograph.withinColor);
	localStorage.setItem(state.linkograph.getBetweenColorName(), newState.linkograph.betweenColor);

	return newState;

}

function recall() {

	var s = localStorage.getItem(state.dataset.getClassIDName());
	if (s) {
		state.dataset.classID = s;
		document.getElementById('classID').value = s;
	}
	s = localStorage.getItem(state.dataset.getStudentIDName());
	if (s) {
		state.dataset.studentID = s;
		document.getElementById('studentID').value = s;
	}
	s = localStorage.getItem(state.dataset.getSegmentIDName());
	if (s) {
		state.dataset.segmentID = s;
		document.getElementById('filename').value = s;
	}

	s = localStorage.getItem(state.sound.getIntervalName());
	if (s) {
		state.sound.interval = parseInt(s);
		document.getElementById('sound_interval_textfield').value = s;
	}
	s = localStorage.getItem(state.sound.getPitchName());
	if (s) {
		state.sound.pitch = parseInt(s);
		document.getElementById('sound_pitch_textfield').value = s;
	}
	s = localStorage.getItem(state.sound.getAttackName());
	if (s) {
		state.sound.attack = parseInt(s);
		document.getElementById('sound_attack_textfield').value = s;
	}
	s = localStorage.getItem(state.sound.getDecayName());
	if (s) {
		state.sound.decay = parseInt(s);
		document.getElementById('sound_decay_textfield').value = s;
	}
	s = localStorage.getItem(state.sound.getOscillatorTypeName());
	if (s) {
		state.sound.oscillatorType = s;
		document.getElementById('sound_oscillator_type_selector').value = s;
	}

	s = localStorage.getItem(state.getIntervalName());
	if (s) {
		state.interval = parseInt(s);
		document.getElementById('timeseries_interval').value = s;
	}
	s = localStorage.getItem(state.getActionFilterName());
	if (s) {
		state.actionFilter = s;
	}
	s = localStorage.getItem(state.getActionOrderName());
	if (s) {
		state.actionOrder = s;
		document.getElementById('sort_selector').value = s;
	}
	s = localStorage.getItem(state.getLevelName());
	if (s) {
		state.level = s;
		document.getElementById('level_selector').value = s;
	}

	s = localStorage.getItem(state.getCanvasBackgroundName());
	if (s) {
		state.canvasBackground = s;
	}
	s = localStorage.getItem(state.getPopupBackgroundAlphaName());
	if (s) {
		state.popupBackgroundAlpha = parseFloat(s);
	}
	s = localStorage.getItem(state.getLabelColorName());
	if (s) {
		state.labelColor = s;
	}

	// category
	s = localStorage.getItem(state.category.construction.getColorName());
	if (s) {
		state.category.construction.color = s;
		document.getElementById('construction_color').value = s;
	}
	s = localStorage.getItem(state.category.construction.getVisibleName());
	if (s) {
		var b = s == 'true';
		state.category.construction.visible = b;
		document.getElementById('show_category_construction').checked = b;
	}

	s = localStorage.getItem(state.category.analysis.getColorName());
	if (s) {
		state.category.analysis.color = s;
		document.getElementById('analysis_color').value = s;
	}
	s = localStorage.getItem(state.category.analysis.getVisibleName());
	if (s) {
		var b = s == 'true';
		state.category.analysis.visible = b;
		document.getElementById('show_category_analysis').checked = b;
	}

	s = localStorage.getItem(state.category.parameter.getColorName());
	if (s) {
		state.category.parameter.color = s;
		document.getElementById('parameter_color').value = s;
	}
	s = localStorage.getItem(state.category.parameter.getVisibleName());
	if (s) {
		var b = s == 'true';
		state.category.parameter.visible = b;
		document.getElementById('show_category_parameter').checked = b;
	}

	s = localStorage.getItem(state.category.view.getColorName());
	if (s) {
		state.category.view.color = s;
		document.getElementById('view_color').value = s;
	}
	s = localStorage.getItem(state.category.view.getVisibleName());
	if (s) {
		var b = s == 'true';
		state.category.view.visible = b;
		document.getElementById('show_category_view').checked = b;
	}

	s = localStorage.getItem(state.category.reflection.getColorName());
	if (s) {
		state.category.reflection.color = s;
		document.getElementById('reflection_color').value = s;
	}
	s = localStorage.getItem(state.category.reflection.getVisibleName());
	if (s) {
		var b = s == 'true';
		state.category.reflection.visible = b;
		document.getElementById('show_category_reflection').checked = b;
	}

	s = localStorage.getItem(state.category.misc.getColorName());
	if (s) {
		state.category.misc.color = s;
		document.getElementById('misc_color').value = s;
	}
	s = localStorage.getItem(state.category.misc.getVisibleName());
	if (s) {
		var b = s == 'true';
		state.category.misc.visible = b;
		document.getElementById('show_category_misc').checked = b;
	}

	// timeseries
	s = localStorage.getItem(state.timeseries.getPlotTypeName());
	if (s) {
		state.timeseries.plotType = s;
		document.getElementById('timeseries-selector').value = s;
	}
	s = localStorage.getItem(state.timeseries.getSplineTensionName());
	if (s) {
		state.timeseries.splineTension = parseFloat(s);
		document.getElementById('spline_tension').value = s;
	}
	s = localStorage.getItem(state.timeseries.getRecurrenceIName());
	if (s) {
		state.timeseries.recurrenceI = s;
	}
	s = localStorage.getItem(state.timeseries.getRecurrenceJName());
	if (s) {
		state.timeseries.recurrenceJ = s;
	}
	s = localStorage.getItem(state.timeseries.getRecurrenceEpsilonName());
	if (s) {
		state.timeseries.recurrenceEpsilon = parseFloat(s);
		document.getElementById('recurrence_epsilon').value = s;
	}
	s = localStorage.getItem(state.timeseries.getRecurrenceIdleValidName());
	if (s) {
		var b = (s === 'true');
		state.timeseries.recurrenceIdleValid = b;
		document.getElementById('recurrence_idle_valid_checkbox').checked = b;
	}
	s = localStorage.getItem(state.timeseries.getLineColorName());
	if (s) {
		state.timeseries.lineColor = s;
		document.getElementById('timeseries_line_color').value = s;
	}
	s = localStorage.getItem(state.timeseries.getFillColorName());
	if (s) {
		state.timeseries.fillColor = s;
		document.getElementById('timeseries_fill_color').value = s;
	}
	s = localStorage.getItem(state.timeseries.getMaximumHeightName());
	if (s) {
		state.timeseries.maximumHeight = parseFloat(s);
		document.getElementById('timeseries_max_height').value = s;
	}

	// scatterplot
	s = localStorage.getItem(state.scatterplot.getPlotTypeName());
	if (s) {
		state.scatterplot.plotType = s;
		document.getElementById('scatterplot-selector').value = s;
	}
	s = localStorage.getItem(state.scatterplot.getSelectedActionsName());
	if (s) {
		state.scatterplot.selectedActions = s;
	}

	// digraph
	s = localStorage.getItem(state.digraph.getShowSelfLoopsName());
	if (s) {
		// because localStorage only stores string, we must convert string to boolean before use
		var b = true;
		if (typeof s === 'string') {
			b = (s === 'true');
		} else if (typeof s === 'boolean') {
			b = s;
		}
		state.digraph.showSelfLoops = b;
		document.getElementById('digraph_self_checkbox').checked = b;
	}

	// heat map
	s = localStorage.getItem(state.heatmap.getColorName());
	if (s) {
		state.heatmap.color = s;
		document.getElementById('heatmap_color').value = s;
	}
	s = localStorage.getItem(state.heatmap.getContrastName());
	if (s) {
		state.heatmap.contrast = parseFloat(s);
		document.getElementById('heatmap_contrast_textfield').value = s;
		document.getElementById('heatmap_contrast_slider').value = s;
	}

	// linkograph
	s = localStorage.getItem(state.linkograph.getWithinColorName());
	if (s) {
		state.linkograph.withinColor = s;
		document.getElementById('linkograph_within_color').value = s;
	}
	s = localStorage.getItem(state.linkograph.getBetweenColorName());
	if (s) {
		state.linkograph.betweenColor = s;
		document.getElementById('linkograph_between_color').value = s;
	}

	// radar chart
	s = localStorage.getItem(state.radarchart.getFillColorName());
	if (s) {
		state.radarchart.fillColor = s;
		document.getElementById('radarchart_fill_color').value = s;
	}
	s = localStorage.getItem(state.radarchart.getScaleFactorName());
	if (s) {
		state.radarchart.scaleFactor = s;
		document.getElementById('radarchart_scale_factor').value = s;
	}

}

function setState(s) {

	if (s === undefined)
		return;

	// do not just say state.dataset = s.dataset because the functions are not persisted in JSON
	state.dataset.classID = s.dataset.classID;
	state.dataset.studentID = s.dataset.studentID;
	state.dataset.segmentID = s.dataset.segmentID;

	state.sound.interval = s.sound.interval;
	state.sound.pitch = s.sound.pitch;
	state.sound.attack = s.sound.attack;
	state.sound.decay = s.sound.decay;
	state.sound.oscillatorType = s.sound.oscillatorType;

	// for backward compatibility, we have to check if a graph type is defined. This makes the code verbose, but is essential
	if (s.timeseries) {
		state.timeseries.plotType = s.timeseries.plotType;
		state.timeseries.recurrenceI = s.timeseries.recurrenceI;
		state.timeseries.recurrenceJ = s.timeseries.recurrenceJ;
		state.timeseries.recurrenceEpsilon = s.timeseries.recurrenceEpsilon;
		state.timeseries.recurrenceIdleValid = s.timeseries.recurrenceIdleValid;
		state.timeseries.splineTension = s.timeseries.splineTension;
		state.timeseries.fillColor = s.timeseries.fillColor;
		state.timeseries.lineColor = s.timeseries.lineColor;
		state.timeseries.maximumHeight = s.timeseries.maximumHeight;
	}
	if (s.digraph) {
		state.digraph.showSelfLoops = s.digraph.showSelfLoops;
	}
	if (s.radarchart) {
		state.radarchart.fillColor = s.radarchart.fillColor;
		state.radarchart.scaleFactor = s.radarchart.scaleFactor;
	}
	if (s.heatmap) {
		state.heatmap.contrast = s.heatmap.contrast;
		state.heatmap.color = s.heatmap.color;
	}
	if (s.linkograph) {
		state.linkograph.withinColor = s.linkograph.withinColor;
		state.linkograph.betweenColor = s.linkograph.betweenColor;
	}

	state.interval = s.interval;
	state.actionFilter = s.actionFilter;
	state.actionOrder = s.actionOrder;
	state.level = s.level;
	state.popupBackgroundAlpha = s.popupBackgroundAlpha;
	state.canvasBackground = s.canvasBackground;
	state.labelColor = s.labelColor;

	state.category.construction.color = s.category.construction.color;
	state.category.analysis.color = s.category.analysis.color;
	state.category.parameter.color = s.category.parameter.color;
	state.category.view.color = s.category.view.color;
	state.category.reflection.color = s.category.reflection.color;
	state.category.misc.color = s.category.misc.color;

	state.category.construction.visible = s.category.construction.visible;
	state.category.analysis.visible = s.category.analysis.visible;
	state.category.parameter.visible = s.category.parameter.visible;
	state.category.view.visible = s.category.view.visible;
	state.category.reflection.visible = s.category.reflection.visible;
	state.category.misc.visible = s.category.misc.visible;

}

function setUiState() {

	document.getElementById('timeseries-selector').value = state.timeseries.plotType;
	document.getElementById('scatterplot-selector').value = state.scatterplot.plotType;
	document.getElementById('spline_tension').value = state.timeseries.splineTension;
	document.getElementById('recurrence_epsilon').value = state.timeseries.recurrenceEpsilon;
	document.getElementById('recurrence_i_selector').value = state.timeseries.recurrenceI;
	document.getElementById('recurrence_j_selector').value = state.timeseries.recurrenceJ;
	document.getElementById('recurrence_idle_valid_checkbox').value = state.timeseries.recurrenceIdleValid;
	document.getElementById('timeseries_fill_color').value = state.timeseries.fillColor;
	document.getElementById('timeseries_line_color').value = state.timeseries.lineColor;
	document.getElementById('timeseries_max_height').value = state.timeseries.maximumHeight;

	document.getElementById('digraph_self_checkbox').checked = state.digraph.showSelfLoops;

	document.getElementById('radarchart_fill_color').value = state.radarchart.fillColor;
	document.getElementById('radarchart_scale_factor').value = state.radarchart.scaleFactor;

	document.getElementById('heatmap_contrast_textfield').value = state.heatmap.contrast;
	document.getElementById('heatmap_contrast_slider').value = state.heatmap.contrast;
	document.getElementById('heatmap_color').value = state.heatmap.color;

	document.getElementById('linkograph_within_color').value = state.linkograph.withinColor;
	document.getElementById('linkograph_between_color').value = state.linkograph.betweenColor;

	document.getElementById('fullscreen').style.opacity = state.popupBackgroundAlpha;
	document.getElementById('popup_background_alpha_slider').value = state.popupBackgroundAlpha;

	setLabelColor(state.labelColor);
	setCanvasBackgroundColor(state.canvasBackground);
	document.getElementById('canvas_bgcolor').value = state.canvasBackground;
	document.getElementById('construction_color').value = state.category.construction.color;
	document.getElementById('analysis_color').value = state.category.analysis.color;
	document.getElementById('parameter_color').value = state.category.parameter.color;
	document.getElementById('view_color').value = state.category.view.color;
	document.getElementById('reflection_color').value = state.category.reflection.color;
	document.getElementById('misc_color').value = state.category.misc.color;
	document.getElementById('show_category_construction').checked = state.category.construction.visible;
	document.getElementById('show_category_analysis').checked = state.category.analysis.visible;
	document.getElementById('show_category_parameter').checked = state.category.parameter.visible;
	document.getElementById('show_category_view').checked = state.category.view.visible;
	document.getElementById('show_category_reflection').checked = state.category.reflection.visible;
	document.getElementById('show_category_misc').checked = state.category.misc.visible;

	timeseries.plotAs(state.timeseries.plotType);
	setRecurrenceUI();

}

function setGraphStates() {
	var classFolder = DATA_HOME + state.dataset.classID;
	$.getJSON(classFolder + '/studenttable.json', function(x) {
		var s = x[state.dataset.classID];
		students = [];
		for (var i = 0; i < s.length; i++) {
			students.push(new User(s[i].id, s[i].gender));
		}
		createStudentList();
		document.getElementById('classID').value = state.dataset.classID;
		document.getElementById('studentID').value = state.dataset.studentID;
		document.getElementById('timeseries_interval').value = state.interval;
		document.getElementById('sound_interval_textfield').value = state.sound.interval;
		document.getElementById('sound_pitch_textfield').value = state.sound.pitch;
		document.getElementById('sound_attack_textfield').value = state.sound.attack;
		document.getElementById('sound_decay_textfield').value = state.sound.decay;
		document.getElementById('sound_oscillator_type_selector').value = state.sound.oscillatorType;
		document.getElementById('sort_selector').value = state.actionOrder;
		document.getElementById('level_selector').value = state.level;
		dataFolder = DATA_HOME + state.dataset.classID + '/' + state.dataset.studentID + '/log/';
		$.getJSON(dataFolder + 'segments.json', function(x) {
			segmentFiles = x;
			createFileList();
			document.getElementById('filename').value = state.dataset.segmentID;
			loadSegmentData();
		});
	});
}
