type Listener = [HTMLElement, string, EventListenerOrEventListenerObject];

/**
 * Used for tracking listeners by ID.
 * This way event listeners in a component can be tossed into a set and easily
 * removed during dispose. Otherwise which element had which events tied to
 * which functions needs to be tracked in the class which can be annoying with
 * dynamically added listeners.
 */
export class TrackedListener {
  static add(
      element: HTMLElement,
      event: string,
      callback: EventListenerOrEventListenerObject
  ) {
    element.addEventListener(event, callback);
    const id = TrackedListener.getNextId();
    this.listeners.set(id, [element, event, callback]);
    return id;
  }

  static remove(id: number) {
    const listener = this.listeners.get(id);
    listener[0].removeEventListener(listener[1], listener[2]);
    this.listeners.delete(id);
  }

  static getNextId(): number {
    const id = TrackedListener.uid;
    if (TrackedListener.uid === Number.MAX_SAFE_INTEGER) {
      TrackedListener.uid = Number.MIN_SAFE_INTEGER;
    } else {
      TrackedListener.uid++;
    }
    return id;
  }
  private static uid = Number.MIN_SAFE_INTEGER;
  private static listeners: Map<number, Listener> = new Map();
}
