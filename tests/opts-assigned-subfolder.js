import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';

import {ip2geo} from '../app/index.js';

import {getCurrentFilename} from './helpers/path.js';
import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);
const SUBFOLDERS = 5;

describe(testName, () => {
    const CACHE_FILE_DIR = path.join(
        ...Array.from({length: SUBFOLDERS}, () => testName),
    );

    const CACHE_FILE_NAME = 'ips.log';
    const CACHE_FILE_SEPARATOR = ';;';
    const CACHE_FILE_NEWLINE = '\n';

    const REQUEST_IP = '9.9.9.9';

    const cacheFile = `${REQUEST_IP.split(/\.|:/)[0]}_${CACHE_FILE_NAME}`;

    const response = {
        ip: REQUEST_IP,
        emoji: '🇨🇭',
        country: 'Switzerland',
        countryA2: 'CH',
        region: 'Zurich',
        city: 'Zürich',
        org: 'Quad9',
        isp: 'Quad9',
        ispDomain: 'quad9.net',
    };

    removeCacheFolder(CACHE_FILE_DIR);

    it(`should return correct response for IP: "${REQUEST_IP}"`, async () => {
        const data = await ip2geo(REQUEST_IP, {
            cacheDir: CACHE_FILE_DIR,
        });

        assert.deepEqual(data, response);
    });

    checkCacheFile(
        CACHE_FILE_DIR,
        cacheFile,
        CACHE_FILE_SEPARATOR,
        CACHE_FILE_NEWLINE,
        response,
    );
});
