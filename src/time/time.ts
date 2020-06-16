
import { is } from '../is/is';

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



    /**
     * Given a startTime and endTime, tests whether the provided testTime
     * is within that time.
     * @param startTime
     * @param endTime
     * @param testTime
     */
    static isInBetween(startTime: Date, endTime: Date, testTime: Date): boolean {
        if (startTime && endTime) {
            return testTime >= startTime && testTime < endTime;
        } else if (startTime) {
            return testTime >= startTime;
        } else if (endTime) {
            return testTime < endTime;
        }
        return false;
    }


    /**
     * Converts a utc based time that you might created into the local time.
     *
     * ```
     * const myUTCDate = new Date('2020-06-20 03:45:00');
     * const theUTCDateInLocalTime = time.utcDateToLocalTimeZone(myUTCDate);
     *
     *
     * // Do Stuff.  Now it is in local time zone.
     * const diff = thisUTCDateInLocalTime - new Date();
     * ```
     * Now the theUTCDateInLocalTime is the UTC time adjusted to your
     * local computer timezone.
     *
     * @param utcDate
     */
    static utcDateToLocalTimeZone(utcDate: Date): Date {
        // Safari for some reason, defaults to utc and does the conversion
        // for you.
        if(is.safari()) {
            return utcDate;
        } else {
            var timeOffsetInMS: number = utcDate.getTimezoneOffset() * 60000;
            return new Date(utcDate.getTime() - timeOffsetInMS);
        }
    }


    /**
     * Use to calculate the countdown to a given time.  Note that the
     * currentTime and endTime should both be in the same local timezone.
     *
     * Returns an object with days, hours, minutes, seconds.
     *
     * ```
     * const now = new Date();
     * const endTime = new Date('2021-06-20 03:34:00 UTC');
     * const countDown = time.countdown(now, endTime);
     *
     *
     * countdown.days; // the number of days
     * countdown.hours; // the number of hours
     * countdown.minutes; // the number of minutes
     * countdown.seconds; // the number of seconds
     * ```
     */
    static countdown(currentTime: Date, endTime: Date): Object {
        var time = endTime.getTime() - currentTime.getTime();
        return {
            'days': Math.floor(time / (1000 * 60 * 60 * 24)),
            'hours': Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            'minutes': Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)),
            'seconds': Math.floor((time % (1000 * 60)) / 1000)
        }
    }



}