/* 
 * Copyright 2015, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function Message() {

	this.aboutVPA = function() {
		var s1 = SOFTWARE.name + ' (' + SOFTWARE.abbreviation + ') is a cloud-based platform for visualizing and analyzing student learning from complex, fine-grained process data. ';
		var s2 = 'It is currently being developed by <a target="_blank" href="http://staff.concord.org/~qxie/">Dr. Charles Xie</a> and collaborators to integrate process analytics and visual analytics to assess student learning through authentic scientific inquiry and engineering design. ';
		var s3 = 'The goal of VPA is to eventually create useful classroom informatics and infographics for students and teachers to monitor their day-to-day learning and teaching through science and engineering practices.';
		var s4 = 'The development of this program is funded by the National Science Foundation under grants #1124281, #1348530, and #1503196. Any opinions, findings, and conclusions or recommendations expressed in the materials associated with this program are those of the author(s) and do not necessarily reflect the views of the National Science Foundation, however.';
		$('#about_vpa_dialog').html('<div style="font-family: Arial; line-height: 20px; font-size: 90%;">' + s1 + s2 + s3 + '<p>' + s4 + '</div>');
		$('#about_vpa_dialog').dialog({
			resizable : false,
			modal : true,
			title : "About VPA",
			height : 400,
			width : 600,
			buttons : {
				'Close' : function() {
					$(this).dialog('close');
				}
			}
		});
	};

	this.warnBrowser = function(browser) {
		$('#warn_browser_dialog').html('<div style="font-family: Arial; line-height: 20px; font-size: 90%;">You are using ' + browser + '. It is advised that you use Chrome, Edge, or Firefox to work with ' + SOFTWARE.abbreviation + '. We cannot guarantee that it works as well on other browsers due to issues with browser compatibility.</div>');
		$('#warn_browser_dialog').dialog({
			resizable : false,
			modal : true,
			title : "Browser Advice",
			height : 250,
			width : 300,
			buttons : {
				'Dismiss' : function() {
					$(this).dialog('close');
				}
			}
		});
	};

}