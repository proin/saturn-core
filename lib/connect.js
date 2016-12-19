'use strict';

module.exports = (host, user, password)=> {
    const fs = require('fs');
    const assert = require('assert');
    const path = require('path');

    const request = require('request');
    const io = require('socket.io-client');

    let httpHandler = (()=> {
        let jar = request.jar();

        let handler = {};
        handler.get = (url)=> new Promise((resolve)=> {
            request.get({url: url, jar: jar}, (err, resp, body)=> {
                resolve(JSON.parse(body));
            });
        });

        handler.post = (url, form)=> new Promise((resolve)=> {
            request.post({url: url, jar: jar, form: form}, (err, resp, body)=> {
                resolve(JSON.parse(body));
            });
        });

        return handler;
    })();

    let _host = host ? host : 'http://localhost:3000';
    let _user = user ? user : null;
    let _password = password ? password : null;

    let lib = {};

    let signin = ()=> new Promise((resolve)=> {
        httpHandler.get(`${_host}/api/user/check`).then((response)=> {
            if (response.status === 'GRANTALL') {
                resolve();
                return;
            }

            httpHandler.post(`${_host}/api/user/signin`, {user: _user, pw: _password}).then((response)=> {
                if (response.status) {
                    resolve();
                } else {
                    assert(false, 'Fail Auth');
                }
            });
        });
    });

    lib.log = (project_path)=> {
        var socket = io(_host);

        let handler = {};
        handler._events = {};

        handler.on = (name, fn)=> {
            handler._events[name] = fn;
            return handler;
        };

        handler.close = ()=> {
            socket.close();
        };

        socket.on('message', (message)=> {
            if (handler._events.data)
                handler._events.data(message);

            if (message.channel === 'status' && message.data !== 'running') {
                socket.close();
            }
        });

        socket.send({channel: 'log', name: project_path});
        return handler;
    };

    lib.run = (project_path, target, src)=> new Promise((resolve)=> {
        if (!src) src = {};
        let params = {runpath: project_path, target: target, lib: src.lib, scripts: src.scripts, config: src.config};
        signin()
            .then(()=> httpHandler.post(`${_host}/api/script/run`, params))
            .then(resolve);
    });

    lib.status = ()=> new Promise((resolve)=> {
        signin()
            .then(()=> httpHandler.get(`${_host}/api/script/running`))
            .then(resolve);
    });

    lib.stop = (project_path)=> new Promise((resolve)=> {
        signin()
            .then(()=> httpHandler.get(`${_host}/api/script/stop?runpath=${project_path}`))
            .then(resolve);
    });

    lib.disconnect = ()=> new Promise((resolve)=> {
        httpHandler.get(`${_host}/api/user/signout`)
            .then(resolve);
    });

    return lib;
};