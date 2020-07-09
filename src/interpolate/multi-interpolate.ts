
import { mathf } from '../mathf/mathf';
import { EASE } from '../ease/ease';
import { Interpolate } from './interpolate';

export interface rangedProgress {
    /**
     * The progress value to start from.
     */
    from: number;
    /**
     * The progress value to end on.
     */
    to: number;
    /**
     * The starting value.
     */
    start: number | string;
    /**
     * The end value.
     */
    end: number | string;
    /**
     * The easing function to be applied.  This is optional and if undeclared,
     * it will be set to linear.
     */
    easingFunction?: Function;
}

export interface interpolateSettings {
    /**
     *  The progress config.
     */
    progress: Array<rangedProgress>;
    /**
     * The name of the interpolations
     */
    id: string;
}

export interface multiInterpolateConfig {
    /**
     * A list of interpolations that need to be applied.
     */
    interpolations: Array<interpolateSettings>;
}

export const multiInterpolateHelper = {

    errors: {
        FROM_TO_EQUAL:
            'Range progress from and to values should not equal each other.',
        FROM_GREATER:
            'Range progress from greater than the value of to'
    },

    /**
     * Checks for invalid progress specifications.
     */
    checkInvalidRangedProgresses: (progresses: Array<rangedProgress>) => {
        progresses.forEach((progress) => {
            if (progress.from == progress.to) {
                console.error(progress);
                throw new Error(multiInterpolateHelper.errors.FROM_TO_EQUAL)
            }

            if (progress.from > progress.to) {
                console.error(progress);
                throw new Error(multiInterpolateHelper.errors.FROM_GREATER)
            }
        });
    },

    /**
     * Given the current progress, does a search withn the progresses, to
     * find the best matching progress.
     *
     * The order of progresses DOES matter because this will do a search from
     * top to bottom.
     *
     * @param {number} currentProgress A number between 0-1 representing progress.
     * @param {Array<rangedProgress>} orderedProgress A list of ordered
     *     progresses.  This algo assumed tha the progresses are ordered based
     *     on from value.  Run your progress through
     *     [[multiInterpolaterHelper.orderProgresses]].
     *
     * @return {rangedProgress} Returns the best matching ranged progress.
     */
    findBestMatchingRangedProgress(currentProgress: number,
        progress: Array<rangedProgress>): rangedProgress {

        // We assume that we always want to start with the first progress
        // declaration.
        let matchedProgress = progress[0];
        progress.forEach((progress) => {
            let previousProgress = matchedProgress;
            // If the current matchedProgress has come to an end.
            // select the next progress.
            if (matchedProgress.to <= currentProgress) {
                matchedProgress = progress;
            }

            // If the current progress is still not in range, revert to the
            // previous progress.
            if (matchedProgress.from > currentProgress) {
                matchedProgress = previousProgress;
            }
        })

        return matchedProgress;
    }

}



/**
 * MultiInterpolate allows you to interpolate multiple values at once against
 * a parent progress.
 *
 * ```ts
 *
 *
 * JS
 *  import { MultiInterpolate, EASE } from 'yano-js';
 *  let multiInterpolate = new MultiInterpolate({
 *   interpolations: [
 *     // This declaration would create the following.
 *     // When progress is:
 *     // 0 - 0.29999 ---> x = 50.
 *     //    It uses applies the start value of the first progress.
 *     // 0.3 - 0.5   ---> x = 50 - 100.
 *     // 0.5 - 0.8   ---> x = 100 - 800
 *     // 0.8 - 1     ----> x = 800.  The last value is used.
 *     {
 *       progress: [
 *          { from: 0.3, to: 0.5, start: 50, end: 1000,
 *             easingFunction: EASE.easeInOutSine },
 *          { from: 0.5, to: 0.8, start: 1000, end: 8000,
 *             easingFunction: EASE.easeInOutBounce }
 *       ],
 *       id: 'x',
 *     },
 *
 *     // When the progress is from 0.5 - 1,
 *     // The value of y would go from 0 to 100.
 *     {
 *       progress: [{ from: 0, to: 0.5, start: 0, end: 100 }],
 *       id: 'y',
 *     },
 *     // When the progress is from 0.5 - 1,
 *     // The value of someOtherId would go from 0 to 100.
 *     {
 *       progress: [{ from: 0, to: 1, start: 0, end: 100 }]
 *       id: 'someOther',
 *     },
 *
 *     // Multi interpolate also supports simple units.  See interpolate for
 *     // unit and color support.
 *     {
 *       progress: [{ from: 0, to: 1, start: '0px', end: '100px' }]
 *       id: 'z',
 *     }
 *  ]
 * });
 *
 * // What are the values at 0 progress.
 * let results = multiInterpolate.calculate(0);
 * console.log(results['x']); // 50
 * console.log(results['y']); // 0
 * console.log(results['someOther']); // 0
 *
 * // What are the values at 0.3 progress (30%)
 * results = multiInterpolate.calculate(0.3);
 * console.log(results['x']); // 50
 * console.log(results['y']); // ~60
 * console.log(results['someOther']); // 30
 *
 * // What are the values at 0.7 progress (70%)
 * results = multiInterpolate.calculate(0.7);
 * console.log(results['x']); //~7441
 * console.log(results['y']); // ~100
 * console.log(results['someOther']); // 30
 *
 * results = multiInterpolate.calculate(1);
 * console.log(results['x']); //~7441
 * console.log(results['y']); // ~100
 * console.log(results['someOther']); // 100
 * ```
 * @tested
 */
