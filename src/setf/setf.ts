export class setf {
  /**
   * Return a new set containing all the values in the minuend that do not
   * appear in the subtrahend.
   */
  static difference<T>(minuend: Set<T>, subtrahend: Set<T>): Set<T> {
    const result = new Set<T>();
    minuend.forEach((value) => {
      if (!subtrahend.has(value)) {
        result.add(value);
      }
    });
    return result;
  }

  /**
   * Merge all of the given sets into a single set.
   */
  static merge<T>(...sets: Array<Set<T>>): Set<T> {
    const result = new Set<T>();
    sets.forEach((set) => {
      set.forEach((value) => {
        result.add(value);
      });
    });
    return result;
  }
}
