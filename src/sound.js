/* 
 * Copyright 2015, The Engineering Computation Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Sound() {

	var that = this;

	this.context = new AudioContext();

	this.attack = 10;
	this.decay = 250;

	this.createOscillator = function(freq) {

		var osc = this.context.createOscillator();

		var gain = this.context.createGain();
		gain.connect(this.context.destination);
		gain.gain.setValueAtTime(0, this.context.currentTime);
		gain.gain.linearRampToValueAtTime(1, this.context.currentTime + this.attack * 0.001);
		gain.gain.linearRampToValueAtTime(0, this.context.currentTime + this.decay * 0.001);

		osc.frequency.value = freq;
		osc.type = state.sound.oscillatorType;
		osc.connect(gain);
		osc.start(0);

		setTimeout(function() {
			osc.stop(0);
			osc.disconnect(gain);
			gain.disconnect(that.context.destination);
		}, this.decay * 1000);

	}

}