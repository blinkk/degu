import { Carousel } from './carousel';
import { dom, DomWatcher, mathf, Raf } from '../..';
import { Transition } from './transitions';
import { CubicBezier, EasingFunction } from '../../mathf/cubic-bezier';
import { arrayf } from '../../arrayf/arrayf';
import { DefaultMap } from '../../map/default-map';
import { CachedMouseTracker } from '../../dom/cached-mouse-tracker';

/**
 * Small enum for readability when traversing slide indices.
 */
enum Direction {
  LEFT = -1,
  RIGHT = 1
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
 * Track the information associated with a user interaction.
 */
class Interaction {
  readonly startX: number;
  readonly startTime: number;
  lastMouseX: number;
  constructor(startX: number, startTime: number) {
    this.startX = startX;
    this.startTime = startTime;
    this.lastMouseX = startX;
  }
}

/**
 * Return the x translation amount from the given element's transform.
 */
function getTranslateX(el: HTMLElement): number {
  const transform = dom.getComputedStyle(el).transform;
  if (!transform.length || transform === 'none') {
    return 0;
  }
  // Grab the tx value from the matrix
  return parseFloat(transform.slice(7, -1).split(',')[4]);
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
  private readonly domWatcher: DomWatcher;
  private readonly transitionTime: number;
  private readonly mouseTracker: CachedMouseTracker;
  private readonly xTranslate: DefaultMap<HTMLElement, number>;
  private transitionTarget: TransitionTarget;
  private carousel: Carousel;
  private resizeTimeout: number;
  private interaction: Interaction;
  private raf: Raf;

  /**
   * @param transitionTime Determines how long in ms it takes to transition from
   *     one slide to another.
   * @param easingFunction Easing function used to adjust slides transitions.
   */
  constructor(
    {
      transitionTime = 500,
      easingFunction = DraggableSlide.DEFAULT_EASING
    }: DraggableSlideConfig = {}
  ) {
    this.raf = new Raf(() => this.loop());
    this.domWatcher = new DomWatcher();
    this.easingFunction = easingFunction;
    this.transitionTime = transitionTime;
    this.transitionTarget = null;
    this.resizeTimeout = null;
    this.mouseTracker = new CachedMouseTracker();
    this.interaction = null;
    // Tracks the current X translation of each slide.
    // Used so that slide can be adjusted for looping and dragging within the
    // same frame without introducing layout thrashing by updating the DOM
    // twice.
    this.xTranslate =
        DefaultMap.usingFunction((el: HTMLElement) => getTranslateX(el));
  }

  /**
   * This function is called by the carousel when the transition is passed to
   * the carousel. Until this function is called the DraggableSlide instance is
   * more or less inert.
   */
  init(carousel: Carousel): void {
    this.initResizeHandler();
    this.carousel = carousel;
    // Transition to the given active slide
    this.raf.read(() => this.transition(carousel.getFirstSlide(), 0));
    this.initDraggableSlides();
    this.raf.start();
  }

  /**
   * Updates slide positioning in response to user interaction and transition
   * animations.
   */
  loop(): void {
    this.raf.read(() => {
      if (!this.isInteracting() && this.transitionTarget) {
        this.renderTransition();
      } else {
        if (this.isInteracting()) {
          this.renderInteraction();
        }
        this.splitSlides();
      }

      // Applies the scheduled X translations set up in other functions.
      // This ensures that splitting slides for looping, transitions and
      // interactions can all adjust the X position without updating the DOM
      // more than once per frame.
      this.applyXTranslations();
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
          this.getVisibleDistanceBetweenCenters(
            <HTMLElement>el, this.carousel.getContainer()));
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
  isInteracting(): boolean {
    return this.interaction !== null;
  }

  /**
   * Dispose of the transition.
   */
  dispose() {
    window.clearTimeout(this.resizeTimeout);
    this.mouseTracker.dispose();
    this.domWatcher.dispose();
    this.xTranslate.clear();
  }

  private initResizeHandler(): void {
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
  }

  /**
   * Limit how far slides can be moved left/right if looping is not allowed for
   * the carousel.
   */
  private constrainXTranslations() {
    if (this.carousel.allowsLooping()) {
      return;
    }
    const slides = this.carousel.getSlides();

    // Allow for centering the last slide
    const halfContainer = this.carousel.getContainer().offsetWidth / 2;
    const totalSlideWidth = DraggableSlide.sumWidth(slides);

    const lastSlideWidth = slides.slice(-1)[0].offsetWidth;
    const halfLastSlide = lastSlideWidth / 2;
    const halfFirstSlide = slides[0].offsetWidth / 2;

    const min = halfContainer - totalSlideWidth + halfLastSlide;
    const max = halfContainer - halfFirstSlide;

    slides.forEach((slide: HTMLElement) => {
      const currentX = this.xTranslate.get(slide);
      this.xTranslate.set(slide, mathf.clamp(min, max, currentX));
    });
  }

  private applyXTranslations() {
    this.constrainXTranslations();
    // Apply all X Translates in a single step
    this.raf.write(() => {
      this.xTranslate.forEach((xTranslate, slide) => {
        slide.style.transform = `translateX(${xTranslate}px)`;
      });
    });
  }

  private renderInteraction() {
    const currentMouseX = this.getMouseX();
    const delta = currentMouseX - this.interaction.lastMouseX;
    this.carousel.getSlides().forEach((slide) => {
      this.xTranslate.set(slide, this.xTranslate.get(slide) + delta);
    });
    this.interaction.lastMouseX = currentMouseX;
  }

  /**
   * Return the distance between the given slide and the center of the carousel.
   */
  private getDistanceToCenter(slide: HTMLElement): number {
    const container = this.carousel.getContainer();
    return this.getVisibleDistanceBetweenCenters(slide, container);
  }

  /**
   * Setup the Draggable instances that will correspond to the slide elements.
   */
  private initDraggableSlides(): void {
    this.carousel.getSlides()
      .forEach(
        (slide) => {
          ['touchstart', 'mousedown']
              .forEach((event: string) => {
                this.domWatcher.add({
                  element: slide,
                  on: event,
                  callback: (e: Event) => this.startInteraction(e)
                });
              });
          ['contextmenu', 'dragstart', 'touchend', 'mouseup']
              .forEach((event: string) => {
                this.domWatcher.add({
                  element: window,
                  on: event,
                  callback: (e: Event) => this.endInteraction(e)
                });
              });
        });
  }

  /**
   * Returns the eased transition percent.
   *
   * Extracted from renderTransition so its name can serve to help
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
  private renderTransition() {
    const target = this.transitionTarget;
    const easedPercent = this.getEasedTransitionPercent();
    const targetDistance = mathf.lerp(target.startDistance, 0, easedPercent);
    const currentDistance = this.getDistanceToCenter(target.target);
    const absDelta = Math.abs(targetDistance) - Math.abs(currentDistance);
    const currentDistanceSign = Math.sign(currentDistance);
    const xDelta = absDelta * currentDistanceSign;
    this.carousel.getSlides().forEach(
        (slide) => this.translate(slide, xDelta));
    this.splitSlides();

    // If we're close enough, let's call it
    if (easedPercent === 1) {
      this.transitionTarget = null;
    }
  }

  /**
   * Translate the given slide by the given amoutn
   * @param slide
   * @param delta
   */
  private translate(slide: HTMLElement, delta: number) {
    this.xTranslate.set(slide, this.xTranslate.get(slide) + delta);
  }

  /**
   * Adjust the split of slides around the currently active slide.
   *
   * Is a no-op for non-looping carousels.
   *
   * Ensures:
   * - Slides cover as much of the carousel as possible.
   * - Slides loop from one side to the other.
   */
  private splitSlides(): void {
    if (!this.carousel.allowsLooping()) {
      return;
    }

    // No matter what we need to loop adjust the target if we have one
    const activeSlide = this.carousel.getActiveSlide();
    const target: HTMLElement =
      (this.transitionTarget && this.transitionTarget.target) ||
      activeSlide;

    const targetLeft = target.getBoundingClientRect().left;
    const targetRight = targetLeft + target.offsetWidth;

    const slides = this.carousel.getSlides();
    const targetIndex = this.carousel.getSlideIndex(target);
    const slidesToSplit =
        new Set(slides.filter((slide) => slide !== target));

    const clientWidth = dom.getScrollElement().clientWidth;
    let leftDistanceToCover = Math.max(targetLeft, 0);
    let rightDistanceToCover = Math.min(clientWidth, clientWidth - targetRight);

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
    return this.getVisibleDistanceBetweenCenters(slide, target) +
      this.getAlteredXTranslation(slide) -
      this.getAlteredXTranslation(target);
  }

  /**
   * Handle the start of user interaction with the carousel.
   * @param event
   */
  private startInteraction(event: Event): void {
    if (this.isInteracting()) {
      return;
    }
    this.interaction = new Interaction(this.getMouseX(), performance.now());
    this.transitionTarget = null;
    this.carousel.stopTransition();
  }

  /**
   * Handle the end of user interaction with the carousel.
   * @param event
   */
  private endInteraction(event: Event): void {
    if (this.interaction === null) {
      return;
    }

    const interactionDuration = performance.now() - this.interaction.startTime;
    const activeSlide = this.getActiveSlide();
    const distance = this.getDistanceToCenter(activeSlide);

    const interactionDelta = this.getMouseX() - this.interaction.startX;
    const velocity = interactionDuration > 700 ? interactionDelta : 0;

    this.interaction = null;

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
   * Return the current mouse position.
   */
  private getMouseX(): number {
    return this.mouseTracker.getClientPosition().x;
  }

  private getAlteredXTranslation(el: HTMLElement): number {
    return this.xTranslate.get(el) - getTranslateX(el);
  }

  private getVisibleCenter(el: HTMLElement): number {
    const rect = el.getBoundingClientRect();
    const raw = rect.left + rect.width / 2;
    return raw + this.getAlteredXTranslation(el);
  }

  private getVisibleDistanceBetweenCenters(
      a: HTMLElement, b: HTMLElement = null
  ): number {
    // Gather up the information on the first element's center position.
    const aCenter = this.getVisibleCenter(a);
    // Gather the info on the second element's center position or the root
    // element's center position.
    let bCenter;
    if (b !== null) {
      bCenter = this.getVisibleCenter(b);
    } else {
      bCenter = document.children[0].clientWidth / 2;
    }
    return aCenter - bCenter;
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
      this.translate(slide, difference);
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
}
