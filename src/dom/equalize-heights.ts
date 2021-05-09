import {DomWatcher} from '../dom/dom-watcher';
import {func} from '../func/func';

/**
 * Equalizes the heights of a set of html elements.
 *
 * ```
 * <div id="myDiv">
 *   <div data-equalize-heights>...</div>
 *   <div data-equalize-heights>...</div>
 * </div>
 *
 * let root = document.getElementById('myDiv');
 * new EqualizeHeights(root, '[data-equalize-heights]');
 *
 * // Apply equalize height only on desktop or above
 * new EqualizeHeights(root, '[data-equalize-heights]', null, '>760');
 *
 * // Apply equalize height based on shortest.
 * new EqualizeHeights(root, '[data-equalize-heights]', true, '>760');
 * ```
 */
export class EqualizeHeights {
  private root: HTMLElement;
  private selector: string;
  private elements: Array<Element>;
  private setToShortest: boolean;
  private breakpoint: string;
  private watcher: DomWatcher;

  /**
   * @param {Element} root The root element.
   * @param {string} selector The css selector for elements to be equalized.
   * @param {boolean} setToShortest Whether to set the height to the shortest
   *   element.  This will apply a max-height instead of a min-height value.
   * @param {string} breakpoint Example: >760 or <759
   */
  constructor(
    rootElement: HTMLElement,
    selector: string,
    setToShortest: boolean,
    breakpoint: string
  ) {
    this.root = rootElement;
    this.selector = selector;
    this.elements = [];
    this.setToShortest = setToShortest;
    this.breakpoint = breakpoint;
    this.watcher = new DomWatcher();
    this.watcher.add({
      element: window,
      on: 'smartResize',
      callback: func.debounce(() => {
        this.run();
      }, 20),
    });
    this.run();
  }

  /**
   * Runs a function against the set of internal elements.
   */
  forEachElement(callback: Function) {
    this.elements.forEach(element => {
      callback(element);
    });
  }

  /**
   * Equalizes the heights of all elments.
   */
  public run() {
    // Don't apply equalheight on certain conditions.
    if (this.breakpoint) {
      const isGreaterThan = this.breakpoint.startsWith('>');
      const targetBreakpoint = +this.breakpoint.substring(1);
      if (isGreaterThan && targetBreakpoint >= window.innerWidth) {
        this.removeEqualHeights();
        return;
      }
      if (!isGreaterThan && targetBreakpoint <= window.innerWidth) {
        this.removeEqualHeights();
        return;
      }
    }

    this.setToShortest
      ? this.setToShortestElement()
      : this.setToTallestElement();
  }

  /**
   * Takes all elements and sets the minimum height to the tallest element.
   */
  setToTallestElement() {
    this.elements = Array.from(this.root.querySelectorAll(this.selector));
    let largestHeight = 0;
    this.forEachElement((element: HTMLElement) => {
      element.style.minHeight = '';
    });
    window.setTimeout(() => {
      this.forEachElement((element: HTMLElement) => {
        const height = element.getBoundingClientRect().height;
        largestHeight = Math.max(height, largestHeight);
      });
      this.forEachElement((element: HTMLElement) => {
        element.style.minHeight = largestHeight + 'px';
      });
    });
  }

  /**
   * Takes all elements and sets the maximum height to the shortest element.
   */
  setToShortestElement() {
    this.elements = Array.from(this.root.querySelectorAll(this.selector));
    let shortestHeight = 10000;
    this.forEachElement((element: HTMLElement) => {
      element.style.maxHeight = 'none';
    });
    this.forEachElement((element: HTMLElement) => {
      const height = element.offsetHeight;
      if (height < shortestHeight) {
        shortestHeight = height;
      }
    });

    this.forEachElement((element: HTMLElement) => {
      element.style.maxHeight = shortestHeight + 'px';
    });
  }

  removeEqualHeights() {
    this.elements = Array.from(this.root.querySelectorAll(this.selector));
    this.forEachElement((element: HTMLElement) => {
      element.style.maxHeight = '';
      element.style.minHeight = '';
    });
  }

  dispose() {
    this.removeEqualHeights();
    this.watcher.dispose();
    this.elements = [];
  }
}
