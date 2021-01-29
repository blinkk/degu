import { Carousel } from '../carousel';
import { MatrixService } from './matrix-service';
import { Vector } from '../../../mathf/vector';
import { mathf } from '../../..';
import { arrayf } from '../../../arrayf/arrayf';

/**
 * Adjusts the given slide within a carousel to keep slides split appropriately.
 * @param carousel The carousel that contains the slides
 * @param targetSlide The slide to adjust around
 * @param slide The slide to adjust
 * @param distancesFromTarget A map of the distance between slides and the target
 * @param direction The direction the slide should be split
 */
export function adjustSlideForSplit(
  carousel: Carousel,
  targetSlide: HTMLElement,
  slide: HTMLElement,
  distancesFromTarget: Map<HTMLElement, number>,
  direction: number
): void {
  const targetOffset =
    getTargetSplitOffset(carousel, targetSlide, slide, direction);
  const difference = targetOffset - distancesFromTarget.get(slide);
  if (difference !== 0) {
    MatrixService.getSingleton().translate(slide, new Vector(difference, 0));
  }
}

function getTargetSplitOffset(
  carousel: Carousel,
  targetSlide: HTMLElement,
  slide: HTMLElement,
  direction: number
): number {
  if (targetSlide === slide) {
    return 0;
  }
  const inBetweenSlides =
    getInBetweenSlides(carousel, targetSlide, slide, direction);
  const inBetweenWidth =
      mathf.sum(inBetweenSlides.map((el) => el.offsetWidth));
  const halfSlideWidth = slide.offsetWidth / 2;
  const halfTargetSlideWidth = targetSlide.offsetWidth / 2;
  return (halfSlideWidth + inBetweenWidth + halfTargetSlideWidth) * direction;
}

function getInBetweenSlides(
  carousel: Carousel,
  targetSlide: HTMLElement,
  slide: HTMLElement,
  direction: number
): HTMLElement[] {
  const targetIndex = carousel.getSlideIndex(targetSlide);
  const endIndex = carousel.getSlideIndex(slide) - direction;
  if (carousel.allowsLooping()) {
    return arrayf.loopSlice(
        carousel.getSlides(), endIndex, targetIndex, -direction);
  } else if (targetIndex === endIndex) {
    return [];
  } else {
    return carousel.getSlides().slice(
      Math.min(targetIndex + 1, endIndex),
      Math.max(targetIndex, endIndex + direction));
  }
}
