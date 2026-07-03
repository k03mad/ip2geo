import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {cacheStorage, ip2geo} from '../app/api.ts';

import {getCurrentFilename, getTestFolder} from './helpers/path.ts';
import {REQUEST_IPV4_MAP_OFF_ONLY} from './shared/consts.ts';
import {checkCacheFile, removeCacheFolder} from './shared/fs.ts';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
  const opts = {
    cacheDir: getTestFolder(testName),
    cacheMapMaxEntries: 0,
  };

  it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

  it(`should return correct response for IP: "${REQUEST_IPV4_MAP_OFF_ONLY.ip}"`, async () => {
    const data = await ip2geo({ip: REQUEST_IPV4_MAP_OFF_ONLY.ip ?? '', ...opts});
    assert.deepEqual(data, REQUEST_IPV4_MAP_OFF_ONLY);
  });

  it('should have cache file', () =>
    checkCacheFile({
      ...opts,
      response: REQUEST_IPV4_MAP_OFF_ONLY,
    }));

  it('should not have cache entries', () => {
    assert.equal(cacheStorage.size, 0);
  });
});
