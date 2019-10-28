
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
 *
 *    }
 *
 *
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
     * The time measurement used to measure internal fps.
     */
    private lastUpdateTime: number;

    constructor(fps:number) {
        this.fps = fps;
    }


    /**
     * Checks the lastUpdateTime and checks if it is within the threshold
     * of being allowed to run.  This method would return true if it's okay
     * to run but return false a call should be culled.
     */
    canRun():boolean {
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