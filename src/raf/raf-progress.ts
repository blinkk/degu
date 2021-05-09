import {mathf} from '../mathf/mathf';
import {is} from '../is/is';
import {Raf} from './raf';
import {EASE} from '..';

interface RafProgressRangeWatcher {
  range: number | Array<number>;
  callback: Function;
}

/**
 * A class that runs Raf for a limited time while a given progress
 * (a value between 0-1) eases.  This class is useful because instead of
 * constanlty runnig raf, it will only run RAF when a progress value is unstable.
 * This class also allows you to register and listen for specific progress
 * values and run callbacks (IE: run a callback when the progress crosses 0.5).
 *
 *
 * Example WITHOUT RafProgress:
 * Consider the following example to understand what RafProgress does.
 * Here we are using an html range input to represent Progress but progresss could
 * be a window scroll, duration, mouse position etc.....a percentage amount:
 * ```ts
 * HTML
 *   <input id="range" type="range" name="points" step="0.01" min="0" max="1" style="width: 500px;">
 *
 * JS
 *  this.range = document.getElementById('range');
 *
 *  // Set the progress to the range value.
 *  this.progress = +this.range.value;
 *
 *  const raf = new Raf(() => {
 *     // Range is a value between 0 and 1.
 *     let progress = +this.range.value;
 *
 *    // Add some ease to the progress to smooth it out.
 *    this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
 *
 *   // Reduce the precision of progress.  We dont need to report progress differences
 *   // of 0.0000001.
 *    this.progress = mathf.round(this.progress, 3);
 *
 *   // Something with progress
 *   // Many manipulate the DOM here.
 *  }).start();
 * ```
 * Here you can see that on each RAF cycle, we check the value of the range and
 * get the progress.  We then apply an ease to that progress and then do
 * something within the RAF loop based on the current progress.
 *
 * This works but the problem is that RAF is constantly running and even if
 * the value of progress is the same as the last raf loop, we still are running
 * RAf and perhaps layout thrashing or performning unncessary calcs.
 *
 *
 * Example WITH RafProgress
 * The above is simplied with this class.
 *
 *
 * ```ts
 *
 * this.range = document.getElementById('range');
 *
 * // Create an instance of raf progress.
 * let rafProgress = new RafProgress((easedProgress, direction)=> {
 *   // DO something here like update the dom.
 *   // This is ONLY called when progress has changed in value.
 *   //..
 * })
 *
 * // Set the initial progress value.
 * rafProgress.setCurrentProgress(+this.range.value)
 *
 * // Optional, set the precision.
 * rafProgress.setPrecision(5);
 *
 * // Now listen to the range input 'input' event.  The input event is basically
 * // fired when the range changes.
 * this.range.addEventListener('input', ()=> {
 *   rafProgress.easeTo(+this.range.value, 0.25, EASE.easeInOutQuad)
 * })
 *
 *
 *
 *
 * // RafProgress is also an event emitter so you can listen to the progressEvent
 * rafProgress.addEventListener('progressChange', (easedProgress, direction)=> {
 *   // Do something.
 * })
 *
 *
 *
 * // Or use alias watch, unwatch
 * var onProgress = (progress)=> {
 *   console.log('hello')
 * }
 * rafProgress.watch(onProgress);
 * rafProgress.unwatch(onProgress);
 *
 * ```
 *
 * # Progress Callbacks
 * Raf progress additionally allows you to register and listen specific
 * progress values and run a callback.
 *
 * ```
 *
 * // Triggers when progress runs from 0.2, 0.4
 * rafProgress.watchFor([0.2, 0.4], callback);
 *
 * // Triggers when 0.2 is crossed .
 * rafProgress.watchFor(0.2, callback);
 *
 * // Remove watchFor
 * rafProgress.unwatchFor(callback);
 *
 * ```
 * @noInheritDoc
 */
export class RafProgress {
  private raf: Raf;
  public currentProgress: number;
  private targetProgress: number;
  private easeAmount: number;
  private damp: number | null;
  private easingFunction: Function | null;
  private precision: number;
  private rangeWatchers: Array<RafProgressRangeWatcher>;
  private callbacks: Array<Function>;
  // The current scroll direction.
  private direction = 0;

