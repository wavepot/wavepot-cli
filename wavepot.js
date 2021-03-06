var readFile = require('fs').readFile;
var electron = require('electron');
var ipc = electron.ipcRenderer;

console.log = electron.remote.getGlobal('console').log;
console.error = electron.remote.getGlobal('console').error;
window.addEventListener('error', e => {
  e.preventDefault();
  console.error(e.error.stack);
});

var audio = new AudioContext;
window.sampleRate = audio.sampleRate;

var bpm = 60;
var sources = {};
var beatTime;

clock();
connect();

function clock() {
  beatTime = 1 / (bpm / 60);
}

function connect() {
  ipc.on('sourcefile', getSourceFile)
  ipc.on('source', getSource)
}

function getSourceFile(event, filename) {
  readFile(filename, 'utf8', build);
}

function getSource(event, js) {
  build(null, js);
}

function build(err, js) {
  if (err) console.log(err.stack);
  else compile(js);
}

function compile(js) {
  var mod = { exports: {} };
  var fn = new Function('module', 'exports', 'require', js);
  fn(mod, mod.exports);
  console.log('ok');

  if ('bpm' in mod.exports) {
    console.log('set bpm:', mod.exports.bpm);
    bpm = mod.exports.bpm;
    clock();
  }

  for (var key in sources) {
    if (!(key in mod.exports)) sources[key].stop();
  }

  for (var key in mod.exports) {
    if ('function' === typeof mod.exports[key]) {
      console.log('compile:', key);
      play(key, mod.exports[key]);
    } else if (Array.isArray(mod.exports[key])) {
      console.log('compile:', key);
      play(key, mod.exports[key][1], mod.exports[key][0])
    }
  }
}

function createSource(key) {
  var source = audio.createBufferSource();
  source.loop = true;
  source.onended = disconnect;
  source.connect(audio.destination);
  return source;
}

function createBuffer(fn, multiplier) {
  var channels = 2;
  var beatFrames = Math.floor(audio.sampleRate * beatTime);
  var blockFrames = Math.floor(beatFrames * multiplier);
  var buffer = audio.createBuffer(2, blockFrames, audio.sampleRate);

  var sample = 0;

  var L = buffer.getChannelData(0);
  var R = buffer.getChannelData(1);

  for (var i = 0; i < blockFrames; i++) {
    sample = fn(1 + i / beatFrames, i);
    L[i] = R[i] = normalize(sample);
  }

  return buffer;
}

function play(key, fn, multiplier) {
  multiplier = multiplier || 4;
  var buffer = createBuffer(fn, multiplier);
  var source = createSource();
  var syncTime = calcSyncTime(multiplier);

  if (key in sources) sources[key].stop(syncTime);

  sources[key] = source;
  source.buffer = buffer;
  source.start(syncTime);

  console.log('playing:', key);
}

function calcSyncTime(multiplier) {
  return normalize(
    audio.currentTime +
    (multiplier * beatTime -
    (audio.currentTime % (multiplier * beatTime)))
  );
}

function disconnect() {
  this.disconnect();
}

function normalize(number) {
  return number === Infinity || number === -Infinity || isNaN(number) ? 0 : number;
}
