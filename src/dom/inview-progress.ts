import {ProgressWatcher} from '../dom/progress-watcher';

export interface InviewProgressItem {
  range: number | number[];
  element?: HTMLElement;
  className?: string;
  activeCallback?: Function;
  inactiveCallback?: Function;
}

/**
 * A class that adds or removes css classes to a given element based on
 * progress values.
 *
 * const inviewProgress = new InviewProgress();
 *
 * // Adds the css class 'active' to the el element while progress is
 * // from 0.2 to 0.4.  If out of range, active gets removed.
 *  this.inviewProgress.add({
 *    range: [0.2, 0.4],
 *    element: el,
 *    className: "active"
 *  })
 *
 *
 *
 * // Add active callbacks.  Called on every progress update when active.
 *  this.inviewProgress.add({
 *    range: [0.2, 0.4],
 *    activeCallback: (progress:number, direction:number)=> {
 *    }
 *  })
 *
 *
 * // Add inactive callbacks.  Called on every progress update when inactive.
 *  this.inviewProgress.add({
 *    range: [0.2, 0.4],
 *    inactiveCallback: (progress:number, direction:number)=> {
 *    }
 *  })
 *
 * inviewProgress.update(0.2)
 */
export class InviewProgress {
  private progressWatcher: ProgressWatcher;

  constructor() {
    this.progressWatcher = new ProgressWatcher();
  }

  add(inviewProgressItem: InviewProgressItem) {
    const setActive = (progress: number, direction: number) => {
      if (inviewProgressItem.className && inviewProgressItem.element) {
        inviewProgressItem.element.classList.add(inviewProgressItem.className);
      }
      if (inviewProgressItem.activeCallback) {
        inviewProgressItem.activeCallback(progress, direction);
      }
    };

    const setInactive = (progress: number, direction: number) => {
      if (inviewProgressItem.className && inviewProgressItem.element) {
        inviewProgressItem.element.classList.remove(
          inviewProgressItem.className
        );
      }
      if (inviewProgressItem.inactiveCallback) {
        inviewProgressItem.inactiveCallback(progress, direction);
      }
    };

    this.progressWatcher.add({
      range: inviewProgressItem.range,
      callback: (progress: number, direction: number) => {
        setActive(progress, direction);
      },
      inactiveCallback: (progress: number, direction: number) => {
        setInactive(progress, direction);
      },
    });
  }

  /**
   * Clears out the css class inviews.
   */
  public clear() {
    this.progressWatcher.clear();
  }

  /**
   * Sets the progress value.
   * @param progress
   */
  public setProgress(progress: number): void {
    this.progressWatcher.setProgress(progress);
  }

  /**
   * Gets the internal instance of progress Watcher.
   */
  public getProgressWatcher() {
    return this.progressWatcher;
  }

  public dispose() {
    this.progressWatcher.dispose();
  }
}
