
# wavepot-cli

wavepot on the terminal

`npm install wavepot -g`

Make sure you have `electron` installed and in your path. If you don't, `npm install electron -g`

## Usage

`$ wavepot <sourcefile>`

Where `<sourcefile>` is a file that contains something like this:

```js
exports.beep = t => .3 * Math.sin(t * 440 * Math.PI * 2);
exports.noise = t => .15 * Math.random() * 2 - 1;
```

And then, try editing the file in your favorite editor. Any changes are reflected in realtime in the audio output.

## Building modules

`$ wavepot -b <sourcefile>`

When you pass the option `--build` or `-b`, the file will be built with browserify and babelify. Babel latest preset is used so you can use imports and any new JavaScript features. An example can be found [here](example/drumbeat.js).

If you're looking for filters, effects and generators to install and play with, check out [opendsp](https://github.com/opendsp). Then install with npm, github style: `npm install opendsp/some-module --save`.

Enjoy!

## License

MIT &copy; [stagas](https://github.com/stagas)
