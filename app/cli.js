#!/usr/bin/env node

import {log, logErrorExit} from '@k03mad/simple-log';

import {DEFAULT_CACHE_FILE_DIR, DEFAULT_CACHE_FILE_NEWLINE, DEFAULT_CACHE_FILE_SEPARATOR, ip2geo} from './api.js';
import {pruneCache} from './helpers/cache.js';
import {codeText, nameText} from './helpers/colors.js';

const args = process.argv.slice(2);
const argsExtra = args.filter(arg => !arg.startsWith('-'));

const isHelp = args.includes('-h') || args.includes('--help');
const isPrune = args.includes('-p') || args.includes('--prune');

if (isHelp) {
    const cmd = `${codeText('$')} ${nameText('ip2geo')}`;

    log([
        '',
        codeText('# current external ip'),
        cmd,
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
        codeText('# remove duplicate cache entries'),
        `${cmd} -p`,
        `${cmd} --prune`,
    ]);

    process.exit(0);
}

if (isPrune) {
    const cacheFolder = argsExtra[0] || DEFAULT_CACHE_FILE_DIR;

    try {
        const {removedEntries} = await pruneCache(
            cacheFolder,
            DEFAULT_CACHE_FILE_SEPARATOR,
            DEFAULT_CACHE_FILE_NEWLINE,
        );

        log(`Removed duplicate cache entries: ${removedEntries}`);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            logErrorExit(err);
        }

        log(`Cache folder empty: ${cacheFolder}`);
    }
} else {
    const output = argsExtra.length === 0
        ? [await ip2geo()]
        : await Promise.all(argsExtra.map(arg => Promise.all(arg.split(',').map(ip => ip2geo({ip})))));

    const flatten = output.flat();

    if (args.includes('--json') || args.includes('-j')) {
        log(JSON.stringify(flatten.length > 1 ? flatten : flatten[0]));
    } else {
        log(flatten);
    }
}
