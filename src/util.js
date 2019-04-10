/* 
 * This file contains utility methods.
 * 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function isMac() {
	return navigator.appVersion.indexOf("Mac") !== -1;
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r : parseInt(result[1], 16),
		g : parseInt(result[2], 16),
		b : parseInt(result[3], 16)
	} : null;
}

function getAverageColor() {
	var n = arguments.length;
	if (n <= 0)
		return '#000000';
	var r = 0, g = 0, b = 0;
	for (var i = 0; i < n; i++) {
		var rgb = hexToRgb(arguments[i]);
		if (rgb === null)
			continue;
		r += rgb.r;
		g += rgb.g;
		b += rgb.b;
	}
	r /= n;
	g /= n;
	b /= n;
	return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

function addZero(number) {
	return (number < 10 ? '0' : '') + number
}

function createArray(length) {
	var a = new Array(length || 0), i = length;
	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while (i--)
			a[length - 1 - i] = createArray.apply(this, args);
	}
	return a;
}

function HtmlUtil() {

	this.show = function(div) {
		document.getElementById(div).style.display = 'block';
	}

	this.hide = function(div) {
		document.getElementById(div).style.display = 'none';
	}

	this.getPosition = function(e) {
		var posx = 0;
		var posy = 0;
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		} else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return {
			x : posx,
			y : posy
		}
	}

	// make a clone of this canvas is, at this point, the easiest workaround to remove all existing event listeners from an element
	this.cloneElement = function(id) {
		var oldElement = document.getElementById(id);
		var newElement = oldElement.cloneNode(true);
		oldElement.parentNode.replaceChild(newElement, oldElement);
		return newElement;
	}

	var expanded = false;
	this.showCheckboxes = function(id) {
		var checkboxes = document.getElementById(id);
		if (!expanded) {
			checkboxes.style.display = "block";
		} else {
			checkboxes.style.display = "none";
		}
		expanded = !expanded;
	}

	this.addOption = function(selectList, text) {
		var option = document.createElement("option");
		option.text = text;
		selectList.add(option);
	}

	this.removeAllOptions = function(selectList) {
		for (var i = selectList.options.length - 1; i >= 0; i--) { // must use reverse order
			selectList.remove(i);
		}
	}

	// return an array of the selected options
	this.getSelectedValues = function(select) {
		var result = [];
		var options = select && select.options;
		var opt;
		for (var i = 0; i < options.length; i++) {
			opt = options[i];
			if (opt.selected) {
				result.push(opt.value || opt.text);
			}
		}
		return result;
	}

}