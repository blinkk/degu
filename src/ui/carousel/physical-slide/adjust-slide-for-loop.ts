import { MatrixService } from './matrix-service';
import { Carousel } from '../carousel';
import { dom } from '../../..';
import { Vector } from '../../../mathf/vector';

const matrixService = MatrixService.getSingleton();

export function adjustSlideForLoop(
    carousel: Carousel, targetSlide: HTMLElement
): void {
  if (!carousel.allowsLooping()) {
    return; // Never adjust non-looping carousels
  }

  const totalWidth =
    carousel.getSlides().reduce(
        (total, slide) => total + slide.offsetWidth, 0);

  const distanceFromCenter =
    dom.getVisibleDistanceBetweenCenters(targetSlide).x +
    matrixService.getAlteredXTranslation(targetSlide);
  const distanceFromCenterSign = Math.sign(distanceFromCenter);
  const isOffscreen = Math.abs(distanceFromCenter) > (totalWidth / 2);

  // Reset during drag if the drag has gone exceedingly far
  if (isOffscreen) {
    const rootElement = document.children[0];
    const xTranslation = -totalWidth * distanceFromCenterSign;
    const translatedDistanceFromCenter =
      (rootElement.clientWidth * distanceFromCenterSign) +
      distanceFromCenter + xTranslation;

    if (
      Math.abs(translatedDistanceFromCenter) < Math.abs(distanceFromCenter)
    ) {
      matrixService.translate(targetSlide, new Vector(xTranslation, 0));
    }
  }
}
