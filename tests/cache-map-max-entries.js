import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {ip2geo} from '../app/api.js';

import {getCurrentFilename, getTestFolder} from './helpers/path.js';
import {removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const firstReqIps = ['10.10.10.10', '20.20.20.20', '30.30.30.30', '40.40.40.40', '50.50.50.50'];

    const secondReqIps = ['60.60.60.60'];

    const opts = {
        cacheDir: getTestFolder(testName),
        cacheMap: new Map(),
        cacheMapMaxEntries: 2,
    };

    it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

    firstReqIps.forEach(ip => {
        it(`should request geo for IP: "${ip}"`, async () => {
            await ip2geo({ip, ...opts});
        });
    });

    it(`should have ${opts.cacheMapMaxEntries} correct cache entries`, () => {
        assert.equal(opts.cacheMap.size, opts.cacheMapMaxEntries);
        assert.deepEqual([...opts.cacheMap.keys()], firstReqIps.slice(-opts.cacheMapMaxEntries));
    });

    secondReqIps.forEach(ip => {
        it(`should request geo for IP: "${ip}"`, async () => {
            await ip2geo({ip, ...opts});
        });
    });

    it(`should have ${opts.cacheMapMaxEntries} correct cache entries`, () => {
        assert.equal(opts.cacheMap.size, opts.cacheMapMaxEntries);

        assert.deepEqual(
            [...opts.cacheMap.keys()],
            [firstReqIps, secondReqIps].flat().slice(-opts.cacheMapMaxEntries),
        );
    });
});
