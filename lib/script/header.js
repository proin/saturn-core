require.main.filename = __dirname;
process.argv.splice(0, 2);

__dirname = require('path').dirname(__dirname);

const Flowpipe = require('flowpipe');
let flowpipe = Flowpipe.instance('SATURN');

${lib.value}