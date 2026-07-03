import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {ip2geo} from '../app/api.ts';
import type {ReqOutput} from '../app/types.ts';

import {getCurrentFilename, getTestFolder} from './helpers/path.ts';
import {REQUEST_IPV4} from './shared/consts.ts';
import {removeCacheFolder} from './shared/fs.ts';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
  const responses = ['10.10.10.10', '192.168.1.100'];

  const opts = {
    cacheDir: getTestFolder(testName),
    cacheMap: new Map<string, ReqOutput>(),
  };

  it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

  responses.forEach(ip => {
    const expectedResponse = Object.fromEntries(
      Object.keys(REQUEST_IPV4).map(key => [key, key === 'ip' ? ip : '']),
    ) as ReqOutput;

    it(`should return empty response for IP: "${ip}"`, async () => {
      const data = await ip2geo({ip, ...opts});
      assert.deepEqual(data, expectedResponse);
    });
  });
});
