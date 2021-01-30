type EventTarget = HTMLElement|Window;
type Listener = [EventTarget, string, EventListenerOrEventListenerObject];

/**
 * Used for tracking listeners by ID.
 * This way event listeners in a component can be tossed into a set and easily
 * removed during dispose. Otherwise which element had which events tied to
 * which functions needs to be tracked in the class which can be annoying with
 * dynamically added listeners.
 */
export class TrackedListener {
  /**
   * Adds an event listener that can be tracked via the returned ID.
   * @param element
   * @param event
   * @param callback
   */
  static add(
      element: EventTarget,
      event: string,
      callback: EventListenerOrEventListenerObject
  ) {
    element.addEventListener(event, callback);
    const id = TrackedListener.getNextId();
    this.listeners.set(id, [element, event, callback]);
    return id;
  }

  /**
   * Adds an event listener that can be tracked via the returned ID.
   * @param element
   * @param events
   * @param callback
   */
  static addMultipleEvents(
      element: EventTarget,
      events: string[],
      callback: EventListenerOrEventListenerObject
  ) {
    return events.map((event) => this.add(element, event, callback));
  }

  /**
   * Removes the event listener tracked via the given ID.
   */
  static remove(...ids: number[]) {
    ids.forEach((id) => {
      const listener = this.listeners.get(id);
      listener[0].removeEventListener(listener[1], listener[2]);
      this.listeners.delete(id);
    });
  }

  /**
   * Get the next available ID.
   *
   * If the ID starts to exceed the safe range then it will restart at the
   * minimum safe ID.
   */
  static getNextId(): number {
    let id = TrackedListener.uid;
    while (this.listeners.has(id)) {
      if (TrackedListener.uid === Number.MAX_SAFE_INTEGER) {
        TrackedListener.uid = Number.MIN_SAFE_INTEGER;
      } else {
        TrackedListener.uid++;
      }
      id = TrackedListener.uid;
    }
    return id;
  }
  private static uid = Number.MIN_SAFE_INTEGER;
  private static listeners: Map<number, Listener> = new Map();
}
