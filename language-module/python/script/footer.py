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
        None

try:
    __save__ = json.dumps(__save__)
    file_ = open('${require('path').join(require('path').dirname(__filename), 'variable.json')}', 'w')
    file_.write(__save__)
    file_.close()
except:
    None