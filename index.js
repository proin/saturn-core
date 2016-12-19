'use strict';

module.exports = (()=> {
    let saturn = {};

    saturn.compile = require('./lib/compile');
    saturn.worker = require('./lib/worker');

    return saturn;
})();