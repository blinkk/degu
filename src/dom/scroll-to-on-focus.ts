import {DomWatcher} from './dom-watcher';
import * as dom from '../dom/dom';
import * as func from '../func/func';
import * as is from '../is/is';
import {
  KeyboardNavigationEvents,
  KeyboardNavigationWatcher,
} from './keyboard-navigation-watcher';

export interface ScrollToOnFocusConfig {
  /**
   * The root parent element.
   */
  element: HTMLElement;

  /**
   * The top offset of the progress.
   */
  topProgressOffset: number;

  /**
   * The bottom offset of the progress.
   */
  bottomProgressOffset: number;

  /**
   * Whether to scroll to the element when its click on.
   * Handy for debuggin.
   */
  mouseDown?: boolean;

  /**
   * Forces to run only when the user is navigating via keyboard.
   * In most cases, if the `mouseDown` option is set to false, you won't
   * need this.  However, if this module is listening to an interactive
   * element like a button, set this option to true to disable scrolling
   * when using the mouse.
   * Defaults to false.
   */
  keyboardModeOnly?: boolean;

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
 * A class that jumps to a specific scroll point when a given
 * element is focused on.
 *
 *
 * This class is designed to help with a11y issues common with
 * css-parallax, lottie-directive or any other module where
 * scroll based progress is calculated.
 *
 *
 * Consider the following example:
 * ```
 * <div sticky-300vh>
 *   <div sticky-child>
 *     <div chapter-1>
 *     <div chapter-2>
 *     <div chapter-3>
 *     <div chapter-4>
 *   </div>
 * </div>
 * ```
 *
 * Our module is 300vh tall and we have a sticky child.
 * We then setup css-parallax and for every 0.25 (25%) progress,
 * we hide the visibility / opacity of each chapter.
 * In other words, as you scroll, the chapters fade in and out.
 *
 * The problem with this is that when using VO or another screenreader,
 * the scroll position never updates as you focus on each chapter and
 * creates a situation where you are selecting an element that might
 * still have an opacity 0.
 *
 * To solve this, you can use this class.
 *
 * ```
 * <div sticky-300vh>
 *   <div sticky-child>
 *     <div chapter-1 data-scroll-to-on-focus="0">
 *     <div chapter-2 data-scroll-to-on-focus="0.25">
 *     <div chapter-3 data-scroll-to-on-focus="0.5">
 *     <div chapter-4 data-scroll-to-on-focus="0.75">
 *   </div>
 * </div>
 *
 * new ScrollToOnFocus({
 *    element: document.querySelector('[sticky-child]'),
 *    setTabIndex: true
 *    setAriaRole: 'region'
 *    // These values should match however you are calculating
 *    // progress.
 *    topProgressOffset: 0,
 *    bottomProgressOffset: 0,
 * })
 *
 * // The focus element require a tabindex so remove it if needed.
 * [data-scroll-to-on-focus]:focus-visible
 *   outline: 2px solid #1967D2
 * [data-scroll-to-on-focus]:focus:not(:focus-visible)
 *   outline: none
 * ```
 *
 * Now when using VO, if you focus on chapter-2, it will jump to
 * the progress 0.25 position.
 *
 *
 *
 * ### Note on role="region" and tabindex
 *
 * By default, this class will add a tabindex="0" to the data-scroll-to-on-focus
 * element.  Without a tabindex, we cannot acquire a focus event on the element.
 * When dong this, VO and other screenreaders will read and announce the content
 * of the element which can result in a unwanted double announcement (if you have
 * say a title and body within the element).
 *
 * To avoid the issue, it is recommended to add role="region" to your element.
 *
 *
 * ### Use the watchElement method.
 *
 * If you are calculating your progress dynamically in javascript, you can
 * also use the watchElement to individually set focus.
 *
 *
 * ```ts
 * const stf = new ScrollToOnFocus({
 *    element: document.querySelector('[sticky-child]'),
 *    setTabIndex: true
 *    setAriaRole: 'region'
 *    // These values should match however you are calculating
 *    // progress.
 *    topProgressOffset: 0,
 *    bottomProgressOffset: 0,
 * })
 *
 *
 * // When element1 is focused, it will scroll to 0.2.
 * stf.watchElement( element1, 0.2);
 *
 * // When element2 is focused, it will scroll to 0.4.
 * stf.watchElement( element2, 0.4);
 * ```
 *
 *
 */
export class ScrollToOnFocus {
  private element: HTMLElement;
  private watcher: DomWatcher;
  private selector: string;
  private topProgressOffset: number;
  private bottomProgressOffset: number;
  private debug = false;
  private config: ScrollToOnFocusConfig;
  private keyboardModeOnly = false;
  private keyboardWatcher: KeyboardNavigationWatcher;
  private isUsingKeyboard = false;

