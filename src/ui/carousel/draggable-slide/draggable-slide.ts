import { Carousel } from '../carousel';
import { dom, DomWatcher, mathf, Raf } from '../../..';
import { Transition } from '../transitions';
import { MatrixService } from './matrix-service';
import { Vector } from '../../../mathf/vector';
import { CubicBezier, EasingFunction } from '../../../mathf/cubic-bezier';
import { Draggable, DraggableEvent } from '../../draggable/draggable';
import { DraggableSynchronizer } from '../../draggable/draggable-synchronizer';
import { Matrix } from './matrix';
import { arrayf } from '../../../arrayf/arrayf';
import { DefaultMap } from '../../../map/default-map';

enum Direction {
  LEFT = -1,
  RIGHT = 1
}

/**
 * Returns the visible center position of the given element.
 */
function getVisibleCenter(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const raw =
      new Vector(rect.left + rect.width / 2, rect.top + rect.height / 2);
  return raw.add(MatrixService.getSingleton().getAlteredTranslation(el));
}

/**
 * Determine the distance between the centers of two given elements.
 * If no second element is given, `document.children[0]` is used.
 *
 * Uses the matrix service to account for translations that will be applied
 * during the raf write step. Note that MatrixService can only account for
 * translations that will be applied via MatrixService.
 *
 * @param a
 * @param b
 */
export function getVisibleDistanceBetweenCenters(
    a: HTMLElement, b: HTMLElement = null
): Vector {
  // Gather up the information on the first element's center position.
  const aCenter = getVisibleCenter(a);
  // Gather the info on the second element's center position or the root
  // element's center position.
  let bCenter;
  if (b !== null) {
    bCenter = getVisibleCenter(b);
  } else {
    bCenter = new Vector(
        document.children[0].clientWidth / 2,
        window.innerHeight / 2);
  }
  return aCenter.subtract(bCenter);
}

/**
 * Configuration options for this transition.
 */
export interface DraggableSlideConfig {
  transitionTime?: number; // How long the transition animation should take
  easingFunction?: EasingFunction; // Easing function for the transition
}

/**
 * Encapsulates information around a slide that needs to be transitioned to.
 */
class TransitionTarget {
  readonly target: HTMLElement;
  readonly timeRange: [number, number];
  readonly startDistance: number;

  constructor(
      target: HTMLElement,
      timeRange: [number, number],
      startDistance: number
  ) {
    this.target = target;
    this.timeRange = timeRange;
    this.startDistance = startDistance;
  }
}

/**
 * Tracks information about the start of an interaction
 */
class InteractionTarget {
  readonly target: HTMLElement;
  readonly time: number;
  readonly position: Vector;
  constructor(target: HTMLElement, time: number, position: Vector) {
    this.target = target;
    this.time = time;
    this.position = position;
  }
}

/**
 * A transition for a carousel that allows the user to drag and fling slides
 * around. Similar to the default interaction for a "slick" carousel.
 *
 * For proper operation, the slide elements within the carousel should be
 * lined up side-by-side and overflowing the container. The container should
 * be overflow: hidden; The slide elements themselves should not have transforms
 * applied. Children of the slide elements however can be transformed as needed
 * to achieve necessary visual effects.
 */
export class DraggableSlide implements Transition {
  private static DEFAULT_EASING: EasingFunction =
      new CubicBezier(0.445, 0.05, 0.55, 0.95).easingFunction();

  /**
   * Sums the offsetWidth of the given slides.
   *
   * Was repeated enough to seem worth extracting.
   */
  private static sumWidth(slides: HTMLElement[]) {
    return mathf.sum(slides.map((slide) => slide.offsetWidth));
  }
  private readonly easingFunction: EasingFunction;
  private readonly matrixService: MatrixService;
  private readonly domWatcher: DomWatcher;
  private readonly transitionTime: number;
  private readonly draggableSynchronizer: DraggableSynchronizer;
  private transitionTarget: TransitionTarget;
  private carousel: Carousel;
  private draggableBySlide: DefaultMap<HTMLElement, Draggable>;
  private interactionTarget: InteractionTarget;
  private resizeTimeout: number;
  private raf: Raf;

  constructor(
    {
      transitionTime = 500,
      easingFunction = DraggableSlide.DEFAULT_EASING
    }: DraggableSlideConfig = {}
  ) {
    this.raf = new Raf(() => this.loop());
    this.draggableSynchronizer = DraggableSynchronizer.getSingleton(this);
    this.matrixService = MatrixService.getSingleton();
    this.domWatcher = new DomWatcher();
    this.easingFunction = easingFunction;
    this.transitionTime = transitionTime;
    this.interactionTarget = null;
    this.transitionTarget = null;
    this.resizeTimeout = null;
  }

