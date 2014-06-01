/*******************************************************************************
                             Gentle Anchors v1.2.1
********************************************************************************
* Author: Kendall Conrad of Angelwatt.com
* Home Page: http://www.angelwatt.com/coding/gentle_anchors.php
* Created: 2008-06-25
* Updated: 2010-12-04
* Description: Gentle Anchors is a page scrolling script for anchor and area tags on a page.
* License:
	This work is licensed under a Creative Commons Attribution-Share Alike
	3.0 United States License
	http://creativecommons.org/licenses/by-sa/3.0/us/
*******************************************************************************/
Gentle_Anchors = function() {
	//#### Script preferences ####
	// Recommended Speed Range: 4 to 40 (fast to slow) default value 12
	var scrollSpeed  = 12;     // Controls speed of scroll:
	var shine        = true;   // Whether to use shine effect
	var shineColor   = '#dd9'; // Background color for shine
	var shineOutline = '#5f5'; // Outline color for shine; transparent for off
	//#### End script preferences ####
	var timer;      // Timer item
	var elt = null; // the current clicked on element

	// Initialization, grabbing all anchors and adding onclick event
	Init = function() {
		var a = document.getElementsByTagName('a'); // got catch'em all!
		var area = document.getElementsByTagName('area');
		var links = new Array();
		// combine NodeLists together
		for (var x=0, y=a.length; x < y; links.push(a[x]), x++);
		for (var x=0, y=area.length; x < y; links.push(area[x]), x++);
		for (var x=0, l=links.length; x < l; x++) {
			if (links[x].href.match(/#[a-zA-Z0-9:\._-]+/)) {
				links[x].onclick = function(e) {
					Setup(this.href);
					return false;
				};
			}
		}
	};
	// Set things up for the scrolling effect
	Setup = function(href) {
		var doc = document;
		if (!href.match(/#([^\?]+)/)) {
			return;
		}
		var hash = href.match(/#([^\?]+)/)[1]; // get id, but not any query string
		// identify destination element
		if (doc.getElementById(hash)) {
			elt=doc.getElementById(hash);
		}
		else { return true; }
		// Find scroll position to destination
		var dest = elt.offsetTop;
		for (var node=elt;
			node.offsetParent && node.offsetParent != doc.body;
			node = node.offsetParent,
			dest += node.offsetTop);
		// fix for stupid IE
		if (navigator.appName.indexOf("Microsoft") != -1
				&& parseFloat(navigator.appVersion.split("MSIE")[1]) < 8.0) {
			dest = elt.offsetTop;
		}
		clearTimeout(timer);
		var start = window.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
		// fix for back button
		location.hash = hash;     // jump to destination
		window.scrollTo(0, start); // then quickly jump back to scroll the distance
		var speed = parseInt(Math.abs(start-dest) / scrollSpeed);
		Scroll(speed, (dest-10));   // minus 10 for padding
	};
	Scroll = function(step, desty) {
		var doc = document;
		was = window.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
		// find out how much to scroll by up/down
		var amt = (was < desty) ? was + step : was - step;
		// Make sure we didn't go past
		if (Math.abs(was-desty) < step) {
			amt = desty;
		}
		window.scrollTo(0, amt);
		now = window.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
		// slow scroll down as approach
		var diff = Math.abs(now-desty);
		if (diff < 1) { step = 1; }
		else if (diff < step*2) { step *= .6; }
		else if (diff < step*6) { step *= .9; }
		// if we're at the right scroll position
		if (was == now) {
			window.scrollTo(0, desty);
			clearTimeout(timer); // clear interval
			if (shine) {
				setTimeout(function(){ ShineOn(); }, 400);
			}
			return;
		}
		timer = setTimeout(function() {
			Scroll(step, desty);
		}, 30);
	};
	ShineOn = function() {
		var c = elt.style.backgroundColor;
		var o = elt.style.outline;
		elt.style.backgroundColor = shineColor;
		elt.style.outline = '1px solid '+shineOutline;
		setTimeout( function() { ShineOff(c,o); }, 1000 );
	};
	ShineOff = function(oldColor, oldOutline) {
		elt.style.backgroundColor = oldColor;
		elt.style.outline = oldOutline;
	};
	// Classic append for onload event to avoid overriding
	function appendOnLoad(fx) {
		try { // For browsers that know DOMContentLoaded (FF, Safari, Opera)
			document.addEventListener('DOMContentLoaded', fx, false);
		} catch(e) { // for IE and older browser
			try {
				document.addEventListener('load', fx, false);
			}
			catch(ee) {
				window.attachEvent('onload', fx);
			}
		}
	}
	appendOnLoad(Init);
	return {
		Setup:Setup
	};
}();
