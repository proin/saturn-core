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

            return httpHandler.post(`${_host}/api/user/signin`, {user: _user, pw: _password});
        }).then((response)=> {
            if (response.status) {
                resolve();
            } else {
                assert(false, 'Fail Auth');
            }
        });
    });

    lib.run = (runpath, target, src)=> new Promise((resolve)=> {
        if (!src) src = {};
        signin()
            .then(()=> httpHandler.post(`${_host}/api/script/run`, {runpath: runpath, target: target, lib: src.lib, scripts: src.scripts}))
            .then(()=> resolve);
    });

    lib.stop = (runpath)=> new Promise((resolve)=> {
        signin()
            .then(()=> httpHandler.get(`${_host}/api/script/stop?runpath=${runpath}`))
            .then(()=> resolve);
    });

    lib.disconnect = ()=> new Promise((resolve)=> {
        httpHandler.post(`${_host}/api/user/signout`)
            .then(resolve);
    });

    return lib;
};