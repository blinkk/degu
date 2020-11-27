export class UidIterator implements IterableIterator<number> {
  private counter: number = 0;

  next(value?: any): IteratorResult<number> {
    this.counter++;
    return {
      value: this.counter,
      done: this.counter >= Number.POSITIVE_INFINITY
    };
  }

  [Symbol.iterator](): UidIterator {
    return this;
  }
}
