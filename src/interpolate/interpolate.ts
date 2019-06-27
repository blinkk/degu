
import { mathf } from '../mathf/mathf';
import { is } from '../is/is';
import { color, ColorRGBA } from '../mathf/color';
import { cssUnit, CssUnitObjectTypes } from '../string/css-unit';

export interface interpolateConfig {
    /**
     * The value at which interperolation should begin. Also accepts
     * css unit types (10px, rgba(255, 255, 255, 0.3))
     * @type {number|string}
     */
    from: number | string;

    /**
     * The value at which interperolation should begin. Also accepts css
     * unit types (10px, rgba(255, 255, 255, 0.3)).
     * @type {number|string}
     */
    to: number | string;
    /**
     * The easing function to use.
     * @type {Function}
     */
    easeFunction: Function;
}

/**
 * A class that interperolate between values. Interperolate is really a
 * compositoin around mathf.ease.
 *
 * ```ts
 * import { EASE, Interpolate } from 'yano-js'
 * let inter = new Interpolate({
 *   from: 0,
 *   to: 100,
 *   easeFunction: EASE.linear
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
 *
 * ```ts
 * import { Raf, EASE, Interpolate } from 'yano-js'
 *
 * this.progress = 0;
 * let ballXInter = new Interpolate({
 *   from: 30,
 *   to: 100 ,
 *   easeFunction: EASE.easeOutSine
 * })
 * let ballYInter = new Interpolate({
 *   from: 30,
 *   to: 100 ,
 *   easeFunction: EASE.linear
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
 * See more examples in the /examples folder
 *
 * ```
 *
 *
 * Unit and Color support.
 *
 * Interpolate also uses [[cssUnit]] to interprete string values (as best as it
 * can).  You can pass basic css unit values such as '10px' or '10vw' as
 * from and to values.  Color values of rgba and hex are also supported.
 *
 *
 * It does NOT support cross unit interporalation at the moment such as
 * from: '0px', to: '10vw'.  (Here the units don't match.)
 *
 * ```ts
 * let inter = new Interpolate({
 *   from: '0px',
 *   to: '100px',
 *   easeFunction: EASE.linear
 * });
 * inter.calculate(0.3);  // return '30px'.
 *
 *
 *  inter = new Interpolate({
 *      from: 'rgba(255, 255, 255, 0)',
 *      to: 'rgba(0,0,0,1)',
 *      easeFunction: EASE.linear
 *  });
 *   inter.calculate(0.5) // 'rgba(127, 127, 127, 0.5)'
 * ```
 *
 *
 * @tested
 */
export class Interpolate {

    /**
     * The current interperolated value.
     */
    public currentValue: number | string;

    /**
     * The current progress.
     */
    public currentProgress: number;

    constructor(private interpolateConfig: interpolateConfig) {
        this.currentValue = 0;
        this.currentProgress = 0;

        // Assume we start on preogress 0.
        this.calculate(0);
    }

    /**
     * Modify the interpolate settings.
     * @param interpolateConfig
     */
    modify(interpolateConfig: interpolateConfig): Interpolate {
        return new Interpolate(interpolateConfig);
    }

    calculate(progress: number) {

        this.currentProgress = progress;

        // If we are just interpolating a number just calculate a straight ease.
        if (is.number(this.interpolateConfig.from)) {
            this.currentValue = mathf.ease(
                this.interpolateConfig.from as number,
                this.interpolateConfig.to as number,
                this.currentProgress,
                this.interpolateConfig.easeFunction);
        } else {
            // If we are interpolating a string.
            // Use the from value to determine the type of cssUnit this is.
            let from = cssUnit.parse(this.interpolateConfig.from as string);
            let to = cssUnit.parse(this.interpolateConfig.to as string);

            // If unit type, interpolate the values and append a unit.
            if (from.valueType == CssUnitObjectTypes.number) {
                this.currentValue = mathf.ease(
                    from.value as number,
                    to.value as number,
                    this.currentProgress,
                    this.interpolateConfig.easeFunction);

                this.currentValue = `${this.currentValue}${from.unit}`;
            }

            // If it's an rgba type inteporalate it.
            if (from.valueType == CssUnitObjectTypes.rgba) {
                const interpolatedRgba = color.rgbaEase(
                    from.value as ColorRGBA,
                    to.value as ColorRGBA,
                    this.currentProgress,
                    this.interpolateConfig.easeFunction
                )

                this.currentValue = color.rgbaToCss(interpolatedRgba);
            }

        }

        return this.currentValue;
    }

}