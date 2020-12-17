/**
 * Maps the values in the iterator to an array using the given function.
 * Behaves similarly to Array.map.
 */
export function map<T, V>(
    iterableIterator: IterableIterator<T>,
    callback: (value: T) => V
): V[] {
  const result: V[] = [];
  let nextEntry = iterableIterator.next();
  while (!nextEntry.done) {
    result.push(callback(nextEntry.value));
    nextEntry = iterableIterator.next();
  }

  return result;
}
