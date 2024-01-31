# GeoIP lookup

— Using [ipwhois.io](https://ipwhois.io/documentation) \
— Runtime + filesystem caching

## Global

```bash
npm i @k03mad/ip2geo -g
ip2geo --help

ip2geo
# your IP info

ip2geo 1.1.1.1
# {
#   ip: '1.1.1.1',
#   continent: 'North America',
#   continentCode: 'NA',
#   country: 'United States',
#   countryCode: 'US',
#   countryEmoji: '🇺🇸',
#   region: 'District of Columbia',
#   regionCode: 'DC',
#   city: 'Washington',
#   connectionAsn: 13335,
#   connectionOrg: 'APNIC and Cloudflare DNS Resolver project',
#   connectionIsp: 'Cloudflare, Inc.',
#   connectionDomain: 'cloudflare.com'
# }

ip2geo 1.1.1.1 8.8.8.8 --json
# [{"ip":"1.1.1.1","continent":"North America","continentCode":"NA","country":"United States","countryCode":"US","countryEmoji":"🇺🇸","region":"District of Columbia","regionCode":"DC","city":"Washington","connectionAsn":13335,"connectionOrg":"APNIC and Cloudflare DNS Resolver project","connectionIsp":"Cloudflare, Inc.","connectionDomain":"cloudflare.com"},{"ip":"8.8.8.8","continent":"North America","continentCode":"NA","country":"United States","countryCode":"US","countryEmoji":"🇺🇸","region":"California","regionCode":"CA","city":"Mountain View","connectionAsn":15169,"connectionOrg":"Google LLC","connectionIsp":"Google LLC","connectionDomain":"google.com"}]
```

## API

```bash
npm i @k03mad/ip2geo
```

```js
import {ip2geo} from '@k03mad/ip2geo';

const info = await ip2geo({
    ip: '1.1.1.1', // make key falsy to use current external IP
    // defaults
    cacheDir: path.join(os.tmpdir(), '.ip2geo'),
    cacheFileName: 'ips.log',
    cacheFileSeparator: ';;',
    cacheFileNewline: '\n',
    cacheMap: new Map(),
    cacheMapMaxEntries: Number.POSITIVE_INFINITY, // store last N requests, 0 — turns cache map off
    rps: 3, // API RPS, useful in Promise.all with IPs array
});

// info {
//   ip: '1.1.1.1',
//   continent: 'North America',
//   continentCode: 'NA',
//   country: 'United States',
//   countryCode: 'US',
//   countryEmoji: '🇺🇸',
//   region: 'District of Columbia',
//   regionCode: 'DC',
//   city: 'Washington',
//   connectionAsn: 13335,
//   connectionOrg: 'APNIC and Cloudflare DNS Resolver project',
//   connectionIsp: 'Cloudflare, Inc.',
//   connectionDomain: 'cloudflare.com'
// }
```
