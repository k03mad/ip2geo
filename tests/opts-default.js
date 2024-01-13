import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {ip2geo} from '../app/index.js';

import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

describe('opts-default', () => {
    const CACHE_FILE_DIR = 'geoip';
    const CACHE_FILE_NAME = 'ip.log';
    const CACHE_FILE_SEPARATOR = ';;';
    const CACHE_FILE_NEWLINE = '\n';

    const REQUEST_IP = '1.1.1.1';

    const cacheFile = `${REQUEST_IP.split('.')[0]}_${CACHE_FILE_NAME}`;

    const response = {
        ip: REQUEST_IP,
        emoji: '🇺🇸',
        country: 'United States',
        countryA2: 'US',
        city: 'Washington',
        isp: 'Cloudflare, Inc.',
    };

    const outputKeys = [
        'ip',
        'emoji',
        'country',
        'countryA2',
        'city',
        'isp',
    ];

    removeCacheFolder(CACHE_FILE_DIR);

    describe('with ip arg', () => {
        it(`should return correct response for IP: "${REQUEST_IP}"`, async () => {
            const data = await ip2geo(REQUEST_IP);

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

    describe('without ip arg', () => {
        let data;

        it('should request geoip without ip arg', async () => {
            data = await ip2geo();
        });

        outputKeys.forEach(key => {
            it(`should have "${key}" in request response`, () => {
                assert.ok(data[key]);
            });
        });
    });
});
