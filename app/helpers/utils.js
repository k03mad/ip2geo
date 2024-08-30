/**
 * @param {Array} arr
 */
export const getArrayDups = arr => arr.filter((e, i, a) => a.indexOf(e) !== i);
