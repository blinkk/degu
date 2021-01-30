import { Draggable } from './draggable';
import { setf } from '../../setf/setf';
import { Vector } from '../../mathf/vector';
import { MatrixService } from '../carousel/physical-slide/matrix-service';

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

  sync(...draggables: Draggable[]) {
    const unchangedSets: Array<Set<Draggable>> = [];
    const setsToMerge: Array<Set<Draggable>> = [new Set(draggables)];
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

  renderDrag(draggable: Draggable, delta: Vector) {
    if (delta.length() === 0) {
      return;
    }
    const syncedDraggables = this.getSetForDraggable_(draggable);
    if (!syncedDraggables) {
      MatrixService.getSingleton().translate(draggable.getElement(), delta);
    }
    syncedDraggables.forEach((syncedDraggable) => {
      MatrixService.getSingleton()
          .translate(syncedDraggable.getElement(), delta);
    });
  }

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

  private getSetForDraggable_(draggable: Draggable): Set<Draggable> {
    return this.syncedDraggables.find((set) => set.has(draggable));
  }
}
