import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {cacheStorage, ip2geo} from '../app/index.js';

import {getCurrentFilename} from './helpers/path.js';
import {REQUEST_IPV4} from './shared/consts.js';
import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    it('should remove fs cache dir if exist', () => removeCacheFolder());

    describe('with ip arg', () => {
        it(`should return correct response for IP: "${REQUEST_IPV4.ip}"`, async () => {
            const data = await ip2geo({ip: REQUEST_IPV4.ip});
            assert.deepEqual(data, REQUEST_IPV4);
        });

        it('should have cache file', () => checkCacheFile({
            response: REQUEST_IPV4,
        }));

        it('should have 1 correct cache entry', () => {
            assert.equal(cacheStorage.size, 1);
            assert.deepEqual(cacheStorage.get(REQUEST_IPV4.ip), REQUEST_IPV4);
        });
    });

    describe('without ip arg', () => {
        let data;

        it('should request geoip without ip arg', async () => {
            data = await ip2geo();
        });

        Object.keys(REQUEST_IPV4).forEach(key => {
            it(`should have "${key}" in request response`, () => {
                assert.ok(data[key]);
            });
        });

        it('should not have extra keys in request response', () => {
            assert.deepEqual(Object.keys(data), Object.keys(REQUEST_IPV4));
        });

        it('should have 2 cache entries', () => {
            assert.equal(cacheStorage.size, 2);
            assert.deepEqual(cacheStorage.get(REQUEST_IPV4.ip), REQUEST_IPV4);
        });
    });
});
