/*====================================================================
Author: Glen Johnson
Email: plasticarm@gmail.com
Website: plasticarm.com / hrpictures.com
----------------------------------------------------------
Summary:



====================================================================*/

// ============================================================================
// Installation:
// 1. Place script in 'C:\Program Files\Adobe\Adobe Photoshop CS#\Presets\Scripts\'
// 2. Restart Photoshop
// 3. Choose File > Scripts > EmojiProcessing
// ============================================================================

#target photoshop

// bring application forward for double-click events
app.bringToFront();

///////////////////////////////////////////////////////////////////////////////
// main - main function
///////////////////////////////////////////////////////////////////////////////
function main() {
	// user-customizable variables
	var prefs = new Object();	
		
	//_________________________________________
	// Default Settings
	
	//prefs.srcFolder = new Folder('~');
	// Set these folders for convience
	prefs.srcFolder = new Folder('C:/Users/Glen/Documents/maya/projects/Assets/images/Wikiwoods/MonsterParade/TestTile');
	
	//prefs.weatheringFolder = new Folder('C:/Users/Glen/Documents/Projects/DeepLocal/OldNavy/Emoji/Process/EmojisA/WeatheringTextures');	// save folder (default: '~')
	prefs.saveFolder = new Folder('~');
	//prefs.saveFolder = new Folder('C:/Users/Glen/Documents/Projects/DeepLocal/OldNavy/Emoji/Process/EmojisA/Output');	// save folder (default: '~')

	// These are the various sizes to output.
	prefs.rows = 10;
	prefs.columns = 10;
	prefs.offsetX = 0;
	prefs.offsetY = 0;


	var browseFolder = prefs.saveFolder; // initial browse folder (default: saveFolder)

	// declare local variables
	prefs.fileArray = new Array();
	prefs.count = 0;

	// if the user-customized save folder doesn't exist, use the 'home' folder
	if (!prefs.srcFolder.exists) {
		prefs.srcFolder = Folder('~');
		browseFolder = prefs.srcFolder;
	}

	// begin dialog layout
	var dlg = new Window('dialog');
	dlg.text = 'Random Actions';
	dlg.alignChildren = 'fill';

	//_________________________________________
	// Source Directory
	var sourceOptions = dlg.add('panel');
	sourceOptions.orientation = 'column';
	sourceOptions.text = 'Source Directory';
	sourceOptions.alignChildren = 'fill';
	sourceOptions.margins = 15;

	var sourceLocation = sourceOptions.add('group');
	sourceLocation.orientation = 'row';
	sourceLocation.alignChildren = 'center';

	var st = sourceLocation.add('statictext');

	st.text = 'Source Location:';
	st.helpTip = 'Specifies the source location of images';

	var sl = sourceLocation.add('edittext');
	sl.text = prefs.srcFolder.fsName;
	//sl.characters = 35; // not supported in CS2
	sl.size = [250, sl.preferredSize.height];
	
	var sourceBrowseBtn = sourceLocation.add('button');
	sourceBrowseBtn.text = 'Browse';
	sourceBrowseBtn.helpTip = 'Choose a source location for images';
	sourceBrowseBtn.properties = {name: 'browse'};

	// define browse button behaviour
	sourceBrowseBtn.onClick = function() {
		prefs.srcPath = Folder.selectDialog('Please select a source location:', browseFolder);
		if (prefs.srcPath != null) { // use the browse path if the OK button is pressed
			prefs.srcFolder = prefs.srcPath;
			sl.text = prefs.srcFolder.fsName;
			checkValues();
		}
	};
	
			
	/*
	// Sizes
		var sizeCheck = dlg.add('group');
			sizeCheck.orientation = 'row';

			// label
			sizeCheck.label = sizeCheck.add('edittext');
			//sizeCheck.label.justify = 'right';
			sizeCheck.label.text = 10000;
			
		
		for (var si = 1; si <= (prefs.sizeArray.length); si++) {
			var sizeIcon = dlg.add('group');
			sizeIcon.orientation = 'row';

			// label
			sizeIcon.label = sizeIcon.add('statictext');
			sizeIcon.label.justify = 'right';
			sizeIcon.label.text = ('&Size ' + si + ':');
			//sizeIcon.label.preferredSize.width = source.label.preferredSize.width;

			// document sizeIcon field
			sizeIcon.field = sizeIcon.add('edittext');
			sizeIcon.field.characters = 5;
			//sizeIcon.field.text = (50 * si);
			sizeIcon.field.text = prefs.sizeArray[(si - 1)];
			sizeIcon.field.active = true;
			sizeIcon.field.addEventListener('keydown', NumericEditKeyboardHandler);
			
			
			sizeIcon.field.onChange = function() {
					
					prefs.sizeArray[(si - 1)] = sizeIcon.label.text;
					sizeCheck.label.text = prefs.sizeArray[(si - 1)];
					
			}
				
			
		}
		*/

		
		//_________________________________________
		// Size Options
		var sizeOptions = dlg.add('panel');
			sizeOptions.orientation = 'column';
			sizeOptions.text = 'Tiles';
			sizeOptions.alignChildren = 'fill';
			sizeOptions.margins = 15;
			
		//_________________________________________
		// Rows
		var rowsSetGroup = sizeOptions.add('group');
		rowsSetGroup.orientation = 'row';
		rowsSetGroup.alignChildren = 'center';

		var rsgt = rowsSetGroup.add('statictext');
		rsgt.text = 'Rows :';
		rsgt.helpTip = 'Number Of Images To Put In Each Row';

		var rset = rowsSetGroup.add('edittext');
		rset.text = '10';
		rset.size = [250, rset.preferredSize.height];
		prefs.rows = rset.text;	
		
		rset.onChange = function() {
			prefs.rows = rset.text;		
		};
			
		//_________________________________________
		// Columns
		var colSetGroup = sizeOptions.add('group');
		colSetGroup.orientation = 'row';
		colSetGroup.alignChildren = 'center';

		var csgt = colSetGroup.add('statictext');
		csgt.text = 'Columns :';
		csgt.helpTip = 'Number Of Images To Put In Each Column';

		var cset = colSetGroup.add('edittext');
		cset.text = '10';
		cset.size = [250, cset.preferredSize.height];
		prefs.columns = cset.text;	
		
		cset.onChange = function() {
			prefs.columns = cset.text;		
		};
		
		//_________________________________________
		// Offset X
		var offXSetGroup = sizeOptions.add('group');
		offXSetGroup.orientation = 'row';
		offXSetGroup.alignChildren = 'center';

		var oxsgt = offXSetGroup.add('statictext');
		oxsgt.text = 'Offset X :';
		oxsgt.helpTip = 'Offset Each Image In X';

		var oxset = colSetGroup.add('edittext');
		oxset.text = '10';
		oxset.size = [250, oxset.preferredSize.height];
		prefs.offsetX = oxset.text;	
		
		oxset.onChange = function() {
			prefs.offsetX = oxset.text;		
		};
		
		//_________________________________________
		// Offset Y
		var offYSetGroup = sizeOptions.add('group');
		offYSetGroup.orientation = 'row';
		offYSetGroup.alignChildren = 'center';

		var oysgt = offXSetGroup.add('statictext');
		oysgt.text = 'Offset Y :';
		oysgt.helpTip = 'Offset Each Image In Y';

		var oyset = colSetGroup.add('edittext');
		oyset.text = '10';
		oyset.size = [250, oyset.preferredSize.height];
		prefs.offsetY = oyset.text;	
		
		oyset.onChange = function() {
			prefs.offsetY = oyset.text;		
		};
		
		//_________________________________________
		// Save Options
		
		var saveOptions = dlg.add('panel');
		saveOptions.orientation = 'column';
		saveOptions.text = 'Output Directory';
		saveOptions.alignChildren = 'fill';
		saveOptions.margins = 15;

		var saveLocation = saveOptions.add('group');
		saveLocation.orientation = 'row';
		saveLocation.alignChildren = 'center';

			var st = saveLocation.add('statictext');
			//st.text = '&Save Location:'; // accelerators don't work inside groups in CS2
			st.text = 'Save Location:';
			st.helpTip = 'Specifies the save location for the processed images';

			var et = saveLocation.add('edittext');
			et.text = prefs.saveFolder.fsName;
			//et.characters = 35; // not supported in CS2
			et.size = [250, et.preferredSize.height];

			// verify that the save path exists whenever the value changes
			et.onChange = function() {
				if (!checkSaveFolder()) {
					alert('Please enter a valid location or use the Browse button to select a folder.', 'Invalid Save Location', true);
					okBtn.enabled = false;
				}
				else if (checkValues()) {
					okBtn.enabled = true;
				}
			};

			var browseBtn = saveLocation.add('button');
			browseBtn.text = 'Browse';
			browseBtn.helpTip = 'Choose a save location for the processed emoji images';
			browseBtn.properties = {name: 'browse'};

			// define browse button behaviour
			browseBtn.onClick = function() {
				prefs.savePath = Folder.selectDialog('Please select a save location:', browseFolder);
				if (prefs.savePath != null) { // use the browse path if the OK button is pressed
					prefs.saveFolder = prefs.savePath;
					et.text = prefs.saveFolder.fsName;
					checkValues();
				}
			};


		
		var buttons = dlg.add('group');
		buttons.orientation = 'row';
		buttons.alignment = 'right';

		var okBtn = buttons.add('button');
		okBtn.text = 'OK';
		okBtn.properties = {name: 'ok'};
		okBtn.enabled = false;

		var cancelBtn = buttons.add('button');
		cancelBtn.text = 'Cancel';
		cancelBtn.properties = {name: 'cancel'};

		/*
		var sizeLength = dlg.add('statictext');
		sizeLength.text = (prefs.sizeArray.length);	
		*/
		
	// end dialog layout

	// verify the dialog values and then display the dialog
	checkValues();
	dlg.center(); // center dialog
	dlg.result = dlg.show();

	///////////////////////////////////////////////////////////////////////////////
	// checkValues - check dialog values and enabled the OK button
	///////////////////////////////////////////////////////////////////////////////
	function checkValues() {
		okBtn.enabled = (checkVariations() && checkSaveFolder());
	}

	///////////////////////////////////////////////////////////////////////////////
	// checkVariations - check variation checkboxes
	///////////////////////////////////////////////////////////////////////////////
	function checkVariations() {
	
		return true;
	}

	///////////////////////////////////////////////////////////////////////////////
	// checkSaveFolder - check save location
	///////////////////////////////////////////////////////////////////////////////
	function checkSaveFolder() {
		if (Folder(et.text).exists) {
			return true;
		}
	}

	// execute relevant variation functions when the OK button is pressed (OK = 1, Cancel = 2)
	if (dlg.result == 1) {
	
		tileImagesInDirectory(prefs);
		
	}


}

