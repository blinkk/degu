
import { mathf } from './mathf';

/**
 * A very simple easing implementation.  Typically used with raf.
 *
 * ```
 * let easer = new Easer(200, 100, Ease);
 * easer.onEnd(()=> {
 *   console.log('this gets called on completion');
 * })
 *
 * // If you want to manually, run ease, you can call update on each raf function.
 * var raf = new raf(()=> {
 *   easer.update((easeAmount, complete)=> {
 *     console.log('amount to ease.')
 *   })
 *
 * });
 *
 * easer.start(); // Start easer
 * raf.start(); // Start raf.
 * ```
 *
 *
 */
export class Easer {

    private startTime_: number | null;
    private endTime_: number | null;
    private duration_: number;
    private delay: number;
    private ease: Function;
    private started_: boolean;
    private completeCallback_: Function | null;

    /**
     * @param {number} duration The duration of the ease in ms.
     * @param {number} delay The delay of the ease.
     * @param {Ease} The easing function to calculate with.
     * @constructor
     */
    constructor(duration: number, delay: number, ease: Function) {

        // The current ms since Jan 1, 1970.
        this.startTime_ = null;

        // The end time.
        this.endTime_ = null;

        // The duration of the ease.
        this.duration_ = duration;

        // The delay.
        this.delay = delay;

        // The easing fucntion.
        this.ease = ease;

        // A flag to test whether the easer has started.
        this.started_ = false;

        // A single complete callback.
        this.completeCallback_ = null;
    }

    /**
     * Initialize.
     */
    start() {
        this.startTime_ = new Date().getTime() + this.delay;
        this.endTime_ = this.startTime_ + this.duration_;
        this.started_ = true;
    }


    /**
     * Adds a complete callback.
     */
    onEnd(callback: Function) {
        this.completeCallback_ = callback;
    }

    /**
     * The update call.
     * @param {Function} callback to pass the ease calculations.
     */
    update(callback: Function) {
        if (!this.started_) {
            return;
        }

        let currentTime = new Date().getTime();

        // The time passed since the ease started.
        let timePassed = currentTime - (this.startTime_ || 0);
        let percent = timePassed / this.duration_;
        let easeAmount = this.ease(mathf.clamp(0, 1, percent));

        let complete = false;

        if (percent > 1) {
            // Ensure the ease amount ends on 1.
            callback(1, complete);
            this.completeCallback_ && this.completeCallback_();
            complete = true;
            this.started_ = false;
        } else {
            callback(easeAmount, complete);
        }

    }

}
