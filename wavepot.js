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
var lastBeatTime = 0;
var beatTime;

clockBegin();
connect();

function clockBegin() {
  beatTime = 4 / (bpm / 60);
}

function clockEnd() {
  lastBeatTime = beatTime;
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
    clockBegin();
  }

  for (var key in mod.exports) {
    if ('function' === typeof mod.exports[key]) {
      console.log('compile:', key);
      play(key, mod.exports[key]);
    } else if (Array.isArray(mod.exports[key])) {
      play(key, mod.exports[key][1], mod.exports[key][0])
    }
  }

  for (var key in sources) {
    if (!(key in mod.exports)) stop(key);
  }

  clockEnd();
}

function createSource(key) {
  var source = audio.createBufferSource();
  source.loop = true;
  source.connect(audio.destination);
  return source;
}

function createBuffer(fn, multiplier) {
  var channels = 2;
  var frameCount = Math.floor(audio.sampleRate * beatTime * multiplier);
  var buffer = audio.createBuffer(2, frameCount, audio.sampleRate);

  var sample = 0;

  var L = buffer.getChannelData(0);
  var R = buffer.getChannelData(1);

  for (var i = 0; i < frameCount; i++) {
    sample = fn(1 + i / frameCount, i);
    L[i] = R[i] = normalize(sample);
  }

  return buffer;
}

function play(key, fn, multiplier) {
  multiplier = multiplier || 1;
  var buffer = createBuffer(fn, multiplier);
  var source = createSource();

  var syncTime = normalize(
    audio.currentTime +
    (multiplier * lastBeatTime -
    (audio.currentTime % (multiplier * lastBeatTime)))
  );

  if (key in sources) stop(key, syncTime);

  sources[key] = source;
  source.buffer = buffer;
  source.start(syncTime);

  console.log('playing:', key);
}

function stop(key, syncTime) {
  sources[key].stop(syncTime);
  sources[key].onended = disconnect;
}

function disconnect() {
  this.disconnect();
}

function normalize(number) {
  return number === Infinity || number === -Infinity || isNaN(number) ? 0 : number;
}
