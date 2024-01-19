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
#   emoji: '🇺🇸',
#   country: 'United States',
#   countryA2: 'US',
#   region: 'District of Columbia',
#   city: 'Washington',
#   org: 'APNIC and Cloudflare DNS Resolver project',
#   isp: 'Cloudflare, Inc.',
#   ispDomain: 'cloudflare.com'
# }

ip2geo 1.1.1.1 8.8.8.8 --json
# [{"ip":"1.1.1.1","emoji":"🇺🇸","country":"United States","countryA2":"US","region":"District of Columbia","city":"Washington","org":"APNIC and Cloudflare DNS Resolver project","isp":"Cloudflare, Inc.","ispDomain":"cloudflare.com"},{"ip":"8.8.8.8","emoji":"🇺🇸","country":"United States","countryA2":"US","region":"California","city":"Mountain View","org":"Google LLC","isp":"Google LLC","ispDomain":"google.com"}]
```

## API

```bash
npm i @k03mad/ip2geo
```

```js
import {ip2geo} from '@k03mad/ip2geo';

const info = await ip2geo('1.1.1.1', {
    // defaults
    cacheDir: path.join(os.tmpdir(), '.ip2geo'),
    cacheFileName: 'ips.log',
    cacheFileSeparator: ';;',
    cacheFileNewline: '\n',
    cacheMap: new Map(),
    rps: 5, // useful in Promise.all with IPs array
});

// info {
//   ip: '1.1.1.1',
//   emoji: '🇺🇸',
//   country: 'United States',
//   countryA2: 'US',
//   region: 'District of Columbia',
//   city: 'Washington',
//   org: 'APNIC and Cloudflare DNS Resolver project',
//   isp: 'Cloudflare, Inc.',
//   ispDomain: 'cloudflare.com'
// }
```
