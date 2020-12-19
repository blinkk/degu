import { DefaultMap } from '../../map/default';
import { Raf } from '../..';

/**
 * Caches element dimensions on a per-frame basis.
 * Useful for measuring element distances as high level elements may be queried
 * multiple times.
 */
export class CachedOffset {
  static getSingleton(use: any): CachedOffset {
    this.singleton = this.singleton || new this();
    this.singleton.uses.push(use);
    return this.singleton;
  }

  static getHeight(element: HTMLElement): number {
    const singleton = this.getSingleton(this);
    const style = singleton.getHeight(element);
    singleton.dispose(this);
    return style;
  }

  private static singleton: CachedOffset = null;
  private readonly raf: Raf;

  // DefaultMap serves as the cache, generating values and storing them
  // Gets cleared out during the postWrite step.
  private offsetHeight: DefaultMap<HTMLElement, number>;

  // Track where this is used so it can be destroyed as needed;
  private readonly uses: any[];

  // Allows singleton to persist for a little bit so it's not being created
  // and destroyed every frame by short-lived calls.
  private disposeTimeout: number;

  constructor() {
    this.uses = [];
    this.disposeTimeout = null;
    this.raf = new Raf(() => this.loop());
    this.offsetHeight =
        DefaultMap.usingFunction(
            (element: HTMLElement) => element.offsetHeight);
    this.raf.start();
  }

  getHeight(element: HTMLElement): number {
    return this.offsetHeight.get(element);
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
            CachedOffset.singleton = null;
            this.raf.dispose();
            this.offsetHeight.clear();
          }
        },
        1000);
  }

  private loop() {
    this.raf.postWrite(() => this.offsetHeight.clear());
  }
}
