
import { mathf } from '../mathf/mathf';
import { dom } from './dom';
import { Interpolate } from '../interpolate/interpolate';

export interface progressTweenProgressConfig {
    /**
     * The progress value to start from.
     */
    from: number;
    /**
     * The progress value to end on.
     */
    to: number;
    /**
     * The starting value.
     */
    start: number;
    /**
     * The end value.
     */
    end: number;
}

export interface progressTween {
    /**
     *  The progress config.
     */
    progress: progressTweenProgressConfig;
    /**
     * The name of the css variable.
     */
    cssVar: string;
    /**
     * A custom easing function.
     */
    easingFunction: Function;
}

export interface cssProgressTweenConfig {
    /**
     *  The root element to apply css variables to.
     */
    rootElement: HTMLElement;

    /**
     * A list of interpolations that need to be applied.
     */
    tweens: [progressTween];
}


/**
 * A progress based tween implementation ussing css variables.
 * ```ts
 *
 * HTML
 *
 * <div id="ball"></div>
 * <input id="range" type="range" name="points" step="0.01" min="0" max="1">
 *
 *
 * JS
 *  let tween = new ProgressTween({
 *   tweens: [
 *     // When the progress is from 0-0.5,
 *     // The value of x would go from 0 to 100.
 *     {
 *       progress: { from: 0, to: 0.5, start: 0, end: 100 }
 *       id: 'x',
 *       easingFunction: EASE.linear,
 *     },
 *
 *     // When the progress is from 0.5 - 1,
 *     // The value of y would go from 0 to 100.
 *     {
 *       progress: { from: 0, to: 0.5, start: 0, end: 100 }
 *       id: 'y',
 *       easingFunction: EASE.easeInOutBounce
 *     },
 *     // When the progress is from 0.5 - 1,
 *     // The value of someOtherId would go from 0 to 100.
 *     {
 *       progress: { from: 0, to: 1, start: 0, end: 100 }
 *       id: 'someOther',
 *       easingFunction: EASE.easeInOutBounce
 *     }
 *  ]
 * });
 *
 * // Now specify your update handler for the tween.  Everytime the values change,
 * // the onUpdate is called. Value changes are evaluated so this is called only
 * // when values are changed.
 * tween.onUpdate((values)=> {
 *   let xValue = values.x;
 *   let yValue = values.y;
 *   let someOther = values.someOther;
 *
 *   // Now you can use those values and apply it to whatever you want.
 *   box.x = xValue;
 *
 *   // Or if working with dom, you can update a css variable and use that
 *   // in your css.
 *   myElement.style.setProperty('--x', x);
 *
 * })
 *
 *
 * // You need to apply a concept of progress (a value between 0 and 1).
 * // Here as an example, we acquire the html range input.
 * let range = document.getElementById('range');
 * this.progress = document.getElementById(range).value;
 *
 * range.addEventListener('change', ()=> {
 *   // Update the progress.
 *   this.progress = range.value;
 *   // Or apply some lerp to the value to smooth things out.
 *   // this.progress = mathf.ease(this.progress, range.value, 0.25);
 *
 *   // Now notify progress tween of the value change.
 *   tween.updateProgress(this.progress);
 * })
 *
 *
 *
 * Sass
 *
 * ```
 * @hidden
 */
export class ProgressTween {
    constructor(private cssProgressTweenConfig: cssProgressTweenConfig) {
        console.log('cssProgressTween', this.cssProgressTweenConfig);
    }

}