  init(activeSlide: HTMLElement, carousel: Carousel): void {
    this.domWatcher.add({
      element: window,
      on: 'resize',
      callback: () => {
        window.clearTimeout(this.resizeTimeout);
        this.resizeTimeout =
            window.setTimeout(
                () => this.transition(this.carousel.getActiveSlide(), 0));
      }
    });
    const options =
        carousel.allowsLooping() ?
            {
              horizontal: true
            } :
            {
              horizontal: true,
              constraints: [(draggable: Draggable, delta: Vector) => {
                return this.constrainDraggableSlide(draggable, delta);
              }]
            };
    this.draggableBySlide =
      DefaultMap.usingFunction(
          (slide: HTMLElement) => new Draggable(slide, options));
    this.carousel = carousel;
    carousel.onDispose((disposedCarousel) => this.dispose());
    // Transition to the given active slide
    this.raf.read(() => this.transition(activeSlide, 0));
    this.initDraggableSlides();
    this.raf.start();
  }

  loop(): void {
    this.raf.read(() => {
      if (!this.isBeingInteractedWith() && this.transitionTarget) {
        this.updateTransitionToTarget();
      } else {
        this.splitSlides();
      }
    });
  }

  /**
   * Transition to the given target within the given time.
   * @param targetEl
   * @param optTransitionTime Time the transition should take, uses value
   *    provided to the constructor is no value is provided for this call.
   */
  transition(
    targetEl: HTMLElement,
    optTransitionTime: number = null
  ): void {
    if (
      this.transitionTarget !== null &&
      this.transitionTarget.target === targetEl
    ) {
      return; // Don't reset target time
    }
    const transitionTime =
      optTransitionTime === null ? this.transitionTime : optTransitionTime;

    const now = performance.now();
    const timeRange: [number, number] = [now, now + transitionTime];
    const distance = this.getDistanceToCenter(targetEl);

    this.transitionTarget =
        new TransitionTarget(targetEl, timeRange, distance);
  }

  /**
   * Returns the currently active slide.
   */
  getActiveSlide(): HTMLElement {
    const lastActiveSlide = this.carousel.getLastActiveSlide();
    return arrayf.min(
      this.carousel.getSlides(),
      // Start with the one closest to the center
      (el) => {
        return Math.abs(
          getVisibleDistanceBetweenCenters(
            <HTMLElement>el, this.carousel.getContainer()).x);
      },
      // If two slides are tied for distance to the center default to the one
      // that was last active.
      (el) => el === lastActiveSlide ? 0 : 1,
      // If neither slide was last active default to the one that appears first
      // in the list of slides
      (el) => -1 * this.carousel.getSlideIndex(el)
    );
  }

  /**
   * Returns true if the carousel has transitioned to the given slide.
   * @param slide
   */
  hasTransitionedTo(slide: HTMLElement): boolean {
    return this.getDistanceToCenter(slide) === 0;
  }

  /**
   * Returns true if the user is interacting with the slides.
   */
  isBeingInteractedWith(): boolean {
    return this.interactionTarget !== null;
  }

  /**
   * Return the distance between the given slide and the center of the carousel.
   */
  private getDistanceToCenter(slide: HTMLElement): number {
    const container = this.carousel.getContainer();
    return getVisibleDistanceBetweenCenters(slide, container).x;
  }

  /**
   * Setup the Draggable instances that will correspond to the slide elements.
   */
  private initDraggableSlides(): void {
    const draggables =
      this.carousel.getSlides()
        .map(
          (slide) => {
            const draggable: Draggable = this.draggableBySlide.get(slide);
            this.domWatcher.add({
              element: draggable.element,
              on: DraggableEvent.START,
              callback: (e: Event) => this.startInteraction(e)
            });
            this.domWatcher.add({
              element: draggable.element,
              on: DraggableEvent.END,
              callback: (e: Event) => this.endInteraction(e)
            });
            return draggable;
          });
    this.draggableSynchronizer.sync(...draggables);
  }

  /**
   * Returns the eased transition percent.
   *
   * Extracted from updateTransitionToTarget so its name can serve to help
   * readability.
   */
  private getEasedTransitionPercent(): number {
    const transitionPercent =
        mathf.inverseLerp(
            this.transitionTarget.timeRange[0],
            this.transitionTarget.timeRange[1],
            performance.now());
    return this.easingFunction(transitionPercent);
  }

  /**
   * Adjust CSS properties to reflect the current state of the transition
   * animation to the current target.
   */
  private updateTransitionToTarget() {
    const target = this.transitionTarget;
    const easedPercent = this.getEasedTransitionPercent();
    const targetDistance = mathf.lerp(target.startDistance, 0, easedPercent);
    const currentDistance = this.getDistanceToCenter(target.target);
    const absDelta = Math.abs(targetDistance) - Math.abs(currentDistance);
    const currentDistanceSign = Math.sign(currentDistance);
    const xDelta = absDelta * currentDistanceSign;
    this.carousel.getSlides().forEach(
        (slide) => this.matrixService.translate(slide, xDelta, 0));
    this.splitSlides();

    // If we're close enough, let's call it
    if (easedPercent === 1) {
      this.transitionTarget = null;
    }
  }

