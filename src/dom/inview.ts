import {Raf} from '../raf/raf';
import {DomWatcher} from '../dom/dom-watcher';
import * as mathf from '../mathf/mathf';
import {EventDispatcher, EventCallback, EventManager} from '../ui/events';

export enum InviewEvents {
  IN = 'in',
  OUT = 'out',
}

interface InviewClassNames {
  READY?: string;
  IN?: string;
  IN_ONCE?: string;
  IN_FOLD?: string;
  DOWN?: string;
  UP?: string;
  OUT?: string;
}

const InviewDefaultClassNames: InviewClassNames = {
  READY: 'ready',
  IN: 'in',
  IN_ONCE: 'in-once',
  IN_FOLD: 'in-fold',
  DOWN: 'down',
  UP: 'up',
  OUT: 'out',
};

export interface InviewConfig {
  /**
   * The root element to track inview status.
   */
  element: HTMLElement;

  /**
   * Defines the baseline of the element.
   * The element baseline is the location in which we should use to
   * check the current element position.  Since we want to check
   * where in a viewport an element is, we need to know what point to use
   * in the element.  Should we use the top (0), middle (0.5) or bottom of the
   * element.
   */
  elementBaseline?: number;

  /**
   * Defines the viewport offset. This is a number between 0-1 where 0 is
   * the bottom of the screen and 1 is the top of the screen.  Defaults to 0.
   */
  viewportOffset?: number;

  /**
   * Inview ClassNames. An optional object defining the inview class names
   * that gets merge with InviewClassNames.
   */
  inviewClassNames?: InviewClassNames;

  /**
   * Optionally pass child selectors to add inview states to children.
   *
   * Example:
   * childSelector: [add-inview]
   *
   * Now any element with the attribute add-inview within the main element
   * will also receive inview class.
   *
   * Child selelectors also received 'inview-index' such as 'inview-index="0"
   * etc, allows you to use it to stagger inview.
   */
  childSelector?: string;

  /**
   * An additional options to pass to raf culling.  In most cases you can ignore
   * this but you can override the internal culling by passing a different
   * setting to fine tune optimization.
   *
   * Expects intersection observer options.  Defaults to:
   *
   * ```
   *    {
   *      rootMargin: '500px 0px 500px 0px'
   *    }
   * ```
   *
   */
  evIntersectionObserverOptions?: Object;

  /**
   * A flag in which if set to true will slightly modify the behavior
   * of inview.  Once inview is fired, it will stay in that state until
   * the element is completely out of view.
   */
  outviewOnlyOnElementExit?: boolean;

  /**
   * A flag that sets this inview to down only mode. See below for more.
   */
  downOnlyMode?: boolean;
}

