import * as arrayf from '../../arrayf/arrayf';
import * as mathf from '../../mathf/mathf';
import * as setf from '../../setf/setf';
import {CssClassesOnly, DraggableSlide, Transition} from './transitions';
import {EventDispatcher, EventManager} from '../events';
import {Raf} from '../../raf/raf';

const DEFAULT_DISTANCE_TO_ACTIVE_SLIDE_ATTR = 'data-index';

/**
 * For readability, specifies which half should be gotten by providing a
 * direction to loop through elements.
 */
enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

/**
 * Data sent by the carousel to event handlers.
 */
export interface BeforeChangeEventData {
  carousel: Carousel;
  currentSlide: HTMLElement;
  currentIndex: number;
  nextSlide: HTMLElement;
  nextIndex: number;
}

/**
 * Data sent by the carousel to event handlers.
 */
export interface AfterChangeEventData {
  carousel: Carousel;
  currentSlide: HTMLElement;
  currentIndex: number;
}

export type CarouselEventData = BeforeChangeEventData | AfterChangeEventData;

/**
 * Carousel events.
 */
export enum CarouselEvent {
  BEFORE_CHANGE = 'beforeChange',
  AFTER_CHANGE = 'afterChange',
}

/**
 * Options provided to the constructor
 */
export interface CarouselOptions {
  activeCssClass?: string;
  beforeCssClass?: string;
  afterCssClass?: string;
  loop?: boolean;
  distanceToActiveSlideAttr?: string;
  // Transition used to iterate through slides.
  transition?: Transition | string;
  // Carousel code won't run if the condition is not met.
  // Used for establishing multiple types of carousels on the same DOM varied
  // by breakpoint.
  condition?: () => boolean;
  // Time to stay on a slide before automatically transitioning to the next
  // slide
  autoplaySpeed?: number;
}

/**
 * Default classes applied to slide elements.
 */
enum DefaultCssClass {
  ACTIVE_SLIDE = 'active',
  BEFORE_SLIDE = 'before',
  AFTER_SLIDE = 'after',
}

/**
 * Internal class used to manage autoplay behaviour.
 *
 * Stores and handles the information needed to pause and resume triggers using
 * a timeout.
 */
class AutoplayTimeout {
  private timeout: number | null;
  private readonly callback: TimerHandler;
  private readonly delay: number;
  private lastStartTime: number;
  private timePassed: number;

  constructor(callback: TimerHandler, delay: number) {
    this.callback = callback;
    this.delay = delay;
    this.timePassed = 0;
    this.timeout = setTimeout(callback, delay);
    this.lastStartTime = +new Date();
  }

  /**
   * Returns true if the timeout autoplay timeout is currently paused/disabled.
   */
  isPaused(): boolean {
    return this.timeout === null;
  }

  /**
   * Disable the timeout to pause the autplay.
   */
  pause(): void {
    this.timePassed += +new Date() - this.lastStartTime;
    this.clear();
  }

  /**
   * Create a new timeout with the time remaining when the autoplay was paused.
   */
  unpause(): void {
    if (!this.isPaused()) {
      return;
    }
    this.timeout = setTimeout(this.callback, this.delay - this.timePassed);
    this.lastStartTime = +new Date();
  }

  /**
   * Dispose of the timeout.
   */
  dispose(): void {
    this.clear();
  }

