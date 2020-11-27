import { DynamicDefaultMap } from './dynamic-default';
import { MapWrapper } from './map-wrapper';

/**
 * A map where the values in the map are all expected to be arrays.
 * When calling get(K) for an unset key K, we are returned and empty array.
 */
export class ArrayMap<K, V> extends MapWrapper<K, V[]> {
  constructor(iterable: Array<[K, V[]]> = [],
              InnerMapClass: typeof Map = Map) {
    super(iterable, InnerMapClass);
    this.replaceInnerMap(
      new DynamicDefaultMap<K, V[]>(
        iterable,
        InnerMapClass,
        (key: K) => []));
  }
}
