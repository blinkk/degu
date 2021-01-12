import { Draggable } from './draggable';
import { setf } from '../../setf/setf';
import { Vector } from '../../mathf/vector';
import { MatrixService } from '../carousel/physical-slide/matrix-service';

class DraggableSyncManager {

  static getSingleton(): DraggableSyncManager {
    return this.singleton = this.singleton || new this();
  }
  private static singleton: DraggableSyncManager = null;
  private syncedDraggables: Array<Set<Draggable>>;

  constructor() {
    this.syncedDraggables = [];
  }

  syncDraggables(...draggables: Draggable[]) {
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

  dispose() {
    this.syncedDraggables = [];
  }

  private getSetForDraggable_(draggable: Draggable): Set<Draggable> {
    return this.syncedDraggables.find((set) => set.has(draggable));
  }
}

export { DraggableSyncManager };