export class MultiInterpolate {

    private parentProgress: number;
    private currentValues: Object;
    private interpolations = Object;
    private config: multiInterpolateConfig;


    constructor(multiInterpolaterConfig: multiInterpolateConfig) {
        this.parentProgress = 0;
        this.currentValues = {};
        this.config = multiInterpolaterConfig;
        this.updateConfig(this.config);
    }

    /**
     * Sets and updates the config.  Validates, reorders and set the config.
     */
    updateConfig(config: multiInterpolateConfig) {
        this.config = config;

        if (!this.config.interpolations) {
            throw new Error(
                'Multiinterpolation config is missing interpolations');
        }

        this.config.interpolations = this.config.interpolations.map(
            (interpolateSettings: interpolateSettings) => {

                // Valid progresses.
                multiInterpolateHelper.checkInvalidRangedProgresses(
                    interpolateSettings.progress
                );

                // TODO (uxder)
                // I think we can add some from of checks to to warn
                // users if their progresses are out of order.
                //
                //
                // Example of case that isn't good.
                //    { from: 0.3, to: 0.4, start: 0, end: 100 },
                //    { from: 0, to: 0.2, start: 100, end: 800 }
                //    { from: 0.4, to: 1, start: 100, end: 800 }
                //
                // Users should restructure the progress in order of
                // from. Could easily reorder in code but it might be
                // better keep as is and enforce cleaner organization and
                // keep the logic top - down.
                //

                return interpolateSettings;
            })

    }


    /**
     * Returns the last know interpolations values.
     * ```ts
     * multiInterpolate.calculate(0.5);
     *
     * let results = multiInterpolate.getCalculations();
     *
     * ```
     */
    getCalculations(): Object {
        return this.currentValues;
    }

    /**
     * Sets the current progress and returns all interpolations.
     * @param {number} The current progress.
     * @return {Object} An object with all interpolation ids as the keys and their
     *     relative values.
     */
    calculate(progress: number) {
        this.parentProgress = progress;

        const previousValues = this.currentValues;

        this.config.interpolations.forEach(
            (config: interpolateSettings) => {
                // Given the set of rangedProgress, find the best matching
                // one based on the current progress.
                const matchedRangeProgress =
                    multiInterpolateHelper.findBestMatchingRangedProgress(
                        this.parentProgress,
                        config.progress
                    );

                // Now that we have a best matched rangedProgress, create
                // a "Child progress' progress (@see mathf.childProgress) and
                // then calculate the ease / interpolations.
                const childProgress = mathf.childProgress(
                    this.parentProgress,
                    matchedRangeProgress.from,
                    matchedRangeProgress.to
                )

                // Now calculate the interpolation based on the childProgress
                // progress value.
                const interpolatedValue = new Interpolate({
                    from: matchedRangeProgress.start,
                    to: matchedRangeProgress.end,
                    easeFunction: matchedRangeProgress.easingFunction ||
                        EASE.linear
                }).calculate(childProgress);

                // Finally cache this value to the current values list.
                this.currentValues[config.id] = interpolatedValue;
            }
        )

        return this.currentValues;
    }
}