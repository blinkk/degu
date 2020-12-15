function map<T, V>(
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

export {map};
