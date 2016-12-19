## Saturn Core

### Install

cli

```
npm install -g saturn-core
```

use in code

```
npm install --save saturn-core
```

### Usage

#### Cli

```
saturn clean ~/your/saturn/path     # clean project (include config, run.js, variables) 
saturn install ~/your/saturn/path   # install npm
saturn run ~/your/saturn/path       # run project
saturn run ~/your/saturn/path 2     # run specific block [0-n]
```

#### in Code

```js
'use strict';

let libstring = `const fs = require('fs');
const path = require('path');
const readline = require('readline');
const express = require('express');
const mysql = require('mysql');
const fsextra = require('fs-extra');
const moment = require('moment');`;

let saturn = require('./index');

let compiler = saturn.compile;

// your saturn project path
let satbook = '~/workspace/basic/python2.satbook';

// parse node_modules in your project
let node_modules = compiler.node_modules(libstring, satbook);

// create runnable script in your project folder
let runnable = compiler.runnable(satbook);

console.log(runnable);
```