  /**
   * Adjust the split of slides around the currently active slide.
   *
   * This ensures that the slides cover as much of the carousel as possible.
   * Also ensures that each slide keeps an appropriate distance from the active
   * slide.
   */
  private splitSlides(): void {
    // No matter what we need to loop adjust the target if we have one
    const activeSlide = this.carousel.getActiveSlide();
    const target: HTMLElement =
      (this.interactionTarget && this.interactionTarget.target) ||
      (this.transitionTarget && this.transitionTarget.target) ||
      activeSlide;

    // Shift slides from one side to the other for an even split if looping is
    // supported.
    if (target !== activeSlide && this.carousel.allowsLooping()) {
      this.loopOffscreenSlides(target);
    }

    const targetLeft = target.getBoundingClientRect().left;
    const targetRight = targetLeft + target.offsetWidth;

    const slides = this.carousel.getSlides();
    const nonTargetSlides =
        slides.filter((slide) => slide !== target);
    const targetIndex = this.carousel.getSlideIndex(target);
    const slidesToSplit = new Set(nonTargetSlides);

    const leftSlides = slides.slice(0, targetIndex);
    const rightSlides = slides.slice(targetIndex + 1);

    let leftDistanceToCover =
        this.carousel.allowsLooping() ?
            Math.max(targetLeft, 0) :
            DraggableSlide.sumWidth(leftSlides);

    const clientWidth = dom.getScrollElement().clientWidth;
    let rightDistanceToCover =
        this.carousel.allowsLooping() ?
            Math.min(clientWidth, clientWidth - targetRight) :
            DraggableSlide.sumWidth(rightSlides);

    const indices = new Map([
      [Direction.LEFT, targetIndex],
      [Direction.RIGHT, targetIndex]]);
    while (slidesToSplit.size > 0) {
      const direction =
          leftDistanceToCover > rightDistanceToCover ?
              Direction.LEFT :
              Direction.RIGHT;
      const index =
          mathf.wrap(indices.get(direction) + direction, 0, slides.length);
      indices.set(direction, index);
      const slideToSplit = slides[index];
      if (index === targetIndex || !slidesToSplit.has(slideToSplit)) {
        continue;
      }
      if (direction === Direction.LEFT) {
        leftDistanceToCover -= slideToSplit.offsetWidth;
      } else {
        rightDistanceToCover -= slideToSplit.offsetWidth;
      }
      this.splitSlideForTarget(target, slideToSplit, direction);
      slidesToSplit.delete(slideToSplit);
    }
  }

  /**
   * Return the distance of the given slide to the target slide.
   */
  private getDistanceToTarget(target: HTMLElement, slide: HTMLElement): number {
    return getVisibleDistanceBetweenCenters(slide, target).x +
      this.matrixService.getAlteredXTranslation(slide) -
      this.matrixService.getAlteredXTranslation(target);
  }

  /**
   * Handle the start of user interaction with the carousel.
   * @param event
   */
  private startInteraction(event: Event): void {
    if (this.interactionTarget !== null) {
      return;
    }
    const target = <HTMLElement>(event.target);
    this.transitionTarget = null;
    this.interactionTarget =
        new InteractionTarget(
            target,
            performance.now(),
            Matrix.fromElementTransform(target).getTranslation());
    this.carousel.stopTransition();
  }

  /**
   * Handle the end of user interaction with the carousel.
   * @param event
   */
  private endInteraction(event: Event): void {
    if (this.interactionTarget === null) {
      return;
    }

    const interactionDuration = performance.now() - this.interactionTarget.time;
    const activeSlide = this.getActiveSlide();
    const distance = this.getDistanceToCenter(activeSlide);

    const interactionDelta =
      Matrix.fromElementTransform(<HTMLElement>event.target)
        .getTranslation()
        .subtract(this.interactionTarget.position);
    const wasHorizontalDrag =
      Math.abs(interactionDelta.x) > Math.abs(interactionDelta.y);

    const velocity =
      interactionDuration > 700 && wasHorizontalDrag ? interactionDelta.x : 0;

    this.interactionTarget = null;

    const velocitySign = Math.sign(velocity);
    const distanceSign = Math.sign(distance) * -1;
    const allowsLooping = this.carousel.allowsLooping();

    // If the slide is already centered, then it is clearly the slide to
    // transition to.
    if (distance === 0 || distanceSign === velocitySign || velocity === 0) {
      this.carousel.transitionToSlide(activeSlide);
    } else {
      // If the user was dragging to the right, transition in the opposite
      // direction.
      if (velocitySign === Direction.RIGHT) {
        if (allowsLooping || activeSlide !== this.carousel.getFirstSlide()) {
          this.carousel.previous();
        } else {
          // If we are already at the first slide and can't loop, transition
          // as is.
          this.carousel.transitionToSlide(activeSlide);
        }
      // If the user was dragging to the left, transition in the opposite
      // direction.
      } else {
        if (allowsLooping || activeSlide !== this.carousel.getLastSlide()) {
          this.carousel.next();
        } else {
          // If we are already at the last slide and can't loop, transition
          // as is.
          this.carousel.transitionToSlide(activeSlide);
        }
      }
    }
  }

