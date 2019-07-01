import { VectorDom, VectorDomOptions, VectorDomComponent } from './vector-dom';
import { dom } from '../dom/dom';
import { EASE } from '../ease/ease';
import { func } from '../func/func';
import { mathf } from '../mathf/mathf';
import { Vector } from '../mathf/Vector';
import { is } from '../is/is';
import { HermiteCurve } from '../mathf/hermite-curve';
import { Interpolate } from '../interpolate/interpolate';

export interface VectorDomStartEnd {
    start: VectorDomTimelineObject
    end: VectorDomTimelineObject
}

export interface VectorDomTimelineOptions {
    /**
     * To use VectorDom for css only interpolations.
     */
    cssOnly?: boolean;
}

export interface VectorDomTimelineObject {
    progress: number;
    x?: number;
    y?: number;
    z?: number;
    rx?: number;
    ry?: number;
    rz?: number;
    alpha?: number;
    easingFunction?: Function;
}

/**
 * A list of keys in timeline object that should be skipped.
 */
const skipKeys = ['progress', 'easingFunction'];

/**
 *
 * A component class of VectorDom that adds timeline functionality to VectorDOM.
 *
 * #### Basic Example
 *
 * The timeline feature is a component of VectorDom to make sequential animations.
 *
 * The timeline feature will directly update element properties including,
 * x, y, z, rx, ry, rz, alpha.  In addition, you can append any css variable and
 * timeline will take care of the interpolations.
 *
 *
 * Here is a basic example:
 *
 * ```ts
 *
 *  // Notice how we add the css var --blur here.
 * .myelement {
 *     filter: blur(calc(var(--blur) * 4px));
 * }
 *
 *
 * // In the timeline, define storyboard out the animations.
 * // Any key that starts with '--' will automatically be available
 * // as a css var on the element.
 * var timeline = [
 *    {
 *      progress: 0,
 *      x: 0,
 *      y: 0,
 *      z: 0.3 - 1,
 *      alpha: 0.2,
 *      '--blur': 1
 *    },
 *    {
 *      progress: 0.2,
 *      x: 100,
 *      y: 200,
 *      z: 0.8 - 1,
 *      alpha: 0.2,
 *      '--blur': 0.2
 *      easingFunction: EASE.easeInOutCubic
 *     },
 *    {
 *      progress: 0.5,
 *      x: 20,
 *      y: 20,
 *      z: 1 - 1,
 *      '--blur': 1
 *      alpha: 1
 *     },
 *     {
 *      progress: 1,
 *      x: 100,
 *      y: 20,
 *      z: 0.2 - 1,
 *      '--blur': 1
 *      alpha: 1
 *     }
 * ]
 *
 * let element = document.getElementById('myelmeent');
 * let vector = new VectorDom(element);
 *
 * // Access the timeline component and set the timeline.
 * vector._.timeline.setTimeline(timeline);
 *
 * // Now update the vector to a specific "progress" in the timeline.
 * let currentProgress = 0.2; // Could be amount of scroll, range input, whatever.
 *
 * // At this point the internal, position, rotational vectors will get updated.
 * vector._.timeline.setTimeline(currentProgress);
 *
 * // Now render it...it will render at where the values are at 20%
 * vector.render();
 * ```
 *
 *
 *
 * ### Catmull Rom Mode.
 * Timeline goes step to step in your progress but this can often lead to
 * rather robotic movement.  Instead of a linear progresss, you can create a
 * a smoothed spline from your points.
 *
 * ```ts
 *
 * // Set the timeline.
 * vector._.timeline.setTimeline(timeline);
 *
 * // Set the timeline mode to catmullrom.  Any easing functions
 * // will get ignored.
 * vector._.timeline.catmullRomMode = true;
 *
 * // Change the default tension if you wish.
 * vector._.timeline.catmullRomTension = 1.2;
 *
 * ```
 *
 *
 * ### Using CSS vars Only.
 * If you want to use VectorDom only with css variables or prevent VectorDom
 * from updating the style properties, pass the cssOnly option.
 *
 *
 * ```ts
 *
 * let myVector = new VectorDom(myElement);
 * vector._.timeline.setTimeline(timeline, { timeline: cssOnly: true}});
 *
 * ```
 *
 * alternatively, which results in the same thing.
 * ```ts
 * let myVector = new VectorDom(myElement);
 * myVector.disableStyleRenders = true;
 *
 * ```
 *
 *
 */
