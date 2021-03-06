/* 
 * This file contains all the methods that augment prototypes of system objects. 
 * 
 * In cases where the name is obvious, we want to check if the method has been defined by the language. If yes, we should not define our own.
 * 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

// A convenient method for counting the number of members of an object
if (typeof Object.size !== 'function') {
	Object.size = function(obj) {
		var count = 0;
		for ( var key in obj) {
			if (obj.hasOwnProperty(key))
				count++;
		}
		return count;
	};
}

if (typeof Object.indexOf !== 'function') {
	Object.indexOf = function(key, obj) {
		if (!obj.hasOwnProperty(key))
			return -1;
		var index = -1;
		for ( var x in obj) {
			if (obj.hasOwnProperty(x)) {
				index++;
				if (key === x) {
					return index;
				}
			}
		}
		return index;
	}
}

Object.getPropertyByIndex = function(index, obj) {
	var i = -1;
	for ( var x in obj) {
		if (obj.hasOwnProperty(x)) {
			i++;
			if (i === index) {
				return x;
			}
		}
	}
	return null;
}

Object.getFirstValue = function(obj) {
	for ( var x in obj) {
		if (obj.hasOwnProperty(x)) {
			return obj[x];
		}
	}
	return null;
}

if (typeof String.prototype.startsWith !== 'function') { // do not call this, doesn't work for some reason
	String.prototype.startsWith = function(s) {
		return this.indexOf(s) === 0;
	};
}

// Fisher–Yates shuffle of an array
if (typeof Array.prototype.shuffle !== 'function') {
	Array.prototype.shuffle = function shuffle() {
		var currentIndex = this.length, temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (currentIndex !== 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = this[currentIndex];
			this[currentIndex] = this[randomIndex];
			this[randomIndex] = temporaryValue;
		}
	}
}

if (typeof CanvasRenderingContext2D.prototype.fillRoundedRect !== 'function') {
	CanvasRenderingContext2D.prototype.fillRoundedRect = function fillRoundedRect(x, y, w, h, r) {
		this.beginPath();
		this.moveTo(x + r, y);
		this.lineTo(x + w - r, y);
		this.quadraticCurveTo(x + w, y, x + w, y + r);
		this.lineTo(x + w, y + h - r);
		this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		this.lineTo(x + r, y + h);
		this.quadraticCurveTo(x, y + h, x, y + h - r);
		this.lineTo(x, y + r);
		this.quadraticCurveTo(x, y, x + r, y);
		this.closePath();
		this.fill();
	}
}

if (typeof CanvasRenderingContext2D.prototype.drawRoundedRect !== 'function') {
	CanvasRenderingContext2D.prototype.drawRoundedRect = function drawRoundedRect(x, y, w, h, r) {
		this.beginPath();
		this.moveTo(x + r, y);
		this.lineTo(x + w - r, y);
		this.quadraticCurveTo(x + w, y, x + w, y + r);
		this.lineTo(x + w, y + h - r);
		this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		this.lineTo(x + r, y + h);
		this.quadraticCurveTo(x, y + h, x, y + h - r);
		this.lineTo(x, y + r);
		this.quadraticCurveTo(x, y, x + r, y);
		this.closePath();
		this.stroke();
	}
}

CanvasRenderingContext2D.prototype.drawTooltip = function drawTooltip(x, y, h, r, margin, text, centered) {
	this.save();
	this.shadowColor = 'black';
	this.shadowBlur = 8;
	this.shadowOffsetX = 2;
	this.shadowOffsetY = 2;
	var tooltipWidth = this.measureText(text).width + 2 * margin;
	this.fillStyle = 'rgba(255, 202, 0, 0.5)';
	this.fillRoundedRect(centered ? x - tooltipWidth / 2 : x, y, tooltipWidth, h, r);
	this.strokeStyle = 'lightGray';
	this.lineWidth = 1;
	this.beginPath();
	this.drawRoundedRect(centered ? x - tooltipWidth / 2 : x, y, tooltipWidth, h, r);
	this.stroke();
	this.closePath();
	this.restore();
	this.save();
	this.fillStyle = 'white';
	this.textAlign = 'center';
	this.fillText(text, centered ? x : x + tooltipWidth / 2, y + h / 2 + 5);
	this.restore();
}

// if String.startsWith hasn't been defined, as is in the case of IE, define it below
if (typeof String.prototype.startsWith !== 'function') {
	String.prototype.startsWith = function(str) {
		return this.indexOf(str) === 0;
	};
}

navigator.sayswho = (function() {
	var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE ' + (tem[1] || '');
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
		if (tem != null)
			return tem.slice(1).join(' ').replace('OPR', 'Opera');
	}
	M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion, '-?' ];
	if ((tem = ua.match(/version\/(\d+)/i)) != null)
		M.splice(1, 1, tem[1]);
	return M.join(' ');
})();