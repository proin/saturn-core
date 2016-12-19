# Saturn Core

## Install

cli

```
npm install -g saturn-core
```

use in code

```
npm install --save saturn-core
```

## Usage

### CLI

```
saturn clean ~/your/saturn/path     # clean project (include config, run.js, variables) 
saturn install ~/your/saturn/path   # install npm
saturn run ~/your/saturn/path       # run project
saturn run ~/your/saturn/path 2     # run specific block [0-n]
```

### Programmatic

#### compile

- `compile.node_modules`: Function (str, project_path)
    - this function parse npm dependencies
    - return [ "some-module" ]
- `compile.runnable`: Function (project_path)
    - this function create runnable
    - return runnable object

```js
'use strict';

let saturn = require('saturn-core');

// some string contains require
let libstring = "const fs = require('fs');\nconst mysql = require('mysql');"

// [ "mysql" ]
let node_modules = saturn.compile.node_modules(libstring);
console.log(node_modules)

// your saturn project path
let project_path = '~/workspace/basic/python2.satbook';

// create runnable script in your project folder
let runnable = saturn.compile.runnable(project_path);
console.log(runnable);
```

#### worker

- `worker.run`: Promise (project_path, target, binder)
    - `project_path`: project path in your file system
    - `target`: 'all' or '1', '2', .., 'n'
    - `binder`:
        - `binder.terminal`: Function, callback(spawn_process)
        - `binder.data`: Function, callback(process_output)
        - `binder.error`: Function, callback(process_error)
- `worker.clean`: Promise (project_path)
    - this function remove all except `lib.json`, `scripts.json`
- `worker.install`: Promise (project_path, binder)
    - `project_path`: project path in your file system
    - `binder`:
        - `binder.terminal`: Function, callback(spawn_process)
        - `binder.data`: Function, callback(process_output)
        - `binder.error`: Function, callback(process_error)
        
#### connect

- `connect.run`: Promise (project_path, target, src)
    - `project_path`: project path in your server
    - `target`: 'all' or '1', '2', .., 'n'
    - `src`: source object
        - **this function overwrite the project**
        - `lib`: lib.json in your project
        - `scripts`: scripts.json in your project
- `connect.stop`: Promise (project_path)
    - this function stop if project running
- `connect.disconnect`: Promise
    - this function remove connection (signout from server)
- `connect.log`: Function (project_path)

```js
let saturn = require('saturn-core');
let connect = saturn.connect('http://host', 'user', 'password');

let log = connect.log('/examples/server/express-api-server.satbook')
    .on('data', (json_data)=> {
        // when log received. 
    });
log.close(); // force stop log

// stop and run project
connect.stop('/examples/server/express-api-server.satbook')
    .then(()=> connect.run('/examples/server/express-api-server.satbook', 'all'))
    .then(()=> connect.disconnect());
```