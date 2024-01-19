import os from 'node:os';
import path from 'node:path';

export const DEFAULT_OPTS = {
    cacheDir: path.join(os.tmpdir(), '.ip2geo'),
    cacheFileName: 'ips.log',
    cacheFileSeparator: ';;',
    cacheFileNewline: '\n',
};

export const REQUEST_IPV4 = {
    ip: '8.8.8.8',
    emoji: '🇺🇸',
    country: 'United States',
    countryA2: 'US',
    region: 'California',
    city: 'Mountain View',
    org: 'Google LLC',
    isp: 'Google LLC',
    ispDomain: 'google.com',
};

export const REQUEST_IPV6 = {
    ip: '2a00:dd80:40:100::',
    emoji: '🇳🇱',
    country: 'Netherlands',
    countryA2: 'NL',
    region: 'North Holland',
    city: 'Amsterdam',
    org: '',
    isp: 'NetActuate Inc',
    ispDomain: '',
};
