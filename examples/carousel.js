/**
 * Sample showing two Carousel instances synced with CarouselSynchronizer.
 *
 * The top carousel uses the DraggableSlide transition and the bottom is
 * styled through CSS with no special interaction.
 */
import {Carousel} from '../lib/ui/carousel/carousel';
import {DraggableSlide} from '../lib/ui/carousel/draggable-slide';
import {CarouselSynchronizer} from '../lib/ui/carousel/carousel-synchronizer';

export default class CarouselSample {
  constructor() {
    function easeOutBounce(x) {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
      } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
      } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
      }
    }
    const a = new Carousel(
        document.querySelector('.carousel--a'),
        Array.from(document.querySelectorAll('.carousel--a .slide')),
        {
          autoplaySpeed: 3000,
          allowLooping: true,
          transition: new DraggableSlide({
            transitionTime: 2000,
            easingFunction: easeOutBounce
          }),
        });
    const b = new Carousel(
        document.querySelector('.nav'),
        Array.from(document.querySelectorAll('.nav .dot')),
        {
          allowLooping: true,
        });
    a.sync(b);
    const c = new Carousel(
        document.querySelector('.carousel--c'),
        Array.from(document.querySelectorAll('.carousel--c .slide')),
        {
          allowLooping: false,
          transition: 'draggable',
        });
  }
}
