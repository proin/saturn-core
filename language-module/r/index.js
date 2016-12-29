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

        let result = fs.readFileSync(path.resolve(__dirname, 'script', 'create.js'), 'utf-8');
        result = result.replace('__FOOTER__', escape(fs.readFileSync(`${__dirname}/script/footer.R`, 'utf-8')));
        result = result.replace('__SCRIPT__', escape(script));
        result = result.replace('__TARGET__', target);

        return result;
    };

    return lang_module;
})();