import {DomWatcher} from './dom-watcher';
import * as cssUnit from '../string/css-unit';
import * as dom from './dom';
import * as mathf from '../mathf/mathf';
import {Raf} from '../raf/raf';
import * as func from '../func/func';
import * as is from '../is/is';
import {InviewProgress} from './inview-progress';
import {ProgressWatcher} from './progress-watcher';
import {EventDispatcher, EventCallback, EventManager} from '../ui/events';

export enum ScrollProgressEvents {
  RAF = 'raf',
  RESIZE = 'resize',
  INIT = 'init',
}

export interface ScrollProgressSettings {
  // debug: false (boolean, optional) True outputs progress in the dev console.
  debug?: boolean;
  //  top: '0px' (string) A css number to offset where the progress begins.  Accepts %, px, vh.
  top?: string;
  //  bottom: '0px' (string) A css number to offset the progress ends.  Accepts %, px, vh.
  bottom?: string;
  //  height: '100px' (string) Optional.  An absolute height to use to calculate the percent.  Accepts %, px, vh.  In most cases you won't need this.
  height?: string | null;
  // http://degu.surge.sh/classes/mathf.mathf-1.html#damp
  //  lerp: 0.18 Optional lerp.  Defaults to 1 assuming no asymptotic averaging.
  lerp?: number;
  //  damp: 0.18 Optional damp.  Defaults to 1 assuming no damping.
  damp?: number;
  // Whether to force clamp the progress to 0-1 range.  Defaults to true.
  clamp?: boolean;

  // Limits the lerping to only when values are beteween 0-1.   Defaults to true.
  lerpOnlyInRange?: boolean;

  // The precision rounding on the lerp.  Used to cull / avoid layout thrashes.
  //  precision: (number) Defaults to 3.  Lower precision means less dom updates but less accuracy.
  precision?: number;

  // The rafEvOptions so that you can add rootMargin etc to the base raf.
  //  rafEvOptions:
  //   rootMargin: '0px 0px 0px 0px'
  rafEvOptions?: Object;

  // Optional mobile lerp.
  // Requires mobileBreakpoint to be enabled.
  lerpMobile?: number;
  // Optional mobile damp.
  // Requires mobileBreakpoint to be enabled.
  dampMobile?: number;
  // The breakpoint width of mobile.
  mobileBreakpoint?: number;

  // Optionally pass inviewProgress.
  // This can be used to trigger css classes at specific breakpoints.
  inviewProgress?: InviewProgress | null;

  // Optionally pass progressWatcher.
  progressWatcher?: ProgressWatcher | null;
}

/**
 * A class that can be used to monitor the scroll progress of a given element.
 *
 * Simple usage:
 *
 * const scrollProgress = new ScrollProgress(element);
 * // Add your settings.
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px'
 * }
 * scrollProgress.init(settings);
 *
 * scrollProgress.on(ScrollProgressEvents.RAF, ()=> {
 *   console.log(scrollProgress.getProgress());
 * });
 *
 * ## How do I add css classes to elements?
 * You can pass an instance of inviewProgress to scroll progress.
 *
 * ```ts
 * const inviewProgress = new InviewProgress();
 *
 * // Add the class "active" when from range 0.2 - 0.4
 * inviewProgress.add({
 *    range: [0.2, 0.4],
 *    element: el,
 *    className: "active"
 * })
 *
 * // Setup scroll progress
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px',
 *    inviewProgress: inviewProgress
 * }
 * const parallaxer = new ScrollProgress(el);
 * parallaxer.init(settings, [])
 * ```
 *
 *
 * ## How do add callbacks at specific points?
 * You can pass an instance of progressWatcher to scroll progress
 *
 * ```
 * const pg = new ProgressWatcher();
 * pg.add({
 *    range: [0.2, 0.4],
 *    callback: (progress: number, direction: number)=> {
 *          console.log(progress, direction);
 *    }
 * })
 *
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px',
 *    progressWatcher: pg
 * }
 * const sp = new ScrollProgress(el);
 * sp.init(settings, [])
 *
 */
export class ScrollProgress implements EventDispatcher {
  private eventManager: EventManager;
  private element: HTMLElement;
  private domWatcher: DomWatcher;
  private raf: Raf;
  private settingsData: ScrollProgressSettings | null = null;
  private initialized = false;
  private currentProgress = 0;
  /**
   * The top offset for progress
   */
  private topOffset = 0;
  /**
   * The bottom offset for progress
   */
  private bottomOffset = 0;

  /**
   * The height value if specified.
   */
  private height: number | null = null;

  constructor(element: HTMLElement) {
    this.eventManager = new EventManager();
    this.element = element;
    this.raf = new Raf(this.onRaf.bind(this));
    this.raf.runWhenElementIsInview(this.element);
    this.domWatcher = new DomWatcher();
    this.domWatcher.add({
      element: window,
      on: 'smartResize',
      callback: func.debounce(() => {
        this.onWindowResize();
      }, 300),
    });
  }

