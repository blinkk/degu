/**
 * A class that creates a RAF loop and calls a specific callback.  Setting the
 * frame rate will throttle the animation.
 *
 * Example usage;
 * ```
 * var raf = new Raf((frame, lastUpdateTime, stop)=> {
 *   console.log('this runs on request animation frame');
 * });
 * raf.start();
 *
 * // Later to stop raf.
 * raf.stop();
 *
 * // Set the FPS
 * raf.setFps(30);
 * raf.start();
 * ```
 *
 * @class
 */
export class Raf {

    public rafLoop: Function;
    private raf_: any;
    private frame: number | null;
    private lastUpdateTime: number;
    private fps: number
    private isPlaying: boolean

    /**
     * @param {Function} rafLoop  The function to be called on each
     *     request animation frame.
     * @constructor
     */
    constructor(rafLoop: Function) {

        /**
         * The callback to be executed upon each request animation frame.
         * @type {Function}
         * @public
         */
        this.rafLoop = rafLoop;

        /**
         * The internal reference to request animation frame.
         * @type {private}
         */
        this.raf_ = null;

        /**
         * The current animation frame.
         * @type {number}
         * @public
         */
        this.frame = null;

        /**
         * The last updated time.
         * @type {number}
         * @public
         */
        this.lastUpdateTime = 0;

        /**
         * The frame rate. Defaults to 0 in which case RAF is not throttled.
         * @type {number}
         */
        this.fps = 0;

        /**
         * Whether raf is looping.
         * @type {boolean}
         */
        this.isPlaying = false;
    }

    /**
     * Sets the Raf loop.
     */
    private setRafLoop(rafLoop: Function) {
        this.rafLoop = rafLoop;
    }

    /**
     * Sets the fps .
     */
    public setFps(fps: number) {
        this.fps = fps;
    }

    /**
     * Starts the RAF animation loop.
     */
    public start() {
        if (this.isPlaying) {
            return;
        }
        this.animationLoop_();
        this.isPlaying = true;
    }

    /**
     * The internal animation loop.
     */
    private animationLoop_() {
        this.raf_ = window.requestAnimationFrame((frame: number) => {
            this.frame = frame;
            this.animationLoop_();
        })


        if (this.lastUpdateTime) {
            let current = Date.now();
            let elapsed = current - this.lastUpdateTime;
            let fps = this.fps == 0 ? 0 : 1000 / this.fps;
            if (elapsed > fps) {
                this.rafLoop(this.frame, this.lastUpdateTime, elapsed, () => {
                    this.stop();
                });

                this.lastUpdateTime = Date.now();
            }
        }

        if (!this.lastUpdateTime) {
            this.lastUpdateTime = Date.now();
        }

    }

    /**
     * Stops the RAF animation loop.
     */
    public stop() {
        this.isPlaying = false;
        window.cancelAnimationFrame(this.raf_);
    }

    public dispose() {
        this.stop();
    }
}
