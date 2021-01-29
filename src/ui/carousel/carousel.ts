import { CssClassesOnly, Transition } from './transitions';
import { DefaultMap } from '../../map/default-map';
import { mathf, Raf } from '../..';
import { setf } from '../../setf/setf';
import { TransitionTarget } from './transition-target';
import { CarouselSynchronizer } from './carousel-synchronizer';

/**
 * For readability, specifies which half should be gotten by providing a
 * direction to loop through elements.
 */
enum Half {
  LEFT = -1,
  RIGHT = 1
}

/**
 * Options provided to the constructor
 */
export interface CarouselOptions {
  onTransitionCallbacks?: Array<(carousel: Carousel) => void>;
  onDisposeCallbacks?: Array<(carousel: Carousel) => void>;
  activeCssClass?: string;
  beforeCssClass?: string;
  afterCssClass?: string;
  allowLooping?: boolean;
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

export class Carousel {
  private readonly activeCssClass: string;
  private readonly activeCssClassSet: Set<string>;
  private readonly beforeCssClass: string;
  private readonly beforeCssClassMap: DefaultMap<number, Set<string>>;
  private readonly afterCssClass: string;
  private readonly afterCssClassMap: DefaultMap<number, Set<string>>;
  private readonly condition: () => boolean;
  private readonly container: HTMLElement;
  private readonly slides: HTMLElement[];
  private readonly transition: Transition;
  private readonly allowLooping: boolean;
  private readonly onTransitionCallbacks: Array<(carousel: Carousel) => void>;
  private readonly onDisposeCallbacks: Array<(carousel: Carousel) => void>;
  private readonly slideCssClasses: DefaultMap<HTMLElement, Set<string>>;
  private readonly raf: Raf;
  private readonly synchronizer: CarouselSynchronizer;
  private transitionTarget: TransitionTarget;
  private interactions: symbol[];
  private lastActiveSlide: HTMLElement;
  private disposed: boolean;
  private disabled: boolean;