  /**
   * Initializes module.
   * You can optionally rerun this method to refresh settings.
   * @param settings
   */
  public init(settings?: ScrollProgressSettings) {
    this.updateSettings(settings);
    this.calculateProgressOffsets();
    this.updateImmediately();
    this.raf.start();
    this.initialized = true;
    this.eventManager.dispatch(ScrollProgressEvents.INIT);
  }

  /**
   * Updates the css parallaxer settings.
   * @param settings
   */
  public updateSettings(settings?: ScrollProgressSettings) {
    // If we haven't set the settings data yet apply default.
    if (!this.settingsData) {
      this.settingsData = {
        ...{
          debug: false,
          clamp: true,
          top: '0px',
          bottom: '0px',
          height: null,
          lerp: 1,
          damp: 1,
          precision: 3,
          lerpOnlyInRange: true,
          inviewProgress: null,
          progressWatcher: null,
        },
        ...(settings || {}),
      };
    } else {
      // If we have already set once.
      this.settingsData = {
        ...this.settingsData,
        ...(settings || {}),
      };
    }
  }

  public on(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  protected onRaf() {
    this.raf.read(() => {
      // Mobile case.
      if (
        this.settingsData!.mobileBreakpoint &&
        window.innerWidth < this.settingsData!.mobileBreakpoint &&
        this.settingsData!.dampMobile &&
        this.settingsData!.lerpMobile
      ) {
        this.updateProgress(
          this.settingsData!.lerpMobile,
          this.settingsData!.dampMobile
        );
      } else {
        // All others.
        this.updateProgress(this.settingsData!.lerp!, this.settingsData!.damp!);
      }
    });

    this.eventManager.dispatch(ScrollProgressEvents.RAF);
  }

  protected onWindowResize() {
    this.calculateProgressOffsets();
    this.updateImmediately();
    this.eventManager.dispatch(ScrollProgressEvents.RESIZE);
  }

  /**
   * Calculates the current progress and returns a value between 0-1.
   */
  public updateProgress(lerp: number, damp: number): number {
    const progress = dom.getElementScrolledPercent(
      this.element,
      this.topOffset,
      this.bottomOffset,
      true
    );

    // Don't apply lerp / damp when we are out of range.
    // The problem is that if you apply damp / lerp out of range,
    // Animations that depend on start (0) and end (1) end up
    // getting slightly delayed causing FOUC.
    if (
      (this.settingsData!.lerpOnlyInRange && progress <= 0) ||
      progress >= 1
    ) {
      this.currentProgress = progress;
    } else {
      // If no lerping, bypass.
      if (lerp === 1 && damp === 1) {
        this.currentProgress = progress;
      } else {
        this.currentProgress = mathf.damp(
          this.currentProgress,
          progress,
          lerp,
          damp
        );
      }
    }

    if (this.settingsData!.clamp) {
      this.currentProgress = mathf.clamp01(this.currentProgress);
    }

    if (this.settingsData!.debug) {
      console.log(this.currentProgress, this.topOffset, this.bottomOffset);
    }

    // Update inviewProgress if provided.
    if (this.settingsData!.inviewProgress) {
      this.settingsData!.inviewProgress.setProgress(this.currentProgress);
    }

    // Update progressWatcher if provided.
    if (this.settingsData!.progressWatcher) {
      this.settingsData!.progressWatcher.setProgress(this.currentProgress);
    }

    return this.currentProgress;
  }

  public updateImmediately() {
    this.updateProgress(1, 1);
  }

  /**
   * Takes a css string declaration such as '100px', '100vh' or '100%'
   * and converts that into a relative pixel number.
   * @param cssUnitObject
   */
  protected getPixelValue(cssValue: string): number {
    const unit = cssUnit.parse(cssValue);
    let base = 1;
    if (unit.unit === '%') {
      base = this.element.offsetHeight;
      return base * ((unit.value as number) / 100);
    }
    if (unit.unit === 'vh') {
      base = window.innerHeight;
      return base * ((unit.value as number) / 100);
    }

    return base * (unit.value as number);
  }

  protected calculateProgressOffsets() {
    this.topOffset = func.setDefault(
      this.getPixelValue(this.settingsData!.top!),
      0
    );

    this.bottomOffset = func.setDefault(
      this.getPixelValue(this.settingsData!.bottom!),
      0
    );
    this.height = is.string(this.settingsData!.height)
      ? this.getPixelValue(this.settingsData!.height!)
      : null;

    // If height is specified, we basically want to "shorten" the element
    // by the delta amount.
    // Example: el.offsetHeight = 500px, height: 100px.
    //        so bottomOffset should be el.offsetHeight - height = 400px
    requestAnimationFrame(() => {
      if (this.height) {
        this.bottomOffset = -(this.element.offsetHeight - this.height);
      }
    });
  }

  /**
   * Gets the current progress value.
   */
  public getProgress(): number {
    return this.currentProgress;
  }

  public dispose() {
    this.eventManager.dispose();
    this.raf && this.raf.stop();
    this.domWatcher.dispose();
  }
}
