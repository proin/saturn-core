saturn.R = (r_path)=> new Promise((resolve)=> {
    let _spawn = require('child_process').spawn;
    if (process.platform == 'win32')
        _spawn = require('cross-spawn');

    let config = require('path').resolve(require('path').dirname(__filename), 'config.json');
    if (require('fs').existsSync(config)) config = JSON.parse(require('fs').readFileSync(config, 'utf-8'));
    else config = {};
    if (config.R) config.R = config.R.replace('~', process.env.HOME || process.env.USERPROFILE);

    let term = _spawn(config.R ? config.R : 'Rscript', [r_path], {cwd: process.cwd()});

    process.on('SIGINT', () => {
        term.kill();
    });

    term.stdout.on('data', (data)=> {
        process.stdout.write(data);
    });

    term.stderr.on('data', (data)=> {
        process.stderr.write(data);
    });

    term.on('close', (code) => {
        if(code !== 0) throw new Error('RScript Error');
        let varJSON = require('path').resolve(require('path').dirname(__filename), 'variable.json');
        if (require('fs').existsSync(varJSON)) {
            let v = JSON.parse(require('fs').readFileSync(varJSON, 'utf-8'));
            for (let key in v)
                global[key] = v[key];
        }
        resolve();
    });
});