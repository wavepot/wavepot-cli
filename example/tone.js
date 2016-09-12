exports.beep = t => .3 * Math.sin(t * 440 * Math.PI * 2);
exports.noise = t => .15 * Math.random() * 2 - 1;
