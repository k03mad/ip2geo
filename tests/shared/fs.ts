import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  DEFAULT_CACHE_FILE_DIR,
  DEFAULT_CACHE_FILE_NAME,
  DEFAULT_CACHE_FILE_NEWLINE,
  DEFAULT_CACHE_FILE_SEPARATOR,
} from '../../app/api.ts';
import type {ReqOutput} from '../../app/types.ts';

interface CheckCacheFileOpts {
  cacheDir?: string;
  cacheFileName?: string;
  cacheFileSeparator?: string;
  cacheFileNewline?: string;
  response: ReqOutput;
}

export const removeCacheFolder = async (
  cacheDir: string = DEFAULT_CACHE_FILE_DIR,
): Promise<void> => {
  try {
    await fs.rm(cacheDir, {recursive: true, force: true});
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }
};

export const checkCacheFile = async ({
  cacheDir = DEFAULT_CACHE_FILE_DIR,
  cacheFileName = DEFAULT_CACHE_FILE_NAME,
  cacheFileSeparator = DEFAULT_CACHE_FILE_SEPARATOR,
  cacheFileNewline = DEFAULT_CACHE_FILE_NEWLINE,
  response,
}: CheckCacheFileOpts): Promise<void> => {
  const cacheFile = `${response.ip?.split(/[.:]/)[0] ?? ''}_${cacheFileName}`;
  const data = await fs.readFile(path.join(cacheDir, cacheFile), {encoding: 'utf8'});

  assert.equal(data, cacheFileNewline + Object.values(response).join(cacheFileSeparator));
};
