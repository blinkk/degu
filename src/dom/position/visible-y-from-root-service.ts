import { DefaultMap } from '../../map/default';
import { dom, Raf } from '../..';
import { domVectorf } from './dom-vectorf';

const ignoredPositions = new Set(['fixed', 'absolute']);

function isFixed(element: HTMLElement) {
  return dom.getStyle(element).position === 'fixed';
}

function getTransformedOffset(candidateElement: HTMLElement): number {
  return candidateElement.offsetTop +
      domVectorf.fromElementTransform(candidateElement).y;
}

function getVisibleDistanceFromRoot(
    element: HTMLElement,
    getOffsetFn: (e: HTMLElement) => number
): number {
  // Short circuit for fixed elements
  if (isFixed(element)) {
    return element.offsetTop;
  }

  // Loop through offset parents and tally the distance
  let candidateElement: HTMLElement = <HTMLElement>element.offsetParent;
  let y = 0;
  while (candidateElement && candidateElement !== document.body) {
    // Special case for fixed elements
    if (isFixed(candidateElement)) {
      return y + candidateElement.offsetTop;
    } else {
      // Factor in the offset and the scroll
      y += getOffsetFn(candidateElement) - candidateElement.scrollTop;
    }
    candidateElement = <HTMLElement>candidateElement.offsetParent;
  }

  return getOffsetFn(element) + y - dom.getScrollElement().scrollTop;
}

/**
 * Caches element distances from the root on a per-frame basis.
 * It can be an expensive operation and will typically force style
 * recalc or layout, so it can be extra helpful in minimizing potential thrasing
 * in situations where there may be code running outside of appropriate raf
 * read/write calls.
 */
export class VisibleYFromRootService {
  static getSingleton(use: any): VisibleYFromRootService {
    this.singleton = this.singleton || new this();
    return this.singleton;
  }

  static getVisibleYFromRoot(element: HTMLElement): number {
    const singleton = this.getSingleton(this);
    return singleton.getVisibleYFromRoot(element);
  }

  private static singleton: VisibleYFromRootService = null;
  private raf: Raf;

  // DefaultMap serves as the cache, generating values and storing them
  // Gets cleared out during the postWrite step.
  private visibleYDistance: DefaultMap<HTMLElement, number>;

  // Allows singleton to persist for a little bit so it's not being created
  // and destroyed every frame by short-lived calls.
  private disposeTimeout: number;

  // Whether or not the instance has had dispose called
  private disposed: boolean = false;
  private readonly disposeHandler: () => void;

  constructor() {
    if (VisibleYFromRootService.singleton !== null) {
      throw new Error(
          'Please use "VisibleYFromRootService.getSingleton()" instead of ' +
          'calling "new() VisibleYFromRootService"');
    }
    VisibleYFromRootService.singleton = this;
    this.disposeTimeout = null;
    this.disposeHandler = () => this.dispose();
    this.visibleYDistance =
        DefaultMap.usingFunction((element: HTMLElement) => {
          return getVisibleDistanceFromRoot(element, getTransformedOffset);
        });
    this.init();
  }

  getVisibleYFromRoot(element: HTMLElement): number {
    // Restart if we've been disposed
    if (this.disposed) {
      this.init();
    }
    clearTimeout(this.disposeTimeout);
    this.disposeTimeout = window.setTimeout(this.disposeHandler, 1000);
    return this.visibleYDistance.get(element);
  }

  private init() {
    this.disposed = false;
    this.raf = new Raf(() => this.loop());
    this.raf.start();
  }

  private dispose() {
    this.raf.dispose();
    this.visibleYDistance.clear();
    this.disposed = true;
  }

  private loop() {
    this.raf.postWrite(() => this.visibleYDistance.clear());
  }
}
