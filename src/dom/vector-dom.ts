

import globalWindow from './global-window';
import documentMouseTracker from './document-mouse-tracker';
import { EASE } from '../ease/ease';
import { mathf } from '../mathf/mathf';
import { MatrixIV } from '../mathf/matrixIV';
import { Vector } from '../mathf/vector';
import { func } from '../func/func';
import { is } from '../is/is';
import { MouseTracker } from './mouse-tracker';
import { DomWatcher } from './dom-watcher';
import { ElementVisibilityObject, elementVisibility } from './element-visibility';
import { VectorDomTimeline, VectorDomTimelineOptions } from './vector-dom-timeline';



/**
 * VectorDom Component interface.
 */
export interface VectorDomComponent {
    init: Function
    render: Function
    resize: Function
    dispose: Function
}


export interface VectorDomOptions {
    timeline?: VectorDomTimelineOptions
}


/**
 * VectorDom is a general object is similar to a GameObject in many engines (but
 * much simpler).
 *
 * Vector-DOM allows you to specify the position (vec3), rotation (vec3) of an
 * html element using matrix3d transforms.
 *
 * The z value of the position vector gets translated as the scale.
 *
 *
 * ## Basic Usage:
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
 * // After setting intial positions and options, run initialize.
 * vectorElement.init();
 *
 *
 * new Raf(()=> {
 *   // On each raf, let's rotate the element.
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
 * vectorDom.renderOnlyWhenInview = false;
 *
 * ```
 *
 *
 *
 * #### Components
 *
 * VectorDom extends functionality via components.
 * Components can be access via `.components` or `._` for shorthand.
 *
 * These two are the same thing.
 *
 * ```ts
 *
 * vectorDom.components.timeline.setProgress(0.4);
 * vectorDom._.timeline.setProgress(0.4);
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
    public element: HTMLElement;

    /**
     * The position of this html element.  Z value refers to scale.
     */
    protected position: Vector;

    /**
     * The acceleration of this element.
     */
    protected acceleration: Vector;

    /**
     * The velocity of this element.
     */
    protected velocity: Vector;

    /**
     * The rotation of this html element.
     */
    protected rotation: Vector;

    /**
     * An internal rotation cache to keep track of how much mouse force is being
     * applied on the element.  Starts at Vector.ZERO and tied to the
     * addMouseRotationPushForce method.
     */
    protected rotationMouseForce: Vector;

    /**
     * An internal rotation cache to keep track of how much scrollY force is being
     * applied on the element.  Starts at Vector.ZERO and tied to the
     * addScrollYRotationForce method.
     */
    protected rotationScrollYForce: Vector;

    /**
     * The total offset of this vector.  This is useful in realigning centeral
     * coordinates.
     */
    protected offset: Vector;

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
    protected gx_: number;
    protected gy_: number;

    /**
     * The opacity of this object.
     */
    public alpha: number;

    /**
     * Sets the transform origin of this VectorDom.
     */
    public transformOrigin: string;

    /**
     * The instance of documentMouseTracker, making it readily available in
     * VectorDom
     */
    public mouse: MouseTracker;


    /**
     * Internal instance of domWatcher.
     */
    protected watcher: DomWatcher;


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


    /**
     * An option to prevent VectorDom to writing out to the "style" attribute
     * of the element.  This option maybe used when you want to just use VectorDom
     * to calculate positions and transforms in memory but not actually have
     * VectorDom update the style value of the element.  It is also used by
     * VectorDomTimeline cssOnly option where the user can option to update
     * element positions via css variables.
     *
     * This value defaults to false.
     */
    public disableStyleRenders: boolean;

    /**
     * The list of options passed to VectorDom upon creation.
     */
    public options: VectorDomOptions;

    /**
     * VectorDom extension components that add funcitonality to the base
     * VectorDom.
     */
    public components: { [name: string]: VectorDomComponent };
    /**
     * An alias to components.  This makes it shorter to write out components.
     */
    public _: { [name: string]: VectorDomComponent };

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
        this.width = element.offsetWidth;
        this.height = element.offsetHeight;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.alpha = 1;
        this.zIndexScalar = 30;
        this.mouse = documentMouseTracker;
        this.watcher = new DomWatcher();
        this.renderOnlyWhenInview = true;
        this.options = options || {};
        this.disableStyleRenders = false;

        this.gx_ = 0;
        this.gy_ = 0;

        // Add element visibility to the VectorDom.
        this.elementVisibility = elementVisibility.inview(this.element);

        this.watcher.add({
            element: window,
            on: 'resize',
            callback: this.resize.bind(this),
            eventOptions: { passive: true }
        })

        // Initialize all components.
        this.components = {
            /**
             * The vector dom timeline component.
             */
            timeline: new VectorDomTimeline(this)
        }
        // Create an alias to components.
        this._ = this.components;
    }

    init() {

        this.resize();
        this.setTransformOrigin();

        for (let key in this.components) {
            this.components[key].init();
        }

        // Make sure render only runs when changes are detected.
        this.render_ = func.runOnceOnChange(this.render_.bind(this));
    }


    resize() {
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;

        // Cache the global gx_ and gy_ values.
        let bounds = this.bounds;
        this.gx_ = bounds.left;
        this.gy_ = bounds.top + globalWindow.scrollY;

        // Update components.
        for (let key in this.components) {
            this.components[key].resize();
        }
    }


    setTransformOrigin(value: string = 'center center') {
        if (this.disableStyleRenders) {
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


    render() {

        // Components render out first.
        for (let key in this.components) {
            this.components[key].render();
        }

        // Update the position based on velocity and acceleration.
        // Has not effect if you just directly update the position.
        this.velocity.ease(this.acceleration, 1, EASE.linear);
        this.position.add(this.velocity);
        const matrixValue = this.toCss3dMatrix();

        this.render_(matrixValue, this.alpha);

    }

    /**
     * Applies the css transform to this object.  Unneccesary calls get culled by
     * func.runOnceOnChange.
     */
    private render_(transform: string, alpha: number) {
        if (this.disableStyleRenders) {
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

        for (let key in this.components) {
            this.components[key].dispose();
        }

        this.watcher.dispose();
        this.elementVisibility.dispose();

    }

}