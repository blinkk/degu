import { SlideToDraggableMap } from './slide-to-draggable-map';
import { adjustSlideForSplit } from './adjust-slide-for-split';
import { adjustSlideForLoop } from './adjust-slide-for-loop';
import { Carousel } from '../carousel';
import { dom, mathf, Raf} from '../../..';
import { Transition } from '../transitions';
import { MatrixService } from './matrix-service';
import { Vector } from '../../../mathf/vector';
import { CubicBezier, EasingFunction } from '../../../mathf/cubic-bezier';
import { Draggable, DraggableEvent } from '../../draggable/draggable';
import { TrackedListener } from '../../../dom/tracked-listener';
import { DraggableSyncManager } from '../../draggable/draggable-sync-manager';
import { Matrix } from './matrix';
import { arrayf } from '../../../arrayf/arrayf';

/**
 * Symbol for the user interacting with the slides as part of this transition.
 */
const SLIDE_INTERACTION = Symbol('Physical Slide Interaction');

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
  private readonly target: HTMLElement;
  private readonly timeRange: [number, number];
  private readonly translationRange: [number, number];

  constructor(
      target: HTMLElement,
      timeRange: [number, number],
      translationRange: [number, number]
  ) {
    this.translationRange = translationRange;
    this.target = target;
    this.timeRange = timeRange;
  }

  getTarget(): HTMLElement {
    return this.target;
  }

  getTranslationRange(): [number, number] {
    return this.translationRange;
  }

  getTimeRange(): [number, number] {
    return this.timeRange;
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
 */
export class PhysicalSlide implements Transition {
  private readonly easingFunction: EasingFunction;
  private readonly matrixService: MatrixService;
  private readonly carouselListeners: Set<number>;
  private readonly resizeHandler: () => void;
  private readonly transitionTime: number;
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
      easingFunction = CubicBezier.EASE_IN_OUT_SINE,
    }: PhysicalSlideConfig = {}
  ) {
    this.raf = new Raf();
    this.matrixService = MatrixService.getSingleton();
    this.carouselListeners = new Set();
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
    carousel.onDispose((disposedCarousel) => this.destroy_());
    this.initActiveSlide_(activeSlide);
    this.initDraggableSlides_();
  }

  loop(): void {
    this.raf.read(() => {
      if (!this.carousel.isBeingInteractedWith() && this.transitionTarget) {
        this.transitionToTarget_();
      } else {
        this.adjustSplit_();
      }
      this.carousel.getSlides().forEach((slide) => {
        const container = this.carousel.getContainer();
        const style = dom.hasVisibleArea(slide, container) ? '' : 'hidden';
        this.raf.write(() => slide.style.visibility = style);
      });
    });
  }

  transition(
    targetEl: HTMLElement,
    optTransitionTime: number = null
  ): void {
    if (
      this.transitionTarget !== null &&
      this.transitionTarget.getTarget() === targetEl
    ) {
      return; // Don't reset target time
    }
    const transitionTime =
      optTransitionTime === null ? this.transitionTime : optTransitionTime;

    const now = performance.now();
    const timeRange: [number, number] = [now, now + transitionTime];

    const currentX = Matrix.fromElementTransform(targetEl).getTranslateX();
    const endX = this.getInvertedDistanceToCenter(targetEl) + currentX;
    const translationRange: [number, number] = [currentX, endX];

    const transitionTarget =
      new TransitionTarget(targetEl, timeRange, translationRange);

    this.transitionTarget = transitionTarget;
  }

  private getDistanceToCenter(slide: HTMLElement): number {
    const container = this.carousel.getContainer();
    const distanceFromCenter =
        dom.getVisibleDistanceBetweenCenters(slide, container).x;
    return distanceFromCenter;
  }

  private getInvertedDistanceToCenter(slide: HTMLElement): number {
    return -1 * this.getDistanceToCenter(slide);
  }

  getActiveSlide(): HTMLElement {
    const lastActiveSlide = this.carousel.getLastActiveSlide();
    return arrayf.min(
      this.carousel.getSlides(),
      (el) => {
        return Math.abs(
          dom.getVisibleDistanceBetweenCenters(
            <HTMLElement>el, this.carousel.getContainer()).x);
      },
      (el) => el === lastActiveSlide ? 0 : 1,
      (el) => -1 * this.carousel.getSlideIndex(el)
    );
  }

  hasTransitionedTo(slide: HTMLElement): boolean {
    return this.getDistanceToCenter(slide) === 0;
  }

  private initActiveSlide_(target: HTMLElement): void {
    this.raf.read(() => this.transition(target, 0));
  }

  private initDraggableSlides_(): void {
    const draggables =
      this.carousel.getSlides()
        .map(
          (slide) => {
            const draggable: Draggable = this.draggableBySlide.get(slide);
            const element = draggable.getElement();
            const startListener =
                TrackedListener.add(
                    element, DraggableEvent.START,
                    (e: Event) => this.startInteraction_(e));
            const endListener =
                TrackedListener.add(
                    element, DraggableEvent.END,
                    (e: Event) => this.endInteraction_(e));
            this.carouselListeners.add(startListener);
            this.carouselListeners.add(endListener);
            return draggable;
          });
    DraggableSyncManager.getSingleton().syncDraggables(...draggables);
  }

  private transitionToTarget_() {
    const target = this.transitionTarget;
    const timeRange = target.getTimeRange();
    const transitionPercent =
        mathf.inverseLerp(timeRange[0], timeRange[1], performance.now());
    const easedPercent = this.easingFunction(transitionPercent);

    const translationRange = target.getTranslationRange();
    const targetX =
        mathf.lerp(translationRange[0], translationRange[1], easedPercent);
    const currentX =
        MatrixService.getSingleton()
            .getAlteredMatrix(target.getTarget()).getTranslateX();
    const deltaX = targetX - currentX;

    this.carousel.getSlides()
      .forEach((slide) => {
        MatrixService.getSingleton().translate(slide, { x: deltaX, y: 0 });
      });
    this.interactionTarget = target.getTarget();
    this.adjustSplit_();

    // If we're close enough, let's call it
    if (easedPercent === 1) {
      this.transitionTarget = null;
    }
  }

  private adjustSplit_(): void {
    // No matter what we need to loop adjust the target if we have one
    const target = this.interactionTarget;
    if (target !== null) {
      adjustSlideForLoop(this.carousel, target);
    }

    const targetSlide = target ? target : this.carousel.getActiveSlide();
    const distancesFromTarget = this.getDistancesFromTarget_(targetSlide);

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

  private getDistancesFromTarget_(
      targetSlide: HTMLElement
  ): Map<HTMLElement, number> {
    const distancesFromTarget = new Map<HTMLElement, number>();
    this.carousel.getSlides().forEach(
      (slide) => {
        const distance =
          dom.getVisibleDistanceBetweenCenters(slide, targetSlide).x +
          this.matrixService.getAlteredXTranslation(slide) -
          this.matrixService.getAlteredXTranslation(targetSlide);
        distancesFromTarget.set(slide, distance);
      });
    return distancesFromTarget;
  }

  private startInteraction_(event: Event): void {
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
    this.carousel.startInteraction(SLIDE_INTERACTION);
  }

  private endInteraction_(event: Event): void {
    if (this.interactionStart === null) {
      return;
    }
    this.interactionTarget = null;
    this.carousel.endInteraction(SLIDE_INTERACTION);

    const interactionDuration = performance.now() - this.interactionStart.time;
    const activeSlide = this.getActiveSlide();
    const distance = this.getInvertedDistanceToCenter(activeSlide);

    const interactionDelta =
      Matrix.fromElementTransform(<HTMLElement>event.target)
        .getTranslation()
        .subtract(this.interactionStart.position);
    const wasHorizontalDrag =
      Math.abs(interactionDelta.x) > Math.abs(interactionDelta.y);

    const velocity =
      interactionDuration > 700 && wasHorizontalDrag ? 0 : interactionDelta.x;

    this.interactionStart = null;

    const velocitySign = Math.sign(velocity);
    const distanceSign = Math.sign(distance);
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

  private destroy_() {
    window.removeEventListener('resize', this.resizeHandler);
    window.clearTimeout(this.resizeTimeout);
    Array.from(this.carouselListeners.values())
        .forEach((uid: number) => TrackedListener.remove(uid));
  }
}
