

import globalWindow from './global-window';
import documentMouseTracker from './document-mouse-tracker';
import { EASE } from '../ease/ease';
import { mathf } from '../mathf/mathf';
import { MatrixIV } from '../mathf/matrixIV';
import { Vector } from '../mathf/vector';
import { func } from '../func/func';
import { is } from '../is/is';
import { dom } from '../dom/dom';
import { HermiteCurve } from '../mathf/hermite-curve';
import { Interpolate } from '../interpolate/interpolate';
import { MouseTracker } from './mouse-tracker';
import { DomWatcher } from './dom-watcher';
import { ElementVisibilityObject, elementVisibility } from './element-visibility';

interface VectorDomTimeline {
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


interface VectorDomOptions {
    /**
     * Whether to set cssTimelineOnly to true.
     */
    cssTimelineOnly: boolean;
}


/**
 * A gameObject type class for DOM elements.
 *
 * Vector-DOM allows you to specify the position (vec3), rotation (vec3) of an
 * html element using matrix3d transforms.
 *
 * The z value of the position vector gets translated as the scale.
 *
 *
 * ```ts
 *
 * const element = document.getElementById('myelement');
 * const vectorElement = new VectorDom(element);
 *
 * // By default the vector element will have an anchor at the center
 * // of the element but override if needed.  This anchor value is generally
 * // used for translate offset while rotation and scale offsets are
 * // controlled by transforOrigin.
 * // Here we set it to the top left.  Default is 0.5.
 * vectorElement.anchorX = 0;
 * vectorElement.anchorY = 0;
 *
 *
 * // Update the transform origin if you want. Default center center.
 * vectorElement.transformOrigin = 'center center'
 *
 * // Set the initial position, rotation of the vector dom.
 * //  z indicates scale.
 * // The z is shifted by 1.  So -1 = 0%.  0 = 100%; 1 = 200%.
 * vectorElement.setPosition( new Vector(0, 0, 0));
 * vectorElement.setRotation( new Vector(0.01, 0, 0));
 *
 * // Optionally set the global offset.  Here we center this element to the
 * // center of the screen.
 * vectorElement.setOffset( new Vector(
 *      window.innerWidth/ 2,  window.innerHeight /2, 0));
 *
 *
 *
 * new Raf(()=> {
 *   // On each raf, add the rotate vector.
 *   let rotate = new Vector(0.01, 0, 0);
 *   this.vectorElement.rotation.add(rotate);
 *
 *   // Move the element up 1px on each raf.
 *   let up = new Vector(1, 0, 0);
 *   this.vectorElement.position.add(rotate);
 *
 *   // Render updates the style.  It is automatically culled so only updated
 *   // when values change.
 *   this.vectorElement.render();
 * })
 *
 * ```
 *
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
 * vector.setTimeline(timeline);
 *
 * // Now update the vector to a specific "progress" in the timeline.
 * let currentProgress = 0.2; // Could be amount of scroll, range input, whatever.
 * vector.setTimeline(currentProgress);
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
 * vector.setTimeline(timeline);
 * // Set the timeline mode to catmullrom.  Any easing functions
 * // will get ignored.
 * vector.timelineCatmullRomMode = true;
 * // Change the default tension if you wish.
 * vector.timelineCatmullRomTension = 1.2;
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
 * new VectorDom(myElement, { cssTimelineOnly: true});
 *
 * ```
 * to indicate that you only want to use this VectorDom with the timeline feature.
 * The timeline feature would only accept css var property keys.
 *
 *
 *
 * #### Element Visibility
 *
 * Each vector dom also tracks it's visility on the page using elmeentVisiblity.
 * You can access the element state with it.
 *
 * ```ts
 *
 * let v = new VectorDom(myElement);
 * v.state().inview; // true or false.  The element is current inview.
 *
 *
 * // Render only if this element is inview.
 * v.state().inview && v.render();
 *
 * ```
 *
 *
 * #### Render When in View
 *
 * By default, the DOM will update when the element is inview.
 * You can turn of this feature by setting it to false which will update the
 * DOM even when the element is out of view.
 *
 * ```
 * vectorElement.renderOnlyWhenInview = false;
 *
 * ```
 *
 * See more demo in /examples/vector-dom and /examples/scroll-demo
 *
 *
 * ############# GOTCHAS ###################
 * globalPosition
 *   In order to avoid layout thrashing, VectorDom internally calculates the
 *   globalPosition.  However this relies on the document.body to not have
 *   padding.
 */
export class VectorDom {
    /**
     * The html element that VectorDom should control.
     */
    private element: HTMLElement;

