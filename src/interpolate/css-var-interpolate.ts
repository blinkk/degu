
import { mathf } from '../mathf/mathf';
import { MultiInterpolate, multiInterpolateConfig } from './multi-interpolate';
import { dom } from '../dom/dom';


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
 *
 *
 * JS
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
 */
export class CssVarInterpolate {
    private mainProgress: number | null;
    private currentValues: Object;
    private multiInterpolate: MultiInterpolate;

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
     * @param element The element to update the css variable to.
     *     This can be the body element if you want a "global" css
     *     variable or you can specific a more speicific element to
     *     scope the results of your css variables.
     * @param config
     */
    constructor(
        private element: HTMLElement,
        private config: multiInterpolateConfig) {

        /**
         * Set this to initially null so that when update is first called
         * we are guanranteed that it will be processed.
         */
        this.mainProgress = null;
        this.currentValues = {};
        this.multiInterpolate = new MultiInterpolate(config);

        this.startProgress = 0;
        this.endProgress = 1;
    }

    /**
     * Updates the progress and updates the css variable values.
     */
    update(progress: number) {
        // Only make updates when progress value was updated to avoid layout
        // thrashing.
        if (progress == this.mainProgress) {
            return;
        }

        // Create a child progress so that the range in which this interpolation
        // reacts can be scoped.
        this.mainProgress = mathf.childProgress(progress,
            this.startProgress, this.endProgress);

        this.currentValues =
            this.multiInterpolate.calculate(this.mainProgress);

        for (var key in this.currentValues) {
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


}