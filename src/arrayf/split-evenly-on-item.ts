/**
 * Placed outside of arrayf.ts due to:
 * - Less frequent use
 * - Size of code
 */

function getLengthOfHalfOfArray_(values: any[], weightOdd: boolean): number {
  const halfLength = (values.length - 1) / 2;
  if (halfLength % 2 === 0) {
    return halfLength;
  } else if (weightOdd) {
    return Math.ceil(halfLength);
  } else {
    return Math.floor(halfLength);
  }
}

function buildHalf<T>(
    values: T[], startIndex: number, targetLength: number, direction: number
): T[] {
  const result = [];
  const valuesLength = values.length;
  let indexToAdd = startIndex;
  while (result.length < targetLength) {
    indexToAdd = (indexToAdd + direction + valuesLength) % valuesLength;
    if (direction > 0) {
      result.push(values[indexToAdd]);
    } else {
      result.unshift(values[indexToAdd]);
    }
  }
  return result;
}

export function splitEvenlyOnItem<T>(
    values: T[], item: T, weightRight: boolean = true
): [T[], T[]] {
  const leftLength = getLengthOfHalfOfArray_(values, !weightRight);
  const rightLength = getLengthOfHalfOfArray_(values, weightRight);
  const itemIndex = values.indexOf(item);
  const left = buildHalf(values, itemIndex, leftLength, -1);
  const right = buildHalf(values, itemIndex, rightLength, 1);
  return [left, right];
}
