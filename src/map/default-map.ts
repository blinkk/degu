import { noop } from '../func/noop';

type DefaultFunction<K, V> = (key: K) => V;
/**
 * Allows for returning generated defaults for unknown keys.
 * Useful as a quick and dirty way to cache results of functions.
 *
 * This is intended to behave similarly to the defaultdict structure in python.
 *
 * ```
 * const sqrRts =
 *     DefaultMap.usingFunction<number, number>((x) => Math.sqrt(x));
 * sqrRts.get(9); // Returns 3
 * ```
 */
export class DefaultMap<K, V> extends Map<K, V> {
  static usingFunction<K, V>(
      defaultFunction: DefaultFunction<K, V>
  ): DefaultMap<K, V> {
    return new this([], defaultFunction);
  }

  private readonly defaultFunction: DefaultFunction<K, V>;

  constructor(iterable: Array<[K, V]> = [],
              defaultFunction: DefaultFunction<K, V> = noop) {
    super(iterable);
    this.defaultFunction = defaultFunction;
  }

  get(key: K): V {
    if (!this.has(key)) {
      const defaultValue = this.defaultFunction(key);
      this.set(key, defaultValue);
      return defaultValue;
    } else {
      return super.get(key);
    }
  }
}
