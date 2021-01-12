import { Carousel } from '../carousel';
import { MatrixService } from './matrix-service';
import { Vector } from '../../../mathf/vector';
import { mathf } from '../../..';
import { arrayf } from '../../../arrayf/arrayf';

export function adjustSlideForSplit(
  carousel: Carousel,
  targetSlide: HTMLElement,
  slide: HTMLElement,
  distancesFromTarget: Map<HTMLElement, number>,
  direction: number
): void {
  const targetOffset =
    getTargetSplitOffset(carousel, targetSlide, slide, direction);
  const distance = distancesFromTarget.get(slide);

  const difference = targetOffset - distance;
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
