import {tsImport} from 'tsx/esm/api';

const mod = await tsImport('./app/api.ts', import.meta.url);

export const {ip2geo, cacheStorage} = mod;

export const {
    DEFAULT_CACHE_FILE_DIR,
    DEFAULT_CACHE_FILE_NAME,
    DEFAULT_CACHE_FILE_NEWLINE,
    DEFAULT_CACHE_FILE_SEPARATOR,
    DEFAULT_CACHE_MAP_MAX_ENTRIES,
} = mod;
