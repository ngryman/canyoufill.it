'use strict';

(function() {

	var utils = require('./utils');

	var TILES_COUNT = 16;
	var COLORS = [
		'90dff8', 'f8c82d', 'fbcf61', 'ff6f6f', 'e3a712',
		'e5ba5a', 'd1404a', '0dccc0', 'a8d164', '3498db',
		'0ead9a', '27ae60', '2980b9', 'd49e99', 'b23f73',
		'48647c', '74525f', '832d51', '2c3e50', 'e84b3a',
		'fe7c60', 'ecf0f1', 'c0392b', '404148', 'bdc3c7'
	];
	/// XXX
	var IMAGES = {
		h: [ 'porsche.png', 'titanic.png', 'porsche.png', 'titanic.png' ],
		v: [ 'empire-state-building.png', 'tour-eiffel.png', 'empire-state-building.png', 'tour-eiffel.png' ]
	};

	var el;
	var tilesEl;
	var width = 0, height = 0;
	var tiles = [];
	var sheet;

	function init() {
		initAttributes();
		initLayout();
		initDom();
		resize();
	}

	function initAttributes() {
		var cellsCount = TILES_COUNT / 2 * 3;
		var factors = trialDivision(cellsCount);

		for (var i = 0, j = factors.length - 1; i < j; i += 2, j -= 2) {
			width += factors[i] * factors[i + 1];
			if (i + 1 == j - 1) {
				height += factors[j];
				break;
			}
			height += factors[j] * factors[j - 1];
		}

		if (width < height)
			width = [height, height = width][0];
	}

	function initLayout() {
		var w = width;
		var h = height;
		var left = TILES_COUNT / 2;
		var m = new Array(w * h);
		var o = true;

		// random position rectangles
		do {
			var x = utils.random() * w | 0;
			var y = utils.random() * h | 0;
			var s = y * w;

			if (0 == x && 0 == y) continue;
			if (m[x + s]) continue;
			if (x + o == w || y + !o == h) continue;
			if (m[x + o + s + w * !o]) continue;

			m[x + s] = true;
			m[x + o + s + w * !o] = true;
			tiles.push({ x: x, y: y, orientation: o });

			left--;
			o = !o;
		} while (left > 0);

		// then fill with squares
		for (var i = 0; i < m.length; i++) {
			if (m[i]) continue;
			tiles.push({ x: i % w, y: i / w | 0 });
		}
	}

	function initDom() {
		var fragEl = document.createDocumentFragment();

		el = document.querySelector('.choices');

		tilesEl = tiles.map(function(tile) {
			var isRect = (null != tile.orientation);

			var el = tile.el = document.createElement('div');
			el.classList.add(
				'choice',
				isRect ? (tile.orientation ? 'h' : 'v') + '-rectangle' : 'square',
				'col-' + (tile.x + 1),
				'row-' + (tile.y + 1)
			);
			el.style.backgroundColor = '#' + COLORS[utils.random() * COLORS.length | 0];

			// XXX
			if (isRect) {
				var url = IMAGES[tile.orientation ? 'h' : 'v'].shift();
				el.style.backgroundImage = 'url(images/' + url + ')';
			}

            fragEl.appendChild(el);
			return el;
        });

		el.appendChild(fragEl);
	}

	function resize() {
		var style = getComputedStyle(el, null);
		var w = Math.round(parseInt(style.getPropertyValue('width')) / width);
		var h = Math.round(parseInt(style.getPropertyValue('height')) / height);
		var i;

		if (!sheet) sheet = utils.createSheet();

		// flush old rules
		while (sheet.cssRules.length > 0) sheet.deleteRule(0);

		sheet.insertRule('.choice.square { width: ' + w + 'px; height: ' + h + 'px; }', 0);
		sheet.insertRule('.choice.h-rectangle { width: ' + (w * 2) + 'px; height: ' + h + 'px; }', 0);
		sheet.insertRule('.choice.v-rectangle { width: ' + w + 'px; height: ' + (h * 2) + 'px; }', 0);

		for (i = 0; i < width; i++)
			sheet.insertRule('.choice.col-' + (i + 1) + '{ left: ' + (w * i) + 'px }', 0);
		for (i = 0; i < height; i++)
			sheet.insertRule('.choice.row-' + (i + 1) + '{ top: ' + (h * i) + 'px }', 0);
	}

	function trialDivision(n) {
		var primes = [2, 3, 5, 7, 11, 13, 17];
		var primeFactors = [];

		for (var i = 0; i < primes.length; i++) {
			var p = primes[i];
			if (p * p > n) break;
			while (0 === n % p) {
				primeFactors.push(p);
				n /= p;
			}
		}
		if (n > 1) primeFactors.push(n);

		return primeFactors;
	}

	init();

	var timeout;
	window.addEventListener('resize', function() {
		cancelAnimationFrame(timeout);
		timeout = requestAnimationFrame(resize);
	});

})();


(function(window) {

	var lastTime = 0,
		vendors = ['webkit', 'moz'],
		requestAnimationFrame = window.requestAnimationFrame,
		cancelAnimationFrame = window.cancelAnimationFrame,
		i = vendors.length;

	// try to un-prefix existing raf
	while (--i >= 0 && !requestAnimationFrame) {
		requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
		cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'];
	}

	// polyfill with setTimeout fallback
	// heavily inspired from @darius gist mod: https://gist.github.com/paulirish/1579671#comment-837945
	if (!requestAnimationFrame || !cancelAnimationFrame) {
		requestAnimationFrame = function(callback) {
			var now = +new Date(), nextTime = Math.max(lastTime + 16, now);
			return setTimeout(function() {
				callback(lastTime = nextTime);
			}, nextTime - now);
		};

		cancelAnimationFrame = clearTimeout;
	}

	// export to window
	window.requestAnimationFrame = requestAnimationFrame;
	window.cancelAnimationFrame = cancelAnimationFrame;

}(window));