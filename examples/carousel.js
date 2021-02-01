/**
 * This sample show the most basic uses of CanvasImageSequence which is
 * updated by the scroll position of a position sticky based container.
 */
import {Carousel} from '../lib/ui/carousel/carousel';
import {PhysicalSlide} from '../lib/ui/carousel/physical-slide/physical-slide';
import {CarouselSynchronizer} from '../lib/ui/carousel/carousel-synchronizer';

export default class CarouselSample {
  constructor() {
    console.log('carousel');
    const a = new Carousel(
        document.querySelector('.container-a'),
        Array.from(document.querySelectorAll('.container-a .slide')),
        {
          allowLooping: true,
          transition: new PhysicalSlide(),
        }
    );
    const b = new Carousel(
        document.querySelector('.container-b'),
        Array.from(document.querySelectorAll('.container-b .slide')),
        {
          allowLooping: true,
        }
    );

    CarouselSynchronizer.getSingleton(this).sync(a, b);
  }
}
