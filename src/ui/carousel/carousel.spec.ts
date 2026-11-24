import {describe, expect, it} from 'vitest';
import {Carousel, CarouselEvent} from './carousel';

describe('Carousel events (#129)', () => {
  it('fires BEFORE_TRANSITION without BEFORE_CHANGE when targeting the active slide', () => {
    const container = document.createElement('div');
    const slide0 = document.createElement('div');
    const slide1 = document.createElement('div');
    container.appendChild(slide0);
    container.appendChild(slide1);
    document.body.appendChild(container);

    let activeSlide: HTMLElement = slide0;
    const mockTransition = {
      init: () => {},
      dispose: () => {},
      isInteracting: () => false,
      getActiveSlide: () => activeSlide,
      hasTransitionedTo: (target: HTMLElement) => target === activeSlide,
      transition: (target: HTMLElement) => {
        activeSlide = target;
      },
    };

    const carousel = new Carousel(container, [slide0, slide1], {
      transition: mockTransition as any,
    });

    const events: string[] = [];
    carousel.on(CarouselEvent.BEFORE_CHANGE, () => events.push('beforeChange'));
    carousel.on(CarouselEvent.BEFORE_TRANSITION, () =>
      events.push('beforeTransition')
    );

    // Targeting the currently active slide (e.g. snap-back after drag)
    carousel.goToSlide(slide0);
    expect(events).toEqual(['beforeTransition']);

    // Targeting a different slide fires both BEFORE_TRANSITION and BEFORE_CHANGE
    events.length = 0;
    carousel.goToSlide(slide1);
    expect(events).toEqual(['beforeTransition', 'beforeChange']);

    carousel.dispose();
    container.remove();
  });
});
