
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
 *
 * }
 * ```
 */
export class Fps {

    /**
     * An fps rate limiter.
     */
    private fps: number | null;

    /**
     * Whether the fps is in a locked state.  A locked state
     * represents that the fps should be limited.  Defaults to
     * true.
     */
    private locked: boolean;

    /**
     * The time measurement used to measure internal fps.
     */
    private lastUpdateTime: number;

    constructor(fps:number) {
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
     * Checks the lastUpdateTime and checks if it is within the threshold
     * of being allowed to run.  This method would return true if it's okay
     * to run but return false a call should be culled.
     */
    canRun():boolean {
        // If the FPS is unlocked always return true.
        if(!this.locked) {
            return true;
        }


        if (this.lastUpdateTime) {
            const current = time.now();
            const elapsed = current - this.lastUpdateTime;
            const fps = this.fps == 0 ? 0 : 1000 / this.fps;
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
    }

}