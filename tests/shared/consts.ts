import type {ReqOutput} from '../../api.d.ts';

export const REQUEST_IPV4: ReqOutput = {
  ip: '8.8.8.8',
  continent: 'North America',
  continentCode: 'NA',
  country: 'United States',
  countryCode: 'US',
  countryEmoji: '🇺🇸',
  region: 'California',
  regionCode: 'CA',
  city: 'San Jose',
  connectionAsn: 15_169,
  connectionOrg: 'Google LLC',
  connectionIsp: 'Google LLC',
  connectionDomain: 'google.com',
};

export const REQUEST_IPV4_MAP_OFF_ONLY: ReqOutput = {
  ip: '9.9.9.9',
  continent: 'North America',
  continentCode: 'NA',
  country: 'United States',
  countryCode: 'US',
  countryEmoji: '🇺🇸',
  region: 'California',
  regionCode: 'CA',
  city: 'San Francisco',
  connectionAsn: 19_281,
  connectionOrg: 'Quad9',
  connectionIsp: 'Quad9',
  connectionDomain: 'quad9.net',
};

export const REQUEST_IPV6: ReqOutput = {
  ip: '2a00:dd80:40:100::',
  continent: 'Europe',
  continentCode: 'EU',
  country: 'Poland',
  countryCode: 'PL',
  countryEmoji: '🇵🇱',
  region: 'Masovian Voivodeship',
  regionCode: '14',
  city: 'Warsaw',
  connectionAsn: 36_236,
  connectionOrg: 'NetActuate Inc',
  connectionIsp: 'NetActuate, Inc',
  connectionDomain: 'netactuate.com',
};
