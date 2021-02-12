import { CssClassesOnly, Transition } from './transitions';
import { mathf, Raf } from '../..';
import { setf } from '../../setf/setf';
import { CarouselSynchronizer } from './carousel-synchronizer';
import { arrayf } from '../../arrayf/arrayf';

const DEFAULT_DISTANCE_TO_ACTIVE_SLIDE_ATTR = 'data-index';

/**
 * For readability, specifies which half should be gotten by providing a
 * direction to loop through elements.
 */
enum Direction {
  LEFT = -1,
  RIGHT = 1
}

/**
 * Options provided to the constructor
 */
export interface CarouselOptions {
  onTransitionCallback?: (carousel: Carousel) => void;
  onDisposeCallback?: (carousel: Carousel) => void;
  activeCssClass?: string;
  beforeCssClass?: string;
  afterCssClass?: string;
  allowLooping?: boolean;
  distanceToActiveSlideAttr?: string;
  // Transition used to iterate through slides.
  transition?: Transition;
  // Carousel code won't run if the condition is not met.
  // Used for establishing multiple types of carousels on the same DOM varied
  // by breakpoint.
  condition?: () => boolean;
}

/**
 * Default classes applied to slide elements.
 */
enum DefaultCssClass {
  ACTIVE_SLIDE = 'active',
  BEFORE_SLIDE = 'before',
  AFTER_SLIDE = 'after'
}

/**
 * Tracks an element that should be transitioned to.
 *
 * Groups the two pieces of information that are needed to transition a carousel
 * to the given element.
 *
 * @param element The element that needs to be transitioned to.
 * @param drivenBySync Whether this transition is driven by a carousel sync.
 *                     If it is driven by sync, then we know that we don't need
 *                     to bother the CarouselSynchronizer for another sync.
 */
class TransitionTarget {
  readonly element: HTMLElement;
  readonly drivenBySync: boolean;

  constructor(element: HTMLElement, drivenBySync: boolean = false) {
    this.element = element;
    this.drivenBySync = drivenBySync;
  }
}

export class Carousel {
  private readonly activeCssClass: string;
  private readonly beforeCssClass: string;
  private readonly afterCssClass: string;
  private readonly distanceToActiveSlideAttr: string;
  private readonly condition: () => boolean;
  private readonly container: HTMLElement;
  private readonly slides: HTMLElement[];
  private readonly transition: Transition;
  private readonly allowLooping: boolean;
  private readonly onTransitionCallbacks: Array<(carousel: Carousel) => void>;
  private readonly onDisposeCallbacks: Array<(carousel: Carousel) => void>;
  private readonly raf: Raf;
  private readonly synchronizer: CarouselSynchronizer;
  private transitionTarget: TransitionTarget;
  private lastActiveSlide: HTMLElement;

  /**
   * @param container Parent element of slides.
   * Element that acts as the carousel, in which all slides are contained.
   * Does not need to be the direct parent.
   *
   * @param slides HTMLElements containing slide content.
   *
   * @param condition Under what conditions the carousel should run
   * @param onTransitionCallback Function run when the active slide changes.
   * @param onDisposeCallback Function run when the carousel is disposeed.
   * @param activeCssClass Class to apply to active slide.
   * @param beforeCssClass Class to apply to slides before active slide.
   * @param afterCssClass Class to apply to slides after active slide.
   * @param distanceToActiveSlideAttr Slide attribute on which the index
   *     distance to the currently active slide is set.
   * @param allowLooping Whether the carousel should be allowed to loop.
   * @param transition How the Carousel should transition.
   * Please see the transitions folder inside the carousel folder for options.
   */
  constructor(
      container: HTMLElement,
      slides: HTMLElement[],
      {
        condition = () => true,
        onTransitionCallback = null,
        onDisposeCallback = null,
        activeCssClass = DefaultCssClass.ACTIVE_SLIDE,
        beforeCssClass = DefaultCssClass.BEFORE_SLIDE,
        afterCssClass = DefaultCssClass.AFTER_SLIDE,
        distanceToActiveSlideAttr = DEFAULT_DISTANCE_TO_ACTIVE_SLIDE_ATTR,
        allowLooping = true,
        transition = null
      }: CarouselOptions = {}
  ) {
    if (slides.length < 1) {
      throw new Error('Cannot start carousel without slides');
    }
    this.raf = new Raf(() => this.loop());
    this.activeCssClass = activeCssClass;
    this.beforeCssClass = beforeCssClass;
    this.afterCssClass = afterCssClass;
    this.distanceToActiveSlideAttr = distanceToActiveSlideAttr;
    this.allowLooping = allowLooping;
    this.condition = condition;
    this.container = container;
    this.lastActiveSlide = null;
    this.onTransitionCallbacks =
        onTransitionCallback ? [onTransitionCallback] : [];
    this.onDisposeCallbacks = onDisposeCallback ? [onDisposeCallback] : [];
    this.slides = slides;
    this.transition = transition || new CssClassesOnly();
    this.transitionTarget = null;
    this.synchronizer = CarouselSynchronizer.getSingleton(this);

    this.init();
  }

