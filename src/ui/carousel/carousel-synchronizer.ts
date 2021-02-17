import { Carousel } from './carousel';
import { DefaultMap } from '../../map/default-map';

/**
 * Will synchronize the active slide index across multiple carousels.
 *
 * This can be useful if you have separate areas for assets, copy and/or
 * navigation that need transition together.
 *
 * Example:
 *
 * DOM:
 * ```
 * <div class="carousel">
 *   <div class="slide">1</div>
 *   <div class="slide">2</div>
 *   <div class="slide">3</div>
 * </div>
 * <div class="nav">
 *   <div class="dot">1</div>
 *   <div class="dot">2</div>
 *   <div class="dot">3</div>
 * </div>
 * ```
 *
 * JS:
 * ```
 * const a = new Carousel(
 *   document.querySelector('.carousel'),
 *   Array.from(document.querySelectorAll('.container-a .slide')),
 *   {
 *     allowLooping: true,
 *     transition: new DraggableSlide(),
 *   });
 * const b = new Carousel(
 *   document.querySelector('.container-b'),
 *   Array.from(document.querySelectorAll('.container-b .slide')),
 *   {
 *     allowLooping: true,
 *   });
 * const syncInstance = CarouselSynchronizer.getSingleton();
 * syncInstance.sync(a, b);
 *
 * // At some point later, dispose.
 * a.dispose();
 * b.dispose();
 * syncInstance.dispose(a);
 * ```
 *
 * CSS:
 * ```
 * .carousel {
 *   position: relative;
 *   height: 20vh;
 *   width: 80vw;
 *   overflow: hidden;
 *   display: flex;
 *   flex-wrap: nowrap;
 * }
 * .slide {
 *   display: flex;
 *   justify-content: center;
 *   align-items: center;
 *   height: 100%;
 *   width: 50%;
 *   flex-shrink: 0;
 *   font-size: 10vw;
 *   user-select: none;
 * }
 * .slide:nth-child(1) {
 *   background: paleturquoise;
 * }
 * .slide:nth-child(2) {
 *   background: palevioletred;
 * }
 * .slide:nth-child(3) {
 *   background: palegreen;
 * }
 * .nav {
 *   display: flex;
 *   justify-content: center;
 *   align-items: center;
 * }
 * .dot {
 *   flex-grow: 0;
 *   flex-shrink: 0;
 *   width: 10px;
 *   height: 10px;
 *   border-radius: 50%;
 *   opacity: .25;
 *   background: black;
 *   transition: opacity 1s, transform 1s;
 *   margin: 0 8px;
 * }
 * .dot.active {
 *   transform: scale(1.25);
 *   opacity: 1;
 * }
 * .dot.before, .dot.after {
 *   transform: scale(0.9);
 * }
 * ```
 */
export class CarouselSynchronizer {
  /**
   * Returns a singleton.
   */
  static getSingleton(): CarouselSynchronizer {
    if (CarouselSynchronizer.singleton === null) {
      CarouselSynchronizer.singleton = new CarouselSynchronizer();
    }
    return CarouselSynchronizer.singleton;
  }

  private static singleton: CarouselSynchronizer = null;
  private graph: DefaultMap<Carousel, Set<Carousel>>;

  constructor() {
    if (CarouselSynchronizer.singleton !== null) {
      throw new Error(
          'CarouselSynchronizer must be instantiated via getSingleton()');
    }
    this.graph =
        DefaultMap.usingFunction((carousel: Carousel) => new Set());
  }

  /**
   * Synchronize the given carousels.
   */
  sync(...carousels: Carousel[]) {
    // Create a set with the given carousels, if any of these carousels are
    // already synced to other carousels merge those sets together so that
    // everything stays synchronized.
    carousels.forEach((carousel) => {
      if (!this.graph.has(carousel)) {
        carousel.onTransitionStart(
            () => this.handleCarouselTransition(carousel));
      }

      const set = this.graph.get(carousel);
      carousels
          .filter((c) => c !== carousel)
          .forEach((c) => set.add(c));
    });
  }

  /**
   * Handle the transition of the given carousel to the given index.
   *
   * Will transition all other carousels synced with the given carousel to the
   * given index.
   *
   * @param carousel
   */
  handleCarouselTransition(carousel: Carousel) {
    const transitionTarget = carousel.getTransitionTarget();
    if (!transitionTarget || transitionTarget.drivenBySync) {
      return; // Skip if this sync was triggered by a sync call
    }

    const syncedCarousels = this.graph.get(carousel);
    const index = carousel.getTransitionTargetIndex();
    syncedCarousels.forEach((syncedCarousel) => {
      syncedCarousel.transitionToIndex(index, true);
    });
  }

  /**
   * Remove the given carousel from any synced sets.
   * @param carousel
   */
  removeCarousel(carousel: Carousel) {
    const syncedCarousels = this.graph.get(carousel);
    syncedCarousels.forEach((syncedCarousel) => {
      this.graph.get(syncedCarousel).delete(carousel);
    });
    this.graph.delete(carousel);

    // If there are now no carousels being synchronized,
    // dispose of the singleton.
    if (
        this.graph.size === 0 &&
        CarouselSynchronizer.singleton === this
    ) {
      CarouselSynchronizer.singleton = null;
    }
  }
}
