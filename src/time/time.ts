
/**
 * A class that helps with time.
 */
export class time {
    /**
     *  A basic debounce implementation.  Debounce will basically wait X amount
     * of seconds to execute AFTER it's last call.
     * ```ts
     *
     * const debouncer = time.debounce((windowEvent)=> {
     *   console.log(wiindowEvent);
     * }, 500);
     *
     * // Now when you resize, it will wait 500 ms until the last resize call.
     * window.addEventListener('resize', debounce);
     *
     * ```
     * @param callback The function to call.
     * @param wait The ms to delay.
     * @param immediate Optional, whether to immediately run (changes this to throttle)
     * @return A debounced function
     * @tested
     */
    static debounce(callback: Function, wait: number,
        immediate?: boolean): Function {
        let timeOutId: undefined | number;

        return function (this: any, ...args: any[]) {
            const ctx: any = this;
            var runLater = () => {
                timeOutId = undefined;
                callback.apply(ctx, args);
            };
            var throttler = () => {
                timeOutId = undefined;
            };

            // For debouncing.
            if (!immediate && timeOutId === undefined) {
                timeOutId = +setTimeout(runLater, wait);
            }

            // For throttling where we call on leading trail (immediate).
            if (immediate && timeOutId == undefined) {
                callback.apply(ctx, args);
                timeOutId = +setTimeout(throttler, wait);
            }
        };
    }


    /**
     * Throttles a function.  Throttle will run a function immediately when it's
     * called and wait X amount of seconds before it can be called again.
     * ```ts
     *
     * const throttler = time.throttle((windowEvent)=> {
     *   console.log(wiindowEvent);
     * }, 500);
     *
     * // Now when you resize, it will immediately call the throttle function
     * // and wait 500 ms before it can be called again.
     * window.addEventListener('resize', throttler);
     *
     * ```
     * @param callback The callback function
     * @param wait The amount to wait in ms.
     * @tested
     */
    static throttle(callback: Function, wait: number): Function {
        return time.debounce(callback, wait, true);
    }

    /**
     * Returns the current time.
     */
    static now(): number {
        return Date.now();
    }

    /**
     * Calculates the time difference in milliseconds between to times.
     *
     * ```ts
     * let startTime = time.now();
     *
     * window.setTimeout(() {
     *   let diff = time.timDiffMs(startTime, time.now());
     *   console.log(diff); // 300
     * }, 300);
     *
     * ```
     * @param startTime
     * @param endTime
     */
    static timeDiffMs(startTime: number, endTime: number): number {
        return (endTime - startTime);
    }

}