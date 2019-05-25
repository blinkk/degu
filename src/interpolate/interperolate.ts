
import { mathf } from '../mathf/mathf';

export interface interpolateConfig {
    /**
     * The value at which interperolation should begin.
     * @type {number}
     */
    from: number;

    /**
     * The value at which interperolation should begin.
     * @type {number}
     */
    to: number;
    /**
     * The easing function to use.
     * @type {Function}
     */
    easeFunction: Function;
}

/**
 * A class that interperolate between values. Interperolate is similar to
 * mathf.ease.
 * ```
 * import { ease, Interpolate } from 'yano-js'
 * let inter = new Interpolate({
 *   from: 0,
 *   to: 100,
 *   easeFunction: ease.linear
 * });
 *
 * inter.calculate(0.3);  // return 30.
 *
 * inter.calculate(0.6); // return 60
 *
 * // Get the value from currentValue if needed.
 * console.log(inter.currentValue); // 60
 * ```
 *
 * This can be useful to create low level tweens.
 * Here for example, we can manually, tween the x and y positions
 * of a ball with separate easing.
 * ```
 * import { Raf, ease, Interpolate } from 'yano-js'
 *
 * this.progress = 0;
 * let ballXInter = new Interpolate({
 *   from: 30,
 *   to: 100 ,
 *   easeFunction: ease.easeOutSine
 * })
 * let ballYInter = new Interpolate({
 *   from: 30,
 *   to: 100 ,
 *   easeFunction: ease.linear
 * })
 *
 * // See RafTimer for how this works.  Basically, here we are running raf for
 * // 300ms and the progress is a value between 0-1 which we used to passed to the
 * // interperolators.
 * new RafTimer((progress)=> {
 *   // Update the positions of ball.
 *   ball.x = ballXInter.calculate(this.progress);
 *   ball.y = ballYInter.calculate(this.progress);
 * }).start(300);
 *
 *
 * ```
 */
export class Interperolate {

    /**
     * The current interperolated value.
     */
    public currentValue: number;

    /**
     * The current progress.
     */
    public currentProgress: number;

    constructor(private interperolateConfig: interpolateConfig) {
        this.currentValue = this.interperolateConfig.from;
        this.currentProgress = 0;

        // Assume we start on preogress 0.
        this.calculate(0);
    }

    updateSettings(interperolateConfig: interpolateConfig) {
        this.interperolateConfig = interperolateConfig;
    }

    calculate(progress: number) {

        this.currentProgress = progress;

        this.currentValue = mathf.ease(
            this.currentValue,
            this.interperolateConfig.to,
            this.currentProgress,
            this.interperolateConfig.easeFunction);

        return this.currentValue;
    }

}