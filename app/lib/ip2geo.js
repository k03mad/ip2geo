import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {request} from '@k03mad/request';
import _debug from 'debug';

const debug = _debug('mad:geoip');

/**
 * @typedef {object} GeoIpOutput
 * @property {string} [ip]
 * @property {string} [emoji]
 * @property {string} [country]
 * @property {string} [countryA2]
 * @property {string} [city]
 * @property {string} [region]
 * @property {string} [org]
 * @property {string} [isp]
 * @property {string} [ispDomain]
 */

const API = 'https://ipwho.is/';

const DEFAULT_CACHE_FILE_DIR = path.join(os.tmpdir(), '.ip2geo');
const DEFAULT_CACHE_FILE_NAME = 'ips.log';
const DEFAULT_CACHE_FILE_SEPARATOR = ';;';
const DEFAULT_CACHE_FILE_NEWLINE = '\n';
const DEFAULT_CACHE_MAP_MAX_ENTRIES = Number.POSITIVE_INFINITY;
const DEFAULT_RPS = 3;

export const cacheStorage = new Map();

const outputKeys = [
    'ip',
    'emoji',
    'country',
    'countryA2',
    'region',
    'city',
    'org',
    'isp',
    'ispDomain',
];

/**
 * @param {Array<string>} dataArr
 * @returns {GeoIpOutput}
 */
const collectOutputData = dataArr => {
    const outputData = {};

    outputKeys.forEach((key, i) => {
        outputData[key] = dataArr[i];
    });

    return outputData;
};

/**
 * @param {string} ip
 * @param {string} cacheDir
 * @param {string} cacheFileName
 * @returns {string}
 */
const getCacheFileFullPath = (ip, cacheDir, cacheFileName) => {
    const [firstOctet] = ip.split(/\.|:/);
    return path.join(cacheDir, `${firstOctet}_${cacheFileName}`);
};

/**
 * @param {string} ip
 * @param {string} cacheDir
 * @param {string} cacheFileName
 * @returns {Promise<string>}
 */
const readFromFsCache = async (ip, cacheDir, cacheFileName) => {
    try {
        await fs.mkdir(cacheDir, {recursive: true});
        return await fs.readFile(getCacheFileFullPath(ip, cacheDir, cacheFileName), {encoding: 'utf8'});
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.appendFile(getCacheFileFullPath(ip, cacheDir, cacheFileName), '');
        } else {
            throw err;
        }
    }
};

/**
 * @param {string} ip
 * @param {Array[string]} data
 * @param {string} cacheDir
 * @param {string} cacheFileName
 * @param {string} cacheFileSeparator
 * @param {string} cacheFileNewline
 * @returns {Promise<void>}
 */
const writeToFsCache = async (ip, data, cacheDir, cacheFileName, cacheFileSeparator, cacheFileNewline) => {
    await fs.mkdir(cacheDir, {recursive: true});

    await fs.appendFile(
        getCacheFileFullPath(ip, cacheDir, cacheFileName),
        data.join(cacheFileSeparator) + cacheFileNewline,
    );
};

/**
 * @param {string} [ip]
 * @param {object} [opts]
 * @param {string} [opts.cacheDir]
 * @param {string} [opts.cacheFileName]
 * @param {string} [opts.cacheFileSeparator]
 * @param {string} [opts.cacheFileNewline]
 * @param {Map|false} [opts.cacheMap]
 * @param {number} [opts.cacheMapMaxEntries]
 * @param {number} [opts.rps]
 * @returns {Promise<GeoIpOutput>}
 */
export const ip2geo = async (ip = '', {
    cacheDir = DEFAULT_CACHE_FILE_DIR,
    cacheFileName = DEFAULT_CACHE_FILE_NAME,
    cacheFileSeparator = DEFAULT_CACHE_FILE_SEPARATOR,
    cacheFileNewline = DEFAULT_CACHE_FILE_NEWLINE,
    cacheMapMaxEntries = DEFAULT_CACHE_MAP_MAX_ENTRIES,
    cacheMap = cacheStorage,
    rps = DEFAULT_RPS,
} = {}) => {
    if (ip) {
        if (cacheMapMaxEntries > 0) {
            const ipData = cacheMap.get(ip);

            if (ipData) {
                debug('get from map cache: %o', ipData);
                return ipData;
            }
        }

        const fsCache = await readFromFsCache(ip, cacheDir, cacheFileName);

        if (fsCache) {
            const data = fsCache.split(cacheFileNewline);

            for (const elem of data) {
                const fileData = elem.split(cacheFileSeparator);

                if (ip === fileData[0]) {
                    const outputData = collectOutputData(fileData);
                    debug('get from fs cache: %o', outputData);

                    if (cacheMapMaxEntries > 0) {
                        cacheMap.set(ip, outputData);
                        debug('set to map cache: %o', outputData);
                    }

                    return outputData;
                }
            }
        }
    }

    const {body} = await request(API + ip, {}, {rps});

    if (!body?.ip) {
        throw new Error(`API error:\n${body}`);
    }

    const usedData = [
        body.ip,
        body?.flag?.emoji,
        body?.country,
        body?.country_code,
        body?.region,
        body?.city,
        body?.connection?.org,
        body?.connection?.isp,
        body?.connection?.domain,
    ];

    const outputData = collectOutputData(usedData);

    if (cacheMapMaxEntries > 0) {
        cacheMap.set(body.ip, outputData);
        debug('set to map cache: %o', outputData);
    }

    await writeToFsCache(
        body.ip, usedData,
        cacheDir, cacheFileName, cacheFileSeparator, cacheFileNewline,
    );

    debug('set to fs cache: %o', outputData);

    if (cacheMap.size > cacheMapMaxEntries) {
        debug('remove from map cache by limit: size %o, limit: %o', cacheMap.size, cacheMapMaxEntries);

        for (const [key] of cacheMap) {
            debug('remove from map cache by limit: key %o', key);
            cacheMap.delete(key);

            if (cacheMap.size <= cacheMapMaxEntries) {
                break;
            }
        }
    }

    return outputData;
};
