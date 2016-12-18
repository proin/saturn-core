'use strict';

module.exports = (()=> {
    let lang_module = {};

    lang_module.create = (script)=> {
        let result = script;
        if (result.indexOf('resolve()') == -1)
            result += '\n' + 'resolve();';
        return result;
    };

    return lang_module;
})();