export class VectorDomTimeline implements VectorDomComponent {
    /**
     * The host of this vectorDom instance of this component.
     */
    private host: VectorDom;
    private element: HTMLElement;
    /**
     * A list of values to interpolate between a given progress.  This is
     * the story board of the timeline feature.
     *
     * ```ts
     * var timeline = [
     *       {
     *           progress: 0,
     *           y: 0,
     *       },
     *       {
     *           progress: 0.1,
     *           '--opacity': 1,
     *           y: 100,
     *       },
     *       {
     *           progress: 0.5,
     *           '--opacity': 0,
     *           y: 200,
     *       }
     *]
     * ```
     */
    private timeline: Array<VectorDomTimelineObject> | null;

    /**
     * Whether to use catmull rom to evaluate timeline.
     */
    public catmullRomMode: boolean;

    /**
     * If using catmull rom to evaluate the timeline, the tension value of the
     * hermit curve m1, m2 points.
     */
    public catmullRomTension: number;

    /**
     * An internal list of all recorded timeline keys.
     */
    private timelineKeys: Array<string>;

    /**
     * A modified version of timeline that organizes the timeline by key.
     * For each key we have it's own progression and timeline.
     * @see [[VectorDomTimeline.generateStoryboard]] for more.
     */
    private storyboard: Object;


    /**
     * The timeline options.
     */
    public options: VectorDomTimelineOptions;

    /**
     * An internal set of css keys and their lastest values.
     */
    private cssKeys: Object;

    /**
     * @param vc  The vectorDom that this component is attached to.
     */
    constructor(vc: VectorDom) {
        this.host = vc;
        this.options = vc.options.timeline || {};
        this.element = vc.element;
        this.cssKeys = {};
        this.timeline = [];
        this.timeline = null;
        this.timelineKeys = [];
        this.catmullRomMode = false;
        this.catmullRomTension = 1;
        this.storyboard = {};


        // Cull unncessary requests to setCssKeys.
        this.setCssKeys_ = func.runOnceOnChange(this.setCssKeys_.bind(this));

        if (this.options.cssOnly) {
            this.host.disableStyleRenders = true;
        }
    }


    init() { }

    /**
     * Sets the timeline to be used and internally generates the storyboard
     * to be used for interpolations.
     */
    setTimeline(timeline: Array<VectorDomTimelineObject>) {
        this.sortTimeline();
        this.timelineKeys = [];

        const rotationValue = ['rx', 'ry', 'rz'];
        this.timeline = timeline.map((timeline) => {

            // Save any new keys.
            let keys = Object.keys(timeline);

            // Add the keys to timelineKeys while deduping.
            this.timelineKeys = [...new Set([...this.timelineKeys, ...keys])];

            // Convert rotation values to radians.
            rotationValue.forEach((key) => {
                if (timeline[key]) {
                    timeline[key] = mathf.degreeToRadian(timeline[key]);
                }
            })

            return timeline;
        });

        // Generate storyboard.
        this.storyboard =
            VectorDomTimeline.generateStoryboard(
                this.timelineKeys,
                this.timeline);
    }

    /**
     * Sorts the maintimeline.
     */
    private sortTimeline() {
        if (!this.timeline) {
            return;
        }
        // Sort the timeline.
        this.timeline = this.timeline.sort((a, b) => {
            return a.progress - b.progress;
        })
    }


    /**
     * Generates a storyboard from the provided timeline.
     *
     * Given a timeline like the following, a storyboard is timeline
     * by a specific key.  Notice how alpha is not declared in every step
     * of the timeline.
     *
     * The storyboard will also ALWAYs creates a progress 0 and 1 timeline
     * based on the first available.  See the alpha example below.
     *
     * const timeline = [
     *   { progress: 0, x: 1200 },
     *   { progress: 0.2, alpha: 0.2, x: 1500 },
     *   { progress: 0.5, x: 1500 },
     *   { progress: 0.8, alpha: 0.6, x: 1500 },
     *   { progress: 1, x: 1500 }
     * ]
     *
     * The resulting storyboard would be:
     * {
     *   alpha: [
     *     { progress: 0, alpha: 0.2},  // Added
     *     { progress: 0.2, alpha: 0.2},
     *     { progress: 0.8, alpha: 0.6},
     *     { progress: 1, alpha: 0.6}  // Added
     *   ],
     *   x: [
     *   { progress: 0, x: 1200},
     *   { progress: 0.2, x: 1500},
     *   { progress: 0.5, x: 1500 },
     *   { progress: 0.8, alpha: 0.6},
     *   { progress: 1, alpha: 1 }
     *   ]
     * }
     */
    static generateStoryboard(keys: Array<string>,
        timeline: Array<VectorDomTimelineObject>): Object {
        let storyboard = {};
        keys.forEach((key) => {
            if (skipKeys.includes(key)) {
                return;
            }
            let keyStoryboard = timeline.filter((t) => {
                return is.defined(t[key]);
            });

            // Make a copy and also remove keys that are not related to this
            // storyboard.
            keyStoryboard = keyStoryboard.map((t) => {
                let copy = Object.assign({}, t);
                for (let k in copy) {
                    if (k !== key && !skipKeys.includes(k)) {
                        delete copy[k];
                    }
                }
                return copy;
            });

            storyboard[key] = keyStoryboard;
        });


        for (let key in storyboard) {
            let keyStory = storyboard[key];

            // Check that the first item is progress 0.  If not, artificially
            // generate it so that the progress starts at 0.
            if (keyStory[0].progress !== 0) {
                let copy = Object.assign({}, keyStory[0]);
                copy.progress = 0;
                keyStory.unshift(copy);
            }

            // Check that the last item is progress 1.  If not, artificially
            // generate it and add it to the end.
            let last = keyStory.length - 1;
            if (keyStory[last].progress !== 1) {
                let copy = Object.assign({}, keyStory[last]);
                copy.progress = 1;
                keyStory.push(copy);
            }

        }

        return storyboard;
    }