    /**
     * The position of this html element.  Z value refers to scale.
     */
    private position: Vector;

    /**
     * The acceleration of this element.
     */
    private acceleration: Vector;

    /**
     * The velocity of this element.
     */
    private velocity: Vector;

    /**
     * The rotation of this html element.
     */
    private rotation: Vector;

    /**
     * An internal rotation cache to keep track of how much mouse force is being
     * applied on the element.  Starts at Vector.ZERO and tied to the
     * addMouseRotationPushForce method.
     */
    private rotationMouseForce: Vector;

    /**
     * An internal rotation cache to keep track of how much scrollY force is being
     * applied on the element.  Starts at Vector.ZERO and tied to the
     * addScrollYRotationForce method.
     */
    private rotationScrollYForce: Vector;

    /**
     * The total offset of this vector.  This is useful in realigning centeral
     * coordinates.
     */
    private offset: Vector;

    /**
     * The base zIndex scalar value.  As elements are scaled, the closer they are,
     * they get a higher index.  This is the scalar for the zIndex.
     */
    public zIndexScalar: number;

    /**
     * The element width.
     */
    public width: number;

    /**
     * The anchor point to calculate x, y positions. Defaults to the center of
     * the element.
     */
    public anchorX: number;
    public anchorY: number;

    /**
     * The element height.
     */
    public height: number;


    /**
     * The global x and y positions of this element in relation to the current
     * window.  This value would be 0, 0 if the element is currently in view and
     * in the top right corner.  It's effectively the same as getBoundingRect
     * top and left but it is internally calculated to optimize performance.
     *
     * Note this represents the cached value so this value should not be used
     * directly as it can be outdated.
     *
     * Use globalPosition vector for an up to date value of global x, y positioning.
     */
    private gx_: number;
    private gy_: number;

    /**
     * The opacity of this object.
     */
    public alpha: number;

    /**
     * Sets the transform origin of this VectorDom.
     */
    public transformOrigin: string;

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
    private timeline: Array<VectorDomTimeline> | null;

    /**
     * An internal list of all recorded timeline keys.
     */
    private timelineKeys: Array<string>;
    /**
     * Whether this is a vector that will only be used for css timeline.
     * If set to true, the default vector functionality will not be applied
     * and effectively, ONLY the timeline functionality with css variable keys
     * will work.
     */
    public cssTimelineOnly: boolean;


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
     * The instance of documentMouseTracker, making it readily available in
     * VectorDom
     */
    public mouse: MouseTracker;


    /**
     * Internal instance of domWatcher.
     */
    private watcher: DomWatcher;


    /**
     * Internal instance of element visibility.
     */
    public elementVisibility: ElementVisibilityObject;

    /**
     * Whether to prevent DOM render updates when the element is out of view.
     * This prevents this class from updating the element style or css variables
     * if it is out of view.
     * The default is true to provide performance benefits.
     */
    public renderOnlyWhenInview: boolean;

    constructor(element: HTMLElement, options?: VectorDomOptions) {
        this.element = element;
        this.offset = Vector.ZERO;
        this.position = Vector.ZERO;
        this.acceleration = Vector.ZERO;
        this.velocity = Vector.ZERO;
        this.rotation = Vector.ZERO;
        this.rotationMouseForce = Vector.ZERO;
        this.rotationScrollYForce = Vector.ZERO;
        this.transformOrigin = 'center center';
        this.setCssKeys_ = func.runOnceOnChange(this.setCssKeys_.bind(this));
        this.width = element.offsetWidth;
        this.height = element.offsetHeight;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.alpha = 1;
        this.zIndexScalar = 30;
        this.timeline = null;
        this.timelineKeys = [];
        this.timelineCatmullRomMode = false;
        this.timelineCatmullRomTension = 1;
        this.mouse = documentMouseTracker;
        this.watcher = new DomWatcher();
        this.renderOnlyWhenInview = true;
        this.gx_ = 0;
        this.gy_ = 0;
        this.cssTimelineOnly =
            func.setDefault(options && options.cssTimelineOnly, false);

        // Add element visibility to the VectorDom.
        this.elementVisibility = elementVisibility.inview(this.element);

        this.watcher.add({
            element: window,
            on: 'resize',
            callback: this.calculateSize.bind(this),
            eventOptions: { passive: true }
        })

        // Make sure render only runs when changes are detected.
        this.render_ = func.runOnceOnChange(this.render_.bind(this));

        this.calculateSize();
        this.setTransformOrigin();
    }


