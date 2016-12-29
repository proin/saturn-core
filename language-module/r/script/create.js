let RSscript = '';

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
            RSscript += key + ' = ' + variables[key];
        } else if (typeof variables[key] == 'string') {
            variables[key] = variables[key].replace(/\\n/gim, '\\\\n');
            RSscript += key + " = '" + variables[key] + "'";
        }
        RSscript += '\n';
    } catch (e) {
    }
}

RSscript += `__SCRIPT__`;
RSscript += '\n';
RSscript += `__FOOTER__`;

let dotR = require('path').resolve(require('path').dirname(__filename), 'R-__TARGET__.R');
fs.writeFileSync(dotR, RSscript);

saturn.R(dotR).then(resolve);