  /**
   * Reposition slides if they have been dragged far enough off one side that
   * they should be wrapping around onto the other side.
   * @param targetSlide
   */
  private loopOffscreenSlides(targetSlide: HTMLElement): void {
    const totalWidth = DraggableSlide.sumWidth(this.carousel.getSlides());

    const distanceToCenter =
        getVisibleDistanceBetweenCenters(targetSlide).x +
        this.matrixService.getAlteredXTranslation(targetSlide);
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
        (rootElement.clientWidth * distanceSign) +
        distanceToCenter +
        xTranslation;

    // Only loop the slide if it will bring it closer to the center of the
    // viewport than it already is.
    if (Math.abs(adjustedDistanceToCenter) < Math.abs(distanceToCenter)) {
      this.matrixService.translate(targetSlide, xTranslation, 0);
    }
  }

  /**
   * Adjusts the given slide within a carousel to keep slides split
   * appropriately.
   * @param target The slide to adjust around
   * @param slide The slide to adjust
   * @param direction The direction the slide should be split
   */
  private splitSlideForTarget(
      target: HTMLElement, slide: HTMLElement, direction: Direction
  ): void {
    const desiredOffset =
        this.getDesiredDistanceBetweenSlides(target, slide, direction);
    const difference = desiredOffset - this.getDistanceToTarget(target, slide);
    if (difference !== 0) {
      this.matrixService.translate(slide, difference, 0);
    }
  }

  /**
   * Return how far the given slide is from the given target slide in terms of
   * slide width in pixels.
   */
  private getDesiredDistanceBetweenSlides(
      target: HTMLElement,
      slide: HTMLElement,
      direction: Direction
  ): number {
    if (target === slide) {
      return 0;
    }
    const inBetweenSlides = this.getInBetweenSlides(target, slide, direction);
    const inBetweenWidth = DraggableSlide.sumWidth(inBetweenSlides);
    const halfSlide = slide.offsetWidth / 2;
    const halfTarget = target.offsetWidth / 2;
    return (halfSlide + inBetweenWidth + halfTarget) * direction;
  }

  /**
   * Return the slides in between the given start and end slide.
   * If the carousel is looping, work in the given direction.
   */
  private getInBetweenSlides(
      startSlide: HTMLElement,
      endSlide: HTMLElement,
      direction: Direction
  ): HTMLElement[] {
    const start = this.carousel.getSlideIndex(startSlide);
    const end = this.carousel.getSlideIndex(endSlide) - direction;
    if (start === end) {
      return [];
    } else if (this.carousel.allowsLooping()) {
      return arrayf.loopSlice(
          this.carousel.getSlides(), end, start, -direction);
    } else {
      // Use min and max to ensure that we slice in the right direction.
      return this.carousel.getSlides().slice(
          Math.min(start + 1, end),
          Math.max(start, end + direction));
    }
  }

  /**
   * Given a draggable, constrain the given delta so that the draggable does not
   * exceed the prescribed bounds of the carousel.
   * @param draggable
   * @param delta
   */
  private constrainDraggableSlide(draggable: Draggable, delta: Vector): Vector {
    const slides = this.carousel.getSlides();

    // Allow for centering the last slide
    const halfContainer = this.carousel.getContainer().offsetWidth / 2;
    const totalSlideWidth =
        mathf.sum(slides.map((s) => s.offsetWidth));
    const lastSlideWidth = slides.slice(-1)[0].offsetWidth;
    const halfLastSlide = lastSlideWidth / 2;
    const halfFirstSlide = slides[0].offsetWidth / 2;

    const min = halfContainer - totalSlideWidth + halfLastSlide;
    const max = halfContainer - halfFirstSlide;
    const currentX =
        this.matrixService.getAlteredMatrix(draggable.element).getTranslateX();
    const finalX = mathf.clamp(min, max, currentX + delta.x);
    const deltaX = finalX - currentX;

    return new Vector(deltaX, delta.y);
  }

  /**
   * Dispose of the transition.
   */
  private dispose() {
    window.clearTimeout(this.resizeTimeout);
    this.draggableSynchronizer.dispose(this);
    this.domWatcher.dispose();
  }
}
