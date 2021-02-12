import { Draggable } from './draggable';
import { setf } from '../../setf/setf';
import { Vector } from '../../mathf/vector';
import { MatrixService } from '../carousel/draggable-slide/matrix-service';

export class DraggableSynchronizer {
  /**
   * Returns a singleton. `use` is passed to ensure the singleton is only
   * actually disposed when it is done being used everywhere. This same `use`
   * should be passed to the dispose call.
   * @param use
   */
  static getSingleton(use: any): DraggableSynchronizer {
    DraggableSynchronizer.singletonUses.add(use);
    if (DraggableSynchronizer.singleton === null) {
      DraggableSynchronizer.singleton = new DraggableSynchronizer();
    }
    return DraggableSynchronizer.singleton;
  }

  private static singleton: DraggableSynchronizer = null;
  private static singletonUses: Set<any> = new Set();
  private syncedDraggables: Array<Set<Draggable>>;

  constructor() {
    if (DraggableSynchronizer.singleton !== null) {
      throw new Error(
          'DraggableSynchronizer must be instantiated via getSingleton()');
    }
    this.syncedDraggables = [];
  }

  /**
   * Synchronize the given draggables so that when one is dragged they all move.
   * @param draggables
   */
  sync(...draggables: Draggable[]) {
    const unchangedSets: Array<Set<Draggable>> = [];
    const setsToMerge: Array<Set<Draggable>> = [new Set(draggables)];
    // If any of the given draggables are already synchronized to another
    // draggable, then merge this new set with the existing set.
    this.syncedDraggables
      .forEach(
        (draggableSet) => {
          const setHasDraggable =
              draggables.find(
                  (draggable) => draggableSet.has(draggable));
          if (setHasDraggable) {
            setsToMerge.push(draggableSet);
          } else {
            unchangedSets.push(draggableSet);
          }
        }
      );

    this.syncedDraggables = [...unchangedSets, setf.merge(...setsToMerge)];
  }

  /**
   * Render a drag for the given draggable and all its synchronized mates.
   * @param draggable The draggable that is kicking things off.
   * @param delta The amount to translate the Draggables by.
   */
  renderDrag(draggable: Draggable, delta: Vector) {
    if (delta.length() === 0) {
      return;
    }
    const syncedDraggables = this.getSetForDraggable(draggable);
    if (!syncedDraggables) {
      MatrixService.getSingleton()
          .translate(draggable.element, delta.x, delta.y);
    }
    syncedDraggables.forEach((syncedDraggable) => {
      MatrixService.getSingleton()
          .translate(syncedDraggable.element, delta.x, delta.y);
    });
  }

  /**
   * Dispose of the draggable, only if all uses of the singleton have disposed
   * themselves.
   * @param use
   */
  dispose(use: any) {
    if (this === DraggableSynchronizer.singleton) {
      DraggableSynchronizer.singletonUses.delete(use);
      if (DraggableSynchronizer.singletonUses.size <= 0) {
        DraggableSynchronizer.singleton = null;
        this.syncedDraggables = [];
      }
    } else {
      this.syncedDraggables = [];
    }
  }

  /**
   * Return the set of Draggables that are synchronized with the given
   * draggable.
   * @param draggable
   */
  private getSetForDraggable(draggable: Draggable): Set<Draggable> {
    return this.syncedDraggables.find(
        (set) => set.has(draggable));
  }
}
