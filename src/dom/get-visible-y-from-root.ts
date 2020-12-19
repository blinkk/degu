import { dom } from '../';
import { domVectorf } from './dom-vectorf';

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
      y += getOffsetFn(candidateElement) - candidateElement.scrollTop;
    }
    candidateElement = <HTMLElement>candidateElement.offsetParent;
  }

  return getOffsetFn(element) + y - dom.getScrollElement().scrollTop;
}

/**
 * Returns the visible distance between the top of the given element and the
 * top of the viewport.
 */
export function getVisibleYFromRoot(element: HTMLElement) {
  return getVisibleDistanceFromRoot(element, getTransformedOffset);
}
