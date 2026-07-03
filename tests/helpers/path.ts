import path from 'node:path';

export const getCurrentFilename = (file: string): string => path.basename(file, '.ts');

export const getTestFolder = (file: string): string => path.join('.geoip', file);
