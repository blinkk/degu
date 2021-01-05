import { dom } from '../';
import { domVectorf } from './dom-vectorf';

/**
 * Determine if the given element is fixed.
 */
function isFixed(element: HTMLElement) {
  return dom.getStyle(element).position === 'fixed';
}

/**
 * Factor in the transform of the given element when determining its offseTop
 */
function getTransformedOffsetTop(candidateElement: HTMLElement): number {
  return candidateElement.offsetTop +
      domVectorf.fromElementTransform(candidateElement).y;
}

/**
 * Returns the visible distance between the top of the given element and the
 * top of the viewport.
 *
 * Useful for specific scroll-based effects and in-view checks that cannot
 * be easily expressed via a configuration.
 *
 * ```
 * function getEffectPercent() {
 *    const start = getSomeHeaderHeight();
 *    const end = start + getViewportHeight() - getSomeFooterHeight();
 *    const distanceFromRoot = getViewportY(this.el);
 *    return mathf.inverseLerp(-1 * start, -1 * end, -1 * distanceFromRoot);
 * }
 * ```
 */
export function getViewportY(element: HTMLElement): number {
  // Short circuit for fixed elements.
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
      y +=
          getTransformedOffsetTop(candidateElement) -
          candidateElement.scrollTop;
    }
    candidateElement = <HTMLElement>candidateElement.offsetParent;
  }

  return getTransformedOffsetTop(element) + y -
      dom.getScrollElement().scrollTop;
}