  /**
   * @param {Function} progressRafLoop  Optional function to be called on each
   *    progress update event.
   * @constructor
   */
  constructor(progressRafLoop?: Function) {
    /**
     * The internally known current progress.
     */
    this.currentProgress = 0;

    /**
     * The number of decimals to use when checking the equality of the
     * previous progress versus current.
     */
    this.precision = 10;

    /**
     * The amount of ease to apply.  This gets calculated as per RAF,
     * how much of the difference between the current value and target
     * should the current value be updated by.  Therefore, 1 would mean,
     * the current value would immediately update to the target value after
     * one RAF cycle.  Use 1 for no ease.
     */
    this.easeAmount = 1;

    /**
     * The amount of damp to apply. 1 is no damping.
     */
    this.damp = 1;

    /**
     * A collection of callbacks to be run at specific progress values.
     */
    this.rangeWatchers = [];

    /**
     * A collection of callbacks to be run when progress is changed.
     */
    this.callbacks = [];

    this.targetProgress = this.currentProgress;
    this.easingFunction = EASE.linear;

    if (progressRafLoop) {
      this.watch(progressRafLoop);
    }

    this.raf = new Raf(() => {
      this.rafLoop();
    });
  }

  /**
   *  Force stops running calculations.
   */
  stop() {
    this.raf.stop();
  }

  /**
   * Sets the FPS of the internal raf loop.
   */
  setFps(fps: number) {
    this.raf.setFps(fps);
  }

  /**
   * Run calculations.  Normally. you would call easeTo to set the latest
   * current progress, you may want to call this if forced stopped and want
   * to restart the raf loop manually.
   */
  run() {
    this.raf.start();
  }

  /**
   * Sets the precision.  Precision is used to check how closely the current
   * progress is versus the previous progress per RAF cycle.
   * The lower the number, the less precise.
   *
   * Use a lower number if you want want to improve performance since it will
   * result in calling Raf fewer times.
   */
  setPrecision(value: number) {
    this.precision = value;
  }

  /**
   * Adds a progress listener.
   * @param {Function}
   */
  watch(callback: any) {
    this.callbacks.push(callback);
  }

  /**
   * Removes a progress listener.
   * @param {Function}
   */
  unwatch(callbackToRemove: any) {
    this.callbacks = this.callbacks.filter(callback => {
      return callback == callbackToRemove;
    });
  }

  /**
   * Sets a callback for a specific range.
   * @param {number|Array<number>} A specific progress to watch for or
   *     an array like [0.1, 0.4] specifying the range to be watched.
   * @param {Function}
   */
  watchFor(range: number | Array<number>, callback: Function) {
    this.rangeWatchers.push({
      range: range,
      callback: callback,
    });
  }

  /**
   * Removes a given
   * @param callback
   */
  unwatchFor(callback: Function) {
    this.rangeWatchers = this.rangeWatchers.filter(
      (watcher: RafProgressRangeWatcher) => {
        return watcher.callback !== callback;
      }
    );
  }

