import { dom } from './dom';
import { is } from '..';

const SCROLL_ELEMENT: HTMLElement = <HTMLElement>(dom.getScrollElement());

export class ScrollLockService {
  static singleton: ScrollLockService;

  static getSingleton(): ScrollLockService {
    return (this.singleton = this.singleton || new this());
  }
  private counter: number;

  constructor() {
    this.counter = 0;
  }

  lockScroll(): void {
    if (is.safari()) {
      return; // Elegant locking is not possible for Safari
    }
    if (this.counter === 0) {
      const width = (<HTMLElement>SCROLL_ELEMENT).offsetWidth;
      SCROLL_ELEMENT.style.overflow = 'hidden';
      SCROLL_ELEMENT.style.width = `${width}px`;
    }
    this.counter++;
  }

  unlockScroll(): void {
    if (is.safari()) {
      return; // Elegant locking is not possible for Safari
    }
    if (this.counter === 1) {
      SCROLL_ELEMENT.style.overflow = '';
      SCROLL_ELEMENT.style.width = '';
    } else if (this.counter < 1) {
      throw new Error(
        'You have tried to unlock the scroll more times than you have locked ' +
        'the scroll.');
    }
    this.counter--;
  }
}
