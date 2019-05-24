
import { mathf } from './mathf';
import { EASE } from './ease';


interface easerConfig {
    /**
     * The duration of the ease in ms.
     * @type {number}
     */
    duration: number,
    /**
     * The delay of the ease in ms.
     * @type {number}
     */
    delay: number
    /**
     * The easing function to use.
     * @type {Function}
     */
    easeFunction: Function
}

/**
 * A very simple easing implementation.  Typically used with raf.
 *
 * ```
 * let easer = new Easer({
 *   duration: 200,
 *   delay: 100,
 *   easeFunction: EASE.linear
 * });
 * easer.onComplete(()=> {
 *   console.log('this gets called on completion');
 * })
 *
 * easer.onUpdate((easeValue, complete)=> {
 *   console.log('this gets called on each update');
 *   // Do something
 *   // element.style.left = 100 * easeValue + 'px';
 * })
 *
 * var raf = new raf(()=> {
 *   easer.update();
 * });
 *
 * easer.start(); // Start easer
 * raf.start(); // Start raf.
 * ```
 *
 *
 */
export class Easer {

    private startTime_: number;
    private endTime_: number;
    private duration_: number;
    private delay_: number;
    private easeFunction_: Function;
    private started_: boolean;
    private completeCallback_: Function | null;
    private updateCallback_: Function | null;

    /**
     * @param {easerConfig}
     * @constructor
     */
    constructor(private easerConfig: easerConfig) {

        // The current ms since Jan 1, 1970.
        this.startTime_ = 0;

        // The end time.
        this.endTime_ = 0;

        // The duration of the ease.
        this.duration_ = easerConfig.duration || 0;

        // The delay.
        this.delay_ = easerConfig.delay || 0;

        // The easing function.
        this.easeFunction_ = easerConfig.easeFunction || EASE.linear;

        // A flag to test whether the easer has started.
        this.started_ = false;

        // A single complete callback.
        this.completeCallback_ = null;

        // A single update callback.
        this.updateCallback_ = null;
    }


    reset(easerConfig?: easerConfig) {
        if (easerConfig) {
            // The duration of the ease.
            this.duration_ = easerConfig.duration || this.duration_;
            // The delay.
            this.delay_ = easerConfig.delay || this.delay_;
            // The easing function.
            this.easeFunction_ = easerConfig.easeFunction || this.easeFunction_;
        }
        // Set started to false to stop progression.
        this.started_ = false;
        this.startTime_ = 0;
        this.endTime_ = 0;
    }



    /**
     * Starts the easing.
     */
    public start() {
        this.startTime_ = new Date().getTime() + this.delay_;
        this.endTime_ = this.startTime_ + this.duration_;
        this.started_ = true;
    }


    /**
     * Adds a complete callback.
     */
    public onComplete(callback: Function) {
        this.completeCallback_ = callback;
    }

    /**
     * Adds a complete callback.
     */
    public onUpdate(callback: Function) {
        this.updateCallback_ = callback;
    }

    /**
     * Manually forces an update.
     * @param {Function?} callback to pass the ease calculations.
     */
    public update() {
        if (!this.started_) {
            return;
        }

        let currentTime = new Date().getTime();

        // Check to see if we are more than our start time.
        if (currentTime < this.startTime_) {
            return;
        }

        // The time passed since the ease started.
        let timePassed = currentTime - (this.startTime_ || 0);
        let percent = timePassed / this.duration_;

        // A value between 0 and 1 representing the current state of progression.
        let progression: number = this.easeFunction_(
            mathf.clamp(0, 1, percent)
        );

        let complete = false;

        if (percent > 1) {
            // Ensure the ease amount ends on 1.
            this.updateCallback_ && this.updateCallback_(1, complete);
            this.completeCallback_ && this.completeCallback_();
            complete = true;
            this.started_ = false;
        } else {
            this.updateCallback_ && this.updateCallback_(progression, complete);
        }

    }

}
