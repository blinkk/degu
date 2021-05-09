import {DomWatcher} from './dom-watcher';
import {cssUnit, CssUnitObject} from '../string/css-unit';
import {elementVisibility, ElementVisibilityObject} from './element-visibility';
import {dom} from './dom';
import {mathf} from '../mathf/mathf';
import {Raf} from '../raf/raf';
import {func} from '../func/func';
import {CssVarInterpolate} from '../interpolate/css-var-interpolate';
import {is} from '../is/is';
import {interpolateSettings} from '../interpolate/multi-interpolate';
import {InviewProgress} from './inview-progress';

export interface CssParallaxSettings {
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
}

/**
 * A class that creates a css var parallaxer.  This is the base controller for
 * directive-css-parallax.  See documentation there for more on usage.
 *
 * ```
 *
 * // Create the instance and set the root element
 * const parallaxer = new CssParallaxer(element);
 *
 *
 * // Add your settings.
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px'
 * }
 * parallaxer.init(settings,
 *   [
 *     {
 *       id: '--x',
 *       progress: [
 *          {from: 0, to: 1, start: '0px', end: '0px'}
 *      ]
 *     }
 *   ]
 * )
 *
 *
 * // Later Dispose.
 * parallaxer.dispose();
 * ```
 *
 * ## Mobile Lerp
 * You can specify a different lerp value for mobile.
 *
 * ```
 * const settings = {
 *    lerp: 0.4,
 *    damp: 0.23
 *    mobileBreakpoint: 769
 *    lerpMobile: 1
 *    dampMobile: 1
 * }
 * ```
 *
 * ## FOUC
 *
 * You can fight FOUC by setting defaults to your var and also by using the
 * .css-parallax-ready class that gets applied to the root element
 * when the css-parallaxer initializer.
 *
 * ```
 * .my-module
 *   visibility: hidden
 *  &.css-parallax-ready
 *   visibility: visible
 * ```
 *
 * ## How do I add css classes to elements?
 * You can pass an instance of inviewProgress to cssParallaxer.
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
 * // Setup css parallax
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px',
 *    inviewProgress: inviewProgress
 * }
 * const parallaxer = new CssParallaxer(el);
 * parallaxer.init(settings, [])
 * ```
 *
 *
 *
 *
 *
 */
export class CssParallaxer {
  private element: HTMLElement;
  private rafEv: ElementVisibilityObject | null = null;
  private domWatcher: DomWatcher;
  private interpolator: CssVarInterpolate | null = null;
  private raf: Raf;
  private initialized: boolean = false;
  private settingsData: CssParallaxSettings | null = null;
  private currentProgress: number = 0;
  /**
   * The top offset for progress
   */
  private topOffset: number = 0;
  /**
   * The bottom offset for progress
   */
  private bottomOffset: number = 0;

  /**
   * The height value if specified.
   */
  private height: number | null = null;

  private windowWidth: number | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.raf = new Raf(this.onRaf.bind(this));
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
  public init(
    settings?: CssParallaxSettings,
    interpolations?: Array<interpolateSettings>
  ) {
    this.updateSettings(settings);

    this.calculateProgressOffsets();

    // Only run this on the first initialization.
    if (!this.initialized) {
      // Create interpolator.
      this.interpolator = new CssVarInterpolate(this.element, {
        interpolations: interpolations || [],
      });
      this.interpolator.useBatchUpdate(true);
      this.interpolator.useSubPixelRendering(false);
      this.element.classList.add('css-parallax-ready');
      this.rafEv = elementVisibility.inview(
        this.element,
        this.settingsData!.rafEvOptions,
        (element: any, changes: any) => {
          if (changes.isIntersecting) {
            this.updateImmediately();
            this.raf.start();
          } else {
            this.raf.stop();
            this.updateImmediately();
          }
        }
      );
      this.initialized = true;
    } else {
      // Update if already set.
      this.interpolator!.setInterpolations({
        interpolations: interpolations || [],
      });
    }

    // On load, we need to initially, bring the animation to
    // start position.
    this.updateImmediately();
  }

  /**
   * Updates the css parallaxer settings.
   * @param settings
   */
  public updateSettings(settings?: CssParallaxSettings) {
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
          rafEvOptions: {
            rootMargin: '300px 0px 300px 0px',
          },
          inviewProgress: null,
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

  /**
   * Takes a css string declaration such as '100px', '100vh' or '100%'
   * and converts that into a relative pixel number.
   * @param cssUnitObject
   */
  protected getPixelValue(cssValue: string): number {
    const unit = cssUnit.parse(cssValue);
    let base = 1;
    if (unit.unit == '%') {
      base = this.element.offsetHeight;
      return base * ((unit.value as number) / 100);
    }
    if (unit.unit == 'vh') {
      base = window.innerHeight;
      return base * ((unit.value as number) / 100);
    }

    return base * (unit.value as number);
  }

  /**
   * Returns the internal multi interpolator.
   */
  public getInterpolator() {
    return this.interpolator;
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
      if (lerp == 1 && damp == 1) {
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

    return this.currentProgress;
  }

  public updateImmediately() {
    this.updateProgress(1, 1);
    this.interpolator!.update(this.currentProgress);
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

  protected onWindowResize() {
    this.windowWidth = window.innerWidth;
    this.calculateProgressOffsets();
    this.interpolator!.flush();
    this.updateImmediately();
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

    this.raf.write(() => {
      // Use a rounded progress to pass to css var interpolate which
      // will cull updates that are repetitive.
      const roundedProgress = mathf.roundToPrecision(
        this.currentProgress,
        this.settingsData!.precision!
      );
      this.interpolator!.update(roundedProgress);
    });
  }

  /**
   * Gets the current progress value.
   */
  public getProgress(): number {
    return this.currentProgress;
  }

  public dispose() {
    this.raf && this.raf.stop();
    this.domWatcher.dispose();
    this.rafEv!.dispose();
  }
}
