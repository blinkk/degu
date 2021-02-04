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

  // Allow for centering the last slide
  const halfContainer = carousel.getContainer().offsetWidth / 2;
  const totalSlideWidth =
      mathf.sum(slides.map((s) => s.offsetWidth));
  const lastSlideWidth = slides.slice(-1)[0].offsetWidth;
  const halfLastSlide = lastSlideWidth / 2;
  const halfFirstSlide = slides[0].offsetWidth / 2;

  const min = halfContainer - totalSlideWidth + halfLastSlide;
  const max = halfContainer - halfFirstSlide;
  const currentX =
      Matrix.fromElementTransform(draggable.element).getTranslateX();
  const finalX = mathf.clamp(min, max, currentX + delta.x);
  const deltaX = finalX - currentX;

  return new Vector(deltaX, delta.y);
}

/**
 * Map slide elements to Draggables that are appropriately constrained to the
 * carousel.
 */
export class SlideToDraggableMap extends DefaultMap<HTMLElement, Draggable> {
  constructor(carousel: Carousel) {
    const options =
        carousel.allowsLooping() ?
            {} :
            {
              constraints: [(draggable: Draggable, delta: Vector) => {
                return constrainDraggableSlide(carousel, draggable, delta);
              }]
            };
    const defaultFn =
        (slide: HTMLElement) => new HorizontallyDraggable(slide, options);
    super([], defaultFn);
  }
}
