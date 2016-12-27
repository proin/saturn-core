'use strict';

module.exports = (()=> {
    const fs = require('fs');
    const assert = require('assert');
    const path = require('path');

    const fsextra = require('fs-extra');
    const compile = require('./compile');

    // class: terminal
    let terminal = (cmd, args, opts, binder)=> new Promise((resolve)=> {
        let _spawn = require('child_process').spawn;
        if (process.platform == 'win32')
            _spawn = require('cross-spawn');

        let term = _spawn(cmd, args, opts);

        term.stdout.on('data', binder.data ? binder.data : ()=> {
        });

        term.stderr.on('data', binder.error ? binder.error : ()=> {
        });

        term.on('close', () => {
            resolve();
        });

        if (binder.terminal)
            binder.terminal(term);
    });

    // class: lib
    let ENV = {};
    let lib = {};

    lib.get = (name)=> ENV[name];
    lib.set = (name, value)=> ENV[name] = value;

    lib.install = (project_path, binder)=> new Promise((resolve)=> {
        assert(fs.existsSync(project_path), 'not exists project path');
        if (!binder) binder = {};

        let src = compile.source(project_path);
        let node_modules = compile.node_modules(src.lib.value, project_path);

        let packageJSONPath = path.resolve(project_path, 'package.json');
        if (fs.existsSync(packageJSONPath) === false)
            fs.writeFileSync(packageJSONPath, '{}');

        let deps = ['install', '--save'];
        if (node_modules.constructor === Array)
            deps = deps.concat(node_modules);

        terminal('npm', deps, {cwd: project_path}, binder).then(()=> {
            resolve();
        });
    });

    lib.run = (project_path, target, binder, process_args)=> new Promise((resolve)=> {
        assert(fs.existsSync(project_path), 'not exists project path');
        if (!binder) binder = {};

        lib.install(project_path).then(()=> {
            compile.runnable(project_path);

            let src = compile.source(project_path);

            let runjs = path.resolve(project_path, 'run.js');
            if (!(target === 'all' || target === 'lib'))
                runjs = path.resolve(project_path, `run-${target}.js`);
            assert(fs.existsSync(runjs), 'not exists run.js file');

            let pargs = [];
            if (src.config.NODE_MAX_HEAP || ENV.NODE_MAX_HEAP)
                pargs.push(`--max-old-space-size=${(src.config.NODE_MAX_HEAP || ENV.NODE_MAX_HEAP) * 1024}`);

            if(src.config.await === true)
                pargs.push('--harmony-async-await');

            pargs.push(runjs);
            if (process_args)
                pargs = pargs.concat(process_args);

            terminal('node', pargs, {cwd: ENV.WORKSPACE || path.dirname(project_path)}, binder).then(()=> {
                resolve();
            });
        });
    });

    lib.clean = (project_path)=> new Promise((resolve)=> {
        assert(fs.existsSync(project_path), 'not exists project path');
        let libPath = path.resolve(project_path, 'lib.json');
        let scriptsPath = path.resolve(project_path, 'scripts.json');
        let packageJSONPath = path.resolve(project_path, 'package.json');

        let libStr = fs.readFileSync(libPath);
        let scriptsStr = fs.readFileSync(scriptsPath);

        fsextra.removeSync(project_path);
        fsextra.mkdirsSync(project_path);

        fs.writeFileSync(libPath, libStr);
        fs.writeFileSync(scriptsPath, scriptsStr);
        fs.writeFileSync(packageJSONPath, '{}');

        resolve();
    });

    return lib;
})();