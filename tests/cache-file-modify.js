import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {ip2geo} from '../app/index.js';

import {getCurrentFilename, getTestFolder} from './helpers/path.js';
import {REQUEST_IPV4} from './shared/consts.js';
import {checkCacheFile, removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const opts = {
        cacheDir: getTestFolder(testName),
        cacheFileName: 'ips.md',
        cacheFileSeparator: '-_-',
        cacheFileNewline: '%%%',
        cacheMap: new Map(),
    };

    it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

    it(`should return correct response for IP: "${REQUEST_IPV4.ip}"`, async () => {
        const data = await ip2geo({ip: REQUEST_IPV4.ip, ...opts});
        assert.deepEqual(data, REQUEST_IPV4);
    });

    it('should have cache file', () => checkCacheFile({
        ...opts,
        response: REQUEST_IPV4,
    }));
});
