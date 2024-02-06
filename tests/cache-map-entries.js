import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {ip2geo} from '../app/index.js';

import {getCurrentFilename, getTestFolder} from './helpers/path.js';
import {REQUEST_IPV4, REQUEST_IPV6} from './shared/consts.js';
import {removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const opts = {
        cacheDir: getTestFolder(testName),
        cacheMap: new Map(),
    };

    it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

    it(`should return correct response for IP: "${REQUEST_IPV4.ip}"`, async () => {
        const data = await ip2geo({ip: REQUEST_IPV4.ip, ...opts});
        assert.deepEqual(data, REQUEST_IPV4);
    });

    it('should have 1 correct cache entry', () => {
        assert.equal(opts.cacheMap.size, 1);
        assert.deepEqual(opts.cacheMap.get(REQUEST_IPV4.ip), REQUEST_IPV4);
    });

    it(`should return correct response for IP: "${REQUEST_IPV6.ip}"`, async () => {
        const data = await ip2geo({ip: REQUEST_IPV6.ip, ...opts});
        assert.deepEqual(data, REQUEST_IPV6);
    });

    it('should have 2 correct cache entries', () => {
        assert.equal(opts.cacheMap.size, 2);
        assert.deepEqual(opts.cacheMap.get(REQUEST_IPV4.ip), REQUEST_IPV4);
        assert.deepEqual(opts.cacheMap.get(REQUEST_IPV6.ip), REQUEST_IPV6);
    });
});
