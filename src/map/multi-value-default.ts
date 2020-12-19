import { MultiValueMap } from './multi-value';
import { noop } from '../func/noop';

type DefaultFunction<K, V> = (keys: K[]) => V;

/**
 * A MultiValueMap with the default generating of DefaultMap
 */
export class MultiValueDefaultMap<K, V> extends MultiValueMap<K, V> {

  static usingFunction<K, V>(
      defaultFunction: DefaultFunction<K, V>
): MultiValueDefaultMap<K, V> {
    return new this([], defaultFunction);
  }

  private readonly defaultFunction: DefaultFunction<K, V>;

  constructor(iterable: Array<[K[], V]> = [],
              defaultFunction: DefaultFunction<K, V> = noop) {
    super(iterable);
    this.defaultFunction = defaultFunction;
  }

  get(key: K[]): V {
    if (!this.has(key)) {
      this.set(key, this.defaultFunction(key));
    }
    return super.get(key);
  }
}