///////////////////////////////////////////////////////////////////////////////
// emojiProcessing
///////////////////////////////////////////////////////////////////////////////
function tileImagesInDirectory(prefs) {

	var acti = prefs.actionCount;
	
	// Get Files For Processing
	var sourceFolder = prefs.srcFolder.absoluteURI;
	var inputFiles = Folder (sourceFolder).getFiles ();

	// Format the save directory
	var saveFolderString = prefs.saveFolder.absoluteURI;
	if (!/\/$/.test(saveFolderString)) {
		saveFolderString += '/';
	}

	var duplicate = inputFiles[0].duplicate();
	//duplicate.flatten();
	
	var docWidth = duplicate.width.value;
	var docHeight = duplicate.height.value;
	
	var xPos = docWidth + prefs.offsetX;
	var yPos = docHeight + prefs.offsetY;
	var curX = xPos;
	var curY = 0;
	
	var resizeX = columns * xPos;
	var resizeY = (inputFiles.length / columns) * yPos;
	duplicate.resizeCanvas(resizeX,resizeY,TOPLEFT);
	
	var c = 0;
	var r = 0;
	for (var i = 1; i <= (inputFiles.length - 1); i++) {
		// Open the file
		app.open(inputFiles[i]);
		
		var ad = activeDocument;
		//var fileNameBody = ad.name;
		//fileNameBody = fileNameBody.replace(/(?:\.[^.]*$|$)/, '');

		// Make the original document active each step
		app.activeDocument = ad;
		
		
		
		ad.copy(0);
		
		app.activeDocument = duplicate;
				
		//duplicate.resizeCanvas(x,y,MIDDLELEFT);
		
		app.activeDocument.paste(0);
		app.activeDocument.activeLayer.name = "row" + r + "_column" + c;
		app.activeDocument.activeLayer.translate(curX, curY);
		
		/*
		for (var si = 1; si <= acti; si++) {
			
			
			translate(x,y);
			
		}
		*/
		
		
		
		if (c == prefs.columns){
			curY = curY + yPos;
			curX = 0;
			c = 0;
			r++;
		} else {
			curX = curX + xPos;
			c++;
		}
		
		
		
		//ad.saveAs(new File(inputFiles[i]));
		//app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
			
	}
	var message = "Finished Processing " + (inputFiles.length) + " Files";
	
	// ask the user another question
	var answer = confirm(message)
	// open the document accordingly
	if (answer) {
		
	} else {
		
	}
			
}

