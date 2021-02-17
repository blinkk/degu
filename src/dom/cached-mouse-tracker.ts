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
  // Use static variables so that independent instances can operate as a
  // singleton but be disposed separately without the user needing to worry
  // about the singleton pattern.
  private static uses: Set<any> = new Set();
  private static clientPosition: Vector;
  private static domWatcher: DomWatcher;
  private static raf: Raf;

  /**
   * Updates the currently tracked position from either a touch event or a mouse
   * event.
   * @param event
   */
  private static updatePosition(event: Event): void {
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
  private static updatePositionFromTouchEvent(touchEvent: TouchEvent): void {
    if (touchEvent.touches.length > 0) {
      this.updatePositionFromEvent(touchEvent.touches[0]);
    }
  }

  /**
   * Update the tracked position using event information.
   * @param data
   */
  private static updatePositionFromEvent(data: ClientPositionData): void {
    this.raf.preRead(() => {
      this.clientPosition = new Vector(data.clientX, data.clientY);
    });
  }

  constructor() {
    if (CachedMouseTracker.uses.size === 0) {
      CachedMouseTracker.raf = new Raf();
      CachedMouseTracker.clientPosition = Vector.ZERO;
      CachedMouseTracker.domWatcher = new DomWatcher();
      CURSOR_MOVE_EVENTS.forEach((cursorMoveEvent) => {
        CachedMouseTracker.domWatcher.add({
          element: window,
          on: cursorMoveEvent,
          callback: (e: Event) => CachedMouseTracker.updatePosition(e)
        });
      });
    }
    CachedMouseTracker.uses.add(this);
  }

  /**
   * Return the current cached mouse position as determined by clientX and
   * clientY values.
   */
  getClientPosition(): Vector {
    return CachedMouseTracker.clientPosition;
  }

  /**
   * Dispose of the currently in use tracker.
   */
  dispose(): void {
    CachedMouseTracker.uses.delete(this);
    if (CachedMouseTracker.uses.size === 0) {
      CachedMouseTracker.domWatcher.dispose();
      CachedMouseTracker.raf.dispose();
      CachedMouseTracker.clientPosition = null;
    }
  }
}
