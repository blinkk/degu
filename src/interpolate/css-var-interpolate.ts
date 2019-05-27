
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
 *   You can apply the interpolated value as a css variable.  Note that unless
 *   since cssVarInterpolate doesn't deal with units at the moment, you need to
 *   multiply your unit via css calc.
 *   Example:
 *      top: calc(var(--x) * 1vh)
 *
 * .ball
 *    transform: translateX(calc(var(--x) * 1px)) translateY(calc(var(--y) * 1px));
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
 *
 *
 * ```
 */
export class CssVarInterpolate {
    private progress: number | null;
    private currentValues: Object;
    private multiInterpolate: MultiInterpolate;


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
        this.progress = null;
        this.currentValues = {};
        this.multiInterpolate = new MultiInterpolate(config);
    }

    /**
     * Updates the progress and updates the css variable values.
     */
    update(progress: number) {
        // Only make updates when progress value was updated to avoid layout
        // thrashing.
        if (progress == this.progress) {
            return;
        }

        this.progress = progress;

        this.currentValues =
            this.multiInterpolate.calculate(this.progress);

        for (var key in this.currentValues) {
            dom.setCssVariable(this.element, key, this.currentValues[key]);
        }
    }

}