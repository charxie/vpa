/* 
 * Copyright 2015, The Engineering Computation Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function ScreenManager() {

	var fullscreenGraph;

	this.isFullscreen = function() {
		return this.fullscreenGraph !== undefined && this.fullscreenGraph !== null;
	}

	this.getCanvas = function() {
		if (this.isFullscreen())
			return this.fullscreenGraph.getCanvas();
		return null;
	}

	this.prepareFullscreenGraph = function() {
		if (this.isFullscreen()) {
			if (this.fullscreenGraph instanceof Digraph) {
				this.fullscreenGraph.updateEdges();
			} else if (this.fullscreenGraph instanceof RadarChart) {
				this.fullscreenGraph.createAxes();
			} else if (this.fullscreenGraph instanceof HeatMap) {
				this.fullscreenGraph.createBaseSet();
			}
		}
	}

	this.draw = function() {
		if (this.isFullscreen())
			this.fullscreenGraph.draw();
	}

	this.maximize = function(type) {
		switch (type) {
		case 'timeseries':
			this.fullscreenGraph = new TimeSeries('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.draw();
			this.fullscreenGraph.linkGraph(scatterplot);
			this.fullscreenGraph.linkGraph(digraph);
			this.fullscreenGraph.linkGraph(piechart);
			break;
		case 'scatterplot':
			this.fullscreenGraph = new Scatterplot('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.draw();
			this.fullscreenGraph.linkGraph(timeseries);
			this.fullscreenGraph.linkGraph(digraph);
			this.fullscreenGraph.linkGraph(radarchart);
			this.fullscreenGraph.linkGraph(piechart);
			break;
		case 'digraph':
			this.fullscreenGraph = new Digraph('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.updateEdges();
			this.fullscreenGraph.draw();
			this.fullscreenGraph.linkGraph(scatterplot);
			this.fullscreenGraph.linkGraph(radarchart);
			break;
		case 'piechart':
			this.fullscreenGraph = new Piechart('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.draw();
			break;
		case 'radarchart':
			this.fullscreenGraph = new RadarChart('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.createAxes();
			this.fullscreenGraph.draw();
			this.fullscreenGraph.linkGraph(scatterplot);
			this.fullscreenGraph.linkGraph(digraph);
			break;
		case 'heatmap':
			this.fullscreenGraph = new HeatMap('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.createBaseSet();
			this.fullscreenGraph.draw();
			this.fullscreenGraph.linkGraph(linkograph);
			break;
		case 'linkograph':
			this.fullscreenGraph = new Linkograph('canvas-popup');
			this.fullscreenGraph.init();
			this.fullscreenGraph.draw();
			this.fullscreenGraph.linkGraph(heatMap);
			break;
		default:
			this.fullscreenGraph = null;
			break;
		}
		if (this.fullscreenGraph !== null) {
			this.fullscreenGraph.resize();
		}
		htmlUtil.show('fullscreen');
	};

	this.closeFullscreen = function() {
		if (this.isFullscreen()) {
			htmlUtil.hide('fullscreen');
			this.fullscreenGraph = null;
		}
	}

	this.setFullscreenOpacity = function(opacity) {
		state.setPopupBackgroundAlpha(opacity);
		document.getElementById('fullscreen').style.opacity = opacity;
	}

	this.resize = function() {
		if (this.isFullscreen())
			this.fullscreenGraph.resize();
	}

	this.setFullscreenPositionAndSize = function(canvas) {
		var a = 50, b = 100, c = 25;
		canvas.style.position = 'absolute';
		canvas.width = window.innerWidth - 2 * a;
		canvas.height = window.innerHeight - b - c;
		canvas.style.left = a + 'px';
		canvas.style.top = b + 'px';
		canvas.style.right = a + 'px';
		canvas.style.bottom = c + 'px';
	}

}