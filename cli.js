#!/usr/bin/env node

'use strict';

const path = require('path');

let commands = process.argv.splice(2);

let worker = require('./lib/worker');

if (commands[0] == 'clean') {
    let PROJECT_PATH = commands[1];
    if (PROJECT_PATH) {
        PROJECT_PATH = path.resolve(PROJECT_PATH);
        worker.clean(PROJECT_PATH).then(()=> {
            console.log(`clean project, ${PROJECT_PATH}`);
        });
    }
    else
        console.log('saturn clean [project_path]')
} else if (commands[0] == 'run') {
    let PROJECT_PATH = commands[1];

    let sliceIndex = 3;
    let TARGET = commands[2];
    if (!TARGET) {
        sliceIndex = 2;
        TARGET = 'lib';
    }

    if (PROJECT_PATH) {
        PROJECT_PATH = path.resolve(PROJECT_PATH);
        worker.run(PROJECT_PATH, TARGET, {
            data: (data)=> {
                process.stdout.write(data);
            },
            error: (data)=> {
                process.stderr.write(data);
            }
        }, commands.slice(sliceIndex)).then(()=> {
        });
    }
    else
        console.log('saturn run [project_path] [target]')
} else if (commands[0] == 'install') {
    let PROJECT_PATH = commands[1];
    if (PROJECT_PATH) {
        PROJECT_PATH = path.resolve(PROJECT_PATH);
        worker.install(PROJECT_PATH, {
            data: (data)=> {
                process.stdout.write(data);
            },
            error: (data)=> {
                process.stderr.write(data);
            }
        }).then(()=> {
        });
    }
    else
        console.log('saturn install [project_path]')
}

