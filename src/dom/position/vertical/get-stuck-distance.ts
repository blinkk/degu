import { getStyle } from '../../style/get-style';
import { getVisibleDistanceFromRoot } from './get-visible-distance-from-root';
import { NumericRange } from '../../../mathf/numeric-range';
import { getOffsetTopIgnoringSticky } from './get-offset-top-ignoring-sticky';

const ignoredPositions = new Set(['fixed', 'absolute']);

export function getStuckDistance(element: HTMLElement): number {
  const position = getStyle(element, 'position');
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

    const stickyRange = new NumericRange(0, maxStickyDistance);
    const estimatedStickyDistance =
      -1 * (ignoringStickyOffsetTop + parentElementOffsetTop);
    return stickyRange.clamp(estimatedStickyDistance);
  }
}
