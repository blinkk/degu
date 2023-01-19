/**
 * Merge all of the given sets into a single set.
 */
export function merge<T>(...sets: Array<Set<T>>): Set<T> {
  const result = new Set<T>();
  sets.forEach(set => {
    set.forEach(value => {
      result.add(value);
    });
  });
  return result;
}