    /**
     * Given a storyboard and the current progress, finds the start and end
     * timeline objects and return them.
     *
     * @param storyboard Object
     * @param key
     * @param progress
     */
    static getStartAndEndTimelineFromStoryboard(storyboard: Object,
        key: string, progress: number): VectorDomStartEnd | null {

        // Loop through the storyboard and figure out the correct start and
        // end points.
        let activeStoryboard = storyboard[key];
        if (!activeStoryboard) {
            return null;
        }

        // By default we assume progress is at 0.
        let start = activeStoryboard[0];
        let end = activeStoryboard[1];
        let done = false;

        let previous = activeStoryboard[0];

        activeStoryboard.forEach((timeline: any) => {
            // Loop until the timeline progress is greater or equal than current
            // progress
            if (!done && timeline.progress >= progress && progress > 0) {
                start = previous;
                end = timeline;
                done = true;
            }

            previous = timeline;
        })

        return {
            start: start,
            end: end
        }
    }


    updateProgress(progress: number) {
        for (let key in this.storyboard) {
            let startEnd = VectorDomTimeline
                .getStartAndEndTimelineFromStoryboard(this.storyboard, key, progress);

            let startTimeline = startEnd!.start;
            let endTimeline = startEnd!.end;
            // The start and end values.
            let start = startTimeline[key];
            let end = endTimeline[key];
            let easing = start.easeFunction;

            // Create a child progress between the start and end.
            let childProgress =
                mathf.clamp01(mathf.childProgress(progress,
                    startTimeline.progress, endTimeline.progress));

            // Safe guard.
            if (is.nan(childProgress)) {
                return;
            }

            let value;
            // If the value is a numberical.
            if (is.number(start) && is.number(end)) {
                let diff = end - start;
                if (!this.catmullRomMode || mathf.absZero(diff) == 0) {
                    value = mathf.ease(start, end, childProgress, easing || EASE.linear);
                } else {

                    let tension = this.catmullRomTension;

                    // Technically, not a catmull rom but create a similar
                    // spline out of HermiteCurves.
                    const vector = HermiteCurve.getPoint(
                        childProgress,
                        new Vector(start, start),
                        new Vector(start * tension,
                            start * tension),
                        new Vector(end, end),
                        new Vector(end * tension,
                            end * tension),
                    );
                    if (vector) {
                        value = vector.x;
                    }
                }
            } else {
                // If string values were passed, process it via Interpolate.
                // to be able to use css units.
                value = new Interpolate({
                    from: start,
                    to: end,
                    easeFunction: easing || EASE.linear
                }).calculate(childProgress);
            }

            if (is.defined(value)) {
                // If the key is a css var, internally cache it.  Otherwise,
                // update the value on the host.
                if (key.startsWith('--')) {
                    this.cssKeys[key] = value;
                } else {
                    this.host[key] = value;
                }
            }
        }
    }




    // /**
    //  * Does a look up in the timeline for the next available key.
    //  *
    //  * Consider this example:
    //  * ```
    //  * {
    //  *   progress: 0,
    //  *   x: 100,
    //  *   y: 200
    //  * },
    //  * {
    //  *   progress: 0.2,
    //  *   y: 100,
    //  * }
    //  * {
    //  *   progress: 1,
    //  *   x: 100,
    //  * }
    //  *
    //  * ```
    //  * In this timeline, x is not available in the 0.2.  This method will
    //  * do a look up.  If you start a search from the i = 1, since x is not
    //  * available, it will proceed to the next item until it is found.
    //  * @param key The key you are looking up.
    //  * @param i The index position to start search.
    //  */
    // findNextAvailableKeyInTimeline(key: string, i: number): Object | null {
    //     if (!this.timeline) {
    //         throw new Error('You need to set a timeline progress first.')
    //     }
    //     if (is.defined(this.timeline[i][key])) {
    //         return {
    //             'value': this.timeline[i][key],
    //             'key': key,
    //             'index': i
    //         }
    //     } else {
    //         if (i >= this.timeline.length - 1) {
    //             return null;
    //         } else {
    //             return this.findNextAvailableKeyInTimeline(key, i + 1);
    //         }
    //     }
    // }