  constructor(config: ScrollToOnFocusConfig) {
    this.element = config.element;
    this.watcher = new DomWatcher();
    this.selector = 'data-scroll-to-on-focus';
    this.topProgressOffset = func.setDefault(config.topProgressOffset, 0);
    this.bottomProgressOffset = func.setDefault(config.bottomProgressOffset, 0);
    this.keyboardModeOnly = func.setDefault(config.keyboardModeOnly, false);
    this.debug = func.setDefault(config.debug, false);
    this.config = config;

    this.keyboardWatcher = new KeyboardNavigationWatcher();
    this.watchKeyboardEvents();

    const elements: Array<HTMLElement> = Array.from(
      this.element.querySelectorAll(`[${this.selector}]`)
    );

    elements.forEach(el => {
      this.watchElement(el);
    });
  }

  private watchKeyboardEvents() {
    this.keyboardWatcher.on(KeyboardNavigationEvents.MOUSE, () => {
      this.isUsingKeyboard = false;
    });

    this.keyboardWatcher.on(KeyboardNavigationEvents.KEYBOARD, () => {
      this.isUsingKeyboard = true;
    });
  }

  public watchElement(el: HTMLElement, progress?: number) {
    // If a progress is declared, then set the attribute on the element.
    if (is.defined(progress)) {
      el.setAttribute(this.selector, progress + '');
    }

    if (this.config.setTabIndex) {
      el.tabIndex = 0;
    }

    if (this.config.setAriaRole) {
      el.setAttribute('role', this.config.setAriaRole);
    }

    this.watcher.add({
      element: el,
      on: 'focus',
      callback: () => {
        this.handleFocus(el);
      },
      eventOptions: {capture: true},
    });

    if (this.config.mouseDown || this.debug) {
      this.watcher.add({
        element: el,
        on: 'mousedown',
        callback: () => {
          this.handleFocus(el);
        },
      });
    }
    if (this.debug) {
      this.watcher.add({
        element: window,
        on: 'scroll',
        callback: () => {
          // Display out the progress.
          console.log(
            'progress',
            dom.getElementScrolledPercent(
              this.element,
              this.topProgressOffset,
              this.bottomProgressOffset
            )
          );
        },
      });
    }
  }

  /**
   * Update / Set the internal top and bottom offset.
   */
  public updateOffset(top: number, bottom: number) {
    this.topProgressOffset = top;
    this.bottomProgressOffset = bottom;
  }

  /**
   * Handle focus on an element.
   */
  private handleFocus(focusedElement: HTMLElement) {
    if (this.keyboardModeOnly && !this.isUsingKeyboard) {
      return;
    }

    const targetPercent = focusedElement.getAttribute(this.selector);

    if (this.debug) {
      console.log('el' + focusedElement);
      console.log('targetPercent' + targetPercent);
    }

    if (targetPercent) {
      this.scrollTo(+targetPercent);
    }
  }

  /**
   * Scroll to a specific window position
   * @param targetPercent
   */
  private scrollTo(targetPercent: number) {
    // Given the top and bottom progress offset, get the windowY value of
    // the provided percent.
    const scrollY = dom.getScrollYAtPercent(
      this.element,
      this.topProgressOffset,
      this.bottomProgressOffset,
      targetPercent
    );

    // Scroll To that point.
    window.scrollTo(0, scrollY);
  }

  public dispose() {
    this.watcher && this.watcher.dispose();
    this.keyboardWatcher && this.keyboardWatcher.dispose();
  }
}
