'use strict';

module.exports = (()=> {
    let lang_module = {};

    lang_module.create = ()=> {
        return 'resolve();';
    };

    return lang_module;
})();