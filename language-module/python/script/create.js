let pythonScript = '# -*- coding: utf-8 -*-\n';

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

pythonScript += 'import json';
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

pythonScript += `__script__`;

pythonScript += '\n';

pythonScript += `
__save__ = {}
__vars__ = vars().copy();

for key in __vars__.keys():
    if key == '__save__':
        continue;
    if key == '__vars__':
        continue;
    try:
        if type(__vars__[key]).__name__ == 'list':
            __save__[key] = __vars__[key]
        elif type(__vars__[key]).__name__ == 'str':
            __save__[key] = __vars__[key]
        elif type(__vars__[key]).__name__ == 'int':
            __save__[key] = __vars__[key]
        elif type(__vars__[key]).__name__ == 'long':
            __save__[key] = __vars__[key]
        elif type(__vars__[key]).__name__ == 'float':
            __save__[key] = __vars__[key]
        elif type(__vars__[key]).__name__ == 'dict':
            __save__[key] = __vars__[key]
    except:
        print

try:
    __save__ = json.dumps(__save__)
    file_ = open('${require('path').join(require('path').dirname(__filename), 'variable.json')}', 'w')
    file_.write(__save__)
    file_.close()
except:
    print
`;

pythonScript += '\n';

let py = require('path').resolve(require('path').dirname(__filename), 'python-__target__.py');
fs.writeFileSync(py, pythonScript);

saturn.python(py).then(resolve);