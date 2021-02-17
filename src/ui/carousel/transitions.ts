import { Carousel } from './carousel';
export { DraggableSlideConfig, DraggableSlide } from './draggable-slide';

/**
 * Interface a Transition must implement to be used with a carousel.
 */
export interface Transition {
  transition(targetSlide: Element): void;
  init(carousel: Carousel): void;
  getActiveSlide(): HTMLElement;
  hasTransitionedTo(slide: HTMLElement): boolean;
  isInteracting(): boolean;
}

/**
 * A transition that doesn't really do anything.
 * This is used for when all effects can be set via CSS and triggered off the
 * default active/before/after classes.
 */
export class CssClassesOnly implements Transition {
  private activeSlide: HTMLElement = null;
  private carousel: Carousel = null;

  init(carousel: Carousel) {
    this.carousel = carousel;
  }

  getActiveSlide(): HTMLElement {
    return this.activeSlide;
  }

  transition(targetSlide: HTMLElement) {
    this.activeSlide = targetSlide;
  }

  hasTransitionedTo(slide: HTMLElement): boolean {
    return this.activeSlide === slide;
  }

  /**
   * Always false, this transition doesn't support any interaction.
   */
  isInteracting(): boolean {
    return false;
  }
}
