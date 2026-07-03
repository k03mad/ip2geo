export const getArrayDups = <T>(arr: T[]): T[] => arr.filter((e, i, a) => a.indexOf(e) !== i);
