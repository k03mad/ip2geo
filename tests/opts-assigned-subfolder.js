import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {ip2geo} from '../app/index.js';

import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

describe('opts-assigned', () => {
    const CACHE_FILE_DIR = 'geoip-subfolder/hello_there';
    const CACHE_FILE_NAME = 'ip.log';
    const CACHE_FILE_SEPARATOR = ';;';
    const CACHE_FILE_NEWLINE = '\n';

    const REQUEST_IP = '9.9.9.9';

    const cacheFile = `${REQUEST_IP.split('.')[0]}_${CACHE_FILE_NAME}`;

    const response = {
        ip: REQUEST_IP,
        emoji: '🇨🇭',
        country: 'Switzerland',
        countryA2: 'CH',
        city: 'Zürich',
        isp: 'Quad9',
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
