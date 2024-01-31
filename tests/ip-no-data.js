import assert from 'node:assert/strict';

import {describe, it} from 'mocha';

import {ip2geo} from '../app/index.js';

import {REQUEST_IPV4} from './helpers/consts.js';
import {getCurrentFilename, getTestFolder} from './helpers/path.js';
import {removeCacheFolder} from './shared/fs.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const responses = [
        {ip: '10.10.10.10'},
        {ip: 'test'},
    ];

    const opts = {
        cacheDir: getTestFolder(testName),
        cacheMap: new Map(),
    };

    it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

    responses.forEach(response => {
        Object.keys(REQUEST_IPV4).forEach(elem => {
            if (elem !== 'ip') {
                response[elem] = undefined;
            }
        });

        it(`should return empty response for IP: "${response.ip}"`, async () => {
            const data = await ip2geo({ip: response.ip, ...opts});
            assert.deepEqual(data, response);
        });
    });
});
