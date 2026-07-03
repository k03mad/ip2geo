import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';

import {ip2geo} from '../app/api.ts';
import type {ReqOutput} from '../app/types.ts';

import {getCurrentFilename, getTestFolder} from './helpers/path.ts';
import {REQUEST_IPV4} from './shared/consts.ts';
import {checkCacheFile, removeCacheFolder} from './shared/fs.ts';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
  const SUBFOLDERS = 5;

  const opts = {
    cacheDir: getTestFolder(path.join(...Array.from({length: SUBFOLDERS}, () => testName))),
    cacheMap: new Map<string, ReqOutput>(),
  };

  it('should remove fs cache dir if exist', () => removeCacheFolder(opts.cacheDir));

  it(`should return correct response for IP: "${REQUEST_IPV4.ip}"`, async () => {
    const data = await ip2geo({ip: REQUEST_IPV4.ip ?? '', ...opts});
    assert.deepEqual(data, REQUEST_IPV4);
  });

  it('should have cache file', () =>
    checkCacheFile({
      ...opts,
      response: REQUEST_IPV4,
    }));
});
