import { VectorDom, VectorDomOptions, VectorDomComponent } from './vector-dom';
import { dom } from '../dom/dom';
import { EASE } from '../ease/ease';
import { func } from '../func/func';
import { mathf } from '../mathf/mathf';
import { Vector } from '../mathf/Vector';
import { is } from '../is/is';
import { HermiteCurve } from '../mathf/hermite-curve';
import { Interpolate } from '../interpolate/interpolate';

export interface VectorDomTimelineOptions {
    /**
     * To use VectorDom for css only interpolations.
     */
    cssOnly?: boolean;
}

export interface VectorDomTimelineObject {
    progress: number;
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    alpha: number;
    easingFunction?: Function;
}

/**
 * A class that adds and helps with timeline functionality of VectorDom.
 *
 * ### TIMELINE FEATURE #######
 *
 * VectorDom also has a timeline feature which can be handy to animate
 * elements to a progress.
 *
 * The default properties of VectorDom get directly appended to the element
 * as a css 3dMatrix (x, y, z, rx, ry, rz).  However, you can optionally,
 * set css variable key values in timeline to set css variables.
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
 *     }
 * ]
 *
 * let element = document.getElementById('myelmeent');
 * let vector = new VectorDom(element);
 *
 * // Set the timeline.
 * vector.timeline.setTimeline(timeline);
 *
 * // Now update the vector to a specific "progress" in the timeline.
 * let currentProgress = 0.2; // Could be amount of scroll, range input, whatever.
 * vector.timeline.setTimeline(currentProgress);
 *
 * // Now render it...it will render at where the values are at 20%
 * vector.render();
 * ```
 *
 *
 *
 * Catmull Rom - instead of a linear, you can set timeline to use
 * catmull rom splines to smooth out the curves between progress points.
 *
 * ```ts
 *
 * // Set the timeline.
 * vector.timeline.setTimeline(timeline);
 * // Set the timeline mode to catmullrom.  Any easing functions
 * // will get ignored.
 * vector.timeline.timelineCatmullRomMode = true;
 * // Change the default tension if you wish.
 * vector.timeline.timelineCatmullRomTension = 1.2;
 *
 * ```
 *
 *
 *
 * Creating a VectorDom only for css timeline.
 * You may want to use VectorDom ONLY for the timeline feature but discard
 * the transforms and vector features.  You can set:
 *
 * ```
 * let myVector = new VectorDom(myElement);
 * myVector.disableStyleRenders = true;
 *
 * ```
 * to indicate that you only want to use this VectorDom with the timeline feature.
 * The timeline feature would only accept css var property keys.
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
    public timelineCatmullRomMode: boolean;

    /**
     * If using catmull rom to evaluate the timeline, the tension value of the
     * hermit curve m1, m2 points.
     */
    public timelineCatmullRomTension: number;

    /**
     * An internal list of all recorded timeline keys.
     */
    private timelineKeys: Array<string>;

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
        this.timelineCatmullRomMode = false;
        this.timelineCatmullRomTension = 1;

        // Cull unncessary requests to setCssKeys.
        this.setCssKeys_ = func.runOnceOnChange(this.setCssKeys_.bind(this));
    }

    /*
     * Given a set timeline, this will update the positions, rotation
     * of the vector dom.
     *
     * ```ts
     *
     * var timeline = [
     *    {
     *      progress: 0,
     *      x: 0,
     *      y: 0,
     *      z: 1 - 1,
     *      alpha: 0.2
     *    },
     *    {
     *      progress: 0.2,
     *      x: 100,
     *      y: 200,
     *      z: 1 - 0.8,
     *      alpha: 0.2
     *     }
     *    {
     *      progress: 0.5,
     *      x: 20,
     *      y: 20,
     *      z: 1 - 1,
     *      alpha: 1
     *     }
     * ]
     *
     * let element = document.getElementById('myelmeent');
     * let vector = new VectorDom(element);
     *
     * // Set the timeline.
     * vector.setTimeline(timeline);
     *
     * // Now update the vector to a specific "progress" in the timeline.
     * vector.setTimeline(0.2);
     *
     * // Now render it...it will render at where the values are at 20%
     * vector.render();
     *
     * ```
     */
    setTimeline(timeline: Array<VectorDomTimelineObject>) {
        // Sort by progression.
        this.timeline = timeline.sort((a, b) => {
            return a.progress - b.progress;
        });

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


        this.timeline = this.timeline.sort((a, b) => {
            return a.progress - b.progress;
        })

    }


    /**
     * Does a look up in the timeline for the next available key.
     *
     * Consider this example:
     * ```
     * {
     *   progress: 0,
     *   x: 100,
     *   y: 200
     * },
     * {
     *   progress: 0.2,
     *   y: 100,
     * }
     * {
     *   progress: 1,
     *   x: 100,
     * }
     *
     * ```
     * In this timeline, x is not available in the 0.2.  This method will
     * do a look up.  If you start a search from the i = 1, since x is not
     * available, it will proceed to the next item until it is found.
     * @param key The key you are looking up.
     * @param i The index position to start search.
     */
    findNextAvailableKeyInTimeline(key: string, i: number): Object | null {
        if (!this.timeline) {
            throw new Error('You need to set a timeline progress first.')
        }
        if (is.defined(this.timeline[i][key])) {
            return {
                'value': this.timeline[i][key],
                'key': key,
                'index': i
            }
        } else {
            if (i >= this.timeline.length - 1) {
                return null;
            } else {
                return this.findNextAvailableKeyInTimeline(key, i + 1);
            }
        }
    }

    updateProgressOld(progress: number) {
        if (!this.timeline) {
            throw new Error('You need to set a timeline progress first.')
        }

        const skipKeys = ['progress', 'easingFunction'];

        /**
         * Loop through each possible property.
         */
        this.timelineKeys.forEach((key) => {
            if (skipKeys.includes(key)) {
                return;
            }

            // Set the start value as the current position in case it's not specified.
            let start: any = null;
            let startProgress = 0;
            let end: any = null;
            let endProgress = 1;
            let easing = null;
            let previous = null;


            // Look up the start and end values for this key in based on
            // the current progress.
            this.timeline!.forEach((timeline) => {
                // If the progress is zero, just take the first available
                // values.
                if (progress == 0) {
                    let endIndex: number =
                        this.findNextAvailableKeyInTimeline(key, 1)!['index'] || 0;
                    start = this.timeline![0][key];
                    end = this.timeline![endIndex][key];
                    easing = this.timeline![0].easingFunction;
                    startProgress = this.timeline![0].progress;
                    endProgress = this.timeline![endIndex].progress;
                }

                if (timeline.progress < progress) {
                    start = timeline[key];
                    startProgress = timeline.progress;
                    easing = timeline.easingFunction;
                }
                // if (!is.number(end) && timeline.progress >= progress && is.number(timeline[key])) {
                if (is.null(end) && timeline.progress >= progress && is.defined(timeline[key])) {
                    endProgress = timeline.progress;
                    end = timeline[key];
                };

                previous = timeline;
            });

            // Now run an interpolation and update the internal value.
            if (!is.null(start) && !is.undefined(start) && !is.null(end)) {
                let childProgress =
                    mathf.clamp01(mathf.childProgress(progress, startProgress, endProgress));

                // Safe guard.
                if (is.nan(childProgress)) {
                    return;
                }

                let value;
                // If the value is a numberical.
                if (is.number(start) && is.number(end)) {
                    if (!this.timelineCatmullRomMode) {
                        value = mathf.ease(start, end, childProgress, easing || EASE.linear);
                    } else {
                        let diff = end - start;
                        // Technically, not a catmull rom but create a similar
                        // spline out of HermiteCurves.
                        const vector = HermiteCurve.getPoint(
                            childProgress,
                            new Vector(start, start),
                            new Vector(start * this.timelineCatmullRomTension,
                                start * this.timelineCatmullRomTension),
                            new Vector(end, end),
                            new Vector(end * this.timelineCatmullRomTension,
                                end * this.timelineCatmullRomTension),
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
                    this[key] = value;
                }
            }
        })

    }

    updateProgress(progress: number) {
        if (!this.timeline) {
            throw new Error('You need to set a timeline progress first.')
        }

        const skipKeys = ['progress', 'easingFunction'];

        /**
         * Loop through each possible property.
         */
        this.timelineKeys.forEach((key) => {
            if (skipKeys.includes(key)) {
                return;
            }

            // Set the start value as the current position in case it's not specified.
            let start: any = null;
            let startProgress = 0;
            let end: any = null;
            let endProgress = 1;
            let easing = null;
            let lastEndValue = null;

            // Create a map of the timeline just for the keys we are looking for.
            // Sometimes, in a timeline, values maybe skipped so this ensures
            // that for this particular key value, we have it's own mapping.
            // For example:
            //
            // const timeline = [
            //   { progress: 0, alpha: 0, x: 1200 }
            //   { progress: 0.2, x: 1500 }
            //   { progress: 0.5, x: 1500 }
            //   { progress: 0.8, alpha: 0.6, x: 1500 }
            //   { progress: 1, alpha: 1, x: 1500 }
            //]
            //
            // The above has alpha missing on some steps.  This means alpha
            // would have it's own stepped interpolations that don't  follow
            // the steps of timeline.
            //
            // The keyMap for alpha above would yield:
            //
            // [
            //   { progress: 0, alpha: 0}
            //   { progress: 0.8, alpha: 0.6}
            //   { progress: 1, alpha: 1}
            //]
            //
            const keyMap = this.timeline!.filter((timeline) => {
                return is.defined(timeline[key]);
            })

            // Look up the start and end values for this key in based on
            // the current progress.
            this.timeline!.forEach((timeline) => {

                // If the progress is zero, just take the first available
                // values.
                if (progress == 0) {
                    let endIndex: number =
                        this.findNextAvailableKeyInTimeline(key, 1)!['index'] || 0;
                    start = this.timeline![0][key];
                    end = this.timeline![endIndex][key];
                    easing = this.timeline![0].easingFunction;
                    startProgress = this.timeline![0].progress;
                    endProgress = this.timeline![endIndex].progress;
                }

                if (timeline.progress < progress) {
                    start = timeline[key];
                    startProgress = timeline.progress;
                    easing = timeline.easingFunction;
                }

                if (is.null(end) && timeline.progress >= progress && is.defined(timeline[key])) {
                    endProgress = timeline.progress;
                    end = timeline[key];
                };

            });


            // Now run an interpolation and update the internal value.
            if (!is.null(start) && !is.undefined(start) && !is.null(end)) {


                let childProgress =
                    mathf.clamp01(mathf.childProgress(progress, startProgress, endProgress));

                // Safe guard.
                if (is.nan(childProgress)) {
                    return;
                }

                let value;
                // If the value is a numberical.
                if (is.number(start) && is.number(end)) {
                    if (!this.timelineCatmullRomMode) {
                        value = mathf.ease(start, end, childProgress, easing || EASE.linear);

                    } else {
                        let diff = end - start;
                        // Technically, not a catmull rom but create a similar
                        // spline out of HermiteCurves.
                        const vector = HermiteCurve.getPoint(
                            childProgress,
                            new Vector(start, start),
                            new Vector(start * this.timelineCatmullRomTension,
                                start * this.timelineCatmullRomTension),
                            new Vector(end, end),
                            new Vector(end * this.timelineCatmullRomTension,
                                end * this.timelineCatmullRomTension),
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
        })

    }


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