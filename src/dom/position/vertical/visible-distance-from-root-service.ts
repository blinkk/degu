/**
 * Caches the distance of an element from the top of the viewport.
 * Without caching this can be an expensive recursive operation.
 */
import { DynamicDefaultMap } from '../../../map/dynamic-default';
import { Scroll } from '../../scroll';
import { Vector2dDom } from '../vector-2d-dom';
import { dom, mathf, Raf } from '../../..';

const ignoredPositions = new Set(['fixed', 'absolute']);

/**
 * Returns the offsetTop of the element if the scrolled sticky wasn't applied.
 */
function getOffsetTopIgnoringSticky(element: HTMLElement): number {
  const position = dom.getStyle(element).position;
  // Short circuit if the given element isn't sticky
  if (position !== 'sticky') {
    return element.offsetTop;
  } else {
    /**
     * Loop through all sibling and parent elements until the offset parent is
     * found to find out where this element would be if it wasn't stickily
     * positioned.
     */
    const previousSiblingHeight = getPreviousSiblingsHeight(element);
    let previousParent = element.parentElement;
    let parentPreviousSiblingHeight = 0;
    while (previousParent !== element.offsetParent) {
      parentPreviousSiblingHeight += getPreviousSiblingsHeight(previousParent);
      previousParent = previousParent.parentElement;
    }

    return previousSiblingHeight + parentPreviousSiblingHeight;
  }
}

/**
 * Returns the total offsetHeight of the element's previous siblings which are
 * relevant to calculating the offsetTop of the element as if it was not
 * sticky positioned.
 */
function getPreviousSiblingsHeight(element: HTMLElement): number {
  let previousSiblingHeight: number = 0;
  let previousSibling: HTMLElement =
      <HTMLElement>element.previousElementSibling;

  /**
   * Loop through previous siblings, totalling height, but ignoring fixed
   * or absolute elements, and totalling only the height of stickied siblings.
   */
  while (previousSibling) {
    const previousSiblingPosition = dom.getStyle(previousSibling).position;
    if (!ignoredPositions.has(previousSiblingPosition)) {
      if (previousSiblingPosition === 'sticky') {
        previousSiblingHeight += previousSibling.offsetHeight;
      } else {
        previousSiblingHeight +=
            previousSibling.offsetTop + previousSibling.offsetHeight;
        break;
      }
    }
    previousSibling = <HTMLElement>previousSibling.previousElementSibling;
  }
  return previousSiblingHeight;
}

/**
 * Returns how many pixels of scroll an element has been "stuck" for.
 */
function getStuckDistance(element: HTMLElement): number {
  const position = dom.getStyle(element).position;
  if (position !== 'sticky') {
    return 0;
  } else {
    const ignoringStickyOffsetTop = getOffsetTopIgnoringSticky(element);

    const stickyContainer = element.parentElement;
    const parentElementOffsetTop: number =
        VisibleDistanceFromRootService.getSingleton()
            .getVisibleDistanceFromRoot(stickyContainer);

    const maxStickyDistance =
        stickyContainer.offsetHeight - ignoringStickyOffsetTop -
        element.offsetHeight;

    const estimatedStickyDistance =
        -1 * (ignoringStickyOffsetTop + parentElementOffsetTop);
    return mathf.clamp(0, maxStickyDistance, estimatedStickyDistance);
  }
}

function isFixed(element: HTMLElement) {
  return dom.getStyle(element).position === 'fixed';
}

function getIgnoreStickyOffset(candidateElement: HTMLElement): number {
  return getTransformedOffset(candidateElement) - getStuckDistance(candidateElement);
}

function getTransformedOffset(candidateElement: HTMLElement): number {
  return candidateElement.offsetTop +
      Vector2dDom.fromElementTransform(candidateElement).getY();
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

  const scroll = Scroll.getSingleton(getVisibleDistanceFromRoot);
  const invertedScroll = scroll.getPosition().invert();
  scroll.dispose(getVisibleDistanceFromRoot);
  return getOffsetFn(element) + y + invertedScroll.getY();
}

export class VisibleDistanceFromRootService {
  static getSingleton(): VisibleDistanceFromRootService {
    return this.singleton = this.singleton || new this();
  }
  private static singleton: VisibleDistanceFromRootService = null;
  private readonly raf: Raf;
  private readonly cache: DynamicDefaultMap<HTMLElement, number>;
  private readonly cacheIgnoringSticky: DynamicDefaultMap<HTMLElement, number>;

  constructor() {
    this.raf = new Raf(() => this.loop());
    this.cache =
        DynamicDefaultMap.usingFunction(
            (element: HTMLElement) => {
              return getVisibleDistanceFromRoot(element, getTransformedOffset);
            });
    this.cacheIgnoringSticky =
        DynamicDefaultMap.usingFunction(
            (element: HTMLElement) => {
              return getVisibleDistanceFromRoot(element, getIgnoreStickyOffset);
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
    this.cacheIgnoringSticky.clear();
  }
}
