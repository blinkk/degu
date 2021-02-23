import { DefaultMap } from '../map/default-map';

type Callback = (...args: any[]) => void;

export interface EventDispatcher {
  /**
   * Adds a callback that will be run each time the event is dispatched.
   *
   * Adding the same event/callback pair a second time should have no effect.
   */
  on(event: string, callback: Callback): void;

  /**
   * Stops the callback from being run each time the event is dispatched.
   */
  off(event: string, callback: Callback): void;
}

/**
 * Utility class to simplify implementation of the EventDispatcher interface.
 *
 * Example:
 * ```
 * class Foo implements EventDispatcher {
 *   private eventManager: EventManager;
 *   constructor() {
 *     this.eventManager = new EventManager();
 *   }
 *
 *   on(event: string, callback: Callback) {
 *     this.eventManager.on(event, callback);
 *   }
 *
 *   off(event: string, callback: Callback) {
 *     this.eventManager.off(event, callback);
 *   }
 *
 *   bar() {
 *     this.eventManager.dispatch('someEvent');
 *   }
 * }
 * ```
 */
export class EventManager {
  private callbacks: DefaultMap<string, Set<Callback>>;

  constructor() {
    this.callbacks = DefaultMap.usingFunction(() => new Set<Callback>());
  }

  /**
   * Run the given callback when the given event is dispatched.
   */
  on(event: string, callback: Callback): void {
    this.callbacks.get(event).add(callback);
  }

  /**
   * Run callbacks for the given event with the given arguments.
   */
  dispatch(event: string, ...args: any[]): void {
    this.callbacks.get(event).forEach((callback) => callback(...args));
  }

  /**
   * Stop running the given callback on the given event.
   */
  off(event: string, callback: Callback): void {
    const callbacks = this.callbacks.get(event);
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      this.callbacks.delete(event);
    }
  }

  /**
   * Clear out internal Sets and Map.
   */
  dispose(): void {
    const values = this.callbacks.values();
    let callbackSet = values.next();
    while (!callbackSet.done) {
      callbackSet.value.clear();
      callbackSet = values.next();
    }
    this.callbacks.clear();
  }
}
