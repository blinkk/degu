
/**
 * A class that helps with time.
 */
export class time {

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