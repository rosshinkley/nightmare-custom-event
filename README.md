nightmare-custom-event
======================

# Important Note
This library will not be ready for use until [Nightmare #391](https://github.com/segmentio/nightmare/issues/391) is completed.  For now, if this library is needed, use the [`electron-plugin` branch from my fork](https://github.com/rosshinkley/nightmare/tree/electron-plugin).

Add custom events to your [Nightmare](http://github.com/segmentio/nightmare) scripts.

## Usage
Simply require the library: 

```js
require('nightmare-custom-event')
```

... and then you're able to use `bind` and `unbind`.

### .bind(name [, handler])
Adds a custom event that can be captured with `.on()` triggerable in `.evaluate()` or `.inject()` with `ipc.send([name], ...)`. The optional handler will consume the named event.

### .unbind(name [, handler])

Removes a custom event added with `.bind()`. If handler is specified, the handler is removed. If no handler is specified or the handler was the last handler for the emitter, the custom event is removed and will no longer be emittable until it is bound again.


## Example

```js
var onResults;
yield nightmare
  .goto(fixture('events'))
  .bind('sample-event', handler)
  .on('sample-event', function(msg) {
    onResults = msg.sample;
   })
   .evaluate(function() {
     ipc.send('sample-event', 'sample', 3, {
       sample: 'sample'
      });
   });

// ... do something intermediate ...

yield nightmare.
    unbind('sample-event');
```
