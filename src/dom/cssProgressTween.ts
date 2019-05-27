import { mathf } from '../mathf/mathf';
import { dom } from './dom';
import { Interpolate } from '../interpolate/interpolate';

export interface cssProgressTweenProgressConfig {
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

export interface cssProgressTween {
    /**
     *  The progress config.
     */
    progress: cssProgressTweenProgressConfig;
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
    tweens: [cssProgressTween];
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
 *  let tween = new CssProgressTween({
 *   // The root element to apply variables to.
 *   rootElement: element,
 *   interpolations: [
 *     // When the progress is from 0-0.5,
 *     // The value of the css variable --transformY should
 *     // go from 0 to 100.
 *     {
 *       progress: { from: 0, to: 0.5, start: 0, end: 100 }
 *       cssVar: '--transformX',
 *       easingFunction: EASE.linear,
 *       update: (value)=> console.log('value')
 *     },
 *
 *     // When the progress is from 0.5 - 1,
 *     // The value of the css variable --transformY should
 *     // go from 100 to 500.
 *     {
 *       progress: { from: 0, to: 0.5, start: 0, end: 100 }
 *       cssVar: '--transformX',
 *       easingFunction: EASE.easeInOutBounce
 *     }
 *  ]
 * });
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
 *   tween.update(this.progress);
 * })
 *
 *
 *
 * Sass
 *
 * ```
 * @hidden
 */
export class CssProgressTween {
    constructor(private cssProgressTweenConfig: cssProgressTweenConfig) {
        console.log('cssProgressTween', this.cssProgressTweenConfig);
    }

}