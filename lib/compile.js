'use strict';

module.exports = (()=> {
    const fs = require('fs');
    const path = require('path');

    const BUILT_IN_MODULES = ["assert", "buffer", "child_process", "cluster", "console", "constants", "crypto", "dgram", "dns", "domain",
        "events", "fs", "http", "https", "module", "net", "os", "path", "process", "punycode", "querystring", "readline", "repl", "stream",
        "string_decoder", "timers", "tls", "tty", "url", "util", "v8", "vm", "zlib"];

    const escape = (str)=> str
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');

    let lib = {};

    lib.node_modules = (src, project_path)=> {
        let result = [];

        // if src is null, return []
        if (!src) return result;

        // parse node_modules
        let npms = src.match(/require\([^\)]+\)/gim);
        npms = npms ? npms : [];

        let installed = [];
        if (project_path) {
            let _node_modules = path.resolve(project_path, 'node_modules');
            if (fs.existsSync(_node_modules))
                installed = fs.readdirSync(_node_modules);
        }

        for (let i = 0; i < npms.length; i++) {
            if (npms[i].indexOf('require("') === -1 && npms[i].indexOf("require('") === -1)
                continue;

            npms[i] = npms[i].replace(/ /gim, '');
            npms[i] = npms[i].replace(/\n/gim, '');
            npms[i] = npms[i].replace(/\t/gim, '');
            npms[i] = npms[i].replace("require('", '');
            npms[i] = npms[i].replace('require("', '');
            npms[i] = npms[i].replace('")', '');
            npms[i] = npms[i].replace("')", '');

            // pass if module is built-in
            if (BUILT_IN_MODULES.includes(npms[i]))
                continue;

            // pass if installed module
            if (installed.includes(npms[i]))
                continue;

            result.push(npms[i]);
        }

        if (!result.includes('flowpipe') && !installed.includes('flowpipe'))
            result.push('flowpipe');

        return result;
    };

    lib.runnable = (project_path)=> {
        if (!project_path) return '';

        // load satbook project
        let satbook = {};
        satbook.lib = path.resolve(project_path, 'lib.json');
        satbook.scripts = path.resolve(project_path, 'scripts.json');
        if (!(fs.existsSync(satbook.lib) && fs.existsSync(satbook.scripts))) return '';
        satbook.lib = JSON.parse(fs.readFileSync(satbook.lib));
        satbook.scripts = JSON.parse(fs.readFileSync(satbook.scripts));

        // script creator
        let creator = {};
        creator.header = fs.readFileSync(path.resolve(__dirname, 'script', 'header.js'), 'utf-8');
        creator.variable = {};
        creator.variable.load = fs.readFileSync(path.resolve(__dirname, 'script', 'variable-load.js'), 'utf-8');
        creator.variable.save = fs.readFileSync(path.resolve(__dirname, 'script', 'variable-save.js'), 'utf-8');

        // header create
        creator.header = creator.header.replace('${lib.value}', satbook.lib.value) + '\n';
        creator.header += fs.readFileSync(path.resolve(__dirname, 'script', 'saturn.js'), 'utf-8') + '\n';

        // loop handler
        let looper = {};
        for (let i = 0; i < satbook.scripts.length; i++) {
            if (satbook.scripts[i].type == 'loop') {
                let start = i + 1;
                for (let j = i + 1; j < satbook.scripts.length; j++) {
                    if (satbook.scripts[j].type != 'loop') {
                        start = j;
                        break;
                    }
                }
                if (!looper[satbook.scripts[i].block_end]) looper[satbook.scripts[i].block_end] = [];
                looper[satbook.scripts[i].block_end].unshift({start: start, end: satbook.scripts[i].block_end, condition: satbook.scripts[i].value});
            }
        }

        // language module
        let languageModule = {};
        languageModule.node = require('../language-module/node/index');
        languageModule.work = languageModule.node;
        languageModule.python = require('../language-module/python');

        for (let langname in languageModule) {
            let lang = languageModule[langname];
            if (lang.header)
                creator.header += lang.header() + '\n';
        }

        creator.runjs = {};

        // create single
        let loopFormatter = (target)=> {
            let work = satbook.scripts[target];

            let runjs = creator.header + '\n';
            runjs += creator.variable.load + '\n';

            for (let i = target; i <= work.block_end; i++) {
                let loopWork = satbook.scripts[i];
                let lang = languageModule[loopWork.type];
                if (lang && lang.create) {
                    runjs +=
                        `flowpipe.then('${i}', (args)=> new Promise((resolve)=> {\n` +
                        lang.create(loopWork.value, {target: i, project_path: project_path}) + '\n' +
                        `}));\n`;
                }

                if (looper[i])
                    for (let j = 0; j < looper[i].length; j++)
                        runjs += `\nflowpipe.loop('${looper[i][j].start}', (args)=> ${looper[i][j].condition.replace(';', '')});\n`;
            }

            runjs += creator.variable.save + '\n';
            runjs += 'flowpipe.run();';

            return runjs;
        };

        let singleFormatter = (target)=> {
            let work = satbook.scripts[target];
            let lang = languageModule[work.type];

            if (work.type == 'loop')
                return loopFormatter(target);

            let runjs = creator.header + '\n';
            runjs += creator.variable.load + '\n';

            if (lang && lang.create)
                runjs +=
                    `flowpipe.then('${target}', (args)=> new Promise((resolve)=> {\n` +
                    lang.create(work.value, {target: target, project_path: project_path}) + '\n' +
                    `}));\n`;
            runjs += creator.variable.save + '\n';
            runjs += 'flowpipe.run();';

            return runjs;
        };

        // create total
        creator.runjs.all = creator.header + '\n';

        for (let i = 0; i < satbook.scripts.length; i++) {
            creator.runjs[i] = singleFormatter(i);
            let work = satbook.scripts[i];
            let lang = languageModule[work.type];

            if (lang && lang.create)
                creator.runjs.all +=
                    `flowpipe.then('${i}', (args)=> new Promise((resolve)=> {\n` +
                    lang.create(work.value, {target: i, project_path: project_path}) + '\n' +
                    `}));\n`;

            if (looper[i])
                for (let j = 0; j < looper[i].length; j++)
                    creator.runjs.all += `\nflowpipe.loop('${looper[i][j].start}', (args)=> ${looper[i][j].condition.replace(';', '')});\n`;
        }

        creator.runjs.all += 'flowpipe.run();';

        let beautify = require('js-beautify').js_beautify;

        for (let key in creator.runjs) {
            let runnableName = 'run.js';
            if (key !== 'all') runnableName = `run-${key}.js`;
            creator.runjs[key] = beautify(creator.runjs[key], {indent_size: 4});
            fs.writeFileSync(path.resolve(project_path, runnableName), creator.runjs[key]);
        }

        return creator.runjs;
    };

    return lib;
})();