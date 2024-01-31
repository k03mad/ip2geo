#!/usr/bin/env node

import {log} from '@k03mad/simple-log';

import {codeText, nameText} from './helpers/colors.js';

import {ip2geo} from './index.js';

const args = process.argv.slice(2);
const argsIps = args.filter(arg => !arg.startsWith('-'));

if (args.includes('-h') || args.includes('--help')) {
    const cmd = `${codeText('$')} ${nameText('ip2geo')}`;

    log([
        '',
        `${cmd} ${codeText('# current external ip')}`,
        `${cmd} 1.1.1.1`,
        '',
        `${cmd} -h`,
        `${cmd} --help`,
        '',
        `${cmd} 1.1.1.1 -j`,
        `${cmd} 1.1.1.1 --json`,
        '',
        `${cmd} 1.1.1.1 8.8.8.8`,
        `${cmd} 1.1.1.1,8.8.8.8`,
        '',
    ]);

    process.exit(0);
}

const output = argsIps.length === 0
    ? [await ip2geo()]
    : await Promise.all(argsIps.map(arg => Promise.all(arg.split(',').map(ip => ip2geo({ip})))));

const flatten = output.flat();

if (args.includes('--json') || args.includes('-j')) {
    log(JSON.stringify(flatten.length > 1 ? flatten : flatten[0]));
} else {
    log(flatten);
}
