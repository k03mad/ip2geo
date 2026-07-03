import fs from 'node:fs/promises';
import path from 'node:path';

import _debug from 'debug';
import {isIP} from 'is-ip';

import type {ReqOutput} from '../types.ts';

import {getArrayDups} from './utils.ts';

const debug = _debug('mad:geoip');

type CacheMap = Map<string, ReqOutput>;

interface LongLinesFile {
  file: string;
  elem: string;
}

interface PruneCacheResult {
  entries: number;
  duplicates: string[];
  different: string[];
  empty: string[];
  longLinesFiles: LongLinesFile[];
}

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
] as const;

export const collectOutputData = (dataArr: string[]): ReqOutput => {
  const outputData = {} as Record<(typeof outputKeys)[number], string | number | undefined>;

  outputKeys.forEach((key, i) => {
    outputData[key] = key === 'connectionAsn' && dataArr[i] ? Number(dataArr[i]) : dataArr[i];
  });

  return outputData as ReqOutput;
};

const getCacheFileFullPath = (ip: string, cacheDir: string, cacheFileName: string): string => {
  const [firstOctet] = ip.split(/[.:]/);
  return path.join(cacheDir, `${firstOctet}_${cacheFileName}`);
};

export const readFromFsCache = async (
  ip: string,
  cacheDir: string,
  cacheFileName: string,
  cacheFileSeparator: string,
  cacheFileNewline: string,
): Promise<ReqOutput | undefined> => {
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
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.appendFile(cacheFileFull, '');
    } else {
      throw err;
    }
  }

  return undefined;
};

export const writeToFsCache = async (
  ip: string,
  data: ReqOutput,
  cacheDir: string,
  cacheFileName: string,
  cacheFileSeparator: string,
  cacheFileNewline: string,
): Promise<void> => {
  const cacheFileFull = getCacheFileFullPath(ip, cacheDir, cacheFileName);
  debug('set to fs cache: %o %o', cacheFileFull, data);

  await fs.mkdir(cacheDir, {recursive: true});

  await fs.appendFile(
    cacheFileFull,
    cacheFileNewline + Object.values(data).join(cacheFileSeparator),
  );
};

export const readFromMapCache = (
  ip: string,
  cacheMap: CacheMap,
  cacheMapMaxEntries: number,
): ReqOutput | undefined => {
  if (cacheMapMaxEntries > 0) {
    const value = cacheMap.get(ip);

    if (value) {
      debug('get from map cache: %o', value);
      return value;
    }
  }

  return undefined;
};

export const removeFromMapCacheIfLimit = (cacheMap: CacheMap, cacheMapMaxEntries: number): void => {
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

export const writeToMapCache = (
  body: ReqOutput,
  cacheMap: CacheMap,
  cacheMapMaxEntries: number,
): void => {
  if (cacheMapMaxEntries > 0) {
    debug('set to map cache: %o', body);
    cacheMap.set(body.ip ?? '', body);

    removeFromMapCacheIfLimit(cacheMap, cacheMapMaxEntries);
  }
};

export const pruneCache = async (
  cacheDir: string,
  cacheFileSeparator: string,
  cacheFileNewline: string,
): Promise<PruneCacheResult> => {
  const files = await fs.readdir(cacheDir);

  await Promise.all(
    files.map(async file => {
      const fullFilePath = path.join(cacheDir, file);

      const [stat, data] = await Promise.all([
        fs.lstat(fullFilePath),
        fs.readFile(fullFilePath, {encoding: 'utf8'}),
      ]);

      const firstIp = data?.split(cacheFileNewline)?.find(Boolean)?.split(cacheFileSeparator)[0];

      if (stat.isDirectory() || (firstIp && !isIP(firstIp))) {
        throw new Error(
          `Folder has subfolders or files without IPs, wrong cache folder arg?\n${fullFilePath}`,
        );
      }
    }),
  );

  const cacheLineToNum = (line: string): number =>
    Number(
      (line.split(cacheFileSeparator)[0] ?? '')
        .split('.')
        .map(num => `00${num}`.slice(-3))
        .join(''),
    );

  const duplicates = new Set<string>();
  const different = new Set<string>();
  const empty: string[] = [];
  const longLinesFiles = new Set<LongLinesFile>();
  let entries = 0;

  await Promise.all(
    files.map(async file => {
      const fullFilePath = path.join(cacheDir, file);

      const data = await fs.readFile(fullFilePath, {encoding: 'utf8'});
      const dataArr = data.split(cacheFileNewline).filter(Boolean);

      const dataArrRemoveEmpty = dataArr.filter((elem): boolean => {
        const splitted = elem.split(cacheFileSeparator);

        if (splitted.length > outputKeys.length) {
          longLinesFiles.add({file: fullFilePath, elem});
        }

        if (splitted.filter(Boolean).length > 1) {
          return true;
        }

        empty.push(elem);
        return false;
      });

      const uniqSorted = [...new Set(dataArrRemoveEmpty)].toSorted(
        (a, b) => cacheLineToNum(a) - cacheLineToNum(b),
      );

      getArrayDups(dataArrRemoveEmpty).forEach(dup => duplicates.add(dup));

      const dupsIp = getArrayDups(uniqSorted.map(elem => elem.split(cacheFileSeparator)[0]));

      const removeDiffs = uniqSorted.filter(elem => {
        if (dupsIp.includes(elem.split(cacheFileSeparator)[0])) {
          different.add(elem);
          return false;
        }

        return true;
      });

      const fileContent = removeDiffs.join(cacheFileNewline).trim();

      if (fileContent) {
        await fs.writeFile(fullFilePath, fileContent);
        entries += removeDiffs.length;
      } else {
        await fs.rm(fullFilePath);
      }
    }),
  );

  return {
    entries,
    duplicates: [...duplicates],
    different: [...different],
    empty,
    longLinesFiles: [...longLinesFiles],
  };
};
