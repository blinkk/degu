import { setf } from '../../setf/setf';
import { Carousel } from './carousel';

/**
 * Will synchronize the slide positions of multiple carousels.
 *
 * This can be useful if you have separate areas for assets, copy and/or
 * navigation that all need to be synchronized together.
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
    this.syncedCarousels = [];
  }

  /**
   * Synchronize the given carousels.
   */
  syncCarousels(...carousels: Carousel[]) {
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
