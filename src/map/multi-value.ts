import { DefaultMap } from './default';
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
export class MultiValueMap<K, V> extends Map<K[], V> {
  private readonly valueToUid: DefaultMap<K, number>;
  private readonly internalKeyToArray: Map<string, K[]>;
  private uid: number = 0;

  constructor(iterable: Array<[K[], V]> = []) {
    super([]); // Defer population

    this.valueToUid =
      DefaultMap.usingFunction<K, number>((value: K) => this.uid++);
    this.internalKeyToArray = new Map<string, K[]>();
    iterable.forEach(([keys, value]) => this.set(keys, value));
  }

  clear(): void {
    super.clear();
    this.uid = 0;
    this.valueToUid.clear();
  }

  get(keys: K[]): V {
    return super.get(this.getInternalKey(keys));
  }

  delete(keys: K[]): boolean {
    return super.delete(this.getInternalKey(keys));
  }

  has(keys: K[]): boolean {
    return super.has(this.getInternalKey(keys));
  }

  keys(): IterableIterator<K[]> {
    // Slice each key to ensure they cannot be modified outside of this class
    return new MappedIterator(super.keys(), (key: K[]) => key ? [...key] : []);
  }

  /**
   * Set a value by a collection of ordered keys
   */
  set(keys: K[], value: V): this {
    return super.set(this.getInternalKey(keys), value);
  }

  // Ensures a one-to-one mapping, so the same values always reference the
  // same array.
  private getInternalKey(keys: K[]): K[] {
    const stringId = keys.map((key) => this.valueToUid.get(key)).join('-');
    if (!this.internalKeyToArray.has(stringId)) {
      this.internalKeyToArray.set(stringId, keys.slice());
    }
    return this.internalKeyToArray.get(stringId);
  }
}
