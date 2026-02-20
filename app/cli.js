#!/usr/bin/env node

import chalk from 'chalk';

import {
    DEFAULT_CACHE_FILE_DIR,
    DEFAULT_CACHE_FILE_NEWLINE,
    DEFAULT_CACHE_FILE_SEPARATOR,
    ip2geo,
} from './api.js';
import {pruneCache} from './helpers/cache.js';
import {codeText, nameText} from './helpers/colors.js';

const {blue, red, green, dim, bold} = chalk;

const args = process.argv.slice(2);
const argsExtra = args.filter(arg => !arg.startsWith('-'));

const isHelp = args.includes('-h') || args.includes('--help');
const isPrune = args.includes('-p') || args.includes('--prune');

if (isHelp) {
    const cmd = `${codeText('$')} ${nameText('ip2geo')}`;

    console.log(
        [
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
        ].join('\n'),
    );

    process.exit(0);
}

if (isPrune) {
    const cacheFolder = argsExtra[0] || DEFAULT_CACHE_FILE_DIR;
    console.log(blue(cacheFolder));

    try {
        const {different, duplicates, empty, entries, longLinesFiles} = await pruneCache(
            cacheFolder,
            DEFAULT_CACHE_FILE_SEPARATOR,
            DEFAULT_CACHE_FILE_NEWLINE,
        );

        console.log(
            [
                '',
                green(`Removed duplicate cache entries: ${bold(duplicates.length)}`),
                ...duplicates.map(elem => dim(`— ${elem}`)),
                green(`Removed different cache entries: ${bold(different.length)}`),
                ...different.map(elem => dim(`— ${elem}`)),
                green(`Removed empty cache entries: ${bold(empty.length)}`),
                ...empty.map(elem => dim(`— ${elem}`)),
            ].join('\n'),
        );

        if (longLinesFiles.length > 0) {
            console.log(
                [
                    red(
                        `Required manual check, some cache files has too long lines: ${bold(longLinesFiles.length)}`,
                    ),
                    ...longLinesFiles.map(({file, elem}) => dim(`— ${file}\n|— ${elem}`)),
                ].join('\n'),
            );
        }

        console.log(['', green(`Current cache entries: ${bold(entries)}`)].join('\n'));
    } catch (err) {
        console.error(red(err));
        process.exit(1);
    }
} else {
    const output =
        argsExtra.length === 0
            ? [await ip2geo()]
            : await Promise.all(
                  argsExtra.map(arg => Promise.all(arg.split(',').map(ip => ip2geo({ip})))),
              );

    const flatten = output.flat();

    if (args.includes('--json') || args.includes('-j')) {
        console.log(JSON.stringify(flatten.length > 1 ? flatten : flatten[0]));
    } else {
        flatten.forEach(elem => console.log(elem));
    }
}
