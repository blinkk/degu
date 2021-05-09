import {DomWatcher} from './dom-watcher';

/**
 * A class that prevents the user from scrolling.
 *
 * This class can be useful in "Freezing" the screen to the current
 * scroll position.
 *
 * ```
 * const p = new PreventScroll();
 *
 * // No scrollling allowed
 * p.enableScroll(false);
 *
 * // All scrolling allowed
 * p.enableScroll(true);
 *
 * // Disposes and reenables scroll.
 * p.dispose();
 * ```
 */
export class PreventScroll {
  private domWatcher: DomWatcher;
  constructor() {
    this.domWatcher = new DomWatcher();
  }

  private preventDefault(e: any) {
    e.preventDefault();
  }

  public enableScroll(enable = true) {
    if (enable) {
      this.domWatcher.removeAll();
    } else {
      const eventTypes = [
        'DomMouseScroll',
        'Scroll',
        'wheel',
        'mouseWheel',
        'keydown',
        'touchmove',
      ];
      eventTypes.forEach(type => {
        this.domWatcher.add({
          element: document,
          on: type,
          eventOptions: {passive: false},
          callback: this.preventDefault.bind(this),
        });
      });
    }
  }

  public dispose() {
    this.domWatcher.dispose();
  }
}
