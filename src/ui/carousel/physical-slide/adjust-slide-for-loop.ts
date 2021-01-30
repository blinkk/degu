import { MatrixService } from './matrix-service';
import { dom, mathf } from '../../..';
import { Vector } from '../../../mathf/vector';

const matrixService = MatrixService.getSingleton();

/**
 * Reposition slides if they have been dragged far enough off one side that they
 * should be wrapping around onto the other side.
 * @param slides
 * @param targetSlide
 */
export function adjustSlideForLoop(
    slides: HTMLElement[], targetSlide: HTMLElement
): void {
  const totalWidth =
      mathf.sum(slides.map((slide) => slide.offsetWidth));

  const distanceToCenter =
    dom.getVisibleDistanceBetweenCenters(targetSlide).x +
    matrixService.getAlteredXTranslation(targetSlide);
  const distanceSign = Math.sign(distanceToCenter);
  const isOffscreen = Math.abs(distanceToCenter) > (totalWidth / 2);

  // If the slides are not offscreen they do not need to be adjusted.
  if (!isOffscreen) {
    return;
  }

  // Reset during drag if the drag has gone exceedingly far
  const rootElement = document.children[0];
  const xTranslation = -totalWidth * distanceSign;
  const adjustedDistanceToCenter =
    (rootElement.clientWidth * distanceSign) + distanceToCenter + xTranslation;

  if (Math.abs(adjustedDistanceToCenter) < Math.abs(distanceToCenter)) {
    matrixService.translate(targetSlide, new Vector(xTranslation, 0));
  }
}
