import {time} from '../time/time';
import * as mathf from '../mathf/mathf';
import {Raf} from './raf';

/**
 * A Raf based timer.  This class allows you to run RAF for only a
 * set duration and then stop.
 *
 * This can be useful to do things like one time animations.
 *
 * Here is an example of running the rafTimer for 300ms
 * and lerping the x value of the box.
 * ```ts
 * // Box x starting value.
 * box.x = 0;
 *
 * let rafTimer = new RafTimer((progress)=> {
 *   // Called on each raf cycle from when start is called
 *   // for 300ms.
 *
 *   // progress is passed as a value between 0 and 1.
 *   // console.log('progress')
 *
 *
 *   // Will move the box from 0 (starting) to 500
 *   // based on the progress.
 *   box.x = mathf.lerp(box.x, 500, progress);
 *
 *   // or go fancy and add easing to the progress!
 *   // box.x = mathf.ease(box.x, 500, progress, ease.easeInOutSine);
 * })
 *
 * rafTimer.onComplete(()=> {
 *   // Do something on completion.
 * })
 *
 * // Set the duration of the rafTimer 300 and start it.
 * rafTimer.setDuration(300);
 * rafTimer.play();
 *
 *
 * // If you want, slow down the FPS.
 * rafTimer.setFps(10);
 *
 * // Pause if you want.
 * window.setTimeout(()=> {
 *   rafTimer.pause();
 *
 *   // Start playing again from pause point
 *   playButton.addEventListner('click', ()=> {
 *     rafTimer.play();
 *   }, { once: true});
 *
 *   // Reset to beginning
 *   resetButton.addEventListner('click', ()=> {
 *     rafTimer.reset();
 *     rafTimer.play();
 *   }, { once: true});
 *
 * })
 *
 * TODO (uxder); Update this to extend emit emitter.
 *
 * ```
 */
export class RafTimer {
  private rafLoop: Function;
  private raf: Raf;
  private duration: number;
  private timeElapsed: number;
  private timeSnapshot: number;
  private playing: boolean;
  private completeCallback: Function | null;
  public progress: number;

  constructor(rafLoop: Function) {
    /**
     * The callback to be executed upon each request animation frame.
     * @type {Function}
     */
    this.rafLoop = rafLoop;

    /**
     * The internal raf instance
     * @type {private}
     */
    this.raf = new Raf(() => {
      this.animationLoop_();
    });

    /**
     * The internal raf instance
     * @type {private}
     */
    this.duration = 0;

    /**
     * The progress of the timer. The amount of percentage
     * we have elasped, represented in a number between 0-1.
     */
    this.progress = 0;

    /**
     * The amount of time in ms that has elapsed
     */
    this.timeElapsed = 0;

    /**
     * The last point in which time was measured.
     */
    this.timeSnapshot = 0;

    /**
     * Whether raf is active, we are playing .
     */
    this.playing = false;

    // A single complete callback.
    this.completeCallback = null;
  }

  /**
   * The internal animation loop.
   */
  private animationLoop_() {
    // In theory, when playing is false, this loop shouldn't
    // run but safe guard.
    if (!this.playing) {
      return;
    }

    // On each raf cycle, we want to calculate
    // the amount of time that has elapsed since
    // the last known timeSnapshot (when the time
    // was recorded).
    // We add this to the total value of time elapsed.
    const timeSinceLastTimeSnapshot = time.timeDiffMs(
      this.timeSnapshot,
      time.now()
    );

    this.timeElapsed += timeSinceLastTimeSnapshot;

    this.progress = mathf.clampAsPercent(this.timeElapsed / this.duration);

    // Update the snapshot.
    this.timeSnapshot = time.now();

    // If we aren't at 100% call the raf loop.
    if (this.progress < 1) {
      this.rafLoop && this.rafLoop(this.progress);
    } else {
      // Run the main update loop one more time as completion.
      this.rafLoop && this.rafLoop(1);
      // Complete
      this.reset();
      this.raf.stop();
      this.completeCallback && this.completeCallback(1);
    }
  }

  /**
   * Set the duration of the raf loop in ms.
   * @param duration  The duration in ms.
   */
  setDuration(duration: number): void {
    this.duration = duration;
  }

  /**
   * Sets the fps of raf loop..
   */
  setFps(fps: number): void {
    this.raf.setFps(fps);
  }

  onComplete(callback: Function) {
    this.completeCallback = callback;
  }

  /**
   * Start playing the rafTimer.
   */
  play(): void {
    if (this.playing) {
      return;
    }
    this.playing = true;
    this.timeSnapshot = time.now();
    this.raf.start();
  }

  /**
   *  Resets the RAF timer.
   */
  reset(): void {
    this.playing = false;
    this.raf.stop();
    this.timeElapsed = 0;
  }

  /**
   *  Pauses the raf Timer.
   */
  pause(): void {
    this.raf.stop();
    this.playing = false;
  }

  dispose() {
    this.raf.dispose();
  }
}
