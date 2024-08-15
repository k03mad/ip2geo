import fs from 'node:fs/promises';
import path from 'node:path';

import _debug from 'debug';

const debug = _debug('mad:geoip');

const outputKeys = [
    'ip',
    'continent',
    'continentCode',
    'country',
    'countryCode',
    'countryEmoji',
    'region',
    'regionCode',
    'city',
    'connectionAsn',
    'connectionOrg',
    'connectionIsp',
    'connectionDomain',
];

/**
 * @param {Array<string>} dataArr
 * @returns {object}
 */
export const collectOutputData = dataArr => {
    const outputData = {};

    outputKeys.forEach((key, i) => {
        outputData[key] = key === 'connectionAsn' && dataArr[i]
            ? Number(dataArr[i])
            : dataArr[i];
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
 * @param {string} cacheFileSeparator
 * @param {string} cacheFileNewline
 * @returns {Promise<object>}
 */
export const readFromFsCache = async (ip, cacheDir, cacheFileName, cacheFileSeparator, cacheFileNewline) => {
    const cacheFileFull = getCacheFileFullPath(ip, cacheDir, cacheFileName);

    try {
        await fs.mkdir(cacheDir, {recursive: true});
        const content = await fs.readFile(cacheFileFull, {encoding: 'utf8'});

        if (content) {
            const data = content.split(cacheFileNewline);

            for (const elem of data) {
                const fileData = elem.split(cacheFileSeparator);

                if (ip === fileData[0]) {
                    const outputData = collectOutputData(fileData);
                    debug('get from fs cache: %o %o', cacheFileFull, outputData);
                    return outputData;
                }
            }
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.appendFile(cacheFileFull, '');
        } else {
            throw err;
        }
    }
};

/**
 * @param {string} ip
 * @param {object} data
 * @param {string} cacheDir
 * @param {string} cacheFileName
 * @param {string} cacheFileSeparator
 * @param {string} cacheFileNewline
 * @returns {Promise<void>}
 */
export const writeToFsCache = async (ip, data, cacheDir, cacheFileName, cacheFileSeparator, cacheFileNewline) => {
    const cacheFileFull = getCacheFileFullPath(ip, cacheDir, cacheFileName);
    debug('set to fs cache: %o %o', cacheFileFull, data);

    await fs.mkdir(cacheDir, {recursive: true});
    await fs.appendFile(cacheFileFull, cacheFileNewline + Object.values(data).join(cacheFileSeparator));
};

/**
 * @param {string} ip
 * @param {Map} cacheMap
 * @param {number} cacheMapMaxEntries
 * @returns {object|undefined}
 */
export const readFromMapCache = (ip, cacheMap, cacheMapMaxEntries) => {
    if (cacheMapMaxEntries > 0) {
        const value = cacheMap.get(ip);

        if (value) {
            debug('get from map cache: %o', value);
            return value;
        }
    }
};

/**
 * @param {Map} cacheMap
 * @param {number} cacheMapMaxEntries
 */
export const removeFromMapCacheIfLimit = (cacheMap, cacheMapMaxEntries) => {
    if (cacheMap.size > cacheMapMaxEntries) {
        debug('remove from map cache by limit: %o > %o', cacheMap.size, cacheMapMaxEntries);

        for (const [key] of cacheMap) {
            debug('remove from map cache by limit: %o', key);
            cacheMap.delete(key);

            if (cacheMap.size <= cacheMapMaxEntries) {
                break;
            }
        }
    }
};

/**
 * @param {object} body
 * @param {string} body.ip
 * @param {Map} cacheMap
 * @param {number} cacheMapMaxEntries
 */
export const writeToMapCache = (body, cacheMap, cacheMapMaxEntries) => {
    if (cacheMapMaxEntries > 0) {
        debug('set to map cache: %o', body);
        cacheMap.set(body.ip, body);

        removeFromMapCacheIfLimit(cacheMap, cacheMapMaxEntries);
    }
};

/**
 * @param {string} cacheDir
 * @param {string} cacheFileSeparator
 * @param {string} cacheFileNewline
 */
export const pruneCache = async (cacheDir, cacheFileSeparator, cacheFileNewline) => {
    const files = await fs.readdir(cacheDir);

    const cacheLineToNum = line => Number(
        line.split(cacheFileSeparator)[0]
            .split('.')
            .map(num => `00${num}`.slice(-3))
            .join(''),
    );

    let duplicates = 0;
    let empty = 0;

    const longLinesFiles = new Set();

    await Promise.all(files.map(async file => {
        const fullFilePath = path.join(cacheDir, file);

        const data = await fs.readFile(fullFilePath, {encoding: 'utf8'});
        const dataArr = data.split(cacheFileNewline).filter(Boolean);

        const dataArrRemoveEmpty = dataArr.filter(elem => {
            const splitted = elem.split(cacheFileSeparator);

            if (splitted.length > outputKeys.length) {
                longLinesFiles.add(fullFilePath);
            }

            return splitted.filter(Boolean).length > 1;
        });

        const uniq = [...new Set(dataArrRemoveEmpty)]
            .sort((a, b) => cacheLineToNum(a) - cacheLineToNum(b));

        const fileContent = uniq.join(cacheFileNewline).trim();
        await (fileContent ? fs.writeFile(fullFilePath, fileContent) : fs.rm(fullFilePath));

        empty += dataArr.length - dataArrRemoveEmpty.length;
        duplicates += dataArrRemoveEmpty.length - uniq.length;
    }));

    return {duplicates, empty, longLinesFiles};
};