    calculateSize() {
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;

        // Cache the global gx_ and gy_ values.
        let bounds = this.bounds;
        this.gx_ = bounds.left;
        this.gy_ = bounds.top + globalWindow.scrollY;
    }


    setTransformOrigin(value: string = 'center center') {
        if (this.cssTimelineOnly) {
            return;
        }
        this.transformOrigin = value;
        this.element.style.transformOrigin = 'center center';
    }

    setPosition(v: Vector) {
        this.position = v;
    }

    get x(): number {
        return this.position.x;
    }

    set x(value: number) {
        this.position.x = value;
    }

    get y(): number {
        return this.position.y;
    }
    set y(value: number) {
        this.position.y = value;
    }

    get z(): number {
        return this.position.z;
    }

    set z(value: number) {
        this.position.z = value;
    }

    get vx(): number {
        return this.velocity.x;
    }

    set vx(value: number) {
        this.velocity.x = value;
    }

    get vy(): number {
        return this.velocity.y;
    }

    set vy(value: number) {
        this.velocity.y = value;
    }

    get vz(): number {
        return this.velocity.z;
    }

    set vz(value: number) {
        this.velocity.z = value;
    }


    get ax(): number {
        return this.acceleration.x;
    }

    set ax(value: number) {
        this.acceleration.x = value;
    }

    get ay(): number {
        return this.acceleration.y;
    }

    set ay(value: number) {
        this.acceleration.y = value;
    }

    get az(): number {
        return this.acceleration.z;
    }

    set az(value: number) {
        this.acceleration.z = value;
    }

    get rx(): number {
        return this.rotation.x;
    }

    set rx(value: number) {
        this.rotation.x = value;
    }

    get ry(): number {
        return this.rotation.y;
    }

    set ry(value: number) {
        this.rotation.y = value;
    }

    get rz(): number {
        return this.rotation.z;
    }

    set rz(value: number) {
        this.rotation.z = value;
    }

    /**
     * Gets the global position of this element in relation to the window.
     * If the element is in the top, left of the window, this value would
     * would return 0,0.
     *
     * Note that this value is to the 0,0 (top left) position of the element.
     * It doesn't account for anchorX or anchorY.
     */
    get globalPosition() {

        const anchorOffsetVector = new Vector(
            -(this.anchorX * this.width),
            -(this.anchorY * this.height),
            0
        )
        let x = this.gx_ + this.offset.x + anchorOffsetVector.x;
        let y = this.gy_ - globalWindow.scrollY + this.offset.y + anchorOffsetVector.y;
        return new Vector(x, y);
    }

    /**
     * The global element center position.  This is the x,y in relation to
     * the current window view to the center of the element.   If this value
     * is 0,0, the "center" of the element is at the top left of the window.
     *
     * In short, this is asking, where on the screen is the center coordinates
     * of the element.
     */
    get globalElementCenterPosition() {
        const g = this.globalPosition.clone();
        // const hw = (this.width * (this.z + 1)) / 2;
        // const hh = (this.height * (this.z + 1)) / 2;
        const hw = this.width / 2;
        const hh = this.height / 2;
        const x = g.x + hw;
        const y = g.y + hh;
        return new Vector(x, y);
    }


    /**
     * The element bounds including left, top, width, height. Watch out calling
     * this on RAF since it can cause layout thrashing.  If possible,
     * use other values since they are cached.  Consider using globalPosition instead
     * which is more optimized.
     *
     * Since this is using getBoundingClientRect() it is the rendered width / height versus
     * actual.
     */
    get bounds() {
        return this.element.getBoundingClientRect();
    }

    setOffset(v: Vector) {
        this.offset = v;
    }

    setRotation(v: Vector) {
        this.rotation = v;
    }

    /**
     * Takes the current position x,y,z vector points and converts it over to
     * a 4x4 matrix with just consideration for translation.
     * [
     *  0 0 0 x
     *  0 0 0 y
     *  0 0 0 z
     *  0 0 0 1
     * ]
     *
     *
     * Example of applying vector positions to dom elements.
     *
     * ```ts
     *
     * // Create a vector
     *  let ballPosition = new Vector(100, 200, 0);
     *
     *
     * // Take those vector positions and convert that into a translation matrix.
     * let matrix = ballPosition.toTranslationMatrixIV()
     *
     * // Convert that to a css 3d translation.
     * let ms = matrix.toCss3dMatrix();
     * ball.style.transform = ms;
     *
     * ```
     *
     * @return {MartrixIV}
     */
    toTranslationMatrixIV(): MatrixIV {
        const positionVector = this.position.clone();

        const matrix = new MatrixIV();
        matrix.setVectorColumn(3, positionVector);
        return matrix;
    }


