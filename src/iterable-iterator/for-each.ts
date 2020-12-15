export function forEach<T>(
  iterableIterator: IterableIterator<T>,
  callback: (value: T) => void
): void {
  let nextEntry = iterableIterator.next();
  while (!nextEntry.done) {
    callback(nextEntry.value);
    nextEntry = iterableIterator.next();
  }
}
