/**
 * Module dependencies.
 */

require('mocha-generators')
  .install();

var Nightmare = require('nightmare');
var should = require('chai')
  .should();
var url = require('url');
var server = require('./server');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');

/**
 * Temporary directory
 */

var tmp_dir = path.join(__dirname, 'tmp')

/**
 * Get rid of a warning.
 */

process.setMaxListeners(0);

/**
 * Locals.
 */

var base = 'http://localhost:7500/';

describe('Nightmare Custom Events', function() {
  before(function(done) {
    require('../nightmare-custom-event');
    server.listen(7500, done);
  });

  it('should be constructable', function * () {
    var nightmare = Nightmare();
    nightmare.should.be.ok;
    yield nightmare.end();
  });

  describe('custom events', function() {
    var nightmare;

    beforeEach(function() {
      nightmare = Nightmare();
    });

    afterEach(function * () {
      yield nightmare.end();
    });

    it('should be able to bind to a custom event', function * () {
      var eventResults;
      yield nightmare
        .goto(fixture('events'))
        .on('sample-event', function() {
          eventResults = arguments;
        })
        .bind('sample-event')
        .evaluate(function() {
          ipc.send('sample-event', 'sample', 3, {
            sample: 'sample'
          });
        });
      eventResults.length.should.equal(3);
      eventResults[0].should.equal('sample');
      eventResults[1].should.equal(3);
      eventResults[2].sample.should.equal('sample');
    });

    it('should be able to unbind a custom event', function * () {
      var eventResults;
      yield nightmare
        .goto(fixture('events'))
        .on('sample-event', function() {
          eventResults = arguments;
        })
        .bind('sample-event')
        .unbind('sample-event')
        .evaluate(function() {
          ipc.send('sample-event', 'sample', 3, {
            sample: 'sample'
          });
        });
      should.not.exist(eventResults);
    });

    it('should be able to bind to a custom event with a handler', function * () {
      var eventResults;
      yield nightmare
        .goto(fixture('events'))
        .bind('sample-event', function() {
          eventResults = arguments;
        })
        .evaluate(function() {
          ipc.send('sample-event', 'sample', 3, {
            sample: 'sample'
          });
        });
      eventResults.should.be.ok;
    });

    it('should be able to unbind a custom event handler', function * () {
      var eventResults, onResults;

      var handler = function() {
        eventResults = arguments;
      }

      yield nightmare
        .goto(fixture('events'))
        .bind('sample-event', handler)
        .on('sample-event', function() {
          onResults = arguments;
        })
        .unbind('sample-event', handler)
        .evaluate(function() {
          ipc.send('sample-event', 'sample', 3, {
            sample: 'sample'
          });
        });
      should.not.exist(eventResults);
      onResults.should.be.ok;
    });

    it('should be able to unbind all custom event handlers', function * () {
      var eventResults, onResults;

      var handler = function() {
        eventResults = arguments;
      }

      yield nightmare
        .goto(fixture('events'))
        .bind('sample-event', handler)
        .on('sample-event', function() {
          onResults = arguments;
        })
        .unbind('sample-event')
        .evaluate(function() {
          ipc.send('sample-event', 'sample', 3, {
            sample: 'sample'
          });
        });
      should.not.exist(eventResults);
      should.not.exist(onResults);
    });

    it('should not emit multiple events for events bound more than once', function * () {
      var count = 0;

      yield nightmare
        .goto(fixture('events'))
        .bind('sample-event')
        .bind('sample-event')
        .on('sample-event', function() {
          count++
        })
        .evaluate(function() {
          ipc.send('sample-event', 'sample', 3, {
            sample: 'sample'
          });
        });

      count.should.equal(1);
    });
  });
});

/**
 * Generate a URL to a specific fixture.
 * @param {String} path
 * @returns {String}
 */

function fixture(path) {
  return url.resolve(base, path);
}