/**
 * Implements a basic type 1 inview.
 *
 * ```
 *        new Inview({
 *           element: document.getElementById('test2'),
 *           elementBaseline: 0,
 *           viewportOffset: 0.2,
 *           waitForOutOfViewToRefireInview: false,
 *           downOnlyMode: false,
 *           // Optionally override default class names.
 *           inviewClassNames: {
 *             IN: 'mymodule--in'
 *           }
 *       });
 * ```
 *
 *
 * Type 1 inview:
 * - will add an '.in' class to an element when the element is at
 *   at certain percentage of the viewport. (viewport offset) or
 *   when an X percentage of the element is visible or BOTH!.  See below.
 * - will add an '.in-once' when inview happens the first time.
 * - will immediately remove the '.in' class when the element goes out of
 *   view
 * - will immediately add '.out' class when the element goes out of
 *   view
 * - will add 'up' and 'down' class to the element based on the scroll direction
 *   allowing you to add directional inview.
 *
 * - waitForOutOfViewToRefireInview, downOnlyMode are options to modify the
 *   inview triggers.
 *
 *
 * # Inview Logic
 * The "logic" of how inview is calculated is important.  Two factors
 * are taken into consideration.
 *
 * The first is the elementBaseline.
 * The elementBaseline defaults to the very top of the element as that is the
 * most common case.  However, this is the line or point in the element in which the
 * trigger point is evaluated.  You can set it to a given percentage of
 * the element (like the very bottom of the element instead of the top).
 *
 * The second is the viewport offset.
 * The viewport offset ranges from 0-1 in which 0 is the bottom of the viewport window
 * and the 1 is the top.
 *
 *
 * Here are some examples of different settings.
 *
 * elementBaseline - 0 (top), viewportOffset - 0.2
 * => inview should happen when the top of the element crosses the bottom 20% of the window.
 *
 * elementBaseline - 0 (top), viewportOffset - 0.5
 * => inview should happen when the top of the element crosses the middle of the window.
 *
 * elementBaseline - 1 (bottom), viewportOffset - 0.5
 * => inview should happen when the bottom of the element crosses the middle of the window.
 *
 * elementBaseline - 0.2, viewportOffset - 0
 * => inview should happen when 20% of the element is visible.
 *
 * elementBaseline - 0.5, viewportOffset - 0
 * => inview should happen when 50% of the element is visible.
 *
 * elementBaseline - 0.5, viewportOffset - 0.5
 * => inview should happen when 50% of the element cross the middle of the screen.
 *
 * elementBaseline - 0, viewportOffset - 1
 * => inview should happen when then top of the element 0%, hits the top of the screen.
 *
 *
 *
 * # FOUC
 * While inview is booting up, there is a split second where it needs to evaluate the
 * inview state.  When inview is ready, the element will receive '.ready' class.
 *
 * You can do something like:
 *
 * ```
 * .myelement
 *    visibility: hidden
 * .myelement.ready
 *    visibility: visible
 *
 * ```
 *
 *
 * # outviewOnlyOnElementExit Mode
 * This changes the behavior of inview a bit.
 *
 * You can set it so that the outview doesn't fire based on the elementBaseline
 * but instead, when the full elmement, top and bottom are out of view.
 *
 * In short, once inview is fired, the element will stay in an inview state
 * until the element is compeltely out off view.
 *
 *
 * To clarify:
 * When scrolling back and up, based on your inview trigger point, the
 * user might see the element go from an instate to outstate back and forth.
 * For example, let's say you trigger at the top of the element (elementBaseline 0)
 * and 0.2 viewport offset.  As the user scrolls down,
 * the top of the element hits the bottom 20%
 * of the viewport, the element becomes in an inview state.  If the user scrolls back
 * up immediately, and the element is at 0.19, the element goes back to outview.
 *
 * This might be undesired.    By setting this option, it will fire outview until the
 * element has completely exited and therefore, preventing refiring of inview multiple
 * times while the element is inview.
 *
 * # downOnlyMode Mode
 * Downonly modes assumes your primary experience is scrolling down.  So
 * it will add an inview, when the element crosses the inview threshold when
 * scrolling down and then "KEEP" that inview attached.  Outview is ONLY
 * fired when the element is completley out of view AND below the viewport.
 *
 *
 *
 */
export class Inview implements EventDispatcher {
  private static gatherTargetElements(config: InviewConfig): HTMLElement[] {
    const targetElements = [config.element];
    if (config.childSelector) {
      Array.from(config.element.querySelectorAll(config.childSelector)).forEach(
        el => targetElements.push(<HTMLElement>el)
      );
    }
    return targetElements;
  }

  private static assignDefaultsToConfig(config: InviewConfig): InviewConfig {
    return Object.assign(
      {
        elementBaseline: 0,
        viewportOffset: 0,
        outviewOnlyOnElementExit: false,
        downOnlyMode: false,
      },
      config
    );
  }
  private readonly raf: Raf;
  private readonly readWrite: Raf;
  private readonly watcher: DomWatcher;
  private readonly config: InviewConfig;

  /**
   * The last known scrollY
   */
  private scrollY: number;

  /**
   * Last known scroll direction. 1 down, -1 up, 0 no direction.
   */
  private scrollDirection = 0;

  /**
   * A flag to keep track of whether the element was inview atleast once.
   */
  private inOnce = false;

  /**
   * A flag to keep track of in or out state.
   */
  private isInState = false;

  /**
   * The list of target elements to add inview to.
   */
  private readonly targetElements: HTMLElement[];

