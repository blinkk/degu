
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
     * A simple function that resolves after a specific amoutn of time.
     * This is useful to create a delay with await.
     * ```ts
     * console.log('hohoho');
     * await time.wait(500);
     * console.log('hohoho after 500ms');
     * ```
     * @param time
     * @tested
     */
    static async wait(time: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, time));
    }


    /**
     * Wait until a condition becomes truthy.   This under the hood implements
     * polling to evaluate the condition so use wisely.
     * ```ts
     *
     * let someValue = 0;
     * time.waitUntil(()=> someValue == 5).then(()=> {
     *   console.log('some value is 5!!!');
     * })
    *
     * setTimeout(()=> {
     *   someValue = 5;
     * }, 1000);
     * ```
     * @param {Function} A condition that returns a boolean.
     * @param {number} The amount of time that can elapse before rejecting the
     *     returning promise. Defaults to 0, which is evaluated as forever.
     * @param {number} The polling interval amount.
     * @tested
     */
    static waitUntil(condition: Function, timeout = 0,
        interval = 100): Promise<void> {
        const startTime = time.now();
        let resolvePromise: Function;
        let rejectPromise: Function;
        const returnPromise = new Promise<void>((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });


        let evaluateCondition = () => {
            const elapsed = time.timeDiffMs(startTime, time.now());
            // If the condition resolves.
            if (condition()) {
                resolvePromise();
            }
            else if (timeout && elapsed > timeout) {
                rejectPromise('Wait until timed out');
            } else {
                setTimeout(evaluateCondition, interval);
            }
        }
        // Start it up.
        evaluateCondition();

        return returnPromise;
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