import { DynamicDefaultMap } from './dynamic-default';
import { MultiValueMap } from './multi-value';
import { noop } from '../func/noop';

/**
 * A MultiValueMap with the default generating of DynamicDefaultMap
 */
export class MultiValueDynamicDefaultMap<K, V> extends MultiValueMap<K, V> {

  static usingFunction<K, V>(
    defaultFunction: (key: K[]) => V
  ): MultiValueDynamicDefaultMap<K, V> {
    return new MultiValueDynamicDefaultMap([], Map, defaultFunction);
  }
  constructor(iterable: Array<[K[], V]> = [],
              InnerMapClass: typeof Map = Map,
              defaultFunction: (key: K[]) => V = <(key: K[]) => V>noop) {
    super();
    this.replaceInnerMap(
      new DynamicDefaultMap(iterable, InnerMapClass, defaultFunction));
  }
}
