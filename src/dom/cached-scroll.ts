import { DefaultMap } from '../map/default';
import { Raf } from '../';
import { dom } from './dom';

/**
 * Caches element scroll on a per-frame basis.
 * Useful for measuring element distances as high level elements may be queried
 * multiple times.
 */
export class CachedScroll {
  static getSingleton(use: any): CachedScroll {
    this.singleton = this.singleton || new this();
    this.singleton.uses.push(use);
    return this.singleton;
  }

  static getRootScrollTop(): number {
    return this.getScrollTop(dom.getScrollElement());
  }

  static getScrollTop(element: Element): number {
    const singleton = this.getSingleton(this);
    const style = singleton.getScrollTop(element);
    singleton.dispose(this);
    return style;
  }

  private static singleton: CachedScroll = null;
  private readonly raf: Raf;

  // DefaultMap serves as the cache, generating values and storing them
  // Gets cleared out during the postWrite step.
  private scrollTop: DefaultMap<Element, number>;

  // Track where this is used so it can be destroyed as needed;
  private readonly uses: any[];

  // Allows singleton to persist for a little bit so it's not being created
  // and destroyed every frame by short-lived calls.
  private disposeTimeout: number;

  constructor() {
    this.uses = [];
    this.disposeTimeout = null;
    this.raf = new Raf(() => this.loop());
    this.scrollTop =
        DefaultMap.usingFunction((element: Element) => element.scrollTop);
    this.raf.start();
  }

  getScrollTop(element: Element): number {
    return this.scrollTop.get(element);
  }

  dispose(use: any) {
    const useIndex = this.uses.indexOf(use);
    if (useIndex === -1) {
      return;
    }
    this.uses.splice(useIndex, 1);
    // Hang tight for a minute so we aren't creating and destroying the
    // singleton too rapidly.
    clearTimeout(this.disposeTimeout);
    this.disposeTimeout = window.setTimeout(
        () => {
          if (this.uses.length <= 0) {
            CachedScroll.singleton = null;
            this.raf.dispose();
            this.scrollTop.clear();
          }
        },
        1000);
  }

  private loop() {
    this.raf.postWrite(() => this.scrollTop.clear());
  }
}