  private clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export class Carousel implements EventDispatcher {
  readonly loop: boolean;
  readonly container: HTMLElement;
  autoplaySpeed?: number;
  private readonly activeCssClass: string;
  private readonly beforeCssClass: string;
  private readonly afterCssClass: string;
  private readonly distanceToActiveSlideAttr: string;
  private readonly condition: () => boolean;
  private readonly slides: HTMLElement[];
  private readonly transition: Transition;
  private readonly raf: Raf;
  private readonly eventManager: EventManager;
  private transitionTarget: HTMLElement | null;
  private lastActiveSlide: HTMLElement | null;
  private autoplayTimeout: AutoplayTimeout | null;
  private syncedCarousels: Set<Carousel>;

  /**
   * @param container Parent element of slides.
   * Element that acts as the carousel, in which all slides are contained.
   * Does not need to be the direct parent.
   *
   * @param slides HTMLElements containing slide content.
   *
   * @param condition Under what conditions the carousel should run
   * @param activeCssClass Class to apply to active slide.
   * @param beforeCssClass Class to apply to slides before active slide.
   * @param afterCssClass Class to apply to slides after active slide.
   * @param distanceToActiveSlideAttr Slide attribute on which the index
   *     distance to the currently active slide is set.
   * @param loop Whether the carousel should be allowed to loop.
   * @param transition How the Carousel should transition.
   * @param autoplaySpeed How long the carousel should stay on a slide (in ms)
   *     before transitioning to the next slide.
   */
  constructor(
    container: HTMLElement,
    slides: HTMLElement[],
    {
      condition = () => true,
      activeCssClass = DefaultCssClass.ACTIVE_SLIDE,
      beforeCssClass = DefaultCssClass.BEFORE_SLIDE,
      afterCssClass = DefaultCssClass.AFTER_SLIDE,
      distanceToActiveSlideAttr = DEFAULT_DISTANCE_TO_ACTIVE_SLIDE_ATTR,
      loop = true,
      transition = undefined,
      autoplaySpeed = undefined,
    }: CarouselOptions = {}
  ) {
    if (slides.length < 1) {
      throw new Error('Cannot start carousel without slides');
    }
    this.raf = new Raf(() => this.onRaf());
    this.activeCssClass = activeCssClass;
    this.beforeCssClass = beforeCssClass;
    this.afterCssClass = afterCssClass;
    this.distanceToActiveSlideAttr = distanceToActiveSlideAttr;
    this.loop = loop;
    this.condition = condition;
    this.container = container;
    this.lastActiveSlide = null;
    this.eventManager = new EventManager();
    this.slides = slides;
    if (typeof transition === 'string') {
      switch (transition) {
        case 'css':
          this.transition = new CssClassesOnly();
          break;
        case 'draggable':
          this.transition = new DraggableSlide();
          break;
        default:
          throw new Error(
            `Unrecognized transition type "${transition}" passed to ` +
              'Carousel.'
          );
      }
    } else {
      this.transition = transition || new CssClassesOnly();
    }
    this.transitionTarget = null;
    this.autoplaySpeed = autoplaySpeed;
    this.autoplayTimeout = null;
    this.syncedCarousels = new Set<Carousel>([this]);

    this.init();
  }

  /**
   * Returns true if the carousel is disabled, false otherwise.
   */
  isDisabled() {
    return !this.condition();
  }

  /**
   * Returns true if the carousel is enabled, false otherwise.
   */
  isEnabled() {
    return this.condition();
  }

  /**
   * Change the active slide to the given slide by either index or element.
   */
  goTo(target: number | HTMLElement, drivenBySync = false) {
    if (typeof target === 'number') {
      this.goToIndex(target, drivenBySync);
    } else {
      this.goToSlide(target, drivenBySync);
    }
  }

  /**
   * Transition the carousel to the given slide.
   */
  goToSlide(targetSlide: HTMLElement, drivenBySync = false): void {
    if (this.isBeingInteractedWith()) {
      return;
    }
    if (this.transitionTarget === targetSlide) {
      return;
    }
    this.transitionTarget = targetSlide;
    this.eventManager.dispatch(CarouselEvent.BEFORE_CHANGE, {
      carousel: this,
      currentSlide: this.getActiveSlide(),
      currentIndex: this.getActiveIndex(),
      nextSlide: this.transitionTarget,
      nextIndex: this.getIndex(this.transitionTarget),
    });
    if (!drivenBySync) {
      this.syncedCarousels.forEach(carousel => {
        if (carousel !== this) {
          carousel.syncTo(this.getIndex(targetSlide), this);
        }
      });
    }
  }

  /**
   * Returns true if the user is interacting with the carousel.
   */
  isBeingInteractedWith(): boolean {
    return this.transition.isInteracting();
  }

  /**
   * Returns the currently active slide.
   */
  getActiveSlide(): HTMLElement {
    return this.transition.getActiveSlide();
  }

  /**
   * Return the index of the currently active slide.
   */
  getActiveIndex(): number {
    return this.getIndex(this.getActiveSlide());
  }

  /**
   * Return the first slide in the carousel.
   */
  getFirstSlide(): HTMLElement {
    return this.slides[0];
  }

  /**
   * Return the last slide in the carousel.
   */
  getLastSlide(): HTMLElement {
    return this.slides[this.slides.length - 1];
  }

  /**
   * Return the index of the given slide within the list of slides.
   * @param slide
   */
  getIndex(slide: HTMLElement): number {
    return this.getSlides().indexOf(slide);
  }

  /**
   * Return a copy of the list of slide elements.
   */
  getSlides(): HTMLElement[] {
    return [...this.slides];
  }

  /**
   * Return the slides before the given slide. Looping if allowed.
   * @param slide
   */
  getSlidesBefore(slide: HTMLElement): HTMLElement[] {
    if (this.loop) {
      return this.splitSlidesInHalf(slide, Direction.LEFT);
    } else {
      return this.getSlides().slice(0, this.getSlides().indexOf(slide));
    }
  }

  /**
   * Return the slides after the given slide. Looping if allowed.
   * @param slide
   */
  getSlidesAfter(slide: HTMLElement): HTMLElement[] {
    if (this.loop) {
      return this.splitSlidesInHalf(slide, Direction.RIGHT);
    } else {
      return this.getSlides().slice(this.getSlides().indexOf(slide) + 1);
    }
  }

  /**
   * Go to the next slide.
   */
  next(): void {
    this.transitionSlidesBy(1);
  }

  /**
   * Go to the previous slide.
   */
  prev(): void {
    this.transitionSlidesBy(-1);
  }

  /**
   * Transition to the slide with the given index.
   */
  goToIndex(index: number, drivenBySync = false): void {
    const clampedIndex = this.getClampedIndex(index);
    this.goToSlide(this.getSlideByIndex(clampedIndex), drivenBySync);
  }

  /**
   * Register a function to be called when the given event is fired.
   */
  on(event: CarouselEvent, callback: (data: CarouselEventData) => void) {
    this.eventManager.on(event, callback);
  }

  /**
   * Remove a function that is called when the given event is fired.
   */
  off(event: CarouselEvent, callback: (data: CarouselEventData) => void) {
    this.eventManager.off(event, callback);
  }

  /**
   * Return the slide element at the given index in the list of slides.
   * @param index
   */
  getSlideByIndex(index: number): HTMLElement {
    return this.slides[index];
  }

  /**
   * Return the number of slides.
   */
  getSlideCount(): number {
    return this.slides.length;
  }

  /**
   * Dispose of the carousel.
   */
  dispose() {
    this.raf.dispose();
    this.transition.dispose();
  }

  /**
   * Clear the transition target, stop transitioning.
   */
  stopTransition(): void {
    this.transitionTarget = null;
  }

  /**
   * Clamp a given index to land within the possible slide indices.
   * @param index
   */
  getClampedIndex(index: number): number {
    const slidesLength = this.getSlides().length;
    if (this.loop) {
      return mathf.wrap(index, 0, slidesLength);
    } else {
      return mathf.clamp(0, slidesLength - 1, index);
    }
  }

  /**
   * Synchronize this carousel with the given carousels.
   */
  sync(...carousels: Carousel[]): void {
    const masterSet = setf.merge(
      this.syncedCarousels,
      ...carousels.map(c => c.syncedCarousels)
    );
    this.syncedCarousels = masterSet;
    masterSet.forEach(c => (c.syncedCarousels = masterSet));
  }

  /**
   * Pause the autoplay functionality of the carousel.
   */
  pause(): void {
    if (this.autoplayTimeout) {
      this.autoplayTimeout.pause();
    }
  }

  /**
   * Unpause the autoplay functionality of the carousel.
   */
  unpause(): void {
    if (this.autoplayTimeout) {
      this.autoplayTimeout.unpause();
    }
  }

  /**
   * Returns true if the carousel autoplay is currently paused.
   */
  isPaused(): boolean {
    return this.autoplayTimeout === null || this.autoplayTimeout.isPaused();
  }

  /**
   * Transition to the slide `value` slides away.
   * @param value
   */
  private transitionSlidesBy(value: number): void {
    const nextIndex =
      this.getSlides().indexOf(this.transitionTarget || this.getActiveSlide()) +
      value;
    this.goToIndex(nextIndex);
  }

  /**
   * Sync this carousel to the given index in the given carousel.
   *
   * Allow for syncing with duplicate slides.
   *
   * In some cases, to meet design requirements a carousel may need to
   * duplicate some slides, for cases where a slide loops but due to a small
   * number of slides, it may be visible on either side simultaneously.
   *
   * In this case, it may not be necessary to duplicate other synchronized
   * carousels.
   *
   * Take the following case where there are images that loop that need to
   * be duplicated, synchronized with dots acting as navigation, and a third
   * carousel with copy that cross-fades depending on the active image.
   *
   * DOM Tags <a>, <b> and <c> are used as shorthand for the various slides.
   *
   * ```
   * <div class="images">
   *   <a></a>
   *   <b></b>
   *   <c></c>
   *   <a></a>
   *   <b></b>
   *   <c></c>
   * </div>
   * <div class="nav-dots">
   *   <a></a>
   *   <b></b>
   *   <c></c>
   * </div>
   * <div class="copy">
   *   <a></a>
   *   <b></b>
   *   <c></c>
   * </div>
   * ```
   *
   * If the user has moved the images so that the fourth image (an <a>) tag
   * is visible, we would want the first slide in the other two to be the
   * active slide.
   *
   * If the user were to click on the navigation to go to the second slide, it
   * would seem odd if the images went backwards past the third image, and
   * then on to the second image.
   *
   * Instead it would seem more natural for the slide to advance to the
   * nearest copy of the second image, in this case, the fifth slide in the
   * images carousel.
   *
   * We also run a modulus on the given index, for the case where things are
   * the other way around, and the carousel we are syncing to has more slides
   * than the current carousel.
   *
   * @param rawIndex
   * @param carousel
   * @private
   */
  private syncTo(rawIndex: number, carousel: Carousel) {
    const index = rawIndex % this.getSlideCount();

    // Assuming this carousel has more slides than the carousel we are syncing
    // to:
    // Use modulus to get the equivalent index of the current transition
    // target, as if it were a slide in the carousel we are syncing to.
    // If the slide counts match up, this modulus operation will be a no-op and
    // no harm is done.
    const equivalentTransitionTargetIndex =
      this.getIndex(this.transitionTarget!) % carousel.getSlideCount();

    // If we are already on an equivalent index, we can stop and return early.
    if (equivalentTransitionTargetIndex === index) {
      return;
    }

    // If the current carousel has more slides than the syncing carousel,
    // then we want to grab the closest equivalent slide to transition to.
    if (this.getSlideCount() > carousel.getSlideCount()) {
      // Build a set of all equivalent indices.
      const equivalentIndices = [];
      let equivalentIndex = index;
      while (equivalentIndex < this.getSlideCount()) {
        equivalentIndices.push(equivalentIndex);
        equivalentIndex += carousel.getSlideCount();
      }
      this.goTo(
        arrayf.min(equivalentIndices, i => Math.abs(this.getActiveIndex() - i)),
        true
      );
    } else {
      this.goTo(index, true);
    }
  }

  /**
   * Returns an integer number for half of the slides. The parameter
   * specifies whether, if given an array containing an odd number of elements,
   * the larger odd value for half should be returned, or the smaller even
   * number.
   * @param weightOdd
   * @private
   */
  private getHalfOfSlideCount(weightOdd: boolean): number {
    const halfLength = (this.getSlides().length - 1) / 2;
    if (halfLength % 2 === 0) {
      return halfLength;
    } else if (weightOdd) {
      return Math.ceil(halfLength);
    } else {
      return Math.floor(halfLength);
    }
  }

  /**
   * Return half of the slides by taking slides to one side of the given slide.
   *
   * This function assumes looping is enabled and loops around if needed to get
   * half of the slides.
   */
  private splitSlidesInHalf(
    slide: HTMLElement,
    direction: Direction
  ): HTMLElement[] {
    const targetLength = this.getHalfOfSlideCount(
      direction === Direction.RIGHT
    );
    const result = [];
    let indexToAdd = this.getIndex(slide);
    while (result.length < targetLength) {
      // Build the looped index
      indexToAdd = mathf.wrap(indexToAdd + direction, 0, this.getSlideCount());
      const slideToAdd = this.getSlideByIndex(indexToAdd);
      if (direction === Direction.RIGHT) {
        result.push(slideToAdd);
      } else {
        result.unshift(slideToAdd);
      }
    }
    return result;
  }

  /**
   * Setup initial values.
   */
  private init(): void {
    this.transition.init(this);
    this.raf.start();
    this.resetAutoplayTimeout();
  }

  /**
   * Clear the current autoplay timeout and prep a new one.
   * @private
   */
  private resetAutoplayTimeout() {
    if (this.autoplaySpeed) {
      if (this.autoplayTimeout) {
        this.autoplayTimeout.dispose();
      }
      this.autoplayTimeout = new AutoplayTimeout(
        () => this.next(),
        this.autoplaySpeed
      );
    }
  }

  /**
   * Run the loop to do all the necessary work for the carousel.
   */
  private onRaf(): void {
    this.raf.read(() => {
      if (!this.condition()) {
        return;
      }

      if (this.isBeingInteractedWith()) {
        this.resetAutoplayTimeout();
      }

      const activeSlide = this.getActiveSlide();
      if (activeSlide !== this.lastActiveSlide) {
        this.lastActiveSlide = activeSlide;
        if (activeSlide) {
          this.updateClasses(activeSlide);
        }
      }

      if (this.transitionTarget !== null) {
        const hasTransitionedToTarget = this.transition.hasTransitionedTo(
          this.transitionTarget
        );
        if (hasTransitionedToTarget) {
          this.transitionTarget = null;
          this.eventManager.dispatch(CarouselEvent.AFTER_CHANGE, {
            carousel: this,
            currentSlide: this.getActiveSlide(),
            currentIndex: this.getActiveIndex(),
          });
          this.resetAutoplayTimeout();
        } else {
          this.transition.transition(this.transitionTarget);
        }
      }
    });
  }

  /**
   * Update the slide elements' CSS classes
   * @param activeSlide
   */
  private updateClasses(activeSlide: HTMLElement) {
    const slidesBefore = this.getSlidesBefore(activeSlide);
    const slidesAfter = this.getSlidesAfter(activeSlide);

    this.raf.write(() => {
      // Create active slide
      activeSlide.classList.add(this.activeCssClass);
      activeSlide.classList.remove(this.beforeCssClass, this.afterCssClass);
      activeSlide.setAttribute(this.distanceToActiveSlideAttr, '0');

      slidesBefore.reverse().forEach((slide, index) => {
        slide.classList.add(this.beforeCssClass);
        slide.classList.remove(this.activeCssClass, this.afterCssClass);
        slide.setAttribute(this.distanceToActiveSlideAttr, `${-index - 1}`);
      });
      slidesAfter.forEach((slide, index) => {
        slide.classList.add(this.afterCssClass);
        slide.classList.remove(this.activeCssClass, this.beforeCssClass);
        slide.setAttribute(this.distanceToActiveSlideAttr, `${index + 1}`);
      });
    });
  }
}
