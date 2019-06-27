

import { EASE } from '../ease/ease';
import { mathf } from '../mathf/mathf';
import { MatrixIV } from '../mathf/matrixIV';
import { Vector } from '../mathf/vector';
import { func } from '../func/func';
import { is } from '../is/is';
import { dom } from '../dom/dom';
import { HermiteCurve } from '../mathf/hermite-curve';
import { Interpolate } from '../interpolate/interpolate';

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
 * See more demo in /examples/vector-dom and /examples/scroll-demo
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

    constructor(element: HTMLElement, options?: VectorDomOptions) {
        this.element = element;
        this.offset = Vector.ZERO;
        this.position = Vector.ZERO;
        this.acceleration = Vector.ZERO;
        this.velocity = Vector.ZERO;
        this.rotation = Vector.ZERO;
        this.transformOrigin = 'center center';
        this.render_ = func.runOnceOnChange(this.render_.bind(this));
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
        this.cssTimelineOnly =
            func.setDefault(options && options.cssTimelineOnly, false);
        this.calculateSize();

        this.setTransformOrigin();
    }

    calculateSize() {
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
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
        console.log(this.timeline);

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
            let start = this[key];
            let startProgress = 0;
            let end: any = null;
            let endProgress = 1;
            let easing = null;
            let previous = null;

            // Look up the start and end values for this key in based on
            // the current progress.
            this.timeline && this.timeline.forEach((timeline) => {
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

                if (value) {
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
        cssVars.forEach((cssVar) => {
            dom.setCssVariable(this.element, cssVar['name'], cssVar['value']);
        })
    }

}