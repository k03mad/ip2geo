import path from 'node:path';

/**
 * @param {string} file import.meta.url
 * @returns {string}
 */
export const getCurrentFilename = file => path.basename(file, '.js');

/**
 * @param {string} file
 * @returns {string}
 */
export const getTestFolder = file => path.join('.geoipCustom', file);
