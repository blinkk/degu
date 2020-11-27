export class iterableIteratorf {
  /**
   * Return values from the given iterator matching the provided filter fn.
   * Equivalent to calling filter on an array.
   */
  static filter<T>(
      iterableIterator: IterableIterator<T>,
      filterFn: (v: T) => boolean
  ): T[] {
    const result = [];
    let nextEntry = iterableIterator.next();
    while (!nextEntry.done) {
      if (filterFn(nextEntry.value)) {
        result.push(nextEntry.value);
      }
      nextEntry = iterableIterator.next();
    }
    return result;
  }

  /**
   * Run the given function on values in the iterator.
   * Equivalent to calling forEach on an array.
   */
  static forEach<T>(
      iterableIterator: IterableIterator<T>,
      callback: (value: T) => void
  ): void {
    let nextEntry = iterableIterator.next();
    while (!nextEntry.done) {
      callback(nextEntry.value);
      nextEntry = iterableIterator.next();
    }
  }

  /**
   * Return an array with the results from calling the given function on
   * values in the iterator.
   * Equivalent to calling map on an array.
   */
  static map<T, V>(
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

  /**
   * Return the value in the iterator that generated the highest score when
   * passed to the given scoreFn.
   * Similar to arrayf.max
   */
  static max<T>(
      iterableIterator: IterableIterator<T>,
      scoreFn: (value: T) => number
  ): T {
    let maxValue;
    let maxScore = Number.NEGATIVE_INFINITY;

    let nextEntry = iterableIterator.next();
    while (!nextEntry.done) {
      const score = scoreFn(nextEntry.value);
      if (maxScore < score) {
        maxValue = nextEntry.value;
        maxScore = score;
      }
      nextEntry = iterableIterator.next();
    }

    return maxValue;
  }

  /**
   * Return true if some value in the iterator returns true for the given
   * function.
   */
  static some<T>(
      iterableIterator: IterableIterator<T>,
      filterFn: (v: T) => boolean
  ): boolean {
    let nextEntry = iterableIterator.next();
    while (!nextEntry.done) {
      if (filterFn(nextEntry.value)) {
        return true;
      }
      nextEntry = iterableIterator.next();
    }
    return false;
  }
}
