saturn.R = (r_path)=> new Promise((resolve)=> {
    let _spawn = require('child_process').spawn;
    if (process.platform == 'win32')
        _spawn = require('cross-spawn');

    let config = require('path').resolve(require('path').dirname(__filename), 'config.json');
    if (require('fs').existsSync(config)) config = JSON.parse(require('fs').readFileSync(config, 'utf-8'));
    else config = {};
    if (config.R) config.R = config.R.replace('~', process.env.HOME || process.env.USERPROFILE);

    let _argv = [r_path].concat(process.argv);
    let term = _spawn(config.R ? config.R : 'Rscript', _argv, {cwd: process.cwd()});

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
        if (code !== 0) throw new Error('RScript Error');
        resolve();
    });
});