import { DynamicDefaultMap } from '../map/dynamic-default';
import { MultiValueDynamicDefaultMap } from '../map/multi-value-dynamic-default';
import { MultiDimensionalVector } from '../mathf/geometry/multi-dimensional-vector';
import { Raf } from '..';

const VALUE_LIMIT: number = 2;

type InnerCache = MultiValueDynamicDefaultMap<any, any>;
const caches: DynamicDefaultMap<any, InnerCache> =
    DynamicDefaultMap.usingFunction<any, any>(
        (Class) => {
          return MultiValueDynamicDefaultMap.usingFunction(
              (args: any[]) => new Class(...args));
        });
const uses: DynamicDefaultMap<CachedElementVector<MultiDimensionalVector>, Set<any>> =
    DynamicDefaultMap.usingFunction(() => new Set());

export abstract class CachedElementVector<T extends MultiDimensionalVector> {
  static getForElement(use: any, args: any[] = [null]): any {
    const instance = caches.get(this).get(args);
    uses.get(instance).add(use);
    return instance;
  }

  static getSingleton(use: any): any {
    return this.getForElement(use);
  }
  protected static VectorClass: typeof MultiDimensionalVector =
      MultiDimensionalVector;
  protected static VALUE_LIMIT: number = VALUE_LIMIT;

  protected element: HTMLElement;

  private readonly args: any[];
  private values: T[];
  private destroyed: boolean;
  private destroyTimeout: number;
  private raf: Raf;

  protected constructor(element: any = null, ...args: any[]) {
    const instanceByElement = caches.get(this.constructor);
    this.raf = new Raf(() => this.loop());
    this.args = [element, ...args];

    if (instanceByElement.has([element, ...args])) {
      if (element) {
        throw new Error('Please use getForElement instead of new.');
      } else {
        throw new Error('Please use getSingleton instead of new.');
      }
    }

    this.destroyTimeout = null;
    this.destroyed = false;
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

  destroy(use: any): void {
    uses.get(this).delete(use);
    clearTimeout(this.destroyTimeout);
    // Hang tight for a minute so we aren't creating and destroying these caches
    // too rapidly.
    this.destroyTimeout = window.setTimeout(
        () => {
          if (uses.size <= 0) {
            caches.get(this.constructor).delete(this.args);
            this.raf.dispose();
            this.destroyed = true;
          }
        },
        1000);
  }

  protected getValues(): number[] {
    throw new Error('getValues must be overridden by child class');
  }

  private init(): void {
    // Init values so that instances can be created during a measure step if
    // necessary.
    this.raf.start();
  }

  private getVectorClass(): typeof MultiDimensionalVector {
    return (<typeof CachedElementVector>this.constructor).VectorClass;
  }

  private getCurrentVector(): T {
    return <T>new (this.getVectorClass())(...this.getValues());
  }

  private getValueLimit_(): number {
    return (<typeof CachedElementVector>this.constructor).VALUE_LIMIT;
  }

  private loop(): void {
    this.raf.preRead(() => this.measureValues());
  }

  private measureValues(): void {
    this.values =
        this.values
            .slice(-(this.getValueLimit_() - 1))
            .concat([this.getCurrentVector()]);
  }

  private getCurrentAndLastValue(): MultiDimensionalVector[] {
    return this.values.slice(-2);
  }
}
