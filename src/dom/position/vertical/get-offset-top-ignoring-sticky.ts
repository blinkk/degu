import { dom } from '../../dom';

const ignoredPositions = new Set(['fixed', 'absolute']);

/**
 * Returns the offsetTop of the element if the scrolled sticky wasn't applied.
 */
export function getOffsetTopIgnoringSticky(element: HTMLElement): number {
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
