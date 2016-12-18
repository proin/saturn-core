flowpipe.then(()=> new Promise((resolve)=> {
    try {
        let variables = JSON.parse(require('fs').readFileSync(require('path').resolve(require('path').dirname(__filename), 'variable.json'), 'utf-8'));

        for(let key in variables) {
            if(typeof variables[key] == 'object' && variables[key].type === 'function') {
                eval(variables[key].eval);
            } else {
                global[key] = variables[key];
            }
        }

    } catch(e) {
    }
    resolve();
}));