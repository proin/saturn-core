'use strict';

module.exports = (()=> {
    let lang_module = {};

    lang_module.create = (script)=> {
        let result = 'async function __async__main__() {\n';
        result += script;
        result += '\n};';
        result += '\n__async__main__();\n';
        result += '\nresolve();\n';
        return result;
    };

    return lang_module;
})();