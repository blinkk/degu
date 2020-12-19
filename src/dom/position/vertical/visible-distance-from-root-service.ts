/**
 * Caches the distance of an element from the top of the viewport.
 * Without caching this can be an expensive recursive operation.
 */
import { DefaultMap } from '../../../map/default';
import { CachedScroll } from '../../cached-scroll';
import { dom, Raf } from '../../..';
import { domVectorf } from '../dom-vectorf';

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

  return getOffsetFn(element) + y - CachedScroll.getRootScrollTop();
}

export class VisibleDistanceFromRootService {
  static getSingleton(): VisibleDistanceFromRootService {
    return this.singleton = this.singleton || new this();
  }
  private static singleton: VisibleDistanceFromRootService = null;
  private readonly raf: Raf;
  private readonly cache: DefaultMap<HTMLElement, number>;

  constructor() {
    this.raf = new Raf(() => this.loop());
    this.cache =
        DefaultMap.usingFunction(
            (element: HTMLElement) => {
              return getVisibleDistanceFromRoot(element, getTransformedOffset);
            });
    this.raf.start();
  }

  /**
   * Returns the visible distance from the elements top to the top of the
   * viewport.
   */
  getVisibleDistanceFromRoot(element: HTMLElement): number {
    return this.cache.get(element);
  }

  /**
   * Clear caches during the postWrite step.
   */
  private loop() {
    this.raf.postWrite(() => this.clearCaches());
  }

  private clearCaches() {
    this.cache.clear();
  }
}
