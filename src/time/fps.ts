
import { time } from '../time/time';

/**
 * A class that helps with time with fps.
 *
 *
 * ```ts
 *
 * class myClass {
 *    contructor() {
 *       this.fps = new Fps(30);
 *       draw();
 *    }
 *
 *    draw() {
 *        // Keep loop going.
 *        requestAnimationFrame(draw);
 *
 *        // Can run would return true when it is okay to execute limiting
 *        // the calls to 30 FPS.
 *        if(this.fps.canRun()) {
 *          // Do some expensive computation.
 *          canvas.drawImage(hugeImage);
 *        }
 *
 *    }
 * }
 * ```
 *
 * The above works but it is a simple gating a call to run at a set rate.
 * Here is a slightly more complex usage where you can "schedule" the last call.
 *
 * This will also draw at 30FPS but the difference is that it is debounced
 * so your very last call to draw is guaranteed to run when the drawing goes idle.
 *
 * ```ts
 *
 * class myClass {
 *    contructor() {
 *       this.fps = new Fps(30);
 *       this.index = 0;
 *       draw(1);
 *       draw(2);
 *       draw(3);  // This last one gets executed in this example.
 *    }
 *
 *    draw(index) {
 *        // If this call came too quickly between 30FPS, schedule it to run.
 *        if(!this.fps.canRun()) {
 *          this.fps.schedule(()=> {
 *             this.draw(index);
 *          });
 *          return;
 *        }
 *
 *        // Do something expensive here.
 *    }
 * }
 * ```
 *
 *
 *
 */
export class Fps {

    /**
     * An fps rate limiter.
     */
    private fps: number;

    /**
     * Whether the fps is in a locked state.  A locked state
     * represents that the fps should be limited.  Defaults to
     * true.
     */
    private locked: boolean;

    /**
     * The time measurement used to measure internal fps.
     */
    private lastUpdateTime: number = 0;

    /**
     * A timeout that is used for scheduling.
     */
    private scheduleTimeout: number = 0;


    constructor(fps: number) {
        this.fps = fps;
        this.locked = true;
    }


    /**
     * Sets the fps.
     * @param fps
     */
    setFps(fps:number) {
        this.fps = fps;
    }


    /**
     * Locks or Unlocks fps.  This forces canRun to always return true.
     * This is useful in cases you need to temporarily remove
     * FPS throttling.
     *
     * ```ts
     *
     * // On Window resize we want to run the drawLoop regardless
     * // of FPS.  We can temporarily tell fps to be unlocked.
     * resize() {
     *    this.fps.lock(false);
     *    this.drawLoop();
     *    this.fps.lock(true);
     * }
     *
     *
     * // Runs on RAF
     * drawLoop() {
     *  if(this.fps.canRun()) {
     *     // Do some expensive computation.
     *     canvas.drawImage(hugeImage);
     *  }
     * }
     *
     * ```
     */
    lock(lock:boolean) {
        this.locked = lock;
    }

    /**
     * Schedules a callback to force run after a set period.
     */
    schedule(callback:Function) {
        this.cancelSchedule();
        this.scheduleTimeout = window.setTimeout(()=> {
            this.locked = false;
            callback();
            this.locked = true;
        }, 1000 / this.fps + 1);
    }


    /**
     * Clears the schdule timeout.
     */
    cancelSchedule() {
        if(this.scheduleTimeout) {
            window.clearTimeout(this.scheduleTimeout);
        }
    }


    /**
     * Checks the lastUpdateTime and checks if it is within the threshold
     * of being allowed to run.  This method would return true if it's okay
     * to run but return false a call should be culled.
     */
    canRun(): boolean {
        this.cancelSchedule();

        // If the FPS is unlocked always return true.
        if (!this.locked) {
            return true;
        }


        if (this.lastUpdateTime) {
            const current = time.now();
            const elapsed = current - this.lastUpdateTime;
            const fps = this.fps === 0 ? 0 : 1000 / this.fps;
            if (elapsed > fps) {
                this.lastUpdateTime = time.now();
                return true;
            } else {
                return false;
            }
        }


        if (!this.lastUpdateTime) {
            this.lastUpdateTime = time.now();
            return true;
        }

        return false;
    }

}
