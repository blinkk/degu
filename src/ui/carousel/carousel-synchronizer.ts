import { setf } from '../../setf/setf';
import { Carousel } from './carousel';

/**
 * Will synchronize the slide positions of multiple carousels.
 *
 * This can be useful if you have separate areas for assets, copy and/or
 * navigation that all need to be synchronized together.
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
 *   <!-- Synced carousel does not need the repeat -->
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
 *     transition: new PhysicalSlide(),
 *   });
 * const b = new Carousel(
 *   document.querySelector('.container-b'),
 *   Array.from(document.querySelectorAll('.container-b .slide')),
 *   {
 *     allowLooping: true,
 *   });
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
   * Returns a singleton. `use` is passed to ensure the singleton is only
   * actually disposed when it is done being used everywhere. This same `use`
   * should be passed to the dispose call.
   * @param use
   */
  static getSingleton(use: any): CarouselSynchronizer {
    CarouselSynchronizer.singletonUses.add(use);
    if (CarouselSynchronizer.singleton === null) {
      CarouselSynchronizer.singleton = new CarouselSynchronizer();
    }
    return CarouselSynchronizer.singleton;
  }

  private static singleton: CarouselSynchronizer = null;
  private static singletonUses: Set<any> = new Set();
  private syncedCarousels: Array<Set<Carousel>>;

  constructor() {
    if (CarouselSynchronizer.singleton !== null) {
      throw new Error(
          'CarouselSynchronizer must be instantiated via getSingleton()');
    }
    this.syncedCarousels = [];
  }

  /**
   * Synchronize the given carousels.
   */
  sync(...carousels: Carousel[]) {
    // Create a set with the given carousels, if any of these carousels are
    // already synced to other carousels merge those sets together so that
    // everything stays synchronized.
    const unchangedSets: Array<Set<Carousel>> = [];
    const setsToMerge: Array<Set<Carousel>> = [new Set(carousels)];
    this.syncedCarousels
        .forEach(
            (carouselSet) => {
              const setContainsAGivenCarousel =
                  carousels.find((carousel: Carousel) => {
                    return carouselSet.has(carousel);
                  });
              if (setContainsAGivenCarousel) {
                setsToMerge.push(carouselSet);
              } else {
                unchangedSets.push(carouselSet);
              }
            }
        );

    this.syncedCarousels = [...unchangedSets, setf.merge(...setsToMerge)];
  }

  /**
   * Handle the transition of the given carousel to the given index.
   *
   * Will transition all other carousels synced with the given carousel to the
   * given index.
   *
   * @param carousel
   * @param index
   */
  handleCarouselTransition(carousel: Carousel, index: number) {
    const syncedCarousels = this.getSetForCarousel(carousel);
    if (!syncedCarousels) {
      return; // Do nothing if this carousel is not synced.
    }
    syncedCarousels.forEach((syncedCarousel) => {
      if (syncedCarousel !== carousel) {
        syncedCarousel.transitionToIndex(index, true);
      }
    });
  }

  /**
   * Dispose of the given carousel, removing it from any synced sets.
   * @param carousel
   */
  disposeCarousel(carousel: Carousel) {
    this.syncedCarousels
        .forEach((carouselSet) => carouselSet.delete(carousel));
    // Remove any empty or army of one carousels. No need to sync a carousel to
    // itself.
    this.syncedCarousels =
        this.syncedCarousels
            .filter((carouselSet) => carouselSet.size > 1);
  }

  /**
   * Indicate that the given `use` is no longer using the CarouselSynchronizer
   * singleton
   * @param use
   */
  dispose(use: any): void {
    if (this === CarouselSynchronizer.singleton) {
      CarouselSynchronizer.singletonUses.delete(use);
      if (CarouselSynchronizer.singletonUses.size <= 0) {
        CarouselSynchronizer.singleton = null;
        this.syncedCarousels = [];
      }
    } else {
      this.syncedCarousels = [];
    }
  }

  /**
   * Return the set of synced carousels to which the given carousel belongs.
   * @param carousel
   */
  private getSetForCarousel(carousel: Carousel): Set<Carousel> {
    return this.syncedCarousels.find((set) => set.has(carousel));
  }
}
