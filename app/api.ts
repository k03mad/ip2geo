import os from 'node:os';
import path from 'node:path';

import {
  collectOutputData,
  readFromFsCache,
  readFromMapCache,
  writeToFsCache,
  writeToMapCache,
} from './helpers/cache.ts';
import type {ReqOutput} from './types.ts';

const API = 'https://ipwho.is/';

export const DEFAULT_CACHE_FILE_DIR = path.join(os.tmpdir(), '.ip2geo-cache');
export const DEFAULT_CACHE_FILE_NAME = 'ip.log';
export const DEFAULT_CACHE_FILE_SEPARATOR = ';;';
export const DEFAULT_CACHE_FILE_NEWLINE = '\n';
export const DEFAULT_CACHE_MAP_MAX_ENTRIES = Number.POSITIVE_INFINITY;

export interface ReqInput {
  ip?: string;
  cacheDir?: string;
  cacheFileName?: string;
  cacheFileSeparator?: string;
  cacheFileNewline?: string;
  cacheMap?: Map<string, ReqOutput>;
  cacheMapMaxEntries?: number;
}

interface ApiResponseBody {
  ip?: string;
  continent?: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  flag?: {emoji?: string};
  region?: string;
  region_code?: string;
  city?: string;
  connection?: {
    asn?: number | string;
    org?: string;
    isp?: string;
    domain?: string;
  };
}

export const cacheStorage = new Map<string, ReqOutput>();

export const ip2geo = async ({
  ip = '',
  cacheDir = DEFAULT_CACHE_FILE_DIR,
  cacheFileName = DEFAULT_CACHE_FILE_NAME,
  cacheFileSeparator = DEFAULT_CACHE_FILE_SEPARATOR,
  cacheFileNewline = DEFAULT_CACHE_FILE_NEWLINE,
  cacheMapMaxEntries = DEFAULT_CACHE_MAP_MAX_ENTRIES,
  cacheMap = cacheStorage,
}: ReqInput = {}): Promise<ReqOutput> => {
  if (ip) {
    const mapCache = readFromMapCache(ip, cacheMap, cacheMapMaxEntries);

    if (mapCache) {
      return mapCache;
    }

    const fsCache = await readFromFsCache(
      ip,
      cacheDir,
      cacheFileName,
      cacheFileSeparator,
      cacheFileNewline,
    );

    if (fsCache) {
      writeToMapCache(fsCache, cacheMap, cacheMapMaxEntries);

      return fsCache;
    }
  }

  const reqUrl = API + ip;
  const response = await fetch(reqUrl);
  const body = (await response.json()) as ApiResponseBody;

  if (!body?.ip) {
    throw new Error(
      ['API error', `request: ${reqUrl}`, `response body: ${JSON.stringify(body)}`].join('\n'),
    );
  }

  const outputData = collectOutputData([
    body.ip ?? '',
    body?.continent ?? '',
    body?.continent_code ?? '',
    body?.country ?? '',
    body?.country_code ?? '',
    body?.flag?.emoji ?? '',
    body?.region ?? '',
    body?.region_code ?? '',
    body?.city ?? '',
    String(body?.connection?.asn ?? ''),
    body?.connection?.org ?? '',
    body?.connection?.isp ?? '',
    body?.connection?.domain ?? '',
  ]);

  writeToMapCache(outputData, cacheMap, cacheMapMaxEntries);

  await writeToFsCache(
    body.ip ?? '',
    outputData,
    cacheDir,
    cacheFileName,
    cacheFileSeparator,
    cacheFileNewline,
  );

  return outputData;
};
