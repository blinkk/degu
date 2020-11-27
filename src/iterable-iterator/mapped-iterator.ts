/**
 * Returns an IterableIterator that maps the values of a given IterableIterator
 */
export class MappedIterator<T, TT> implements IterableIterator<TT> {
  private readonly iterator: Iterator<T>;
  private readonly mapFunction: (val: T) => TT;

  constructor(iterator: Iterator<T>, mapFunction: (val: T) => TT) {
    this.iterator = iterator;
    this.mapFunction = mapFunction;
  }

  next(): IteratorResult<TT> {
    const nextValue = this.iterator.next();
    return {
      done: nextValue.done,
      value: this.mapFunction(nextValue.value)
    };
  }

  [Symbol.iterator](): MappedIterator<T, TT> {
    return this;
  }
}
