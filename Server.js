#!/usr/bin/env node
/**
 * A very basic cluster-based server runner. Restarts failed workers.
 *
 * Adopted and adapted from Parsoid project
 */

'use strict';

var cluster = require( 'cluster' ),
	logger = require( __dirname + '/utils/Logger.js' );

if ( cluster.isMaster ) {
	// Start a few more workers than there are cpus visible to the OS, so that we
	// get some degree of parallelism even on single-core systems. A single
	// long-running request would otherwise hold up all concurrent short requests.
	var numCPUs = require( 'os' ).cpus().length + 3;
	// Fork workers.
	for ( var i = 0; i < numCPUs; i++ ) {
		cluster.fork();
	}

	cluster.on( 'exit', function ( worker /*, code, signal */ ) {
		if ( !worker.suicide ) {
			var exitCode = worker.process.exitCode;
			logger.warn( 'worker', worker.process.pid,
				'died (' + exitCode + '), restarting.' );
			cluster.fork();
		}
	} );

	process.on( 'SIGTERM', function () {
		logger.warn( 'master shutting down, killing workers' );
		var workers = cluster.workers;
		Object.keys( workers ).forEach( function ( id ) {
			logger.info( 'Killing worker ' + id );
			workers[ id ].destroy();
		} );
		logger.info( 'Done killing workers, bye' );
		process.exit( 1 );
	} );
} else {
	// Worker.
	process.on( 'SIGTERM', function () {
		logger.warn( 'Worker shutting down' );
		process.exit( 1 );
	} );

	// Enable heap dumps in /tmp on kill -USR2.
	// See https://github.com/bnoordhuis/node-heapdump/
	// For node 0.6/0.8: npm install heapdump@0.1.0
	// For 0.10: npm install heapdump
	process.on( 'SIGUSR2', function () {
		var heapdump = require( 'heapdump' );
		logger.error( 'SIGUSR2 received! Writing snapshot.' );
		process.chdir( '/tmp' );
		heapdump.writeSnapshot();
	} );

	require( './ContentTranslationService.js' );
}
