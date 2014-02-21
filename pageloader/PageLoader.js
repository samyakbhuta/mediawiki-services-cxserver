/**
 * Loads html for pages to translate
 *
 * @file
 * @copyright See AUTHORS.txt
 * @license GPL-2.0+
 */

'use strict';

var config;

try {
	// TODO: Have an example configuration file.
	config = require( __dirname + '/../config.js' );
} catch ( e ) {
	// TODO: define this configuration in betterway
	config = {
		pageloaderservice: 'parsoid',
		parsoid: {
			api: 'http://parsoid.wmflabs.org'
		},
		mediawiki: {
			api: 'http://en.wikipedia.org/w/api.php'
		}
	};
}

/**
/**
 * @class ParsoidPageLoader
 */
function PageLoader( page ) {
	this.page = page;
}

PageLoader.prototype.load = function () {
	var loader, promise, ParsoidPageLoader, MediaWikiApiPageLoader, title;

	title = this.page.split( '/' ).pop();
	if ( config.pageloaderservice === 'parsoid' ) {
		ParsoidPageLoader = require( __dirname + '/ParsoidPageLoader.js' ).ParsoidPageLoader;
		loader = new ParsoidPageLoader( config.parsoid.api, 'enwiki' ); //FIXME
		promise = loader.load( title );
	}
	if ( config.pageloaderservice === 'mediawiki' ) {
		MediaWikiApiPageLoader = require( __dirname + '/MediaWikiApiPageLoader.js' ).MediaWikiApiPageLoader;
		loader = new MediaWikiApiPageLoader( config.mediawiki.api );
		promise = loader.load( title );
	}
	return promise;
};

module.exports.PageLoader = PageLoader;