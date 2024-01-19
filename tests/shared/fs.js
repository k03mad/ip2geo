import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {DEFAULT_OPTS} from '../helpers/consts.js';

/**
 * @param {string} cacheDir
 */
export const removeCacheFolder = async (cacheDir = DEFAULT_OPTS.cacheDir) => {
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
    cacheDir = DEFAULT_OPTS.cacheDir,
    cacheFileName = DEFAULT_OPTS.cacheFileName,
    cacheFileSeparator = DEFAULT_OPTS.cacheFileSeparator,
    cacheFileNewline = DEFAULT_OPTS.cacheFileNewline,
    response,
}) => {
    const cacheFile = `${response.ip.split(/\.|:/)[0]}_${cacheFileName}`;
    const data = await fs.readFile(path.join(cacheDir, cacheFile), {encoding: 'utf8'});

    assert.equal(data, Object.values(response).join(cacheFileSeparator) + cacheFileNewline);
};
