import { CssClassesOnly, DraggableSlide, Transition } from './transitions';
import { mathf, Raf } from '../..';
import { EventDispatcher, EventManager } from '../events';
import { setf } from '../../setf/setf';
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
 * Data sent by the carousel to event handlers.
 */
export interface CarouselEventData {
  carousel: Carousel;
  currentSlide: HTMLElement;
  nextSlide: HTMLElement;
}

/**
 * Carousel events.
 */
export enum CarouselEvent {
  BEFORE_CHANGE = 'beforeChange',
  AFTER_CHANGE = 'afterChange'
}

/**
 * Options provided to the constructor
 */
export interface CarouselOptions {
  activeCssClass?: string;
  beforeCssClass?: string;
  afterCssClass?: string;
  allowLooping?: boolean;
  distanceToActiveSlideAttr?: string;
  // Transition used to iterate through slides.
  transition?: Transition|string;
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
  AFTER_SLIDE = 'after'
}

export class Carousel implements EventDispatcher {
  readonly loop: boolean;
  readonly container: HTMLElement;
  autoplaySpeed: number;
  private readonly activeCssClass: string;
  private readonly beforeCssClass: string;
  private readonly afterCssClass: string;
  private readonly distanceToActiveSlideAttr: string;
  private readonly condition: () => boolean;
  private readonly slides: HTMLElement[];
  private readonly transition: Transition;
  private readonly raf: Raf;
  private readonly eventManager: EventManager;
  private transitionTarget: HTMLElement;
  private lastActiveSlide: HTMLElement;
  private autoplayTimeout: number;
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
   * @param allowLooping Whether the carousel should be allowed to loop.
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
        allowLooping = true,
        transition = null,
        autoplaySpeed = null
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
    this.loop = allowLooping;
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
              `Carousel.`);
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
   * Returns the last known active slide.
   */
  getLastActiveSlide(): HTMLElement {
    return this.lastActiveSlide;
  }

  /**
   * Change the active slide to the given slide by either index or element.
   */
  goTo(target: number|HTMLElement, drivenBySync = false) {
    if (target instanceof HTMLElement) {
      this.goToSlide(target, drivenBySync);
    } else {
      this.goToIndex(target, drivenBySync);
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
    this.eventManager.dispatch(
        CarouselEvent.BEFORE_CHANGE,
        this.generateEventData());
    if (!drivenBySync) {
      this.syncedCarousels.forEach(
          (carousel) => {
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
  previous(): void {
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
        ...carousels.map((c) => c.syncedCarousels));
    this.syncedCarousels = masterSet;
    carousels.forEach((c) => c.syncedCarousels = masterSet);
  }

  /**
   * Transition to the slide `value` slides away.
   * @param value
   */
  private transitionSlidesBy(value: number): void {
    const nextIndex =
        this.getSlides()
            .indexOf(this.transitionTarget || this.getActiveSlide()) +
        value;
    this.goToIndex(nextIndex);
  }

  /**
   * Sync this carousel to the given index in the given carousel.
   * @param index
   * @param carousel
   * @private
   */
  private syncTo(index: number, carousel: Carousel) {
    // Allow for syncing with duplicate slides.
    // If Carousel A needed its slides duplicated to meet design motion
    // requirements, but Carousel B didn't, A's slide 2X is equivalent to B's
    // slide X, so if B transitions to X and A is already at 2X, we can safely
    // ignore that sync, to prevent what will seem to the user like an
    // unnecessary transition.
    if (
        this.getIndex(this.transitionTarget) % carousel.getSlideCount() !==
        index
    ) {
      // If the current carousel has more slides than the syncing carousel,
      // then we want to grab the closest equivalent slide.
      if (this.getSlideCount() > carousel.getSlideCount()) {
        const equivalentIndices = [];
        while (index < this.getSlideCount()) {
          equivalentIndices.push(index);
          index += carousel.getSlideCount();
        }
        this.goTo(
            arrayf.min(
                equivalentIndices,
                (i) => Math.abs(this.getActiveIndex() - i)),
            true);
      } else {
        this.goTo(index, true);
      }
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
    if (this.autoplaySpeed !== null) {
      clearTimeout(this.autoplayTimeout);
      this.autoplayTimeout =
          window.setTimeout(() => this.next(), this.autoplaySpeed);
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
        const hasTransitionedToTarget =
            this.transition.hasTransitionedTo(this.transitionTarget);
        if (hasTransitionedToTarget) {
          this.transitionTarget = null;
          this.eventManager.dispatch(
              CarouselEvent.AFTER_CHANGE, this.generateEventData());
          this.resetAutoplayTimeout();
        } else {
          this.transition.transition(this.transitionTarget);
        }
      }
    });
  }

  /**
   * Generates event data for carousel events.
   * Uses an object for configuration to allow keyword argument style calling
   * instead of relying on positional arguments, allowing room for growth if
   * necessary.
   */
  private generateEventData(): CarouselEventData {
    return {
      carousel: this,
      currentSlide: this.getActiveSlide(),
      nextSlide: this.transitionTarget
    };
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
