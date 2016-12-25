'use strict';

module.exports = (()=> {
    let lang_module = {};

    const escape = (str)=> str
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');

    const path = require('path');
    const fs = require('fs');

    lang_module.header = ()=> {
        return fs.readFileSync(path.resolve(__dirname, 'script', 'header.js'), 'utf-8');
    };

    lang_module.create = (script, opts)=> {
        let target = opts.target;
        let project_path = opts.project_path;

        let scripts = path.resolve(project_path, 'scripts.json');
        scripts = JSON.parse(fs.readFileSync(scripts, 'utf-8'));

        let adding = '';

        for (let j = 0; j < target; j++) {
            if (scripts[j].type == 'python') {
                let addingScript = scripts[j].value + '';
                addingScript = addingScript.split('\n');
                let addingScriptTmp = '';
                let fnStart = false;

                for (let k = 0; k < addingScript.length; k++) {
                    if (fnStart === true) {
                        if (addingScript[k].indexOf('\t') === 0 || addingScript[k].indexOf('  ') === 0) {
                            addingScriptTmp += addingScript[k] + '\n';
                            continue;
                        } else if (addingScript[k].trim() != '') {
                            fnStart = false;
                        }
                    }

                    if (addingScript[k].indexOf('import') === 0 || addingScript[k].indexOf('from') === 0) {
                        addingScriptTmp += addingScript[k] + '\n';
                    }

                    if (addingScript[k].indexOf('sys') === 0) {
                        addingScriptTmp += addingScript[k] + '\n';
                    }

                    if (addingScript[k].indexOf('def') === 0) {
                        fnStart = true;
                        addingScriptTmp += addingScript[k] + '\n';
                    }
                }

                adding = adding + '\n' + addingScriptTmp;
            }
        }

        script = adding + '\n' + script;

        let result = fs.readFileSync(path.resolve(__dirname, 'script', 'create.js'), 'utf-8');
        result = result.replace('__script__', escape(script));
        result = result.replace('__target__', target);
        return result;
    };

    return lang_module;
})();