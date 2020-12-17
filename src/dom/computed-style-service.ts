import { DynamicDefaultMap } from '../map/dynamic-default';
import { Raf } from '..';

/**
 * Caches results of getComputedStyle on a per-frame basis.
 * It can be an expensive operation and will typically force style
 * recalc or layout, so it can be extra helpful in minimizing potential trhasing
 * in situations where there may be code running outside of appropriate raf
 * read/write calls.
 */
export class ComputedStyleService {
  static getSingleton(): ComputedStyleService {
    return this.singleton = this.singleton || new this();
  }

  private static singleton: ComputedStyleService = null;
  private readonly raf: Raf;

  // DynamicDefaultMap serves as the cache, generating values and storing them
  // Gets cleared out during the postWrite step.
  private computedStyle: DynamicDefaultMap<Element, CSSStyleDeclaration>;

  constructor() {
    this.raf = new Raf(() => this.loop());
    this.computedStyle =
        DynamicDefaultMap.usingFunction(
            (element: Element) => window.getComputedStyle(element));
    this.init();
  }

  getComputedStyle(element: Element) {
    return this.computedStyle.get(element);
  }

  private init() {
    this.raf.start();
  }

  private loop() {
    this.raf.postWrite(() => this.computedStyle.clear());
  }
}
