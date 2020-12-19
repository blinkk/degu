import { dom } from '../';
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
export function getVisibleYFromRoot(element: HTMLElement) {
  return getVisibleDistanceFromRoot(element, getTransformedOffset);
}
