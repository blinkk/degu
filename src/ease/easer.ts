import {time} from '../time/time';
import {mathf} from '../mathf/mathf';
import {EASE} from './ease';
import {Raf} from '../raf/raf';

export interface easerConfig {
  /**
   * The duration of the ease in ms.
   * @type {number}
   */
  duration: number;
  /**
   * The delay of the ease in ms.
   * @type {number}
   */
  delay: number;
  /**
   * The easing function to use.
   * @type {Function}
   */
  easeFunction: Function;
  /**
   * Whether to disable the internal Raf update cycles of easer.
   * For most cases, don't turn this on.
   * @type {boolean}
   */
  disableRaf: boolean;
}

/**
 * A very simple time based tween implementation.
 * TODO (uxder); Possibly refactor this to use raf-timer instead.
 *
 * ```ts
 * import { Raf, Easer} from '@blinkk/degu';
 *
 * // Simple example.
 * let easer = new Easer({
 *   duration: 200,
 *   delay: 100,
 *   easeFunction: EASE.linear
 * });
 * easer.onUpdate((easeValue, complete)=> {
 *   // Called on each raf cycle.
 *   // element.style.left = 100 * easeValue + 'px';
 * })
 *
 * // Start and listen to completion.
 * easer.start().then(()=> {
 *   console.log('easing is complete');
 * })
 *
 *
 * // Example where you want to handle raf updates on your own.
 * // Here we tell easer that we will be calling the easer.calculate method
 * // on raf.
 * let easer = new Easer({
 *   duration: 200,
 *   easeFunction: EASE.easeInOutExpo,
 *   disableRaf: true // Note that this option is set to true.
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
 * // Since we told easer to not internall update on raf, we need to
 * // call calculate and tell easer to calculate.
 * var raf = new Raf(()=> {
 *   easer.calculate();
 * });
 *
 * // As an example, we throttle our raf instance to 10 FPS so easer will
 * // only update at 10 frames per second.
 * raf.setFps(10);
 *
 * easer.start(); // Start easer
 * raf.start(); // Start raf so easer calculate is called.
 *
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
  private completePromiseResolve_: Function | null;
  private raf_: Raf;
  private rafDisabled_: boolean;

  /**
   * @param {easerConfig} The easing configuration
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

    // The resolving function for the complete promise (if used).
    this.completePromiseResolve_ = null;

    // Internal instance of raf.
    this.raf_ = new Raf(() => {
      this.calculate();
    });

    // Whether raf is disabled.  When this option is true, easer will
    // no longer interally call Raf and instead expects easer.calculate()
    // to be called on each Raf.  Disabling raf within easer might be
    // a more advanced usercase in which an application wants to
    // have control over easer and it's calculate timings.
    this.rafDisabled_ = easerConfig.disableRaf || false;
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
    this.raf_ && this.raf_.stop();
  }

  /**
   * Returns the internal instance of raf.
   * @return The internal instance of raf.
   */
  getRaf(): Raf {
    return this.raf_;
  }

  /**
   * Starts the easing.
   * @return Returns a promise that resolved when the animation completes.
   */
  start(): Promise<void> {
    this.startTime_ = time.now() + this.delay_;
    this.endTime_ = this.startTime_ + this.duration_;
    this.started_ = true;

    if (!this.rafDisabled_) {
      this.raf_ && this.raf_.start();
    }

    return new Promise(resolve => {
      this.completePromiseResolve_ = resolve;
    });
  }

  /**
   * Adds a complete callback.
   */
  onComplete(callback: Function): void {
    this.completeCallback_ = callback;
  }

  /**
   * Adds a complete callback.
   */
  onUpdate(callback: Function): void {
    this.updateCallback_ = callback;
  }

  /**
   * Calculates the current ease.  This method should generally be
   * called at 60FPS by Raf.
   */
  calculate(): void {
    if (!this.started_) {
      return;
    }

    const currentTime = time.now();

    // Check to see if we are more than our start time.
    if (currentTime < this.startTime_) {
      return;
    }

    // The time passed since the ease started.
    const timePassed = currentTime - (this.startTime_ || 0);
    const percent = timePassed / this.duration_;

    // A value between 0 and 1 representing the current state of progression.
    const progression: number = this.easeFunction_(mathf.clamp(0, 1, percent));

    let complete = false;

    if (percent > 1) {
      // Ensure the ease amount ends on 1.
      this.updateCallback_ && this.updateCallback_(1, complete);
      this.completeCallback_ && this.completeCallback_(1, complete);
      this.completePromiseResolve_ && this.completePromiseResolve_(1, complete);
      complete = true;
      this.started_ = false;
    } else {
      this.updateCallback_ && this.updateCallback_(progression, complete);
    }
  }

  dispose(): void {
    this.raf_ && this.raf_.stop();
  }
}
