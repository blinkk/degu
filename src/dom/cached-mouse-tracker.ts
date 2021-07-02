import {DomWatcher} from '../dom/dom-watcher';
import {Raf} from '../raf/raf';
import {Vector} from '../mathf/vector';
import {EventCallback, EventDispatcher, EventManager} from '../ui/events';

const CURSOR_MOVE_EVENTS: string[] = ['mousemove', 'touchstart', 'touchmove'];

export enum CachedMouseTrackerEvent {
  UPDATE = 'update',
}

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
export class CachedMouseTracker implements EventDispatcher {
  // Use static variables so that independent instances can operate as a
  // singleton but be disposed separately without the user needing to worry
  // about the singleton pattern.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static uses: Set<any> = new Set();
  private static nextClientPosition: Vector | null;
  private static clientPosition: Vector | null;
  private static domWatcher: DomWatcher;
  private static raf: Raf;
  private static eventManager: EventManager;

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
    this.nextClientPosition = new Vector(data.clientX, data.clientY);
  }

  private static loop(): void {
    this.raf.preRead(() => {
      if (
        this.nextClientPosition &&
        this.clientPosition?.equals(this.nextClientPosition)
      ) {
        return;
      }
      this.clientPosition = this.nextClientPosition;
      this.eventManager.dispatch(CachedMouseTrackerEvent.UPDATE);
    });
  }

  constructor() {
    if (CachedMouseTracker.uses.size === 0) {
      CachedMouseTracker.raf = new Raf(() => CachedMouseTracker.loop());
      CachedMouseTracker.clientPosition = Vector.ZERO;
      CachedMouseTracker.nextClientPosition = Vector.ZERO;
      CachedMouseTracker.domWatcher = new DomWatcher();
      CachedMouseTracker.eventManager = new EventManager();
      CURSOR_MOVE_EVENTS.forEach(cursorMoveEvent => {
        CachedMouseTracker.domWatcher.add({
          element: window,
          on: cursorMoveEvent,
          eventOptions: {passive: true},
          callback: (e: Event) => CachedMouseTracker.updatePosition(e),
        });
      });
      CachedMouseTracker.raf.start();
    }
    CachedMouseTracker.uses.add(this);
  }

  /**
   * Add a callback to the given event.
   */
  on(event: string, callback: EventCallback): void {
    CachedMouseTracker.eventManager.on(event, callback);
  }

  /**
   * Remove a callback from the given event.
   */
  off(event: string, callback: EventCallback): void {
    CachedMouseTracker.eventManager.off(event, callback);
  }

  /**
   * Return the current cached mouse position as determined by clientX and
   * clientY values.
   */
  getClientPosition(): Vector | null {
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
      CachedMouseTracker.eventManager.dispose();
    }
  }
}
