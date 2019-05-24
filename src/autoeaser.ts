
import { Easer } from './easer';
import { Raf } from './raf';

/**
 * A class the implemented auto-easing with RAF just one time.
 * A composition around easer and raf-manager.
 *
 * Usage:
 *
 * ```
 * let autoEaser = new AutoEaser(200, 100, ease.easOutBounce,
 * (value, complete) => {
 *  // Value is something between 0-1 representing the current ease value.
 *  myElement.style.width += 200 * value; // 200 is the final value we want.
 * },
 * ()=> {
 *  // on Complete
 * });
 *
 *
 * );
 * ```
 *
 *
 */
export class AutoEaser {

    private raf: Raf;
    private easer: Easer;

    /**
     * @param {number} duration The duration of the ease in ms.
     * @param {number} delay The delay of the ease.
     * @param {Ease} ease easing function to calculate with.
     * @param {Function} onUpdate A function to be called on every update.
     * @param {Function} onComplete A function to be called when all easing ends.
     * @constructor
     */
    constructor(duration: number, delay: number, ease: Function,
                onUpdate: Function, onComplete: Function) {

        // Setup Easer.
        this.easer = new Easer({
            duration,
            delay,
            easeFunction: ease
        });

        this.easer.onComplete(() => {
            onComplete && onComplete();
            this.destroy();
        });
        this.easer.onUpdate((currentValue: number, complete: boolean) => {
            onUpdate(currentValue, complete);
        });

        // Setup Raf.
        this.raf = new Raf(() => {
            this.easer.update();
        });
    }

    start() {
        // Start processes.
        this.easer.start();
        this.raf.start();
    }

    destroy() {
        this.raf && this.raf.stop();
    }

}
