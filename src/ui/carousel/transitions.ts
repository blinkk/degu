import { Carousel } from './carousel';
export { PhysicalSlideConfig, PhysicalSlide } from './physical-slide/physical-slide';

export interface Transition {
  transition(targetSlide: Element): void;
  init(initialSlide: Element, carousel: Carousel): void;
  getActiveSlide(): HTMLElement;
  hasTransitionedTo(slide: HTMLElement): boolean;
  loop(): void;
}

export class CssClassesOnly implements Transition {
  private activeSlide: HTMLElement = null;
  private carousel: Carousel = null;

  init(targetSlide: HTMLElement, carousel: Carousel) {
    this.carousel = carousel;
    this.activeSlide = targetSlide;
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

  loop() {
    // This space left deliberately empty.
  }
}