    // updateProgress(progress: number) {
    //     if (!this.timeline) {
    //         throw new Error('You need to set a timeline progress first.')
    //     }

    //     const skipKeys = ['progress', 'easingFunction'];

    //     /**
    //      * Loop through each possible property.
    //      */
    //     this.timelineKeys.forEach((key) => {
    //         if (skipKeys.includes(key)) {
    //             return;
    //         }

    //         // Set the start value as the current position in case it's not specified.
    //         let start: any = null;
    //         let startProgress = 0;
    //         let end: any = null;
    //         let endProgress = 1;
    //         let easing = null;
    //         let lastEndValue = null;

    //         this.timeline!.forEach((timeline) => {

    //             // If the progress is zero, just take the first available
    //             // values.
    //             if (progress == 0) {
    //                 let endIndex: number =
    //                     this.findNextAvailableKeyInTimeline(key, 1)!['index'] || 0;
    //                 start = this.timeline![0][key];
    //                 end = this.timeline![endIndex][key];
    //                 easing = this.timeline![0].easingFunction;
    //                 startProgress = this.timeline![0].progress;
    //                 endProgress = this.timeline![endIndex].progress;
    //             }

    //             if (timeline.progress < progress) {
    //                 start = timeline[key];
    //                 startProgress = timeline.progress;
    //                 easing = timeline.easingFunction;
    //             }

    //             if (is.null(end) && timeline.progress >= progress && is.defined(timeline[key])) {
    //                 endProgress = timeline.progress;
    //                 end = timeline[key];
    //             };

    //         });


    //         // Now run an interpolation and update the internal value.
    //         if (!is.null(start) && !is.undefined(start) && !is.null(end)) {


    //             let childProgress =
    //                 mathf.clamp01(mathf.childProgress(progress, startProgress, endProgress));

    //             // Safe guard.
    //             if (is.nan(childProgress)) {
    //                 return;
    //             }

    //             let value;
    //             // If the value is a numberical.
    //             if (is.number(start) && is.number(end)) {
    //                 if (!this.catmullRomMode) {
    //                     value = mathf.ease(start, end, childProgress, easing || EASE.linear);

    //                 } else {
    //                     let diff = end - start;
    //                     // Technically, not a catmull rom but create a similar
    //                     // spline out of HermiteCurves.
    //                     const vector = HermiteCurve.getPoint(
    //                         childProgress,
    //                         new Vector(start, start),
    //                         new Vector(start * this.catmullRomTension,
    //                             start * this.catmullRomTension),
    //                         new Vector(end, end),
    //                         new Vector(end * this.catmullRomTension,
    //                             end * this.catmullRomTension),
    //                     );
    //                     if (vector) {
    //                         value = vector.x;
    //                     }
    //                 }
    //             } else {
    //                 // If string values were passed, process it via Interpolate.
    //                 // to be able to use css units.
    //                 value = new Interpolate({
    //                     from: start,
    //                     to: end,
    //                     easeFunction: easing || EASE.linear
    //                 }).calculate(childProgress);
    //             }

    //             if (is.defined(value)) {
    //                 // If the key is a css var, internally cache it.  Otherwise,
    //                 // update the value on the host.
    //                 if (key.startsWith('--')) {
    //                     this.cssKeys[key] = value;
    //                 } else {
    //                     this.host[key] = value;
    //                 }
    //             }
    //         }
    //     })

    // }


    /**
     * Applies the css variables.  Unneccesary calls get culled by
     * func.runOnceOnChange.
     */
    private setCssKeys_(cssVars: Object) {

        /**
         * Render this element only when it is inview
         * for performance boost.
         */
        if (this.host.renderOnlyWhenInview &&
            this.host.elementVisibility.state().ready &&
            !this.host.elementVisibility.state().inview) {
            return;
        }

        for (let key in cssVars) {
            dom.setCssVariable(this.element, key, cssVars[key]);
        }
    }

    render() {
        this.setCssKeys_(this.cssKeys);
    }

    resize() { }

    dispose() { }

}