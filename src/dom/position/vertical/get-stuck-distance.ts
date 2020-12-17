import { getVisibleDistanceFromRoot } from './get-visible-distance-from-root';
import { getOffsetTopIgnoringSticky } from './get-offset-top-ignoring-sticky';
import {dom, mathf} from '../../..';

const ignoredPositions = new Set(['fixed', 'absolute']);

export function getStuckDistance(element: HTMLElement): number {
  const position = dom.getStyle(element).position;
  if (position !== 'sticky') {
    return 0;
  } else {
    const ignoringStickyOffsetTop = getOffsetTopIgnoringSticky(element);

    const stickyContainer = element.parentElement;
    const parentElementOffsetTop: number =
      getVisibleDistanceFromRoot(stickyContainer);

    const maxStickyDistance =
      stickyContainer.offsetHeight - ignoringStickyOffsetTop -
      element.offsetHeight;

    const estimatedStickyDistance =
      -1 * (ignoringStickyOffsetTop + parentElementOffsetTop);
    return mathf.clamp(0, maxStickyDistance, estimatedStickyDistance);
  }
}
