import { DynamicDefaultMap } from './dynamic-default';
import { MapWrapper } from './map-wrapper';
import { MappedIterator } from '../iterable-iterator/mapped-iterator';

/**
 * Allows for a series of values to be mapped to a value, taking order into
 * account.
 *
 * ```
 * const flamingo = "Flamingo";
 * const bat = "Bat";
 * const man = "Man";
 * const bruceWayne = ["Crime fighter", "Rich", "Sir Adopt-A-Lot"];
 * const robertKirkland = ["Scientist", "Monster", "Science Accident"];
 *
 * const map = new MultiValueMap();
 * map.set([bat, man], bruceWayne);
 * map.set([man, bat], robertKirkland);
 * // And the order matters, both values are stored.
 * map.get([bat, man]); // Returns `bruceWayne`
 * map.get([man, bat]); // Returns `robertKirkland`
 * map.get([flamingo, man]); // Returns an empty array
 * ```
 */
export class MultiValueMap<K, V> extends MapWrapper<K[], V> {
  private valueToUid: DynamicDefaultMap<K, number>;
  private internalKeyToArray: Map<string, K[]>;
  private uid: number;

  constructor(iterable: Array<[K[], V]> = [],
              InnerMapClass: typeof Map = Map) {
    super([], InnerMapClass); // Defer population

    this.uid = 0;
    this.valueToUid =
      DynamicDefaultMap.usingFunction<K, number>((value: K) => this.uid++);

    this.internalKeyToArray = new Map<string, K[]>();

    this.populateFromIterable(iterable);
  }

  clear(): void {
    super.clear();
    this.uid = 0;
    this.valueToUid.clear();
  }

  get(keys: K[]): V {
    return super.get(this.getInternalKey_(keys));
  }

  delete(keys: K[]): boolean {
    return super.delete(this.getInternalKey_(keys));
  }

  has(keys: K[]): boolean {
    return super.has(this.getInternalKey_(keys));
  }

  keys(): IterableIterator<K[]> {
    // Slice each key to ensure they cannot be modified outside of this class
    return new MappedIterator(super.keys(), (key: K[]) => key ? [...key] : []);
  }

  set(keys: K[], value: V): this {
    return super.set(this.getInternalKey_(keys), value);
  }

  // Ensures a one-to-one mapping, so the same values always reference the
  // same array.
  private getInternalKey_(keys: K[]): K[] {
    const stringId = keys.map((key) => this.valueToUid.get(key)).join('-');
    if (!this.internalKeyToArray.has(stringId)) {
      this.internalKeyToArray.set(stringId, keys.slice());
    }
    return this.internalKeyToArray.get(stringId);
  }
}