  /**
   * Once raf is starated, updates on each raf cycle if raf is running.
   * Dirty check for progress and stops raf once the value has stabilized.
   */
  private rafLoop() {
    const previousProgress = this.currentProgress;

    if (typeof this.damp === 'number') {
      this.currentProgress = mathf.damp(
        this.currentProgress,
        this.targetProgress,
        this.easeAmount,
        this.damp
      );
    } else {
      this.currentProgress = mathf.ease(
        this.currentProgress,
        this.targetProgress,
        this.easeAmount,
        this.easingFunction || EASE.linear
      );
    }

    // Reduce the precision of progress.  We dont need to report progress differences
    // of 0.0000001.
    this.currentProgress = mathf.toFixed(this.currentProgress, this.precision);

    // Based on the the precision, we want to make sure we return
    // a complete 0 or complete 1 as integers at the bounds of the progress.
    if (this.currentProgress < 0.5) {
      this.currentProgress = mathf.floorToPrecision(
        this.currentProgress,
        this.precision - 1
      );
    } else {
      this.currentProgress = mathf.ceilToPrecision(
        this.currentProgress,
        this.precision - 1
      );
    }

    this.direction = mathf.direction(previousProgress, this.currentProgress);

    // Call callbacks.
    this.callbacks.forEach(callback => {
      callback(this.currentProgress, this.direction);
    });

    // Loop through watchers.
    this.rangeWatchers.forEach((watcher: RafProgressRangeWatcher) => {
      let isBetween = false;
      if (Array.isArray(watcher.range)) {
        isBetween = mathf.isBetween(
          this.currentProgress,
          watcher.range[0],
          watcher.range[1]
        );
      } else {
        // If we are only watching for a specific value, we used the
        // previous progress to see if we passed it.
        isBetween = mathf.isBetween(
          <number>watcher.range,
          this.currentProgress,
          previousProgress
        );
      }

      if (isBetween) {
        watcher.callback(this.currentProgress, this.direction);
      }
    });

    // Stop RAF if the value of progress has stabilized.
    if (previousProgress == this.currentProgress) {
      this.raf.stop();
    }
  }

  /**
   * Sets the current progress.  This forces an immediate update to
   * the passed progress.
   */
  setCurrentProgress(progress: number, noClamp = true) {
    this.currentProgress = noClamp ? progress : mathf.clampAsProgress(progress);
    this.targetProgress = this.currentProgress;
    this.easeAmount = 1;
    // Run the raf loop once.
    this.raf.start();
  }

  /**
   * Eases the progress to a target value.  Until that value is reached,
   * the progressRafLoop is called.
   *
   * @param {number} targetProgress The progress to get to.
   * @param {number} easeAmount The amount to ease. This gets calculated as per
   *     RAF, how much of the difference between the current value and target
   *     should the current value be updated by.  Therefore, 1 would mean
   *     no ease. 0.1 would mean a lot of ease.
   * @param {Function} easingFunction An optional easing funciton.  Defaults to
   *     linear.
   * @param {boolean} noClamp Prevent progress clamping.  Allows values outside
   *      range of 0-1.
   *
   */
  public easeTo(
    targetProgress: number,
    easeAmount: number,
    easingFunction: Function = EASE.linear,
    noClamp = false
  ) {
    this.targetProgress = noClamp
      ? targetProgress
      : mathf.clampAsProgress(targetProgress);
    this.easeAmount = mathf.clampAsPercent(easeAmount);
    this.easingFunction = easingFunction;
    this.damp = null;

    // Start up RAF to make updates and ease to the target progress.
    // Make sure we force a restart since sometimes, you can get multiple
    // call to this in the same raf cycle and if stop is called at the end
    // our animation won't be guaranteed to start.
    this.raf.start(true);
  }

  /**
   * Similar to easeTo but applied a smoothdamp instead.
   * @param targetProgress
   * @param easeAmount
   * @param damp
   */
  public dampTo(
    targetProgress: number,
    easeAmount: number,
    damp: number,
    noClamp = false
  ): void {
    this.targetProgress = noClamp
      ? targetProgress
      : mathf.clampAsProgress(targetProgress);
    this.easeAmount = mathf.clampAsPercent(easeAmount);
    this.easingFunction = null;
    this.damp = damp;

    // Start up RAF to make updates and ease to the target progress.
    // Make sure we force a restart since sometimes, you can get multiple
    // call to this in the same raf cycle and if stop is called at the end
    // our animation won't be guaranteed to start.
    this.raf.start(true);
  }

  /**
   * Gets the lerp delta - the difference between the current ease and the
   * targetEase (where it should be if it caught up).
   */
  public getLerpDelta() {
    return this.targetProgress - this.currentProgress;
  }

  /**
   * Gets the current scroll direction. 1 is down scroll, -1 is up scroll and
   * 0 is no scroll (when progress is catching up).
   */
  public getScrollDirection(): number {
    return this.direction;
  }

  dispose() {
    this.raf.dispose();
    this.callbacks = [];
    this.rangeWatchers = [];
  }
}
