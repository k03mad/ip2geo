# GeoIP lookup

— Using [ipwhois.io](https://ipwhois.io/documentation) \
— Runtime cache \
— Filesystem infinity cache

## Global

```bash
npm i @k03mad/ip2geo -g

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

ip2geo 1.1.1.1 --json
# {"ip":"1.1.1.1","emoji":"🇺🇸","country":"United States","countryA2":"US","region":"District of Columbia","city":"Washington","org":"APNIC and Cloudflare DNS Resolver project","isp":"Cloudflare, Inc.","ispDomain":"cloudflare.com"}
```

## API

```bash
npm i @k03mad/ip2geo --save-exact
echo .geoip >> .gitignore
```

```js
import {ip2geo} from '@k03mad/ip2geo';

const info = await ip2geo('1.1.1.1', {
    // defaults
    cacheDir: '.geoip',
    cacheFileName: 'ips.log',
    cacheFileSeparator: ';;',
    cacheFileNewline: '\n',
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
