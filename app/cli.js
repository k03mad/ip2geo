#!/usr/bin/env node

import os from 'node:os';
import path from 'node:path';

import {codeText, errorText, nameText} from './helpers/colors.js';
import {log, throwError} from './helpers/logging.js';

import {ip2geo} from './index.js';

const jsonParam = '--json';

let args = process.argv.slice(2);

if (args.length === 0) {
    const prefix = codeText('$');
    const name = nameText('ip2geo');

    throwError([
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
    const output = await ip2geo(arg, {
        cacheDir: path.join(os.tmpdir(), '.ip2geo'),
    });

    if (json) {
        return log(JSON.stringify(output));
    }

    log(output);
}));
