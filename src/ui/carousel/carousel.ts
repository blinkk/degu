import { CssClassesOnly, Transition } from './transitions';
import { DefaultMap } from '../../map/default-map';
import { mathf, Raf } from '../..';
import { setf } from '../../setf/setf';
import { splitEvenlyOnItem } from '../../arrayf/split-evenly-on-item';
import { TransitionTarget } from './transition-target';
import { CarouselSyncManager } from './carousel-sync-manager';

export interface CarouselOptions {
  onTransitionCallbacks?: Array<(carousel: Carousel) => void>;
  onDisposeCallbacks?: Array<(carousel: Carousel) => void>;
  activeCssClass?: string;
  beforeCssClass?: string;
  afterCssClass?: string;
  allowLooping?: boolean;
  transition?: Transition;
  condition?: () => boolean;
}

const defaultTransition: Transition = new CssClassesOnly();
const INTERACTION: symbol = Symbol('interaction');
enum CssClass {
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
        activeCssClass = CssClass.ACTIVE_SLIDE,
        beforeCssClass = CssClass.BEFORE_SLIDE,
        afterCssClass = CssClass.AFTER_SLIDE,
        allowLooping = true,
        transition = defaultTransition
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
    this.transition = transition;
    this.transitionTarget = null;
    this.interactions = [];
    this.disposed = false;
    this.disabled = false;

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
    this.init_();
  }

  allowsLooping() {
    return this.allowLooping;
  }

  getLastActiveSlide(): HTMLElement {
    return this.lastActiveSlide;
  }

  transitionToSlide(
      targetSlide: HTMLElement,
      drivenBySync: boolean = false
  ): void {
    if (this.isBeingInteractedWith()) {
      return;
    }
    this.transitionTarget = new TransitionTarget(targetSlide, drivenBySync);
  }

  isTransitioning(): boolean {
    return this.transitionTarget !== null;
  }

  isBeingInteractedWith(interaction: symbol = null): boolean {
    return this.interactions.length > 0 &&
        (!interaction || this.interactions.indexOf(interaction) !== -1);
  }

  isIdle(): boolean {
    return !this.isTransitioning() && !this.isBeingInteractedWith();
  }

  getActiveSlide(): HTMLElement {
    return this.transition.getActiveSlide();
  }

  getActiveClass(): string {
    return this.activeCssClass;
  }

  getActiveSlideIndex(): number {
    return this.getSlideIndex(this.getActiveSlide());
  }

  getFirstSlide(): HTMLElement {
    return this.slides[0];
  }

  getLastSlide(): HTMLElement {
    return this.slides[this.slides.length - 1];
  }

  getSlideIndex(slide: HTMLElement): number {
    return this.getSlides().indexOf(slide);
  }

  getSlidesBetween(a: HTMLElement, b: HTMLElement): HTMLElement[] {
    return this.getSlides()
        .slice(this.getSlideIndex(a) + 1, this.getSlideIndex(b));
  }

  getContainer(): HTMLElement {
    return this.container;
  }

  getSlides(): HTMLElement[] {
    return [...this.slides];
  }

  getSlidesBefore(slide: HTMLElement): HTMLElement[] {
    if (this.allowsLooping()) {
      return splitEvenlyOnItem(this.getSlides(), slide, true)[0];
    } else {
      return this.getSlides().slice(0, this.getSlides().indexOf(slide));
    }
  }

  getSlidesAfter(slide: HTMLElement): HTMLElement[] {
    if (this.allowsLooping()) {
      return splitEvenlyOnItem(this.getSlides(), slide, true)[1];
    } else {
      return this.getSlides().slice(this.getSlides().indexOf(slide) + 1);
    }
  }

  next(): void {
    this.transitionSlidesBy(1);
  }

  previous(): void {
    this.transitionSlidesBy(-1);
  }

  startInteraction(interaction: symbol = INTERACTION): void {
    this.clearTransitionTarget_();
    this.interactions.push(interaction);
  }

  endInteraction(interaction: symbol = INTERACTION): void {
    const index = this.interactions.indexOf(interaction);
    this.interactions = [
        ...this.interactions.slice(0, index),
        ...this.interactions.slice(index + 1)];
  }

  transitionSlidesBy(value: number): void {
    const nextIndex =
        this.getSlides().indexOf(this.getCurrentTransitionTarget_()) + value;
    this.transitionToIndex(nextIndex);
  }

  transitionToIndex(index: number, drivenBySync: boolean = false): void {
    if (!drivenBySync) {
      CarouselSyncManager.getSingleton().transitionToIndex(this, index);
    }

    const clampedIndex = this.getClampedIndex_(index);
    this.transitionToSlide(this.getSlideByIndex(clampedIndex), drivenBySync);
  }

  onTransition(callback: (carousel: Carousel) => void) {
    this.onTransitionCallbacks.push(callback);
  }

  onDispose(callback: (carousel: Carousel) => void) {
    this.onDisposeCallbacks.push(callback);
  }

  getSlideByIndex(index: number): HTMLElement {
    return this.slides[index];
  }

  enable(): void {
    this.disabled = false;
  }

  disable(): void {
    this.disabled = true;
  }

  dispose() {
    this.disposed = true;
    this.raf.dispose();
    CarouselSyncManager.getSingleton().disposeCarousel(this);
    this.onDisposeCallbacks.forEach((callback) => callback(this));
  }

  private clearTransitionTarget_(): void {
    this.transitionTarget = null;
  }

  private init_(): void {
    this.transition.init(this.getSlides()[0], this);
    this.raf.start();
  }

  private loop(): void {
    if (this.disposed) {
      return;
    }

    this.raf.read(() => {
      // Do nothing if disabled
      if (this.disabled || !this.condition()) {
        return;
      }

      const shouldSync: boolean = this.handleTransition_();
      this.transition.loop(); // Run the transition's render loop

      const activeSlide = this.getActiveSlide();

      if (activeSlide !== this.lastActiveSlide) {
        this.lastActiveSlide = activeSlide;
        this.onTransitionCallbacks.forEach((callback) => callback(this));

        if (activeSlide) {
          this.raf.write(() => this.updateClasses_(activeSlide));
        }

        // Sync other carousels.
        if (shouldSync) {
          CarouselSyncManager.getSingleton()
              .transitionToIndex(this, this.getSlideIndex(activeSlide));
        }
      }
    });
  }

  private updateClasses_(activeSlide: HTMLElement) {
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

  private handleTransition_(): boolean {
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

  private getCurrentTransitionTarget_(): HTMLElement {
    return this.isTransitioning() ?
        this.transitionTarget.getElement() :
        this.getActiveSlide();
  }

  private getClampedIndex_(index: number): number {
    const slidesLength = this.getSlides().length;
    if (this.allowsLooping()) {
      const clampedIndex = index % slidesLength; // Can be any sign
      return (clampedIndex + slidesLength) % slidesLength; // Make positive
    } else {
      return mathf.clamp(0, slidesLength - 1, index);
    }
  }
}
