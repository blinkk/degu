export function reduce<V, R>(
    iterableIterator: IterableIterator<V>,
    callback: (result: R, value: V) => R,
    initialValue: R
): R {
  let value = initialValue;
  let nextEntry = iterableIterator.next();
  while (!nextEntry.done) {
    value = callback(value, nextEntry.value);
    nextEntry = iterableIterator.next();
  }
  return value;
}
