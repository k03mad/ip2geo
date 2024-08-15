import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
    DEFAULT_CACHE_FILE_DIR,
    DEFAULT_CACHE_FILE_NAME,
    DEFAULT_CACHE_FILE_NEWLINE,
    DEFAULT_CACHE_FILE_SEPARATOR,
} from '../../app/api.js';

/**
 * @param {string} cacheDir
 */
export const removeCacheFolder = async (cacheDir = DEFAULT_CACHE_FILE_DIR) => {
    try {
        await fs.rm(cacheDir, {recursive: true, force: true});
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
};

/**
 * @param {object} opts
 * @param {string} opts.cacheDir
 * @param {string} opts.cacheFileName
 * @param {string} opts.cacheFileSeparator
 * @param {string} opts.cacheFileNewline
 * @param {object} opts.response
 */
export const checkCacheFile = async ({
    cacheDir = DEFAULT_CACHE_FILE_DIR,
    cacheFileName = DEFAULT_CACHE_FILE_NAME,
    cacheFileSeparator = DEFAULT_CACHE_FILE_SEPARATOR,
    cacheFileNewline = DEFAULT_CACHE_FILE_NEWLINE,
    response,
}) => {
    const cacheFile = `${response.ip.split(/\.|:/)[0]}_${cacheFileName}`;
    const data = await fs.readFile(path.join(cacheDir, cacheFile), {encoding: 'utf8'});

    assert.equal(data, cacheFileNewline + Object.values(response).join(cacheFileSeparator));
};
