import { ArrayMap } from './array';
import { MultiValueMap } from './multi-value';

/**
 * A combination of MultiValueMap and ArrayMap, will always return an array.
 *
 * ```
 * const bat = "Bat";
 * const man = "Man";
 * const bruceWayne = "Superhero whose power is money";
 * const robertKirkland = "Transhumanist who turned himself into a monster";
 *
 * const map = new MultiValueMap();
 * map.set([bat, man], bruceWayne);
 * map.set([man, bat], robertKirkland);
 * // And the order matters, both values are stored.
 * map.get([bat, man]); // Returns `bruceWayne`
 * map.get([man, bat]); // Returns `robertKirkland`
 * ```
 *
 */
export class MultiValueArrayMap<K, V> extends MultiValueMap<K, V[]> {
  constructor(iterable: Array<[K[], V[]]> = [],
              InnerMapClass: typeof Map = Map) {
    super();
    this.replaceInnerMap(new ArrayMap<K[], V>(iterable, InnerMapClass));
  }
}
