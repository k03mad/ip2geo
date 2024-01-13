# GeoIP lookup

— Using [ipwhois.io](https://ipwhois.io/documentation) \
— Runtime cache \
— Filesystem infinity cache

## API

```bash
npm i @k03mad/ip2geo --save-exact
echo .geoip >> .gitignore
```

```js
import {ip2geo} from '@k03mad/ip2geo';

const {
    ip,
    emoji,
    country,
    countryA2,
    city,
    isp,
} = await ip2geo('1.1.1.1', {
    // defaults
    cacheDir: '.geoip',
    cacheFileName: 'ips.log',
    cacheFileSeparator: ';;',
    cacheFileNewline: '\n',
});

// ip: "1.1.1.1"
// emoji: "🇺🇸"
// country: "United States"
// countryA2: "US"
// city: "Washington"
// isp: "Cloudflare, Inc."
```