    /**
     * Takes the rotation, scale and translation matrices and combines them
     * into one.
     */
    toMatrixIV(): MatrixIV {
        const translationMatrix = this.toTranslationMatrixIV();

        // Account for anchor offsets.
        const anchorOffsetVector = new Vector(
            -(this.anchorX * this.width),
            -(this.anchorY * this.height),
            0
        )


        const offsetMatrix = new MatrixIV();
        const offsetVector = this.offset.clone().add(anchorOffsetVector);
        offsetMatrix.setVectorColumn(3, offsetVector);

        // Scale based on the z position.
        let z = mathf.clamp(-1, 10, this.position.z + 1);

        const scaleMatrix = new MatrixIV().scaleXyz(z, z, z);
        const rotationMatrix = new MatrixIV().ypr(
            this.rotation.x, this.rotation.y, this.rotation.z);

        // Apply SRT.
        return scaleMatrix
            .multiply(rotationMatrix)
            .multiply(translationMatrix)
            .multiply(offsetMatrix);
    }


    toCss3dMatrix(): string {
        const matrixValue = this.toMatrixIV().toCss3dMatrix();
        return matrixValue;
    }


    /**
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
    setTimeline(timeline: Array<VectorDomTimeline>) {
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

    setTimelineProgress(progress: number) {
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


    render() {
        // Update the position based on velocity and acceleration.
        // Has not effect if you just directly update the position.
        this.velocity.ease(this.acceleration, 1, EASE.linear);
        this.position.add(this.velocity);
        const matrixValue = this.toCss3dMatrix();
        this.render_(matrixValue, this.alpha);



        // Add all registered css keys.
        let cssVars = [];
        for (let key in this) {
            if (key.startsWith('--')) {
                cssVars.push({
                    'name': key,
                    'value': this[key]
                });
            }
        }

        this.setCssKeys_(cssVars);
    }

    /**
     * Applies the css transform to this object.  Unneccesary calls get culled by
     * func.runOnceOnChange.
     */
    private render_(transform: string, alpha: number) {
        if (this.cssTimelineOnly) {
            return;
        }


        /**
         * Render this element only when it is inview for performance boost.
         */
        if (this.renderOnlyWhenInview &&
            this.elementVisibility.state().ready &&
            !this.elementVisibility.state().inview) {
            return;
        }

        this.element.style.transform = transform;
        this.element.style.opacity = alpha + '';
        this.element.style.zIndex =
            (this.zIndexScalar * (this.position.z + 1) >> 0) + '';
    }



    /**
     * Applies the css variables.  Unneccesary calls get culled by
     * func.runOnceOnChange.
     */
    private setCssKeys_(cssVars: Array<Object>) {

        /**
         * Render this element only when it is inview
         * for performance boost.
         */
        if (this.renderOnlyWhenInview &&
            this.elementVisibility.state().ready &&
            !this.elementVisibility.state().inview) {
            return;
        }

        cssVars.forEach((cssVar) => {
            dom.setCssVariable(this.element, cssVar['name'], cssVar['value']);
        })
    }


