/*******************************************************************************
                             Gentle Anchors v1.2.4
********************************************************************************
* Author: Kendall Conrad of Angelwatt.com
* Home Page: http://www.angelwatt.com/coding/gentle_anchors.php
* Created: 2008-06-25
* Updated: 2013-04-18
* Description: Gentle Anchors is a page scrolling script for anchor and area tags on a page.
* License:
	This work is licensed under a Creative Commons Attribution-Share Alike
	3.0 United States License
	http://creativecommons.org/licenses/by-sa/3.0/us/
*******************************************************************************/
(function(scope) {
'use strict';

scope.Gentle_Anchors = function() {
	//#### Script preferences ####
	// Recommended Speed Range: 4 to 40 (fast to slow) default value 12
	var scrollSpeed  = 12,     // Controls speed of scroll:
		shine        = true,   // Whether to use shine effect
		shineColor   = '#dd9', // Background color for shine
		shineOutline = '#5f5', // Outline color for shine; transparent for off
	//#### End script preferences ####
		timer,      // Timer item
		elt = null, // the current clicked on element
		// Get the current URL page
		curPage = location.href.split('?')[0].split('#')[0],
		anchorOnPage = new RegExp("^" + curPage + "#[a-zA-Z0-9:\._-]+");
	
	var sinX = 0;
	/**
	 * Setup href from link.
	 */
	var fxLinkClick = function(e) {
		e = e || window.event;
		var href = e.target ? e.target.href : e.srcElement.href;
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.returnValue = false; // for IE
		return Setup(href);
		//return false;
	};

	// Initialization, grabbing all anchors and adding onclick event
	var Init = function() {
		var a = document.getElementsByTagName('a'),
			area = document.getElementsByTagName('area'),
			links = new Array(),
			x = 0, y = 0;
		// combine NodeLists together
		for (x = 0, y = a.length; x < y; links.push(a[x++]));
		for (x = 0, y = area.length; x < y; links.push(area[x++]));
		for (x = 0, y = links.length; x < y; x++) {
			// If the link is on the current page and has an anchor
			if (anchorOnPage.test(links[x].href)) {
				if (window.addEventListener) {
					links[x].addEventListener('click', fxLinkClick, true);
				}
				else if (window.attachEvent) {
					links[x].attachEvent('onclick', fxLinkClick);
				}
				else {
					links[x]['onclick'] = fxLinkClick;
				}
			}
		}
	};

	/**
	 * Set things up for the scrolling effect
	 */
	var Setup = function(href) {
		var doc = document;
		if (!href.match(/#([^\?]+)/)) {
			return true;
		}
		var hash = href.match(/#([^\?]+)/)[1]; // get id, but not any query string
		// identify destination element
		if (doc.getElementById(hash)) {
			elt = doc.getElementById(hash);
		}
		else {
			return true;
		}
		// Find scroll position to destination
		clearTimeout(timer);
		var start = getPageY();
		console.log('Start y = ' + start);
		// fix for back button
		location.hash = hash;     // jump to destination
		// Testing
		//var dest = elt.offsetTop;
		var dest = getPageY();
		dy = dest;
		yRatio = (1 * Math.PI) / dy;
		
		window.scrollTo(0, start); // then quickly jump back to scroll the distance
		var speed = parseInt(Math.abs(start-dest) / scrollSpeed);
		//Scroll(speed, (dest-10));   // minus 10 for padding
		sinX =  //Math.PI * 1.5 * Math.abs(start-dest);
		iters=0;
		pageX = start;
		speed = stepSize;
		startTime = (new Date()).getTime() / 1000;

		console.log('[start] ' + dest + ' / ' + yRatio + ' / ' + tRatio);

		Scroll2(0, dest);
		return false;
	};
	var radToDeg = function(rad) {
		return rad * 180 / Math.PI;
	};
	var degToRad = function(deg) {
		return deg * Math.PI / 180;
	};
	var iters = 0;
	var pageX = 0;
	var stepSize = (Math.PI * 1.5) / (degToRad(5));
	stepSize = degToRad(2);
	var startTime;
	var endTime;
	var tTotal = 1;
	var fps = 1000/100;
	var tRatio = (1 * Math.PI) / fps;
	var freq = 1; //seconds / .75;
	var amp = 50;
	var dy;
	var yRatio;
	//console.log('stepSize=' + stepSize);


	/**
	 * X distance = 1.5 * pi = xd // totalX = total * xd;
	 * x from 0 to pi
	 * amp*sin(time/period)
	 * y(time)= A*time * sin(2pi * freq * time + phase)
	 *
	 * y/A = sin(wt) // wt = asin(y/A) //  -- wt=angle
	 */
	var Scroll2 = function(step, desty) {
		// amount to move
		var amt = 50 * stepSize;
		var pageY = 0;
		var time = ((new Date()).getTime() / 1000) - startTime;
		
		//pageY = (Math.sin(step)+1) * amt;
		//pageY = amp * time * (Math.sin(freq * time * 2 * Math.PI) + 1);
		var sinY = Math.sin(tTotal * time);
		pageY = sinY / yRatio / tRatio;

		console.log('A:' + iters + ' / ' + pageY + ' / ' + sinY + ' / ' + time);

		window.scrollTo(0, pageY);
		//pageX += pageY;

		if (getPageY() >= desty || ++iters >= 120) {
			endTime = (new Date()).getTime() / 1000;
			console.log('Done: ' + (endTime - startTime));
			clearTimeout(timer); // clear interval
			if (shine) {
				setTimeout(function(){
					ShineOn();
				}, 400);
			}
			return;
		}
		step += stepSize;

		timer = setTimeout(function() {
			Scroll2(step, desty);
		}, 30);
	};

	/**
	 * Handles the scroll effect.
	 * Curve: sin(x)+1
	 * y = speed, x = distance
	 */
	var Scroll = function(step, desty) {
		var doc = document,
			was = getPageY(),
			// find out how much to scroll by up/down
			amt = (was < desty) ? was + step : was - step;
		
		// Make sure we didn't go past
		if (Math.abs(was-desty) < step) {
			amt = desty;
		}
		window.scrollTo(0, amt);
		var now = getPageY(),
			// slow scroll down as approach
			diff = Math.abs(now-desty);
		// Less than one doesn't add well
		if (diff < 1) {
			step = 1;
		}
		else if (diff < step * 2) {
			step *= .6;
		}
		else if (diff < step * 6) {
			step *= .9;
		}
		console.log('was/now/diff = ' + was + ' / ' + now + ' / ' + diff);
		// if we're at the right scroll position
		if (was == now) {
			window.scrollTo(0, desty);
			clearTimeout(timer); // clear interval
			if (shine) {
				setTimeout(function(){
					ShineOn();
				}, 400);
			}
			return;
		}
		timer = setTimeout(function() {
			Scroll(step, desty);
		}, 30);
	};

	/**
	 * Returns the current offset from the top of the page.
	 */
	var getPageY = function() {
		var doc = document;
		return window.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
	};

	/**
	 * Highlght the target.
	 */
	var ShineOn = function() {
		var c = elt.style.backgroundColor,
			o = elt.style.outline;
		elt.style.backgroundColor = shineColor;
		elt.style.outline = '1px solid ' + shineOutline;
		setTimeout(function() {
			ShineOff(c, o);
		}, 1000 );
	};

	/**
	 * Removes the shine effect.
	 */
	var ShineOff = function(oldColor, oldOutline) {
		elt.style.backgroundColor = oldColor;
		elt.style.outline = oldOutline;
	};

	// Classic append for onload event to avoid overriding
	function appendOnLoad(fx) {
		try { // For browsers that know DOMContentLoaded (FF, Safari, Opera)
			document.addEventListener('DOMContentLoaded', fx, false);
		}
		catch(e) { // for IE and older browser
			try {
				document.addEventListener('load', fx, false);
			}
			catch(ee) {
				window.attachEvent('onload', fx);
			}
		}
	}
	appendOnLoad(Init);
	// Return public methods
	return {
		Setup:Setup
	};
}();

})(window);

