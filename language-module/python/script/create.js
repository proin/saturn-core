let pythonScript = '';

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

pythonScript += '__HEADER__';
pythonScript += '\n';

for (let key in variables) {
    try {
        if (typeof variables[key] == 'object') {
            pythonScript += key + ' = ' + JSON.stringify(variables[key]);
            pythonScript += '\n';
        } else if (typeof variables[key] == 'number') {
            pythonScript += key + ' = ' + variables[key];
        } else if (typeof variables[key] == 'string') {
            variables[key] = variables[key].replace(/\\n/gim, '\\\\n');
            pythonScript += key + ' = "' + variables[key] + '"';
        } else {
            pythonScript += key + ' = "' + variables[key] + '"';
        }
        pythonScript += '\n';
    } catch (e) {
    }
}

pythonScript += `__SCRIPT__`;
pythonScript += '\n';
pythonScript += `__FOOTER__`;

let py = require('path').resolve(require('path').dirname(__filename), 'python-__TARGET__.py');
fs.writeFileSync(py, pythonScript);

saturn.python(py).then(resolve);