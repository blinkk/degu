import {VectorDom, VectorDomOptions, VectorDomComponent} from './vector-dom';
import {dom} from '../dom/dom';
import {EASE} from '../ease/ease';
import {func} from '../func/func';
import {mathf} from '../mathf/mathf';
import {Vector} from '../mathf/vector';
import {is} from '../is/is';
import {HermiteCurve} from '../mathf/hermite-curve';
import {Interpolate} from '../interpolate/interpolate';

export interface VectorDomStartEnd {
  start: VectorDomTimelineObject;
  end: VectorDomTimelineObject;
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
 * vector._.timeline.updateProgress(currentProgress);
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
 * ### How the timeline is evalualted.
 * For the timeline you declare, a storyboard is internally generated per
 * property.  This measn that for each keyframe, you can skip certain properties
 * and the interpolations will make the best effort correctly go between
 * your keyframes.  If you don't declare a start (0) and end (1) progress
 * the first and last keyframes you declare will be used in place.
 *
 * Easing functions are used in forward progression so there is no point in
 * adding an easing function to your last keyframe since that is the end.
 *
 *
 * Consider the following:
 * ```ts
 *
 * timeline = [
 *    { progress: 0.2, alpha: 1, x: 200, easingFunction: EASE.easeInOutCubic},
 *    { progress: 0.5, x: 500},
 *    { progress: 0.8, alpha: 0.2},
 *    { progress: 1, alpha: 0, x: 100}
 * ]
 *
 * ```
 * Here x and alpha are not declared on each keyframe.  VectorDomTimeline
 * will generate a storyboard like this for each frame.
 *
 * ```ts
 *
 * storyboard = {
 *    alpha: [
 *      { progress: 0.2, alpha: 1, easingFunction: EASE.easeInOutCubic},
 *      { progress: 0.8, alpha: 0.2},
 *      { progress: 1, alpha: 0}
 *    ],
 *    x: [
 *      { progress: 0.2, x: 200, easingFunction: EASE.easeInOutCubic},
 *      { progress: 0.5, x: 500},
 *      { progress: 1, x: 100}
 *    ]
 * }
 *
 * ```
 * For alpha, the alpha storyboard will be used as the final interpolation
 * values and points.  Same goes with x.
 *
 *
 * For this reason, it's best practice to try to declare 0 and 1 keyframes to
 * make it easier to understand your storyboard.
 *
 * @unstable
 * @hidden
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

  init() {}

