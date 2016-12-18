'use strict';

module.exports = (()=> {
    let saturn = {};

    saturn.compile = require('./lib/compile');

    return saturn;
})();