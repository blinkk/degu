import { HorizontallyDraggable } from '../../draggable/horizontally-draggable';
import { DefaultMap } from '../../../map/default-map';
import { Draggable } from '../../draggable/draggable';
import { Carousel } from '../carousel';
import { Vector } from '../../../mathf/vector';
import { mathf } from '../../..';
import { Matrix } from './matrix';

/**
 * Given a carousel and draggable, constrain the given delta so that the
 * draggable does not exceed the prescribed bounds of the carousel.
 * @param carousel
 * @param draggable
 * @param delta
 */
function constrainDraggableSlide(
    carousel: Carousel, draggable: Draggable, delta: Vector
): Vector {
  const slides = carousel.getSlides();
  const container = carousel.getContainer();

  // Allow for centering the last slide
  const halfContainerWidth = container.offsetWidth / 2;
  const widthOfAllSlides =
      mathf.sum(slides.map((s) => s.offsetWidth));
  const widthOfLastSlide = slides.slice(-1)[0].offsetWidth;
  const halfWidthOfLastSlide = widthOfLastSlide / 2;
  const halfWidthOfFirstSlide = slides[0].offsetWidth / 2;

  const min =
      halfContainerWidth - widthOfAllSlides + halfWidthOfLastSlide;
  const max = halfContainerWidth - halfWidthOfFirstSlide;
  const currentX =
      Matrix.fromElementTransform(draggable.element).getTranslateX();
  const finalX = currentX + delta.x;
  const clampedFinalX = mathf.clamp(min, max, finalX);
  const deltaX = clampedFinalX - currentX;

  return new Vector(deltaX, delta.y);
}

/**
 * Map slide elements to Draggables that are appropriately constrained to the
 * carousel.
 */
export class SlideToDraggableMap extends DefaultMap<HTMLElement, Draggable> {
  constructor(carousel: Carousel) {
    const constraints =
        carousel.allowsLooping() ?
            [] :
            [(draggable: Draggable, delta: Vector) => {
              return constrainDraggableSlide(carousel, draggable, delta);
            }];

    const options = { constraints };
    const defaultFn =
        (slide: HTMLElement) => new HorizontallyDraggable(slide, options);
    super([], defaultFn);
  }
}
