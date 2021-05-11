import {EventDispatcher, EventCallback, EventManager} from '../ui/events';

export enum KeyboardNavigationEvents {
  ANY_CHANGE = 'any',
  MOUSE = 'mouse',
  KEYBOARD = 'keyboard',
}

/**
 * A class that monitors mouse versus keyboard navigation on the page.
 *
 * Example:
 * ```
 * import {KeyboardNavigationEvents, KeyboardNavigationWatcher} from '@blinkk/degu/lib/dom/keyboard-navigation-watcher';
 *
 * const watcher = new KeyboardNavigationWatcher();
 *
 * watcher.on(KeyboardNavigationEvents.MOUSE, ()=> {
 *    // user switched to mouse
 * })
 *
 * watcher.on(KeyboardNavigationEvents.KEYBOARD, ()=> {
 *    // user switched to keyboard
 * })
 *
 * watcher.on(KeyboardNavigationEvents.ANY_CHANGE, ()=> {
 *     //  *  console.log(watcher.state)
 * })
 *
 * watcher.dispose();
 * ```
 */
export class KeyboardNavigationWatcher implements EventDispatcher {
  private listenerDisposers: Array<Function>;
  private eventManager: EventManager;
  public state: KeyboardNavigationEvents | null = null;

  constructor() {
    this.eventManager = new EventManager();

    this.listenerDisposers = [];

    // Mouse related events.
    this.addEvents('mousemove', this.setMouse.bind(this));
    this.addEvents('mousedown', this.setMouse.bind(this));
    this.addEvents('mouseup', this.setMouse.bind(this));
    this.addEvents('touchmove', this.setMouse.bind(this));
    this.addEvents('touchstart', this.setMouse.bind(this));
    this.addEvents('touchend', this.setMouse.bind(this));

    // Keyboard
    this.addEvents('keyup', this.setKeyboard.bind(this));
    this.addEvents('keydown', this.setKeyboard.bind(this));
  }

  on(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  off(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  private setKeyboard() {
    if (this.state !== KeyboardNavigationEvents.KEYBOARD) {
      this.eventManager.dispatch(KeyboardNavigationEvents.KEYBOARD);
      this.eventManager.dispatch(KeyboardNavigationEvents.ANY_CHANGE);
      this.state = KeyboardNavigationEvents.KEYBOARD;
    }
  }

  private setMouse() {
    if (this.state !== KeyboardNavigationEvents.MOUSE) {
      this.eventManager.dispatch(KeyboardNavigationEvents.MOUSE);
      this.eventManager.dispatch(KeyboardNavigationEvents.ANY_CHANGE);
      this.state = KeyboardNavigationEvents.MOUSE;
    }
  }

  private addEvents(name: string, callback: EventListener) {
    document.addEventListener(name, callback);
    this.listenerDisposers.push(() => {
      document.removeEventListener(name, callback);
    });
  }

  dispose() {
    this.eventManager.dispose();
    this.listenerDisposers.forEach(disposer => {
      disposer();
    });
  }
}
