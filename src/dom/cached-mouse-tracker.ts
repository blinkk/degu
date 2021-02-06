import { DomWatcher, Raf } from '..';
import { Vector } from '../mathf/vector';

const CURSOR_MOVE_EVENTS: string[] = ['mousemove', 'touchstart', 'touchmove'];

/**
 * Interface filled by either mousemove or touchmove events.
 */
interface ClientPositionData {
  clientX: number;
  clientY: number;
}

/**
 * Tracks the client mouse position per frame.
 *
 * This improves performance and ensures that all frame-synced animations are
 * always using the same position value by delaying mouse position updates until
 * the preRead step of the RAF loop.
 *
 * If needed could be extended to:
 * - Track the page position and screen position.
 * - Track whether or not the mouse is pressed.
 * - Track velocity and gestures.
 *
 * If any of these needs arise this can serve as a reference:
 * https://github.com/angusm/toolbox-v2/blob/130326ee6b26e652d4bf7442c65ffbfeccc31649/src/toolbox/utils/cached-vectors/cursor.ts
 */
export class CachedMouseTracker {
  /**
   * Returns a singleton. `use` is passed to ensure the singleton is only
   * actually disposed when it is done being used everywhere. This same `use`
   * should be passed to the dispose call.
   * @param use
   */
  static getSingleton(use: any): CachedMouseTracker {
    CachedMouseTracker.singletonUses.add(use);
    if (CachedMouseTracker.singleton === null) {
      CachedMouseTracker.singleton = new CachedMouseTracker();
    }
    return CachedMouseTracker.singleton;
  }

  private static singleton: CachedMouseTracker = null;
  private static singletonUses: Set<any> = new Set();
  private readonly raf: Raf;
  private clientPosition: Vector;
  private domWatcher: DomWatcher;

  constructor() {
    if (CachedMouseTracker.singleton !== null) {
      throw new Error(
          'CachedMouseTracker must be instantiated via getSingleton()');
    }

    this.raf = new Raf();
    this.clientPosition = Vector.ZERO;
    this.domWatcher = new DomWatcher();
    CURSOR_MOVE_EVENTS.forEach((cursorMoveEvent) => {
      this.domWatcher.add({
        element: window,
        on: cursorMoveEvent,
        callback: (e: Event) => this.updatePosition(e)
      });
    });
  }

  /**
   * Return the current cached mouse position as determined by clientX and
   * clientY values.
   */
  getClientPosition(): Vector {
    return this.clientPosition;
  }

  /**
   * Indicate that the given `use` is no longer using the CachedMouseTracker
   * singleton.
   * @param use
   */
  dispose(use: any): void {
    if (this === CachedMouseTracker.singleton) {
      CachedMouseTracker.singletonUses.delete(use);
      if (CachedMouseTracker.singletonUses.size <= 0) {
        CachedMouseTracker.singleton = null;
        this.domWatcher.dispose();
      }
    } else {
      this.domWatcher.dispose();
    }
  }

  /**
   * Updates the currently tracked position from either a touch event or a mouse
   * event.
   * @param event
   */
  private updatePosition(event: Event): void {
    if (event instanceof MouseEvent) {
      this.updatePositionFromEvent(event);
    } else if (event instanceof TouchEvent) {
      this.updatePositionFromTouchEvent(event);
    }
  }

  /**
   * Update the tracked position from the touch event.
   * @param touchEvent
   */
  private updatePositionFromTouchEvent(touchEvent: TouchEvent): void {
    if (touchEvent.touches.length > 0) {
      this.updatePositionFromEvent(touchEvent.touches[0]);
    }
  }

  /**
   * Update the tracked position using event information.
   * @param data
   */
  private updatePositionFromEvent(data: ClientPositionData): void {
    this.raf.preRead(() => {
      this.clientPosition = new Vector(data.clientX, data.clientY);
    });
  }
}
