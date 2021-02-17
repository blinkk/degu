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
    const a = new Carousel(
        document.querySelector('.carousel--a'),
        Array.from(document.querySelectorAll('.carousel--a .slide')),
        {
          allowLooping: true,
          transition: new DraggableSlide(),
        });
    const b = new Carousel(
        document.querySelector('.nav'),
        Array.from(document.querySelectorAll('.nav .dot')),
        {
          allowLooping: true,
        });
    CarouselSynchronizer.getSingleton(this).sync(a, b);
    const c = new Carousel(
        document.querySelector('.carousel--c'),
        Array.from(document.querySelectorAll('.carousel--c .slide')),
        {
          allowLooping: false,
          transition: 'draggable',
        });
  }
}
