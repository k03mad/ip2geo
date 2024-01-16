import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {string} cacheDir
 */
export const removeCacheFolder = async cacheDir => {
    try {
        await fs.rm(cacheDir, {recursive: true, force: true});
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
};

/**
 * @param {string} cacheDir
 * @param {string} cacheFileName
 * @param {string} cacheFileSeparator
 * @param {string} cacheFileNewline
 * @param {object} response
 */
export const checkCacheFile = async (cacheDir, cacheFileName, cacheFileSeparator, cacheFileNewline, response) => {
    const data = await fs.readFile(path.join(cacheDir, cacheFileName), {encoding: 'utf8'});

    assert.equal(data, Object.values(response).join(cacheFileSeparator) + cacheFileNewline);
};
