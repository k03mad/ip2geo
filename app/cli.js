#!/usr/bin/env node

import {log, logErrorExit} from '@k03mad/simple-log';

import {codeText, errorText, nameText} from './helpers/colors.js';

import {ip2geo} from './index.js';

const jsonParam = '--json';

let args = process.argv.slice(2);

if (args.length === 0) {
    const prefix = codeText('$');
    const name = nameText('ip2geo');

    logErrorExit([
        errorText('IP(s) should be passed as args'),
        '',
        `${prefix} ${name} 1.1.1.1`,
        `${prefix} ${name} 1.1.1.1 8.8.8.8`,
    ]);
}

let json;

if (args.includes(jsonParam)) {
    json = true;
    args = args.filter(elem => elem !== jsonParam);
}

await Promise.all(args.map(async arg => {
    const output = await ip2geo(arg);

    if (json) {
        return log(JSON.stringify(output));
    }

    log(output);
}));