  /**
   * Returns true if the carousel loops.
   */
  allowsLooping() {
    return this.allowLooping;
  }

  /**
   * Returns the last known active slide.
   */
  getLastActiveSlide(): HTMLElement {
    return this.lastActiveSlide;
  }

  /**
   * Transition the carousel to the given slide.
   * If `drivenBySync` is set we know not to trigger another call to the
   * synchronizer.
   * @param targetSlide
   * @param drivenBySync
   */
  transitionToSlide(
      targetSlide: HTMLElement,
      drivenBySync: boolean = false
  ): void {
    if (this.isBeingInteractedWith()) {
      return;
    }
    this.transitionTarget = new TransitionTarget(targetSlide, drivenBySync);
  }

  /**
   * Returns true if the carousel is in the process of transitioning.
   */
  isTransitioning(): boolean {
    return this.transitionTarget !== null;
  }

  /**
   * Returns true if the user is interacting with the carousel.
   */
  isBeingInteractedWith(): boolean {
    return this.transition.isBeingInteractedWith();
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
  getActiveSlideIndex(): number {
    return this.getSlideIndex(this.getActiveSlide());
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
  getSlideIndex(slide: HTMLElement): number {
    return this.getSlides().indexOf(slide);
  }

  /**
   * Return the carousel container, the DOM element containing the slides.
   */
  getContainer(): HTMLElement {
    return this.container;
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
    if (this.allowsLooping()) {
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
    if (this.allowsLooping()) {
      return this.splitSlidesInHalf(slide, Direction.RIGHT);
    } else {
      return this.getSlides().slice(this.getSlides().indexOf(slide) + 1);
    }
  }

  /**
   * Transition to the next slide.
   */
  next(): void {
    this.transitionSlidesBy(1);
  }

  /**
   * Transition to the previous slide.
   */
  previous(): void {
    this.transitionSlidesBy(-1);
  }

  /**
   * Transition to the slide `value` slides away.
   * @param value
   */
  transitionSlidesBy(value: number): void {
    const nextIndex =
        this.getSlides().indexOf(this.getCurrentTransitionTarget()) + value;
    this.transitionToIndex(nextIndex);
  }

  /**
   * Transition to the slide with the given index.
   *
   * If the `drivenBySync` value is set we know not to call the synchronizer
   * again.
   *
   * @param index
   * @param drivenBySync
   */
  transitionToIndex(index: number, drivenBySync: boolean = false): void {
    if (!drivenBySync) {
      this.synchronizer.handleCarouselTransition(this, index);
    }

    const clampedIndex = this.getClampedIndex(index);
    this.transitionToSlide(this.getSlideByIndex(clampedIndex), drivenBySync);
  }

  /**
   * Register a function to be called when the carousel completes a transition.
   * @param callback
   */
  onTransition(callback: (carousel: Carousel) => void) {
    this.onTransitionCallbacks.push(callback);
  }

  /**
   * Register a function to be called when the carousel disposes.
   * @param callback
   */
  onDispose(callback: (carousel: Carousel) => void) {
    this.onDisposeCallbacks.push(callback);
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
    this.synchronizer.removeCarousel(this);
    this.synchronizer.dispose(this);
    this.onDisposeCallbacks.forEach((callback) => callback(this));
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
    if (this.allowsLooping()) {
      return mathf.wrap(index, 0, slidesLength);
    } else {
      return mathf.clamp(0, slidesLength - 1, index);
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
      slide: HTMLElement, direction: Direction
  ): HTMLElement[] {
    const targetLength =
        this.getHalfOfSlideCount(direction === Direction.RIGHT);
    const result = [];
    let indexToAdd = this.getSlideIndex(slide);
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
    this.transition.init(this.getFirstSlide(), this);
    this.raf.start();
  }

  /**
   * Run the loop to do all the necessary work for the carousel.
   */
  private loop(): void {
    this.raf.read(() => {
      if (!this.condition()) {
        return;
      }

      const shouldSync: boolean = this.shouldSync();
      const activeSlide = this.getActiveSlide();
      if (activeSlide !== this.lastActiveSlide) {
        this.lastActiveSlide = activeSlide;
        this.onTransitionCallbacks.forEach((callback) => callback(this));

        if (activeSlide) {
          this.updateClasses(activeSlide);
        }

        // Sync other carousels.
        if (shouldSync) {
          this.synchronizer
              .handleCarouselTransition(this, this.getSlideIndex(activeSlide));
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

  /**
   * Handle the transition between slides.
   */
  private shouldSync(): boolean {
    if (this.isTransitioning()) {
      const hasTransitionedToTarget =
          this.transition.hasTransitionedTo(this.transitionTarget.element);

      const shouldSync = !this.transitionTarget.drivenBySync;
      if (hasTransitionedToTarget) {
        this.transitionTarget = null;
      } else {
        this.transition.transition(this.transitionTarget.element);
      }
      return shouldSync;
    }
    return true;
  }

  /**
   * Get the slide element the carousel is in the process of transitioning to.
   */
  private getCurrentTransitionTarget(): HTMLElement {
    return this.isTransitioning() ?
        this.transitionTarget.element :
        this.getActiveSlide();
  }
}
