import { MapWrapper } from './map-wrapper';
import { noop } from '../func/noop';

/**
 * Allows for returning generated defaults for unknown keys.
 * Useful as a quick and dirty way to cache results of functions.
 *
 * ```
 * const sqrRts =
 *     DynamicDefaultMap.usingFunction<number, number>((x) => Math.sqrt(x));
 * sqrRts.get(9); // Returns 3
 * ```
 */
export class DynamicDefaultMap<K, V> extends MapWrapper<K, V> {
  static usingFunction<K, V>(
    defaultFunction: (key: K) => V
  ): DynamicDefaultMap<K, V> {
    return new this([], Map, defaultFunction);
  }

  private readonly defaultFunction: (key: K) => V;

  constructor(iterable: Array<[K, V]> = [],
              InnerMapClass: typeof Map = Map,
              defaultFunction: (key: K) => V = <(key: K) => V>noop) {
    super([], InnerMapClass); // Defer population
    this.defaultFunction = defaultFunction;
    this.populateFromIterable(iterable);
  }

  get(key: any): any {
    if (!this.has(key)) {
      this.set(key, this.defaultFunction(key));
    }
    return super.get(key);
  }
}