  /**
   * A list of inview classnames.
   */
  private readonly inviewClassNames: InviewClassNames;

  /**
   * A caching flag. Set on events that would change the inview status of an
   * element, cleared when a RAF loop has run.
   * This will improve performance by culling RAF runs before work is done.
   */
  private shouldRun = false;

  private eventManager: EventManager;

  constructor(config: InviewConfig) {
    this.eventManager = new EventManager();

    // Establish defaults on the config as needed and then handle errors for bad
    // configs.
    this.config = Inview.assignDefaultsToConfig(config);
    if (!this.config.element) {
      throw new Error('No element is defined for inview');
    }

    // Assign property values
    this.raf = new Raf(() => this.onRaf());
    this.readWrite = new Raf();
    this.watcher = new DomWatcher();
    this.inviewClassNames = Object.assign(
      {},
      InviewDefaultClassNames,
      config.inviewClassNames || {}
    );
    this.scrollY = window.scrollY;
    this.targetElements = Inview.gatherTargetElements(this.config);

    // Initialize the class and properties
    this.init();
  }

  on(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  off(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  runInviewState(force?: boolean) {
    if (this.isInState && !force) {
      return;
    }
    this.readWrite.write(() => {
      this.targetElements.forEach(el => {
        el.classList.remove(this.inviewClassNames.OUT!);
        el.classList.add(this.inviewClassNames.IN!);

        if (!this.inOnce) {
          el.classList.add(this.inviewClassNames.IN_ONCE!);
          this.inOnce = true;

          if (window.scrollY === 0) {
            el.classList.add(this.inviewClassNames.IN_FOLD!);
          }
        }

        const isScrollingUp = this.scrollDirection === -1;
        el.classList.remove(
          isScrollingUp
            ? this.inviewClassNames.DOWN!
            : this.inviewClassNames.UP!
        );
        el.classList.add(
          isScrollingUp
            ? this.inviewClassNames.UP!
            : this.inviewClassNames.DOWN!
        );
        this.isInState = true;
        this.eventManager.dispatch(InviewEvents.IN);
      });
    });
  }

  runOutviewState(force?: boolean) {
    if (!this.isInState && !force) {
      return;
    }
    this.readWrite.write(() => {
      this.targetElements.forEach(el => {
        el.classList.add(this.inviewClassNames.OUT!);
        el.classList.remove(this.inviewClassNames.IN!);
        el.classList.remove(this.inviewClassNames.UP!);
        el.classList.remove(this.inviewClassNames.DOWN!);
        el.classList.add(
          this.scrollDirection === -1
            ? this.inviewClassNames.UP!
            : this.inviewClassNames.DOWN!
        );
        this.isInState = false;
        this.eventManager.dispatch(InviewEvents.OUT);
      });
    });
  }

  dispose(): void {
    this.raf.dispose();
    this.raf.dispose();
    this.watcher.dispose();
  }

  private init(): void {
    this.initDomWatcher();
    this.addInviewIndicesToTargetElements();
    this.readyTargetElements();
    this.initInview();

    // Force update the state.
    this.onRaf(true);
  }

  private initDomWatcher(): void {
    this.watcher.add({
      element: window,
      on: 'scroll',
      callback: () => this.onWindowScroll(),
      eventOptions: {passive: true},
    });
    this.watcher.add({
      element: window,
      on: 'smartResize',
      callback: () => this.onWindowScroll(),
      eventOptions: {passive: true},
    });
  }

  private addInviewIndicesToTargetElements(): void {
    // Do nothing if there is only a single target element
    if (this.targetElements.length <= 1) {
      return;
    }
    this.readWrite.write(() => {
      this.targetElements.forEach((target, i) => {
        target.setAttribute('inview-index', `${i}`);
      });
    });
  }

  private readyTargetElements(): void {
    this.readWrite.write(() => {
      this.targetElements.forEach((target: HTMLElement) => {
        target.classList.add(this.inviewClassNames.READY!);
      });
    });
  }

  private initInview(): void {
    const intersectionObserverOptions = this.config
      .evIntersectionObserverOptions || {rootMargin: '100px 0px 100px 0px'};
    const inviewPromise = this.raf.runWhenElementIsInview(
      this.config.element,
      intersectionObserverOptions
    );
    inviewPromise.then(() => this.raf.start());
  }

  private onWindowScroll(): void {
    this.raf.read(() => {
      // Calculate the scroll direction.
      const scrollY = window.scrollY;
      this.scrollDirection = mathf.direction(this.scrollY, scrollY);
      this.scrollY = scrollY;
      this.shouldRun = true;
    });
  }

  /**
   * Request Animation Frame handle.  This runs only when the element is
   * in the viewport.
   */
  private onRaf(force?: boolean): void {
    if (!force && !this.shouldRun) {
      // Flag was not set, skip this iteration as there is not reason to expect
      // any changes.
      return;
    }
    this.shouldRun = false; // Clear the flag as the iteration is set to run
    // Figure out how much of this element is visible.
    this.readWrite.read(() => {
      // Since generally, since we think in terms of scrolling down, 0 - 1 would
      // be represented as:
      // 1 ---> top of screen
      // 0.5 --> middle of screen
      // 0 --> bottom of screen
      //
      // Therefore, progress is represented as 0-1 where it goes from the bottom
      // of the screen to the top.
      //
      // Additionally, we need to know, what point in the element should be used
      // to see where the element resides.  We could use the top, center or
      // bottom.
      //
      // The elementBaseline is used to factor this in.  The default state is
      // calculated from the top of the element.
      const wh = window.innerHeight;
      const box = this.config.element.getBoundingClientRect();
      const elementBaseline =
        box.top + this.config.elementBaseline! * box.height;

      // This is the percent of where element baseline is.
      // So 0 would mean the elementbaseline is at the bottom of the viewport.
      // 1 would mean elementBaseline is at the top of the viewport.
      // A value less than viewport offset would mean that the element is above
      // the viewport == outview.
      const inPercent = 1 - mathf.inverseLerp(0, wh, elementBaseline, true);

      // This is the percent of where the BOTTOM of the element is in the
      // viewport.
      // We want to use this to valuate whether the element is out of view.
      // A value greater than 1 would mean that the element is above the
      // viewport == outview.
      const outPercent =
        1 - mathf.inverseLerp(0, wh, box.top + box.height, true);

      if (this.config.outviewOnlyOnElementExit) {
        // This is the percent where the TOP of the element is in the viewport.
        const topPercent = 1 - mathf.inverseLerp(0, wh, box.top, true);
        // AKA
        const bottomPercent = outPercent;
        const completelyOutOfView =
          !mathf.isBetween(topPercent, 0, 1) &&
          !mathf.isBetween(bottomPercent, 0, 1);
        if (inPercent < this.config.viewportOffset! || outPercent >= 1) {
          if (completelyOutOfView) {
            this.runOutviewState(force);
          }
        } else {
          this.runInviewState(force);
        }
      } else if (this.config.downOnlyMode) {
        // This is the percent where the TOP of the element is in the viewport.
        const topPercent = 1 - mathf.inverseLerp(0, wh, box.top, true);
        const bottomPercent = outPercent;
        // Down only mode.
        const topOfElementIsBelowViewport = topPercent < 0;
        const bottomOfElementIsAboveViewport = bottomPercent >= 1;
        if (inPercent < this.config.viewportOffset! || outPercent >= 1) {
          if (topOfElementIsBelowViewport) {
            this.runOutviewState(force);
          }

          // If the bottom of the element is above the viewport, we should
          // ensure it is in the instate.
          if (bottomOfElementIsAboveViewport) {
            this.runInviewState(force);
          }
        } else {
          this.runInviewState(force);
        }
      } else {
        // NORMAL INVIEW
        // The outview conditions are in the outpercent (bottom of the element)
        // is greater than 1
        // or the inpercent (the element baseline) is below 0 under the screen.
        if (inPercent < this.config.viewportOffset! || outPercent >= 1) {
          this.runOutviewState(force);
        } else {
          this.runInviewState(force);
        }
      }
    });
  }
}
