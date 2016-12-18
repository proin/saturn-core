flowpipe.then(()=> new Promise((resolve)=> {
    let variables = {};
    for(let key in global) {
        try {
            if(typeof global[key] == 'function') {
                if(global[key].name && global[key].name !== 'Buffer')
                    variables[key] = { type: 'function', eval: global[key].name + ' = ' + global[key].toString() };
            } else {
                JSON.stringify(global[key]);
                variables[key] = global[key];
            }
        } catch(e) {}
    }

    delete variables.console;

    require('fs').writeFileSync(require('path').resolve(require('path').dirname(__filename), 'variable.json'), JSON.stringify(variables));
    resolve();
}));