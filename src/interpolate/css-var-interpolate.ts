
import { mathf } from '../mathf/mathf';
import { MultiInterpolate, multiInterpolateConfig } from './multi-interpolate';
import { ElementVisibilityObject, elementVisibility } from '../dom/element-visibility';
import { dom } from '../dom/dom';
import { is } from '../is/is';
import { cssUnit } from '../string/css-unit';


/**
 * A class that allows you to multiInterpolate css variables.
 *
 * ```
 *
 * HTML
 * <div class="ball"></div>
 * <input id="range" type="range" name="points" step="0.01" min="0" max="1" style="width: 500px;">
 *
 * Sass
 *   You can apply the interpolated value as a css variable. If you specify
 *   numerical values in your from and to values, add the unit in css by
 *   multiplying it.
 *   Example of using vh:
 *      top: calc(var(--x) * 1vh)
 *   Example of using px:
 *      top: calc(var(--x) * 1px)
 *   Example of a complex variable setup:
 *   .ball
 *      transform: translateX(calc(var(--x) * 1px)) translateY(calc(var(--y) * 1px));
 *
 * ```
 *
 *
 *
 * JS
 * ```ts
 *
 *  this.ball = document.getElementById('ball');
 *  this.range = document.getElementById('range');
 *
 *  this.cssVarInterpolate = new CssVarInterpolate(
 *    this.ball,
 *    {
 *      interpolations: [
 *          {
 *            progress: [
 *              { from: 0, to: 1, start: 0, end: 500 },
 *            ],
 *            id: '--x'
 *          },
 *          {
 *            progress: [
 *               { from: 0, to: 0.2, start: 0, end: 100, easingFunction: EASE.easeOutSine },
 *               { from: 0.2, to: 0.3, start: 100, end: 300, easingFunction: EASE.easeOutSine },
 *               { from: 0.3, to: 0.5, start: 300, end: 0, easingFunction: EASE.easeOutSine },
 *               { from: 0.5, to: 1, start: 0, end: 500, easingFunction: EASE.easeInQuad },
 *            ],
 *            id: '--y'
 *          },
 *          // You can use simple unit values.  See interpolate for more.
 *          {
 *            progress: [
 *              { from: '10px', to: '20px', start: 0, end: 500 },
 *            ],
 *            id: '--z'
 *          },
 *      ]}
 *  )
 *
 *  // Set the progress to the range value.
 *  this.progress = +this.range.value;
 *
 *
 *  // Note that cssVarInterpolate, will cull uncessary calls to
 *  // avoid layout updates/thrashing.  If the value of progress is the
 *  // same, won't make any uncessary calls but allow the animations
 *  // to complete.
 *  //
 *  //
 *  // Note that it is recommended to use [[RafProgress]] to manage progress
 *  // easing but here to keep the demo simple, we are using a simplified
 *  // model. See the css-var-interpolate example in /examples folder for this
 *  // same implemetnation using RafProgress.
 *  //
 *  const raf = new Raf(() => {
 *     let progress = +this.range.value;
 *
 *    // Add some ease to the progress to smooth it out.
 *    this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
 *
 *   // Reduce the precision of progress.  We dont need to report progress differences
 *   // of 0.0000001.
 *   this.progress = mathf.round(this.progress, 3);
 *
 *    this.cssVarInterpolate.update(this.progress);
 *  }).start();
 *
 *
 * ```
 *
 * Ranged Progress Interpolations
 * You can also set the progress range.  This will tell cssVarInterpolate
 * to internally generate a [[mathf.childProgress]] and scope the interpolations
 * to a scoped range instead of 0-1.
 * ```ts
 *  this.cssVarInterpolate.setProgressRange(0.2, 0.6);
 * ```
 *
 *
 * Element Visibility
 * CssVarInterpolate by default will only update css variables when the
 * root element is inview to performance reasons.
 *
 * If you want to turn this off, do the following:
 *
 * ```ts
 * this.cssVarInterpolate.renderOnlyWhenInview = false;
 * ```
 */
export class CssVarInterpolate {
    private mainProgress: number | null;
    private currentValues: Object;
    private multiInterpolate: MultiInterpolate | null;

    /**
     * Given the mainProgress, at what progress point the interpolations
     * should begin.  This value is used to calculate a
     * [[mathf.childProgeress]] so that if necessary, the interpolations
     * can be scoped to a set range.  Defaults to 0.
     */
    private startProgress: number;

    /**
     * Given the mainProgress, at what progress point the interpolations
     * should end.  This value is used to calculate a
     * [[mathf.childProgeress]] so that if necessary, the interpolations
     * can be scoped to a set range.  Defaults to 1.
     */
    private endProgress: number;

    /**
     * Internal instance of element visibility.
     */
    public elementVisibility: ElementVisibilityObject;

    /**
     * Whether to prevent DOM render updates when the element is out of view.
     * This prevents this class from updating the element style or css variables
     * if it is out of view.
     * The default is true to provide performance benefits.
     */
    public renderOnlyWhenInview: boolean;

    /**
     * Whether to run update once after the element
     * goes out of view so the state of interpololations are correctly resolved
     * to its starting state when elements come back into view.
     * The default is true.
     */
    public runOnceAfterOutView: boolean;

    /**
     * Internal flag to keep track of whether the outview update was run once.
     */
    private ranOutViewUpdate: boolean;

