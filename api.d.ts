export interface ReqOutput {
  ip?: string;
  continent?: string;
  continentCode?: string;
  country?: string;
  countryCode?: string;
  countryEmoji?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  connectionAsn?: number;
  connectionOrg?: string;
  connectionIsp?: string;
  connectionDomain?: string;
}

export interface ReqInput {
  ip?: string;
  cacheDir?: string;
  cacheFileName?: string;
  cacheFileSeparator?: string;
  cacheFileNewline?: string;
  cacheMap?: Map<string, ReqOutput>;
  cacheMapMaxEntries?: number;
}

export const cacheStorage: Map<string, ReqOutput>;

export const DEFAULT_CACHE_FILE_DIR: string;
export const DEFAULT_CACHE_FILE_NAME: string;
export const DEFAULT_CACHE_FILE_SEPARATOR: string;
export const DEFAULT_CACHE_FILE_NEWLINE: string;
export const DEFAULT_CACHE_MAP_MAX_ENTRIES: number;

export const ip2geo: (opts?: ReqInput) => Promise<ReqOutput>;