    /**
     * Takes the distance to the mouse position as a force and applies an
     * effect where the mouse "pushes" the element.  This creates a slight
     * interaction effect.
     *
     * The push force is added to the rotation vector.
     *
     * Note this is rather experiemental at this point and it may cause
     * side effects.
     *
     * This method should be called PRIOR to calling render in the render loop.
     *
     *
     * Example:
     *
     * ```ts
     *
     * let myVector = new VectorDom(element);
     *
     * new Raf(()=> {
     *
     *   myVector.addMouseRotationForce();
     *   myVector.render();
     *
     * }).start();
     *
     *
     * ```
     *
     *
     * To pull the element towards the mouse, you can pass negative scale values.
     *
     * ```ts
     *
     * let myVector = new VectorDom(element);
     * new Raf(()=> {
     *   myVector.addMouseRotationForce(-0.0005, -0.0005, 0, 0.03);
     *   myVector.render();
     * }).start();
     *
     * ```
     */
    public addMouseRotationForce(
        xScalar: number = 0.0005,
        yScalar: number = 0.0005, zScalar: number = 0.0005, lerp: number = 0.02) {
        let globalMousePosition = this.mouse.position.clone();
        globalMousePosition.y = globalMousePosition.y - globalWindow.scrollY;

        // Get the angle difference between the mouse and the center of this element.
        let angleDelta = Vector.getXyzRotationTo(
            this.globalElementCenterPosition,
            globalMousePosition
        )

        // Scale the angleDelta.
        angleDelta[0] = angleDelta[0] * xScalar;
        angleDelta[1] = angleDelta[1] * yScalar;
        angleDelta[2] = angleDelta[3] * zScalar;

        // Make that into a vector.
        let targetRotation = Vector.fromArray(angleDelta);

        // TODO (uxder) Is rx inverted?
        targetRotation.x = -targetRotation.x;

        // Now in memory lerp that rotationMouseForce (an internal mouse rotation
        // only value).
        this.rotationMouseForce.lerp(targetRotation, lerp);

        // Now get the difference between the target rotation and rotationmouseForce.
        // and apply that to the main rotation vector.
        // This effectively, applies the force to the main rotation vector
        // but as the internal rotationMouseForce gets closer to the target rotation
        // value the force will lessen.  It effectively, clamps the rotations.
        let diffVector = Vector.subtract(
            this.rotationMouseForce, targetRotation);

        this.rotation.add(diffVector);
    }



    /**
     * Based on the center of the window, adds a rotational force to this element.
     * Basically, when the element reaches the center of the screen, this
     * force would be 0 and the farther it gets aways from the center, more
     * rotatonal force is applied to the element.
     *
     * Since this is based only the y axis, you can apply the force in different ways.
     *
     *
     * This example is a basic example in which the element gets pulls in
     * rotationY based on its distance to the center Y of the screen.
     *
     * ```ts
     *
     * let myVector = new VectorDom(element);
     * new Raf(()=> {
     *   myVector.addScrollYRotationForce();
     *   myVector.render();
     * }).start();
     *
     * ```
     *
     *
     *
     * This example is a basic example in which the element gets pulls in
     * rotationX based on its distance to the center Y of the screen.
     *
     * ```ts
     *
     * let myVector = new VectorDom(element);
     * new Raf(()=> {
     *   myVector.addScrollYRotationForce(-0.0004, 0);
     *   myVector.render();
     * }).start();
     *
     * ```
     */
    public addScrollYRotationForce(
        xScalar: number = 0,
        yScalar: number = 0.0005, zScalar: number = 0, lerp: number = 0.02) {

        let windowCenter = new Vector(
            globalWindow.width / 2,
            globalWindow.height / 2);

        // Override the x and z values to the same coordinate as the element
        // sicne we don't care about the delta between those.
        windowCenter.x = this.globalElementCenterPosition.x;
        windowCenter.z = this.globalElementCenterPosition.z;

        // Get the angle difference between window center and the center of this element.
        let angleDelta = Vector.getXyzRotationTo(
            this.globalElementCenterPosition,
            windowCenter
        )

        // Since this is adding scrollY force, the amount of force we add to
        // the x and z is going to be the distance delta of y.
        angleDelta[0] = angleDelta[1] * xScalar;
        angleDelta[2] = angleDelta[2] * zScalar;

        // Scale the y angleDelta.
        angleDelta[1] = angleDelta[1] * yScalar;

        // Make that into a vector.
        let targetRotation = Vector.fromArray(angleDelta);

        // TODO (uxder) Is rx inverted?
        targetRotation.x = -targetRotation.x;

        // We want an effect where the mouse "PUSHes" away the element
        // The getXyzRotationTo is a more pull so we negate the value.
        // targetRotation.negate();

        // Now in memory lerp that rotationMouseForce (an internal mouse rotation
        // only value).
        this.rotationScrollYForce.lerp(targetRotation, lerp);

        // Now get the difference between the target rotation and rotationmouseForce.
        // and apply that to the main rotation vector.
        // This effectively, applies the force to the main rotation vector
        // but as the internal rotationMouseForce gets closer to the target rotation
        // value the force will lessen.  It effectively, clamps the rotations.
        let diffVector = Vector.subtract(
            this.rotationScrollYForce, targetRotation);

        this.rotation.add(diffVector);
    }


    dispose() {
        this.watcher.dispose();
        this.elementVisibility.dispose();
    }

}