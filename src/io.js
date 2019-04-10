/* 
 * The I/O functions
 * 
 * Copyright 2016, The Intelligent Learning Technology Laboratory, The Concord Consortium
 * 
 * @author Charles Xie
 *
 */

'use strict';

function PngExporter() {

	var that = this;

	this.save = function(filename, imgURL) {
		var link = document.getElementById('invisible_link');
		link.download = filename;
		link.href = imgURL;
		link.click();
	};

	this.saveAs = function(canvas) {
		var filename = 'screenshot.png';
		$('#save_to_disk_dialog').html('<div style="font-family: Arial; line-height: 30px; font-size: 90%;">Save screenshot as:<br><input type="text" id="save_filename" style="width: 260px;" value="' + filename + '">');
		$('#save_to_disk_dialog').dialog({
			resizable : false,
			modal : true,
			title : "Save",
			height : 200,
			width : 300,
			position : {
				my : 'center center',
				at : 'center center',
				of : window
			},
			buttons : {
				'OK' : function() {
					$(this).dialog('close');
					var filename = document.getElementById('save_filename').value;
					that.save(filename, canvas.toDataURL("image/png"));
				},
				'Cancel' : function() {
					$(this).dialog('close');
				}
			}
		});
	};

}

function CsvExporter() {

	var that = this;

	this.save = function(filename, arr) {
		var s = '';
		var cols = arr.length;
		var rows = arr[0].length;
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				s += arr[j][i] + ', ';
			}
			s = s.trim();
			s = s.substring(0, s.length - 1) + '\n';
		}
		var csv = 'text/csv;charset=utf-8,' + encodeURIComponent(s);
		var link = document.getElementById('invisible_link');
		link.download = filename;
		link.href = 'data:' + csv;
		link.click();
	};

	this.saveAs = function(arr, name) {
		var filename = stateFileName ? stateFileName : name + '.csv';
		$('#save_to_disk_dialog').html('<div style="font-family: Arial; line-height: 30px; font-size: 90%;">Save ' + name + ' as:<br><input type="text" id="save_filename" style="width: 260px;" value="' + filename + '">');
		$('#save_to_disk_dialog').dialog({
			resizable : false,
			modal : true,
			title : "Save",
			height : 200,
			width : 300,
			position : {
				my : 'center center',
				at : 'center center',
				of : window
			},
			buttons : {
				'OK' : function() {
					$(this).dialog('close');
					var filename = document.getElementById('save_filename').value;
					that.save(filename, arr);
				},
				'Cancel' : function() {
					$(this).dialog('close');
				}
			}
		});
	};

}

function DataImporter() {

	var warnAboutRepository = true;

	this.open = function() {
		if (warnAboutRepository) {
			$('#warn_repository_dialog').html('<div style="font-family: Arial; line-height: 20px; font-size: 90%;">You are loading an external file to the VPA. This may disrupt the repository navigation and operation.</div>');
			$('#warn_repository_dialog').dialog({
				resizable : false,
				modal : true,
				title : "Repository Advice",
				height : 180,
				width : 300,
				buttons : {
					'OK' : function() {
						$(this).dialog('close');
						document.getElementById('invisible_json_file_dialog').click();
						warnAboutRepository = false;
					}
				}
			});
		} else {
			document.getElementById('invisible_json_file_dialog').click();
		}
	};

	this.onFileDialogChange = function(event) {
		var reader = new FileReader();
		reader.onload = function(event) {
			data = JSON.parse(event.target.result);
			var fileInput = document.getElementById('invisible_json_file_dialog');
			var fullPath = fileInput.value;
			var fileName;
			if (fullPath) {
				var startIndex = fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/');
				fileName = fullPath.substring(startIndex);
				if (fileName.indexOf('\\') === 0 || fileName.indexOf('/') === 0) {
					fileName = fileName.substring(1);
				}
				document.title = fileName + ' - ' + SOFTWARE.name;
			}
			process(fileName);
		};
		reader.readAsText(event.target.files[0]);
	};

}

function StateIO() {

	var that = this;

	this.open = function() {
		var fileInput = document.getElementById('invisible_vpa_file_dialog');
		fileInput.click();
	};

	this.onFileDialogChange = function(event) {
		var reader = new FileReader();
		reader.onload = function(event) {
			setState(JSON.parse(event.target.result));
			setUiState();
			setGraphStates();
			var fileInput = document.getElementById('invisible_vpa_file_dialog');
			var fullPath = fileInput.value;
			if (fullPath) {
				var startIndex = fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/');
				stateFileName = fullPath.substring(startIndex);
				if (stateFileName.indexOf('\\') === 0 || stateFileName.indexOf('/') === 0) {
					stateFileName = stateFileName.substring(1);
				}
				document.title = stateFileName + ' - ' + SOFTWARE.name;
			}
		};
		reader.readAsText(event.target.files[0]);
	};

	this.save = function(filename) {
		var vpa = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state));
		var link = document.getElementById('invisible_link');
		link.download = filename;
		link.href = 'data:' + vpa;
		link.click();
	};

	this.saveAs = function() {
		var filename = stateFileName ? stateFileName : 'perspective.vpa';
		$('#save_to_disk_dialog').html('<div style="font-family: Arial; line-height: 30px; font-size: 90%;">Save current perspective as:<br><input type="text" id="save_filename" style="width: 260px;" value="' + filename + '">');
		$('#save_to_disk_dialog').dialog({
			resizable : false,
			modal : true,
			title : "Save",
			height : 200,
			width : 300,
			position : {
				my : 'center center',
				at : 'center center',
				of : window
			},
			buttons : {
				'OK' : function() {
					$(this).dialog('close');
					var filename = document.getElementById('save_filename').value;
					that.save(filename);
				},
				'Cancel' : function() {
					$(this).dialog('close');
				}
			}
		});
	};

}