import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {cacheStorage, ip2geo} from '../app/index.js';

import {REQUEST_IPV4} from './helpers/consts.js';
import {getCurrentFilename, getTestFolder} from './helpers/path.js';
import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const opts = {
        cacheDir: getTestFolder(testName),
        cacheMapMaxEntries: 0,
    };

    it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

    it(`should return correct response for IP: "${REQUEST_IPV4.ip}"`, async () => {
        const data = await ip2geo(REQUEST_IPV4.ip, opts);
        assert.deepEqual(data, REQUEST_IPV4);
    });

    it('should have cache file', () => checkCacheFile({
        response: REQUEST_IPV4,
    }));

    it('should not have cache entries', () => {
        assert.equal(cacheStorage.size, 0);
    });
});
