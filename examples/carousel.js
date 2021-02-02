/**
 * This sample show the most basic uses of CanvasImageSequence which is
 * updated by the scroll position of a position sticky based container.
 */
import {Carousel} from '../lib/ui/carousel/carousel';
import {DraggableSlide} from '../lib/ui/carousel/draggable-slide/draggable-slide';
import {CarouselSynchronizer} from '../lib/ui/carousel/carousel-synchronizer';

export default class CarouselSample {
  constructor() {
    console.log('carousel');
    const a = new Carousel(
        document.querySelector('.carousel'),
        Array.from(document.querySelectorAll('.carousel .slide')),
        {
          allowLooping: true,
          transition: new DraggableSlide(),
        }
    );
    const b = new Carousel(
        document.querySelector('.nav'),
        Array.from(document.querySelectorAll('.nav .dot')),
        {
          allowLooping: true,
        }
    );

    CarouselSynchronizer.getSingleton(this).sync(a, b);
  }
}
