let thScript = '';

let variables = {};
for (let key in global) {
    try {
        JSON.stringify(global[key]);
        variables[key] = global[key];
    } catch (e) {
    }
}

variables = JSON.parse(JSON.stringify(variables));
delete variables.console;

for (let key in variables) {
    try {
        if (key.indexOf('_') === 0) continue;
        if (typeof variables[key] == 'number') {
            thScript += 'local ' + key + ' = ' + variables[key];
        } else if (typeof variables[key] == 'string') {
            variables[key] = variables[key].replace(/\\n/gim, '\\\\n');
            thScript += 'local ' + key + " = '" + variables[key] + "'";
        }
        thScript += '\n';
    } catch (e) {
    }
}

thScript += `__SCRIPT__`;

let dotTh = require('path').resolve(require('path').dirname(__filename), 'torch-__TARGET__.lua');
fs.writeFileSync(dotTh, thScript);

saturn.torch(dotTh).then(resolve);