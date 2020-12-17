import { DynamicDefaultMap } from '../map/dynamic-default';
import { Raf } from '..';
import { arrayf } from '../arrayf/arrayf';

/**
 * Caches results of getComputedStyle on a per-frame basis.
 * It can be an expensive operation and will typically force style
 * recalc or layout, so it can be extra helpful in minimizing potential trhasing
 * in situations where there may be code running outside of appropriate raf
 * read/write calls.
 */
export class ComputedStyleService {
  static getSingleton(use: any): ComputedStyleService {
    this.singleton = this.singleton || new this();
    this.singleton.uses.push(use);
    return this.singleton;
  }

  private static singleton: ComputedStyleService = null;
  private readonly raf: Raf;

  // DynamicDefaultMap serves as the cache, generating values and storing them
  // Gets cleared out during the postWrite step.
  private computedStyle: DynamicDefaultMap<Element, CSSStyleDeclaration>;

  // Track where this is used so it can be destroyed as needed;
  private uses: any[];

  // Allows singleton to persist for a little bit so it's not being created
  // and destroyed every frame by short-lived calls.
  private disposeTimeout: number;

  constructor() {
    this.uses = [];
    this.disposeTimeout = null;
    this.raf = new Raf(() => this.loop());
    this.computedStyle =
        DynamicDefaultMap.usingFunction(
            (element: Element) => window.getComputedStyle(element));
    this.init();
  }

  getComputedStyle(element: Element) {
    return this.computedStyle.get(element);
  }

  dispose(use: any) {
    this.uses = arrayf.removeFirstInstance(this.uses, use);
    // Hang tight for a minute so we aren't creating and destroying the
    // singleton too rapidly.
    clearTimeout(this.disposeTimeout);
    this.disposeTimeout = window.setTimeout(
        () => {
          if (this.uses.length <= 0) {
            ComputedStyleService.singleton = null;
            this.raf.dispose();
            this.computedStyle.clear();
          }
        },
        1000);
  }

  private init() {
    this.raf.start();
  }

  private loop() {
    this.raf.postWrite(() => this.computedStyle.clear());
  }
}
