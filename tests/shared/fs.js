import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {it} from 'node:test';

/**
 * @param {string} cacheDir
 */
export const removeCacheFolder = cacheDir => {
    it('should remove fs cache dir if exist', async () => {
        try {
            await fs.rm(cacheDir, {recursive: true, force: true});
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
    });
};

/**
 * @param {string} cacheDir
 * @param {string} cacheFileName
 * @param {string} cacheFileSeparator
 * @param {string} cacheFileNewline
 * @param {object} response
 */
export const checkCacheFile = (cacheDir, cacheFileName, cacheFileSeparator, cacheFileNewline, response) => {
    it('should have cache file', async () => {
        const data = await fs.readFile(path.join(cacheDir, cacheFileName), {encoding: 'utf8'});

        assert.equal(data, Object.values(response).join(cacheFileSeparator) + cacheFileNewline);
    });
};
