'use strict';

var utils = require('./utils');

(function() {

	var TILES_COUNT = 16;
	var COLORS = [
		'90dff8', 'f8c82d', 'fbcf61', 'ff6f6f', 'e3a712',
		'e5ba5a', 'd1404a', '0dccc0', 'a8d164', '3498db',
		'0ead9a', '27ae60', '2980b9', 'd49e99', 'b23f73',
		'48647c', '74525f', '832d51', '2c3e50', 'e84b3a',
		'fe7c60', 'ecf0f1', 'c0392b', '404148', 'bdc3c7'
	];

	var el;
	var tilesEl;
	var width = 0, height = 0;
	var tiles = [];

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

		// random position rectangles
		do {
			var x = utils.random() * w | 0;
			var y = utils.random() * h | 0;
			var s = y * w;
			var o = utils.random() < .5;

			if (m[x + s]) continue;
			if (x + !!o == w || y + !o == h) continue;
			if (m[x + !!o + s + w * !o]) continue;

			m[x + s] = true;
			m[x + !!o + s + w * !o] = true;
			tiles.push({ x: x, y: y, orientation: o });
			left--;
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

		/// XXX
		var images = ['empire-state-building.png', 'porsche.png', 'titanic.png', 'tour-eiffel.png'];

		tilesEl = tiles.map(function(tile) {
			var el = tile.el = document.createElement('div');
			el.classList.add(
				'choice',
				null != tile.orientation ? (tile.orientation ? 'h' : 'v') + '-rectangle' : 'square'
			);
			el.style.backgroundColor = '#' + COLORS[utils.random() * COLORS.length | 0];

			if (images.length > 0) {
				var image = images.shift();
				el.style.backgroundImage = 'url(images/' + image + ')';
			}

			fragEl.appendChild(el);
		});

		el.appendChild(fragEl);
	}

	function resize() {
		var w = window.innerWidth / width;
		var h = window.innerHeight / height;

		tiles.forEach(function(tile) {
			var el = tile.el;
			el.style.width = Math.ceil(w + (null != tile.orientation ? (tile.orientation ? w : 0) : 0)) + 'px';
			el.style.height = Math.ceil(h + (null != tile.orientation ? (tile.orientation ? 0 : h) : 0)) + 'px';
			el.style.transform = 'translate(' + (tile.x * w) + 'px, ' + (tile.y * h) + 'px)';
		});
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

//	buildGrid(TILES_COUNT);
//
//	function buildGrid(tilesCount) {
//		var attributes = gridAttributes(tilesCount);
//		var layout = gridLayout(attributes);
//		var gridEl = document.createDocumentFragment();
//		var width = window.innerWidth / layout.width;
//		var height = window.innerHeight / layout.height;
//
//		layout.tiles.forEach(function(tile) {
//			var el = document.createElement('div');
//			el.classList.add(
//				'choice',
//				null != tile.orientation ? (tile.orientation ? 'h' : 'v') + '-rectangle' : 'square'
//			);
//			el.style.width = Math.ceil(width + (null != tile.orientation ? (tile.orientation ? width : 0) : 0)) + 'px';
//			el.style.height = Math.ceil(height + (null != tile.orientation ? (tile.orientation ? 0 : height) : 0)) + 'px';
//			el.style.transform = 'translate(' + (tile.x * width) + 'px, ' + (tile.y * height) + 'px)';
//			el.style.background = COLORS[Math.random() * COLORS.length | 0];
//			gridEl.appendChild(el);
//		});
//
//		var sectionEl = document.querySelector('.choices');
//		sectionEl.appendChild(gridEl);
//	}
//
//	function gridLayout(attributes) {
//		var w = attributes.width;
//		var h = attributes.height;
//		var left = attributes.rectangles;
//		var m = new Array(w * h);
//		var tiles = [];
//
//		// random position rectangles
//		do {
//			var x = Math.random() * w | 0;
//			var y = Math.random() * h | 0;
//			var s = y * w;
//			var o = Math.random() < .5;
//
//			if (m[x + s]) continue;
//			if (x + !!o == w || y + !o == h) continue;
//			if (m[x + !!o + s + w * !o]) continue;
//
//			m[x + s] = true;
//			m[x + !!o + s + w * !o] = true;
//			tiles.push({ x: x, y: y, orientation: o });
//			left--;
//		} while (left > 0);
//
//		// then fill with squares
//		for (var i = 0; i < m.length; i++) {
//			if (m[i]) continue;
//			tiles.push({ x: i % w, y: i / w | 0 });
//		}
//
//		return {
//			tiles: tiles,
//			width: w,
//			height: h
//		};
//	}
//
//	function gridAttributes(tilesCount) {
//		var cellsCount = tilesCount / 2 * 3;
//		var factors = trialDivision(cellsCount);
//		var width = 0, height = 0;
//
//		for (var i = 0, j = factors.length - 1; i < j; i += 2, j -= 2) {
//			width += factors[i] * factors[i + 1];
//			if (i + 1 == j - 1) {
//				height += factors[j];
//				break;
//			}
//			height += factors[j] * factors[j - 1];
//		}
//
//		if (width < height)
//			width = [height, height = width][0];
//
//		return {
//			width: width,
//			height: height,
//			squares: tilesCount / 2,
//			rectangles: tilesCount / 2
//		};
//	}
//
//	function trialDivision(n) {
//		var primes = [2, 3, 5, 7, 11, 13, 17];
//		var primeFactors = [];
//
//		for (var i = 0; i < primes.length; i++) {
//			var p = primes[i];
//			if (p * p > n) break;
//			while (0 === n % p) {
//				primeFactors.push(p);
//				n /= p;
//			}
//		}
//		if (n > 1) primeFactors.push(n);
//
//		return primeFactors;
//	}

})();