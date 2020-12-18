import { DynamicDefaultMap } from './dynamic-default';

/**
 * A map where the values in the map are all expected to be arrays.
 * When calling get(K) for an unset key K, we are returned and empty array.
 */
export class ArrayMap<K, V> extends DynamicDefaultMap<K, V[]> {
  constructor(iterable: Array<[K, V[]]> = []) {
    super(iterable, () => []);
  }
}
