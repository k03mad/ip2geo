import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {ip2geo} from '../app/index.js';

import {getCurrentFilename, getTestFolder} from './helpers/path.js';
import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const CACHE_FILE_DIR = getTestFolder(testName);
    const CACHE_FILE_NAME = 'ips.log';
    const CACHE_FILE_SEPARATOR = ';;';
    const CACHE_FILE_NEWLINE = '\n';

    const REQUEST_IP = '2a00:dd80:40:100::';

    const cacheFile = `${REQUEST_IP.split(/\.|:/)[0]}_${CACHE_FILE_NAME}`;

    const response = {
        ip: REQUEST_IP,
        emoji: '🇳🇱',
        country: 'Netherlands',
        countryA2: 'NL',
        region: 'North Holland',
        city: 'Amsterdam',
        org: '',
        isp: 'NetActuate Inc',
        ispDomain: '',
    };

    it('should remove fs cache dir if exist', () => removeCacheFolder(CACHE_FILE_DIR));

    it(`should return correct response for IP: "${REQUEST_IP}"`, async () => {
        const data = await ip2geo(REQUEST_IP, {
            cacheDir: CACHE_FILE_DIR,
        });

        assert.deepEqual(data, response);
    });

    it('should have cache file', () => checkCacheFile(
        CACHE_FILE_DIR,
        cacheFile,
        CACHE_FILE_SEPARATOR,
        CACHE_FILE_NEWLINE,
        response,
    ));
});
