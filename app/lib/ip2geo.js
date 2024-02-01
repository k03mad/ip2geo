import os from 'node:os';
import path from 'node:path';

import {request} from '@k03mad/request';
import {logErrorExit} from '@k03mad/simple-log';

import {
    collectOutputData,
    readFromFsCache,
    readFromMapCache,
    removeFromMapCacheIfLimit,
    writeToFsCache,
    writeToMapCache,
} from '../helpers/cache.js';

const API = 'https://ipwho.is/';

export const DEFAULT_CACHE_FILE_DIR = path.join(os.tmpdir(), '.ip2geo-cache');
export const DEFAULT_CACHE_FILE_NAME = 'ip.log';
export const DEFAULT_CACHE_FILE_SEPARATOR = ';;';
export const DEFAULT_CACHE_FILE_NEWLINE = '\n';
export const DEFAULT_CACHE_MAP_MAX_ENTRIES = Number.POSITIVE_INFINITY;
export const DEFAULT_RPS = 3;

export const cacheStorage = new Map();

/**
 * @typedef {object} ReqInput
 * @property {object} [opts]
 * @property {object} [opts.ip]
 * @property {string} [opts.cacheDir]
 * @property {string} [opts.cacheFileName]
 * @property {string} [opts.cacheFileSeparator]
 * @property {string} [opts.cacheFileNewline]
 * @property {Map} [opts.cacheMap]
 * @property {number} [opts.cacheMapMaxEntries]
 * @property {number} [opts.rps]
 */

/**
 * @typedef {object} ReqOutput
 * @property {string} [ip]
 * @property {string} [continent]
 * @property {string} [continentCode]
 * @property {string} [country]
 * @property {string} [countryCode]
 * @property {string} [countryEmoji]
 * @property {string} [region]
 * @property {string} [regionCode]
 * @property {string} [city]
 * @property {string} [connectionAsn]
 * @property {string} [connectionOrg]
 * @property {string} [connectionIsp]
 * @property {string} [connectionDomain]
 */

/**
 * @param {ReqInput} opts
 * @returns {Promise<ReqOutput>}
 */
export const ip2geo = async ({
    ip = '',
    cacheDir = DEFAULT_CACHE_FILE_DIR,
    cacheFileName = DEFAULT_CACHE_FILE_NAME,
    cacheFileSeparator = DEFAULT_CACHE_FILE_SEPARATOR,
    cacheFileNewline = DEFAULT_CACHE_FILE_NEWLINE,
    cacheMapMaxEntries = DEFAULT_CACHE_MAP_MAX_ENTRIES,
    cacheMap = cacheStorage,
    rps = DEFAULT_RPS,
} = {}) => {
    if (ip) {
        const mapCache = readFromMapCache(ip, cacheMap, cacheMapMaxEntries);

        if (mapCache) {
            return mapCache;
        }

        const fsCache = await readFromFsCache(
            ip,
            cacheDir, cacheFileName,
            cacheFileSeparator, cacheFileNewline,
        );

        if (fsCache) {
            writeToMapCache(fsCache, cacheMap, cacheMapMaxEntries);
            return fsCache;
        }
    }

    const reqUrl = API + ip;
    const {body} = await request(reqUrl, {}, {rps});

    if (!body?.ip) {
        logErrorExit(['API error', `request: ${reqUrl}`, `response body: ${body}`]);
    }

    const outputData = collectOutputData([
        body.ip,
        body?.continent,
        body?.continent_code,
        body?.country,
        body?.country_code,
        body?.flag?.emoji,
        body?.region,
        body?.region_code,
        body?.city,
        body?.connection?.asn,
        body?.connection?.org,
        body?.connection?.isp,
        body?.connection?.domain,
    ]);

    writeToMapCache(outputData, cacheMap, cacheMapMaxEntries);
    removeFromMapCacheIfLimit(cacheMap, cacheMapMaxEntries);

    await writeToFsCache(
        body.ip, outputData,
        cacheDir, cacheFileName,
        cacheFileSeparator, cacheFileNewline,
    );

    return outputData;
};
