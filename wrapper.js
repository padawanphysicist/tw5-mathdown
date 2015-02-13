/*\
title: $:/plugins/padawanphysicist/tw5-mathdown/wrapper.js
type: application/javascript
module-type: parser

Wraps up markdown parser for use in TiddlyWiki5

\*/
(function(){
/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Load main libraries
var Markdown = require("$:/plugins/padawanphysicist/tw5-mathdown/markdown-it.js");
var TeXZilla = require("$:/plugins/padawanphysicist/tw5-mathdown/TeXZilla.js");
var md; // Store markdown parser instance

/** Function count the occurrences of substring in a string;
* @param {String} string   Required. The string;
* @param {String} subString    Required. The string to search for;
* @param {Boolean} allowOverlapping    Optional. Default: false;
*/
function occurrences(string, subString, allowOverlapping){

	string+=""; subString+="";
	if(subString.length<=0) return string.length+1;

	var n=0, pos=0;
	var step=(allowOverlapping)?(1):(subString.length);

	while(true){
		pos=string.indexOf(subString,pos);
		if(pos>=0){ n++; pos+=step; } else break;
	}
	return(n);
}

// Regular expressions contain special (meta) characters, and as such it is dangerous to blindly pass an argument in the find function above without pre-processing it to escape those characters. This is covered in the Mozilla Developer Network's JavaScript Guide on Regular Expressions, where they present the following utility function:
function escapeRegExp(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) {
	return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/*
This function parse the equations, turning them into html tags
*/
//function preParse(text, newMacros) {
function preParse(text) {
	var txt = text;
	//var ncmds = newMacros.length-1;

	if(!!txt) {
		// Parse Internal tiddler links
		var re = /(?:\[(.*?)\]\((.*?)\))/gm;
		txt = txt.replace(re,function(match,text) {
			var linkName = match.match(/(?:\((.*)\))/g);
			linkName = linkName[0].substr(1,(linkName[0].length-2));

      //console.log("parsing link... " + linkName + ", with text " + text);

			return "<a href=\"" + linkName + "\">" + text + "</a>";
		});

    // Parse new TeX commands
		//if (ncmds > 0) {
		//	for(var i=0;i<ncmds;i++){
		//		var cmdArray = newMacros[i].split("\t");
		//		if(cmdArray[1] == 0) { // Check for no-argument command
		//			txt = replaceAll(txt,cmdArray[0],cmdArray[2]);
		//		}
		//		else if(cmdArray[1] == 1){
		//			//console.log("found one argument command " + cmdArray[0])
		//			var cmdStr = cmdArray[0].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		//			var re = new RegExp(cmdStr + '{(.*?)}', 'g');
		//			txt = txt.replace(re,function(match,text) {
		//				return cmdArray[2].replace('#1',text);
		//			});
		//		}
		//	}
		//}

		// Displayed equation using \begin{equation} LaTeX environment \end{equation}
		var re = /([^\\]\\begin\{equation\}(?:\\.|[\s\S])*?\\end\{equation\})/gm;
		txt = txt.replace(re,function(match,text) {
			var tmp = text.replace("\\begin{equation}","").replace("\\end{equation}","").replace(/\r?\n|\r/g,"");
			// Parse label
			var labelRegexp = /(?:\\label\{(.*?)\})/;
			var label = ""
			if(labelRegexp.test(tmp)) {
				var match = labelRegexp.exec(tmp);
				label = match[1];
				tmp = tmp.replace("\\label\{" + label + "\}",""); // Now that we have the label, we can delete from string
				console.log(label);
			}
			var ml = TeXZilla.toMathMLString(tmp,true);
			if(label!=="") { // Additional markup for labeling
				var innerMathRegex = /(?:\<math.*?\>(.*)\<\/math\>)/;
				if(innerMathRegex.test(ml)) {
					var match = innerMathRegex.exec(ml);
					ml = match[1];
				}
				ml = "<div id=\'" + label + "\'><math xmlns=\'http:\/\/www.w3.org/1998/Math/MathML\' display=\'block\'><mtable side=\'right\'><mlabeledtr><mtd>"+ ml + "</mtd></mlabeledtr></mtable></math></div>";
			}
			else {
				ml = "<math xmlns=\'http:\/\/www.w3.org/1998/Math/MathML\' display=\'block\'><mtable side=\'right\'><mlabeledtr><mtd>"+ ml + "</mtd></mlabeledtr></mtable></math>";
			}

			return ml;
		});

		// Displayed (unumbered) equation using \begin{equation*} LaTeX environment \end{equation*}
		var re = /([^\\]\\begin\{equation\*\}(?:\\.|[\s\S])*?\\end\{equation\*\})/gm;
		txt = txt.replace(re,function(match,text) {
			var tmp = text.replace("\\begin{equation*}","").replace("\\end{equation*}","").replace(/\r?\n|\r/g,"");
			var ml = TeXZilla.toMathMLString(tmp,true);

			return ml;
		});

		// Displayed equation using \[ square brackets \]
		var re = /([^\\]\\\[(?:\\.|[\s\S])*?\\\])/gm;
		txt = txt.replace(re,function(match,text) {
			var tmp = text.replace("\\[","").replace("\\]","").replace(/\r?\n|\r/g,"");
			var ml = TeXZilla.toMathMLString(tmp,true);

			return ml;
		});

		// Inline equation using $single dollars$
		var re = /(?:\$)([^\$\s]{0}[^\$]*?[^\$\\\s])(?:\$[^\$]{0})/gm;
		txt = txt.replace(re,function(match,text) {
			var ml = TeXZilla.toMathMLString(text,false);
			return ml;
		});
	}

	return txt;
}

var MarkdownParser = function(type,text,options) {
  var preParsedText,htmlText;
  //var newMacrosTiddlerStr = options.wiki.getTiddlerText(CONFIG_MACRO_TIDDLER,DEFAULT_CMD);

  // To count number of commands
  //var ncmds = occurrences(newMacrosTiddlerStr, "\n");
  //var newMacros = newMacrosTiddlerStr.split("\n");

	md = new Markdown();

  // Set Markdown options here
	md.set({html: true});

	// Parse additional rules before markdown (I hope this is just a
	// workaround while learning how to insert rules properly on
	// remarkable parser)
	//preParsedText = preParse(text, newMacros);
	preParsedText = preParse(text);

	// Parse Markdown
	htmlText = md.render(preParsedText);

	this.tree = [{type: "raw", html: htmlText}];
};

exports["text/x-mathdown"] = MarkdownParser;

})();
