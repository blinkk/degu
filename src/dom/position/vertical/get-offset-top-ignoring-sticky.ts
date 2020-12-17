import {dom} from '../../dom';

const ignoredPositions = new Set(['fixed', 'absolute']);

function getPreviousSiblingHeight(element: HTMLElement): number {
  let previousSiblingHeight: number = 0;
  let previousSibling: HTMLElement =
      <HTMLElement>element.previousElementSibling;
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

function getOffsetTopIgnoringSticky(element: HTMLElement): number {
  const position = dom.getStyle(element).position;
  if (position !== 'sticky') {
    return element.offsetTop;
  } else {
    const previousSiblingHeight = getPreviousSiblingHeight(element);
    let previousParent = element.parentElement;
    let parentPreviousSiblingHeight = 0;
    while (previousParent !== element.offsetParent) {
      parentPreviousSiblingHeight += getPreviousSiblingHeight(previousParent);
      previousParent = previousParent.parentElement;
    }

    return previousSiblingHeight + parentPreviousSiblingHeight;
  }
}

export { getOffsetTopIgnoringSticky };
