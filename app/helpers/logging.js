/* eslint-disable no-console */

import {convertToArray} from './array.js';

/**
 * @param {any|any[]} msg
 * @returns {void}
 */
export const log = msg => convertToArray(msg)
    .forEach(elem => console.log(elem));

/**
 * @param {any|any[]} msg
 * @returns {void}
 */
export const logError = msg => convertToArray(msg)
    .forEach(elem => console.error(elem));

/**
 * @param {any|any[]} msg
 * @returns {void}
 */
export const throwError = msg => {
    logError(msg);
    process.exit(1);
};
