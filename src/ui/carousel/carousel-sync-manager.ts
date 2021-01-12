import {setf} from '../../setf/setf';
import {Carousel} from './carousel';

export class CarouselSyncManager {
  static getSingleton(): CarouselSyncManager {
    return this.singleton_ = this.singleton_ || new this();
  }
  private static singleton_: CarouselSyncManager = null;
  private syncedCarousels_: Array<Set<Carousel>>;

  constructor() {
    this.syncedCarousels_ = [];
  }

  syncCarousels(...carousels: Carousel[]) {
    const unchangedSets: Array<Set<Carousel>> = [];
    const setsToMerge: Array<Set<Carousel>> = [new Set(carousels)];
    this.syncedCarousels_
        .forEach(
            (carouselSet) => {
              if (carousels.find((carousel) => carouselSet.has(carousel))) {
                setsToMerge.push(carouselSet);
              } else {
                unchangedSets.push(carouselSet);
              }
            }
        );

    this.syncedCarousels_ = [...unchangedSets, setf.merge(...setsToMerge)];
  }

  transitionToIndex(carousel: Carousel, index: number) {
    const syncedCarousels = this.getSetForCarousel_(carousel);
    if (!syncedCarousels) {
      return;
    }
    syncedCarousels.forEach((syncedCarousel) => {
      if (syncedCarousel !== carousel) {
        syncedCarousel.transitionToIndex(index, true);
      }
    });
  }

  disposeCarousel(carousel: Carousel) {
    this.syncedCarousels_
        .forEach((carouselSet) => carouselSet.delete(carousel));
    this.syncedCarousels_ =
        this.syncedCarousels_
            .filter((carouselSet) => carouselSet.size > 0);
  }

  destroy() {
    this.syncedCarousels_ = [];
  }

  private getSetForCarousel_(carousel: Carousel): Set<Carousel> {
    return this.syncedCarousels_.find((set) => set.has(carousel));
  }
}