  /**
   * @param container Parent element of slides.
   * Element that acts as the carousel, in which all slides are contained.
   * Does not need to be the direct parent.
   *
   * @param slides HTMLElements containing slide content.
   *
   * @param condition Under what conditions the carousel should run
   * @param onTransitionCallbacks Functions run when the active slide changes.
   * @param onDisposeCallbacks Functions run when the carousel is disposeed.
   * @param activeCssClass Class to apply to active slide.
   * @param beforeCssClass Class to apply to slides before active slide.
   * @param afterCssClass Class to apply to slides after active slide.
   * @param allowLooping Whether the carousel should be allowed to loop.
   * @param transition How the Carousel should transition.
   * Please see the transitions folder inside the carousel folder for options.
   */
  constructor(
      container: HTMLElement,
      slides: HTMLElement[],
      {
        condition = () => true,
        onTransitionCallbacks = [],
        onDisposeCallbacks = [],
        activeCssClass = DefaultCssClass.ACTIVE_SLIDE,
        beforeCssClass = DefaultCssClass.BEFORE_SLIDE,
        afterCssClass = DefaultCssClass.AFTER_SLIDE,
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
    this.allowLooping = allowLooping;
    this.condition = condition;
    this.container = container;
    this.lastActiveSlide = null;
    this.onTransitionCallbacks = onTransitionCallbacks;
    this.onDisposeCallbacks = onDisposeCallbacks;
    this.slides = slides;
    this.transition = transition !== null ? transition : new CssClassesOnly();
    this.transitionTarget = null;
    this.interactions = [];
    this.disposed = false;
    this.disabled = false;
    this.synchronizer = CarouselSynchronizer.getSingleton(this);

    this.slideCssClasses =
        DefaultMap.usingFunction<HTMLElement, Set<string>>(
            () => new Set<string>());

    /** Mapped Set caches to avoid allocation churn */
    this.activeCssClassSet = new Set([activeCssClass]);
    this.beforeCssClassMap =
        DefaultMap.usingFunction<number, Set<string>>(
            (index) => new Set(
                [this.beforeCssClass, `${this.beforeCssClass}--${index}`]));
    this.afterCssClassMap =
        DefaultMap.usingFunction<number, Set<string>>(
            (index) => new Set(
                [this.afterCssClass, `${this.afterCssClass}--${index}`]));
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
   * Returns true if the user is interacting with the carousel in the way
   * specified by the given symbol.
   * @param interaction
   */
  isBeingInteractedWith(interaction: symbol = null): boolean {
    return this.interactions.length > 0 &&
        (!interaction || this.interactions.indexOf(interaction) !== -1);
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
      return this.splitSlidesInHalf(slide, Half.LEFT);
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
      return this.splitSlidesInHalf(slide, Half.RIGHT);
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
   * Tell the carousel that it is being interacted with in the way specified
   * by the given symbol.
   * @param interaction
   */
  startInteraction(interaction: symbol): void {
    this.clearTransitionTarget();
    this.interactions.push(interaction);
  }

  /**
   * Tell the carousel that it is no longer being interacted with in the way
   * specified by the given symbol.
   * @param interaction
   */
  endInteraction(interaction: symbol): void {
    const index = this.interactions.indexOf(interaction);
    this.interactions = [
        ...this.interactions.slice(0, index),
        ...this.interactions.slice(index + 1)];
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
   * Enable the carousel.
   */
  enable(): void {
    this.disabled = false;
  }

  /**
   * Disable the carousel.
   */
  disable(): void {
    this.disabled = true;
  }

  /**
   * Dispose of the carousel.
   */
  dispose() {
    this.disposed = true;
    this.raf.dispose();
    this.synchronizer.disposeCarousel(this);
    this.synchronizer.dispose(this);
    this.onDisposeCallbacks.forEach((callback) => callback(this));
  }

  /**
   * Returns an integer number for half of the slides. The parameter
   * specifies whether, if given an array containing an odd number of elements,
   * the larger odd value for half should be returned, or the smaller even
   * number.
   * @param weightOdd
   * @private
   */
  private getHalfLengthOfSlides(weightOdd: boolean): number {
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
   * @param slide
   * @param direction
   */
  private splitSlidesInHalf(
      slide: HTMLElement, direction: Half
  ): HTMLElement[] {
    const targetLength =
        this.getHalfLengthOfSlides(direction === Half.RIGHT);
    const slideCount = this.getSlideCount();
    const result = [];
    let indexToAdd = this.getSlideIndex(slide);
    while (result.length < targetLength) {
      // Build the looped index
      indexToAdd = (indexToAdd + direction + slideCount) % slideCount;
      const slideToAdd = this.getSlideByIndex(indexToAdd);
      if (direction > 0) {
        result.push(slideToAdd);
      } else {
        result.unshift(slideToAdd);
      }
    }
    return result;
  }

  /**
   * Clear the transition target, stop transitioning.
   */
  private clearTransitionTarget(): void {
    this.transitionTarget = null;
  }

  /**
   * Setup initial values.
   */
  private init(): void {
    this.transition.init(this.getSlides()[0], this);
    this.raf.start();
  }

  /**
   * Run the loop to do all the necessary work for the carousel.
   */
  private loop(): void {
    if (this.disposed) {
      return;
    }

    this.raf.read(() => {
      // Do nothing if disabled
      if (this.disabled || !this.condition()) {
        return;
      }

      const shouldSync: boolean = this.handleTransition();
      this.transition.loop(); // Run the transition's render loop

      const activeSlide = this.getActiveSlide();

      if (activeSlide !== this.lastActiveSlide) {
        this.lastActiveSlide = activeSlide;
        this.onTransitionCallbacks.forEach((callback) => callback(this));

        if (activeSlide) {
          this.raf.write(() => this.updateClasses(activeSlide));
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

    const adjustCssClasses =
        (slide: HTMLElement, cssClassesToKeep: Set<string>) => {
          const currentCssClasses = this.slideCssClasses.get(slide);
          const classesToRemove =
              setf.subtract(currentCssClasses, cssClassesToKeep);
          this.slideCssClasses.set(slide, cssClassesToKeep);
          slide.classList.remove(...classesToRemove);
          slide.classList.add(...cssClassesToKeep);
        };

    adjustCssClasses(activeSlide, this.activeCssClassSet);

    slidesBefore.reverse()
        .forEach((slide, index) => {
          adjustCssClasses(slide, this.beforeCssClassMap.get(index));
        });

    slidesAfter
        .forEach((slide, index) => {
          adjustCssClasses(slide, this.afterCssClassMap.get(index));
        });
  }

  /**
   * Handle the transition between slides.
   */
  private handleTransition(): boolean {
    if (this.isTransitioning()) {
      const hasTransitionedToTarget =
          this.transition.hasTransitionedTo(this.transitionTarget.getElement());

      const shouldSync = !this.transitionTarget.isDrivenBySync();
      if (hasTransitionedToTarget) {
        this.transitionTarget = null;
      } else {
        this.transition.transition(this.transitionTarget.getElement());
      }
      return shouldSync;
    } else {
      return true;
    }
  }

  /**
   * Get the slide element the carousel is in the process of transitioning to.
   */
  private getCurrentTransitionTarget(): HTMLElement {
    return this.isTransitioning() ?
        this.transitionTarget.getElement() :
        this.getActiveSlide();
  }

  /**
   * Clamp a given index to land within the possible slide indices.
   * @param index
   */
  private getClampedIndex(index: number): number {
    const slidesLength = this.getSlides().length;
    if (this.allowsLooping()) {
      const clampedIndex = index % slidesLength; // Can be any sign
      return (clampedIndex + slidesLength) % slidesLength; // Make positive
    } else {
      return mathf.clamp(0, slidesLength - 1, index);
    }
  }
}