    /**
     * Whether to disallow subpixel rendering.  This option will make any
     * pixel value interpolations into round whole number. Defaults to true.
     */
    private renderSubPixels: boolean;


    /**
     * @param element The element to update the css variable to.
     *     This can be the body element if you want a "global" css
     *     variable or you can specific a more speicific element to
     *     scope the results of your css variables.
     * @param config
     */
    constructor(
        private element: HTMLElement,
        private config?: multiInterpolateConfig) {

        /**
         * Set this to initially null so that when update is first called
         * we are guanranteed that it will be processed.
         */
        this.mainProgress = null;
        this.currentValues = {};

        this.renderSubPixels = true;

        if (config) {
            this.multiInterpolate = new MultiInterpolate(config);
        } else {
            this.multiInterpolate = null;
        }

        // Add element visibility to the VectorDom.
        this.elementVisibility = elementVisibility.inview(this.element);
        this.runOnceAfterOutView = true;
        this.renderOnlyWhenInview = true;
        this.ranOutViewUpdate = false;

        this.startProgress = 0;
        this.endProgress = 1;
    }


    /**
     * Updates the internal interpolations.   Use this to update your
     * interpolations.
     *
     * ```ts
     *
     * let ci = new CssVarInterpolate(element);
     * ci.setInterpolations({
     *   interpolations: [
     *       {
     *           progress: [
     *               { from: 0, to: 1, start: 0, end: 500 },
     *           ],
     *           id: '--x'
     *
     *       }
     *   ]
     * });
     *
     *
     * ```
     *
     * @param config
     */
    setInterpolations(config: multiInterpolateConfig) {
        if (config) {
            this.multiInterpolate = new MultiInterpolate(config);
        }
    }


    /**
     * Flushes the update cache.  By default, two consecutive calls to
     * update with the same progress values will cull the second call
     * for performance booosts.  However, there are rare cases where
     * you may want to update with the same progress values and force
     * an update to the variable.  Calling flush will flush the internal
     * cache.
     *
     * ```ts
     *
     * cssVarInterpolate.update(0.2);
     * cssVarInterpolate.update(0.2); // Normally gets ignored
     *
     * cssVarInterpolate.update(0.2);
     * cssVarInterpolate.flush(); // Flush cache
     * cssVarInterpolate.update(0.2); // Will update.
     * ```
     */
    flush() {
        this.mainProgress = null;
    }

    /**
     * Toggles subpixel rendering. When subpixel rendering is turned off,
     * 'px' value interpolations will be turned into whole
     * numbers.  Subpixel rendering is turned on by default but can be
     * turned off for performance boosts.
     */
    useSubPixelRendering(value: boolean) {
        this.renderSubPixels = value;
    }

    /**
     * Updates the progress and updates the css variable values.
     * @param {number} progress
     * @param {boolean} force Allows you to bypass the cache.  By default
     *   two consecutive calls to update WITH the same progress values will
     *   cull the second call.  Force allows you to force it to render again.
     */
    update(progress: number, force: boolean = false) {
        if (!this.multiInterpolate) {
            return;
        }

        // Only make updates when progress value was updated to avoid layout
        // thrashing.
        if (!force && progress == this.mainProgress) {
            return;
        }

        /**
         * Render this element only when it is inview for performance boost.
         */
        if (this.renderOnlyWhenInview &&
            this.elementVisibility.state().ready &&
            !this.elementVisibility.state().inview) {

            // If we go out of view run interpolations atleast once so that
            // when the element comes back into view, it correctly sits in
            // the starting position.
            if (this.runOnceAfterOutView && !this.ranOutViewUpdate) {
                this.ranOutViewUpdate = true;
                // Make a guestimation of 0 or 1 and round to 0 or 1 state.
                // This helps fight cases in which progress might be tied to
                // an eased scroll and user quickly scrolls out of view in which
                // the progress is not fully resolve to the start or end state.
                this.updateValues(progress >= 0.5 ? 1 : 0);
            }
            return;
        }

        // We are inview so run update normally.
        this.ranOutViewUpdate = false;
        this.updateValues(progress);
    }


    /**
     * Updates and calculates interpolation values.
     */
    private updateValues(progress: number) {
        if (!this.multiInterpolate) {
            return;
        }

        // Create a child progress so that the range in which this interpolation
        // reacts can be scoped.
        this.mainProgress = mathf.childProgress(progress,
            this.startProgress, this.endProgress);

        this.currentValues =
            this.multiInterpolate.calculate(this.mainProgress);

        for (var key in this.currentValues) {
            if (!this.renderSubPixels && is.string(this.currentValues[key])) {
                let cssUnitValue = cssUnit.parse(this.currentValues[key]);
                if (cssUnitValue.unit == 'px') {
                    this.currentValues[key] =
                        (cssUnitValue.value as number >> 0) + 'px';
                }
            }

            dom.setCssVariable(this.element, key, this.currentValues[key]);
        }
    }


    /**
     * Sets the start and end values of which interpolations begin.  This allows
     * you to set something like, given the main progress that is updated from
     * 0-1, I only want this to interpolate from 0.2-0.6.
     * @param start
     * @param end
     */
    setProgressRange(start: number, end: number) {
        this.startProgress = start;
        this.endProgress = end;
    }


    /**
     * Gets the last set of calculated values.  This will return an empty
     * object if no updates / calculations have been run.  If updates have
     * been executed, it will return an object with each css-var property value.
     */
    getValues(): Object {
        return this.currentValues;
    }

}