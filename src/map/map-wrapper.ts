import { is } from '..';

/**
 * Places a wrapper around the built-in Map structure. The built in structure
 * cannot be inherited, so this allows us to extend and build on top of
 * this functionality.
 *
 * Generic Types
 * K: Key type
 * V: Value type
 */

export class MapWrapper<K, V> implements Map<K, V> {

  get size(): number {
    return this.map.size;
  }
  readonly [Symbol.toStringTag]: 'Map';
  private map: Map<K, V>;

  constructor(iterable: Array<[K, V]> = [],
              InnerMapClass: typeof Map = Map) {
    this.map = new InnerMapClass<K, V>();
    this.populateFromIterable(iterable);
  }

  clear(): void {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }

  forEach(
      callbackFn: (value: V, index: K, map: Map<K, V>) => void,
      thisArg?: any
  ): void {
    const finalThisArg = is.defined(thisArg) ? thisArg : this;
    this.map.forEach(callbackFn, <this>finalThisArg);
  }

  get(key: K): V {
    return this.map.get(key);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  set(key: K, value: V): this {
    this.map.set(key, value);
    return this;
  }

  values(): IterableIterator<V> {
    return this.map.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map[Symbol.iterator]();
  }

  protected populateFromIterable(iterable: Array<[K, V]>) {
    iterable.forEach(([key, value]) => this.set(key, value));
  }

  protected replaceInnerMap(innerMap: Map<K, V>): void {
    this.map = innerMap;
  }
}
