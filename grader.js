#!/usr/bin/env node

var fs = require('fs'),
	program = require('commander'),
	cheerio = require('cheerio'),
	rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist.Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var checkHtmlFromURL = function(url, checksfile) {
	$ = rest.get( url ).on('complete', function(result) {
  		return cheerio.load( result );
	});
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};


var clone = function(fn) {
	// workaround for commander.js issue
	// http://stackoverflow/a/6772648
	return fn.bind({});
};

if(require.main == module) {
	program
        	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <page_url>', 'URL to file')
        	.parse(process.argv);

	var checkJson = "";

	if(program.file){
		checkJson = checkHtmlFile(program.file, program.checks);
	} else if(program.url){
		checkJson = checkHtmlFromURL(program.url, program.checks);
	}

	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
} else {
	exports.checkHtmlFile = checkHtmlFile;
	exports.checkHtmlFromURL = checkHtmlFromURL;
}