  /**
   * Sets the timeline to be used and internally generates the storyboard
   * to be used for interpolations.
   */
  setTimeline(timeline: Array<VectorDomTimelineObject>) {
    this.sortTimeline();
    this.timelineKeys = [];

    const rotationValue = ['rx', 'ry', 'rz'];
    this.timeline = timeline.map(timeline => {
      // Save any new keys.
      const keys = Object.keys(timeline);

      // Add the keys to timelineKeys while deduping.
      this.timelineKeys = [...new Set([...this.timelineKeys, ...keys])];

      return timeline;
    });

    // Generate storyboard.
    this.storyboard = VectorDomTimeline.generateStoryboard(
      this.timelineKeys,
      this.timeline
    );
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
    });
  }

  /**
   * Generates a storyboard from the provided timeline.
   *
   * Given a timeline like the following, a storyboard is timeline
   * by a specific key.  Notice how alpha is not declared in every step
   * of the timeline.
   *
   * The storyboard will also ALWAYs creates a progress 0 and 1 timeline
   * based on the first available.
   *
   * const timeline = [
   *   { progress: 0, x: 1200 },
   *   { progress: 0.2, alpha: 0.2, x: 1500, ease: EASING.easeInOutBounce },
   *   { progress: 0.5, x: 1500 },
   *   { progress: 0.8, alpha: 0.6, x: 1500 },
   *   { progress: 1, x: 1500 }
   * ]
   *
   * The resulting storyboard would be:
   * {
   *   alpha: [
   *     { progress: 0, alpha: 0.2},  // Added
   *     { progress: 0.2, alpha: 0.2, ease: EASING.easeInOutBounce},
   *     { progress: 0.8, alpha: 0.6},
   *     { progress: 1, alpha: 0.6}  // Added
   *   ],
   *   x: [
   *   { progress: 0, x: 1200},
   *   { progress: 0.2, x: 1500, ease: EASING.easeInOutBounce},
   *   { progress: 0.5, x: 1500 },
   *   { progress: 0.8, x: 1500},
   *   { progress: 1, x: 1500}
   *   ]
   * }
   *
   * This storyboard is basically then used for interporlations when
   * the progress value is updated.
   */
  static generateStoryboard(
    keys: Array<string>,
    timeline: Array<VectorDomTimelineObject>
  ): Object {
    const storyboard = {};
    keys.forEach(key => {
      if (skipKeys.includes(key)) {
        return;
      }
      let keyStoryboard = timeline.filter(t => {
        return is.defined(t[key]);
      });

      // Make a copy and also remove keys that are not related to this
      // storyboard.
      keyStoryboard = keyStoryboard.map(t => {
        const copy = Object.assign({}, t);
        for (const k in copy) {
          if (k !== key && !skipKeys.includes(k)) {
            delete copy[k];
          }
        }
        return copy;
      });

      storyboard[key] = keyStoryboard;
    });

    for (const key in storyboard) {
      const keyStory = storyboard[key];

      // Check that the first item is progress 0.  If not, artificially
      // generate it so that the progress starts at 0.
      if (keyStory[0].progress !== 0) {
        const copy = Object.assign({}, keyStory[0]);
        copy.progress = 0;
        keyStory.unshift(copy);
      }

      // Check that the last item is progress 1.  If not, artificially
      // generate it and add it to the end.
      const last = keyStory.length - 1;
      if (keyStory[last].progress !== 1) {
        const copy = Object.assign({}, keyStory[last]);
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
   * ```ts
   * let storyboard = {
   *    alpha: [
   *       { progress: 0, alpha: 0 },
   *      { progress: 0.2, alpha: 0 },
   *       { progress: 0.8, alpha: 0.6 },
   *      { progress: 1, alpha: 0.6 }
   *   ]
   * }
   *
   * // Find the start and end points if the progress were 0.1
   * VectorDomTimeline.getStartAndEndTimelineFromStoryboard(storyboard, 'alpha', 0.1);
   *
   *
   *
   * //Returns:
   * //  {
   * //      start: { progress: 0, alpha: 0 },
   * //      end: { progress: 0.2, alpha: 0 },
   * //  }
   *
   * ```
   *
   * @param storyboard Object
   * @param key
   * @param progress
   */
  static getStartAndEndTimelineFromStoryboard(
    storyboard: Object,
    key: string,
    progress: number
  ): VectorDomStartEnd | null {
    // Loop through the storyboard and figure out the correct start and
    // end points.
    const activeStoryboard = storyboard[key];
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
    });

    return {
      start: start,
      end: end,
    };
  }

  updateProgress(progress: number) {
    for (const key in this.storyboard) {
      const startEnd = VectorDomTimeline.getStartAndEndTimelineFromStoryboard(
        this.storyboard,
        key,
        progress
      );

      const startTimeline = startEnd!.start;
      const endTimeline = startEnd!.end;
      // The start and end values.
      const start = startTimeline[key];
      const end = endTimeline[key];
      const easing = startTimeline.easingFunction;

      // Create a child progress between the start and end.
      const childProgress = mathf.clamp01(
        mathf.childProgress(
          progress,
          startTimeline.progress,
          endTimeline.progress
        )
      );

      // Safe guard.
      if (is.nan(childProgress)) {
        return;
      }

      let value;
      // If the value is a numberical.
      if (is.number(start) && is.number(end)) {
        const diff = end - start;
        if (!this.catmullRomMode || mathf.absZero(diff) == 0) {
          value = mathf.ease(start, end, childProgress, easing || EASE.linear);
        } else {
          const tension = this.catmullRomTension;

          // Technically, not a catmull rom but create a similar
          // spline out of HermiteCurves.
          const vector = HermiteCurve.getPoint(
            childProgress,
            new Vector(start, start),
            new Vector(start * tension, start * tension),
            new Vector(end, end),
            new Vector(end * tension, end * tension)
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
          easeFunction: easing || EASE.linear,
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

  /**
   * Applies the css variables.  Unneccesary calls get culled by
   * func.runOnceOnChange.
   */
  private setCssKeys_(cssVars: Object) {
    /**
     * Render this element only when it is inview
     * for performance boost.
     */
    if (
      this.host.renderOnlyWhenInview &&
      this.host.elementVisibility.state().ready &&
      !this.host.elementVisibility.state().inview
    ) {
      return;
    }

    for (const key in cssVars) {
      dom.setCssVariable(this.element, key, cssVars[key]);
    }
  }

  render() {
    this.setCssKeys_(this.cssKeys);
  }

  resize() {}

  dispose() {}
}
