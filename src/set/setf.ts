export class setf {
  /**
   * Creates and returns copy of the minuend with values from the subtrahend
   * removed.
   *
   * ```
   * // Returns new Set(['b']);
   * setf.subtract(new Set(['a', 'b', 'c']), new Set(['a', 'c']));
   * ```
   */
  static subtract<T>(minuend: Set<T>, subtrahend: Set<T>): Set<T> {
    const result = new Set<T>();
    minuend.forEach((value) => {
      if (!subtrahend.has(value)) {
        result.add(value);
      }
    });
    return result;
  }
}
