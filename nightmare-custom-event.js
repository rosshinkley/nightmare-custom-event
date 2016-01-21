var Nightmare = require('nightmare'),
  debug = require('debug')('nightmare:custom-event');

Nightmare.action('bind',
  function(ns, options, parent, win, renderer, done) {
    var sliced = require('sliced');
    parent.on('bind', function(name) {
      if (renderer.listeners(name)
        .length == 0) {
        renderer.on(name, function() {
          parent.emit.apply(parent, [name].concat(sliced(arguments, 1)))
        });
      }
      parent.emit('bind');
    });
    done();
  },
  function() {
    var name = arguments[0],
      handler, done;
    debug('binding ' + name);
    if (arguments.length == 2) {
      done = arguments[1];
    } else if (arguments.length == 3) {
      handler = arguments[1];
      done = arguments[2];
    }
    if (handler) {
      this.child.on(name, handler);
    }
    this.child.once('bind', done);
    this.child.emit('bind', name);
  });

Nightmare.action('unbind',
  function(ns, options, parent, win, renderer, done) {
    parent.on('unbind', function(name) {
      renderer.removeAllListeners(name);
      parent.emit('unbind');
    });
    done();
  }, function() {
    var name = arguments[0],
      handler, done;
    debug('unbinding ' + name);
    if (arguments.length == 2) {
      done = arguments[1];
    } else if (arguments.length == 3) {
      handler = arguments[1];
      done = arguments[2];
    }

    if (handler) {
      this.child.removeListener(name, handler);
    } else {
      this.child.removeAllListeners(name);
    }

    if (this.child.listeners(name)
      .length == 0) {
      this.child.once('unbind', function() {
        done();
      });
      this.child.emit('unbind', name);
    } else {
      done();
    }
  });
