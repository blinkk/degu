/**
 * CachedElementVector is used to optimize access to commonly checked values.
 * Abstracts the caching of values such as window dimensions or scroll positions
 * that can be stored as vectors.
 */
import { DynamicDefaultMap } from '../map/dynamic-default';
import { MultiValueDynamicDefaultMap } from '../map/multi-value-dynamic-default';
import { MultiDimensionalVector } from '../mathf/geometry/multi-dimensional-vector';
import { Raf } from '..';

// Number of past values to cache
const VALUE_LIMIT: number = 2;

type InnerCache = MultiValueDynamicDefaultMap<any, any>;

/**
 * All instances of CachedElementVector will share a single cache to facilitate
 * abstraction of the cache checking/clearing.
 *
 * Also helps ensure that only singletons are being created by checking for
 * existing instances in this cache.
 */
const caches: DynamicDefaultMap<any, InnerCache> =
    DynamicDefaultMap.usingFunction<any, any>(
        (Class) => {
          return MultiValueDynamicDefaultMap.usingFunction(
              (args: any[]) => new Class(...args));
        });

/**
 * Tracks where singletons are being used so that they are not fully disposed
 * if they are being used elsewhere.
 */
const uses: DynamicDefaultMap<CachedElementVector<MultiDimensionalVector>, Set<any>> =
    DynamicDefaultMap.usingFunction(() => new Set());

export abstract class CachedElementVector<T extends MultiDimensionalVector> {
  /**
   * Used when a single type of caching could serve multiple elements.
   * For instance you may want to cache the scroll of the main document but also
   * the scroll of an inner scrollable element.
   */
  static getForElement(use: any, args: any[] = [null]): any {
    const instance = caches.get(this).get(args);
    uses.get(instance).add(use);
    return instance;
  }

  /**
   * Returns a generic singleton.
   */
  static getSingleton(use: any): any {
    return this.getForElement(use);
  }

  /**
   * Type of vector this is caching, Dimensions/Vector2d/etc.
   */
  protected static VectorClass: typeof MultiDimensionalVector =
      MultiDimensionalVector;

  // Element whose values are being cached.
  protected element: HTMLElement;

  // Optional args the constructor was called with.
  private readonly args: any[];

  // Currently cached values
  private values: T[];

  // Allows caches to persist for a little bit so they aren't being created
  // and destroyed every frame by short-lived calls.
  private disposeTimeout: number;

  private raf: Raf;

  protected constructor(element: any = null, ...args: any[]) {
    const instanceByElement = caches.get(this.constructor);
    this.raf = new Raf(() => this.loop());
    this.args = [element, ...args];

    // Prevent direct instantiation
    if (instanceByElement.has([element, ...args])) {
      if (element) {
        throw new Error('Please use getForElement instead of new.');
      } else {
        throw new Error('Please use getSingleton instead of new.');
      }
    }

    this.disposeTimeout = null;
    this.element = element;
    this.values = <T[]>[this.getCurrentVector()];
    this.init();
  }

  getLastValue(): T {
    return this.values.slice(-1)[0];
  }

  getDelta(): T {
    const values = this.getCurrentAndLastValue();
    return <T>this.getVectorClass().subtract(values[0], values[1]);
  }

  hasChanged(): boolean {
    return !this.getVectorClass().areEqual(...this.getCurrentAndLastValue());
  }

  dispose(use: any): void {
    uses.get(this).delete(use);
    clearTimeout(this.disposeTimeout);
    // Hang tight for a minute so we aren't creating and destroying these caches
    // too rapidly.
    this.disposeTimeout = window.setTimeout(
        () => {
          if (uses.size <= 0) {
            caches.get(this.constructor).delete(this.args);
            this.raf.dispose();
          }
        },
        1000);
  }

  // Expected to be overridden
  protected getValues(): number[] {
    throw new Error('getValues must be overridden by child class');
  }

  private init(): void {
    this.raf.start();
  }

  private getVectorClass(): typeof MultiDimensionalVector {
    return (<typeof CachedElementVector>this.constructor).VectorClass;
  }

  private getCurrentVector(): T {
    return <T>new (this.getVectorClass())(...this.getValues());
  }

  // Measure at the start of every frame
  private loop(): void {
    this.raf.preRead(() => this.measureValues());
  }

  private measureValues(): void {
    this.values =
        this.values
            .slice(-(VALUE_LIMIT - 1))
            .concat([this.getCurrentVector()]);
  }

  private getCurrentAndLastValue(): MultiDimensionalVector[] {
    return this.values.slice(-2);
  }
}
