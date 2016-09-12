var extname = require('path').extname;
var read = require('fs').readFileSync;
var through = require('through2');

module.exports = function (file) {
  var ext = extname(file).toLowerCase();

  return through(function (buf, enc, next) {
    if (ext === '.wav') {
      this.push('module.exports = new Buffer("'
        + read(file).toString('base64')
        + '", "base64").buffer;'
      );
    } else {
      this.push(buf);
    }
    next();
  });
};
