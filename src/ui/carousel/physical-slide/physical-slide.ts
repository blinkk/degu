import { SlideToDraggableMap } from './slide-to-draggable-map';
import { adjustSlideForSplit } from './adjust-slide-for-split';
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
function getVisibleDistanceBetweenCenters(
    a: HTMLElement, b: HTMLElement = null
): Vector {
  // Gather up the information on the first element's center position.
  const aRect = a.getBoundingClientRect();
  const rawACenter = new Vector(
      aRect.left + aRect.width / 2,
      aRect.top + aRect.height / 2);
  const aCenter =
      rawACenter.add(
          MatrixService.getSingleton().getAlteredTranslation(a));
  // Gather the info on the second element's center position or the root
  // element's center position.
  let bCenter;
  if (b !== null) {
    const bRect = b.getBoundingClientRect();
    const rawBCenter = new Vector(
        bRect.left + bRect.width / 2,
        bRect.top + bRect.height / 2);
    bCenter =
        rawBCenter.add(
            MatrixService.getSingleton().getAlteredTranslation(b));
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
export interface PhysicalSlideConfig {
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
    this.startDistance = startDistance;
    this.target = target;
    this.timeRange = timeRange;
  }
}

/**
 * Tracks information about the start of an interaction
 */
class InteractionStart {
  readonly time: number;
  readonly position: Vector;
  constructor(time: number, position: Vector) {
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
 * applied to themselves. Children of the slide elements however can be
 * transformed as needed to achieve any visual effects needed.
 */
export class PhysicalSlide implements Transition {
  private static DEFAULT_EASING: EasingFunction =
      new CubicBezier(0.445, 0.05, 0.55, 0.95).easingFunction();
  private readonly easingFunction: EasingFunction;
  private readonly matrixService: MatrixService;
  private readonly domWatcher: DomWatcher;
  private readonly resizeHandler: () => void;
  private readonly transitionTime: number;
  private readonly draggableSynchronizer: DraggableSynchronizer;
  private transitionTarget: TransitionTarget;
  private carousel: Carousel;
  private draggableBySlide: SlideToDraggableMap;
  private interactionTarget: HTMLElement;
  private interactionStart: InteractionStart;
  private resizeTimeout: number;
  private raf: Raf;

  constructor(
    {
      transitionTime = 500,
      easingFunction = PhysicalSlide.DEFAULT_EASING
    }: PhysicalSlideConfig = {}
  ) {
    this.raf = new Raf();
    this.draggableSynchronizer = DraggableSynchronizer.getSingleton(this);
    this.matrixService = MatrixService.getSingleton();
    this.domWatcher = new DomWatcher();
    this.easingFunction = easingFunction;
    this.interactionStart = null;
    this.transitionTime = transitionTime;
    this.transitionTarget = null;
    this.interactionTarget = null;

    this.resizeTimeout = null;
    this.resizeHandler = () => {
      window.clearTimeout(this.resizeTimeout);
      this.resizeTimeout = window.setTimeout(() => {
        this.transition(this.carousel.getActiveSlide(), 0);
      });
    };

    window.addEventListener('resize', this.resizeHandler);
  }

  init(activeSlide: HTMLElement, carousel: Carousel): void {
    this.draggableBySlide = new SlideToDraggableMap(carousel);
    this.carousel = carousel;
    carousel.onDispose((disposedCarousel) => this.dispose());
    // Transition to the given active slide
    this.raf.read(() => this.transition(activeSlide, 0));
    this.initDraggableSlides();
  }

  loop(): void {
    this.raf.read(() => {
      if (!this.isBeingInteractedWith() && this.transitionTarget) {
        this.updateTransitionToTarget();
      } else {
        this.adjustSplit();
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

  isBeingInteractedWith(): boolean {
    return this.interactionTarget !== null;
  }

  /**
   * Return the distance between the given slide and the center of the carousel.
   * @param slide
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
   * Adjust CSS properties to reflect the current state of the transition
   * animation to the current target.
   */
  private updateTransitionToTarget() {
    const target = this.transitionTarget;
    const transitionPercent =
        mathf.inverseLerp(
            target.timeRange[0], target.timeRange[1], performance.now());
    const easedPercent = this.easingFunction(transitionPercent);
    const targetDistance = mathf.lerp(target.startDistance, 0, easedPercent);
    const currentDistance = this.getDistanceToCenter(target.target);
    const absDelta = Math.abs(targetDistance) - Math.abs(currentDistance);
    const currentDistanceSign = Math.sign(currentDistance);
    const deltaX = absDelta * currentDistanceSign;
    this.carousel.getSlides()
      .forEach((slide) => {
        MatrixService.getSingleton().translate(slide, { x: deltaX, y: 0 });
      });
    this.adjustSplit();

    // If we're close enough, let's call it
    if (easedPercent === 1) {
      this.transitionTarget = null;
    }
  }

  /**
   * Adjust the split of slides around the currently active slide.
   */
  private adjustSplit(): void {
    // No matter what we need to loop adjust the target if we have one
    let target;
    if (this.interactionTarget !== null) {
      target = this.interactionTarget;
    } else if (this.transitionTarget !== null) {
      target = this.transitionTarget.target;
    } else {
      target = null;
    }

    // Shift slides from one side to the other for an even split if looping is
    // supported.
    if (target !== null && this.carousel.allowsLooping()) {
      this.adjustSlideForLoop(target);
    }

    const targetSlide = target ? target : this.carousel.getActiveSlide();
    const distancesFromTarget = this.getDistancesFromTarget(targetSlide);

    const slideLeftEdgeDistanceFromLeftEdge =
        targetSlide.getBoundingClientRect().left;
    const slideRightEdgeDistanceFromWindowLeftEdge =
        slideLeftEdgeDistanceFromLeftEdge + targetSlide.offsetWidth;

    const slides = this.carousel.getSlides();
    const nonTargetSlides =
        slides.filter((slide) => slide !== targetSlide);
    const targetSlideIndex = this.carousel.getSlideIndex(targetSlide);
    const slidesToAdjust = new Set(nonTargetSlides);
    const slideCount = slides.length;

    let distanceOnLeftToCover =
        this.carousel.allowsLooping() ?
            Math.max(slideLeftEdgeDistanceFromLeftEdge, 0) :
            mathf.sum(
                slides.slice(0, targetSlideIndex)
                    .map((slide) => slide.offsetWidth));
    const clientWidth = dom.getScrollElement().clientWidth;

    let leftIndex = targetSlideIndex;
    let distanceOnRightToCover =
        this.carousel.allowsLooping() ?
            Math.min(
                clientWidth,
                clientWidth - slideRightEdgeDistanceFromWindowLeftEdge) :
            mathf.sum(
                slides.slice(targetSlideIndex + 1)
                    .map((slide) => slide.offsetWidth));
    let rightIndex = targetSlideIndex;

    while (slidesToAdjust.size > 0) {
      if (distanceOnLeftToCover > distanceOnRightToCover) {
        leftIndex = mathf.wrap(leftIndex - 1, 0, slideCount);
        if (leftIndex === targetSlideIndex) {
          continue;
        }
        const slideToAdjust = slides[leftIndex];
        if (!slidesToAdjust.has(slideToAdjust)) {
          continue;
        }
        adjustSlideForSplit(
            this.carousel, targetSlide, slideToAdjust, distancesFromTarget, -1);
        distanceOnLeftToCover -= slideToAdjust.offsetWidth;
        slidesToAdjust.delete(slideToAdjust);
      } else {
        rightIndex = mathf.wrap(rightIndex + 1, 0, slideCount);
        if (rightIndex === targetSlideIndex) {
          continue;
        }
        const slideToAdjust = slides[rightIndex];
        if (!slidesToAdjust.has(slideToAdjust)) {
          continue;
        }
        adjustSlideForSplit(
            this.carousel, targetSlide, slideToAdjust, distancesFromTarget, 1);
        distanceOnRightToCover -= slideToAdjust.offsetWidth;
        slidesToAdjust.delete(slideToAdjust);
      }
    }
  }

  /**
   * Return a mapping of slide elements to their distance from the given target
   * slide.
   * @param targetSlide
   */
  private getDistancesFromTarget(
      targetSlide: HTMLElement
  ): Map<HTMLElement, number> {
    const distancesFromTarget = new Map<HTMLElement, number>();
    this.carousel.getSlides().forEach(
      (slide) => {
        const distance =
          getVisibleDistanceBetweenCenters(slide, targetSlide).x +
          this.matrixService.getAlteredXTranslation(slide) -
          this.matrixService.getAlteredXTranslation(targetSlide);
        distancesFromTarget.set(slide, distance);
      });
    return distancesFromTarget;
  }

  /**
   * Handle the start of user interaction with the carousel.
   * @param event
   */
  private startInteraction(event: Event): void {
    if (this.interactionStart !== null) {
      return;
    }
    const target = <HTMLElement>(event.target);
    this.interactionTarget = target;
    this.transitionTarget = null;
    this.interactionStart =
        new InteractionStart(
            performance.now(),
            Matrix.fromElementTransform(target).getTranslation());
    this.carousel.stopTransition();
  }

  /**
   * Handle the end of user interaction with the carousel.
   * @param event
   */
  private endInteraction(event: Event): void {
    if (this.interactionStart === null) {
      return;
    }
    this.interactionTarget = null;

    const interactionDuration = performance.now() - this.interactionStart.time;
    const activeSlide = this.getActiveSlide();
    const distance = this.getDistanceToCenter(activeSlide);

    const interactionDelta =
      Matrix.fromElementTransform(<HTMLElement>event.target)
        .getTranslation()
        .subtract(this.interactionStart.position);
    const wasHorizontalDrag =
      Math.abs(interactionDelta.x) > Math.abs(interactionDelta.y);

    const velocity =
      interactionDuration > 700 && wasHorizontalDrag ? interactionDelta.x : 0;

    this.interactionStart = null;

    const velocitySign = Math.sign(velocity);
    const distanceSign = Math.sign(distance) * -1;
    const allowsLooping = this.carousel.allowsLooping();

    if (distance === 0 || distanceSign === velocitySign || velocity === 0) {
      this.carousel.transitionToSlide(activeSlide);
    } else {
      if (velocitySign === 1) {
        if (allowsLooping || activeSlide !== this.carousel.getFirstSlide()) {
          this.carousel.previous();
        } else {
          this.carousel.transitionToSlide(activeSlide);
        }
      } else {
        if (allowsLooping || activeSlide !== this.carousel.getLastSlide()) {
          this.carousel.next();
        } else {
          this.carousel.transitionToSlide(activeSlide);
        }
      }
    }
  }

  /**
   * Reposition slides if they have been dragged far enough off one side that they
   * should be wrapping around onto the other side.
   * @param targetSlide
   */
  private adjustSlideForLoop(targetSlide: HTMLElement): void {
    const matrixService = MatrixService.getSingleton();
    const slides = this.carousel.getSlides();
    const totalWidth =
        mathf.sum(slides.map((slide) => slide.offsetWidth));

    const distanceToCenter =
        getVisibleDistanceBetweenCenters(targetSlide).x +
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

  /**
   * Dispose of the transition.
   */
  private dispose() {
    this.draggableSynchronizer.dispose(this);
    window.removeEventListener('resize', this.resizeHandler);
    window.clearTimeout(this.resizeTimeout);
    this.domWatcher.dispose();
  }
}