function wizMessage(message){
	
	// ask the user another question
	var answer = confirm(message)
	// open the document accordingly
	if (answer) {
		
	} else {
		
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: FindAllFiles
// Usage: Find all the files in the given folder recursively
// Input: srcFolder is a string to a folder
//		  destArray is an Array of File objects
// Return: Array of File objects, same as destArray
///////////////////////////////////////////////////////////////////////////////
function FindAllFiles( srcFolderStr, destArray ) {
	var fileFolderArray = Folder( srcFolderStr ).getFiles();

	for ( var i = 0; i < fileFolderArray.length; i++ ) {
		var fileFoldObj = fileFolderArray[i];
		if ( fileFoldObj instanceof File ) {
			destArray.push( fileFoldObj );
		} else { // folder
			FindAllFiles( fileFoldObj.toString(), destArray );
		}
	}

	return destArray;
}


function SaveAsPNG( inFileName ) {
	var pngOptions = new PNGSaveOptions();
	pngOptions.compression = 0;
	pngOptions.interlaced = 0;
	app.activeDocument.saveAs( File( inFileName ), pngOptions );
}

function cTID(s) {return app.charIDToTypeID(s);}

///////////////////////////////////////////////////////////////////////////////
// saveFile - save b&w variations as 'Filename + Suffix.psd'
///////////////////////////////////////////////////////////////////////////////
function saveFile(doc, prefs) {
	// remove file extension
	var fileNameBody = doc.name;
	
	fileNameBody = fileNameBody.replace(/(?:\.[^.]*$|$)/, '');

	// convert saveFolder to string and add a trailing slash (if necessary)
	var saveFolderString = prefs.saveFolder.absoluteURI;
	if (!/\/$/.test(saveFolderString)) {
		saveFolderString += '/';
	}

	// build complete path and add to fileArray
	var saveFile = new File(saveFolderString + fileNameBody + prefs.fileNameSeparator + prefs.fileNameSuffix + '.psd');
	prefs.fileArray.push(saveFile);

	// PSD save options
	var psdSaveOptions = new PhotoshopSaveOptions();
	psdSaveOptions.embedColorProfile = true;
	psdSaveOptions.maximizeCompatibility = true;

	// save and close file
	doc.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);
	doc.close(SaveOptions.DONOTSAVECHANGES);
}

///////////////////////////////////////////////////////////////////////////////
// isCorrectVersion - check for Adobe Photoshop CS2 (v9) or higher
///////////////////////////////////////////////////////////////////////////////
function isCorrectVersion() {
	if (parseInt(version, 10) >= 9) {
		return true;
	}
	else {
		alert('This script requires Adobe Photoshop CS2 or higher.', 'Wrong Version', false);
		return false;
	}
}

///////////////////////////////////////////////////////////////////////////////
// isOpenDocs - ensure at least one document is open
///////////////////////////////////////////////////////////////////////////////
function isOpenDocs() {

	if (documents.length) {
		return true;
	}
	else {
		return true;
		//alert('There are no documents open.', 'No Documents Open', false);
		
		//return false;
	}

}

///////////////////////////////////////////////////////////////////////////////
// showError - display error message if something goes wrong
///////////////////////////////////////////////////////////////////////////////
function showError(err) {
	if (confirm('An unknown error has occurred.\n' +
		'Would you like to see more information?', true, 'Unknown Error')) {
			alert(err + ': on line ' + err.line, 'Script Error', true);
	}
}


// test initial conditions prior to running main function
if (isCorrectVersion() && isOpenDocs()) {
	try {
		main();
	}
	catch(e) {
		// don't report error on user cancel
		if (e.number != 8007) {
			showError(e);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
// Function: NumericEditKeyboardHandler
// Source: Adobe
// Usage: Do not allow anything except for numbers 0-9
// Input: ScriptUI keydown event
// Return: <nothing> key is rejected and beep is sounded if invalid
///////////////////////////////////////////////////////////////////////////////
function NumericEditKeyboardHandler(event) {
	try {
		var keyIsOK = KeyIsNumeric(event) || KeyIsDelete(event) || KeyIsLRArrow(event) || KeyIsTabEnterEscape(event);
		if (!keyIsOK) {
			//	Bad input: tell ScriptUI not to accept the keydown event
			event.preventDefault();
			// Notify user of invalid input:
			// make sure NOT to put up an alert dialog or do anything which requires user interaction,
			// because that interferes with preventing the 'default' action for the keydown event
			app.beep();
		}
	}
	catch(e) {
		// alert('Ack! Bug in NumericEditKeyboardHandler: ' + e);
	}
}

// key identifier functions
function KeyHasModifier(event) {
	return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

function KeyIsNumeric(event) {
	return (event.keyName >= '0') && (event.keyName <= '9') && !KeyHasModifier(event);
}

function KeyIsDelete(event) {
	//	Shift-delete is ok
	return (event.keyName == 'Backspace') && !(event.ctrlKey);
}

function KeyIsLRArrow(event) {
	return ((event.keyName == 'Left') || (event.keyName == 'Right')) && !(event.altKey || event.metaKey);
}

function KeyIsTabEnterEscape(event) {
	return event.keyName == 'Tab' || event.keyName == 'Enter' || event.keyName == 'Escape';
}