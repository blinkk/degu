import {DomWatcher} from './dom-watcher';
import * as func from '../func/func';
import * as is from '../is/is';

export interface ScrollToCenterOfScreenOnFocusConfig {
  /**
   * The root parent element.
   */
  element: HTMLElement;

  /**
   * Whether to scroll to the element when its click on.
   * Handy for debuggin.
   */
  mouseDown?: boolean;

  /**
   * For any element with data-scroll-to-on-focus automatically set
   * the tabindex=0.  For VO focus to be acquired, tabindex=0 is required
   * so generally you can set this to true.
   */
  setTabIndex?: boolean;

  /**
   * Automatically sets the aria region to what is specified.
   */
  setAriaRole?: string;

  /**
   * Enables debug mode which outputs additional info to the console for
   * debugging.
   */
  debug: boolean;
}

/**
 * A class that looks for all elements with data-scroll-to-center-of-screen-on-focus
 * and when that element is focused, centers it to the vertical center
 * of the current viewport.
 *
 * Why is this needed?
 *
 * Let's say you have a title, body (chapter) that has an inview fade-in anim
 * that triggers when the threshold passes the bottom 30% of the viewport.
 *
 * When using VO or another screenreader, the user can focus onto an element
 * while it is still below the threshold causing a situation where the
 * content is announced but not visible on the screen.
 *
 * By using this class, you can force the element to the vertical center
 * of the screen to avoid these types of situations.
 *
 *
 * ```
 *
 *   this.scrollToCenterOfScreenOnFocus = new ScrollToCenterOfScreenOnFocus({
 *      element: this.element,
 *      debug: false,
 *      setTabIndex: true,
 *     setAriaRole: 'region'
 *   });
 *
 *
 * // Most cases:
 * // On focus of this element, would scroll the window so that the element
 * // is dead center in the screen.
 * <div data-scroll-to-center-of-screen-on-focus="0.5">xxx</div>
 *
 * // On focus scroll so that the top of this element is at the top of the screen.
 * <div
 *  data-scroll-to-center-of-screen-on-focus="0"
 *  data-base-line="0"
 *  >xxx</div>
 *
 * // On focus scroll so that the center of this element is at the top of the screen.
 * <div
 *  data-scroll-to-center-of-screen-on-focus="0"
 *  data-base-line="0.5"
 *  >xxx</div>
 *
 * // On focus of this element, would scroll the window so that the element
 * // is 0.8 percent from the top
 * <div data-scroll-to-center-of-screen-on-focus="0.8">xxx</div>
 *
 *
 * // On focus, the bottom of this element should be at the center of the
 * // screen.
 * <div
 *  data-scroll-to-center-of-screen-on-focus="0.5"
 *  data-base-line="1"
 *  >xxx</div>
 *
 *
 * ```
 *
 *
 * `data-scroll-to-center-of-screen-on-focus` value sets where on the screen
 * the element should align to. 0 would be the top, 0.5 would be center and 1
 * would be the bottom of the screen.
 *
 * `data-base-line` tells this class what part of the element should be aligned.
 * 0 would mean the top of the element, 0.5 would be the center, 1 would be the bottom.
 */
export class ScrollToCenterOfScreenOnFocus {
  private element: HTMLElement;
  private watcher: DomWatcher;
  private selector: string;
  private debug = false;

  constructor(private config: ScrollToCenterOfScreenOnFocusConfig) {
    this.element = config.element;
    this.watcher = new DomWatcher();
    this.selector = 'data-scroll-to-center-of-screen-on-focus';
    this.debug = func.setDefault(config.debug, false);

    const elements: Array<HTMLElement> = Array.from(
      this.element.querySelectorAll(`[${this.selector}]`)
    );

    elements.forEach(el => {
      if (config.setTabIndex) {
        el.tabIndex = 0;
      }

      if (config.setAriaRole) {
        el.setAttribute('role', config.setAriaRole);
      }

      this.watcher.add({
        element: el,
        on: 'focus',
        callback: () => {
          this.handleFocus(el);
        },
        eventOptions: {capture: true},
      });

      if (config.mouseDown || this.debug) {
        this.watcher.add({
          element: el,
          on: 'mousedown',
          callback: () => {
            this.handleFocus(el);
          },
        });
      }
    });
  }

  /**
   * Handle focus on an element.
   */
  private handleFocus(focusedElement: HTMLElement) {
    const targetPercent = +focusedElement.getAttribute(this.selector)!;
    const targetBaseline = !is.nullLike(
      focusedElement.getAttribute('data-base-line')
    )
      ? +focusedElement.getAttribute('data-base-line')!
      : 0.5;

    if (this.debug) {
      console.log('el' + focusedElement);
      console.log('targetPercent' + targetPercent);
      console.log('targetBaseline' + targetBaseline);
    }

    // Calculate the scrollY so that the element is in the desired
    // position on the viewport.
    const box = focusedElement.getBoundingClientRect();
    let elementBaseline = box.top + targetBaseline * box.height;
    elementBaseline = window.scrollY + elementBaseline;
    const y = elementBaseline - targetPercent * window.innerHeight;

    // Scroll To that point.
    window.scrollTo(0, y);

    // Simple version.
    // focusedElement.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'center'
    // });
  }

  public dispose() {
    this.watcher && this.watcher.dispose();
  }
}
