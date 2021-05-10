import documentMouseTracker from './document-mouse-tracker';
import {EASE} from '../ease/ease';
import {mathf} from '../mathf/mathf';
import {MatrixIV} from '../mathf/matrixIV';
import {Vector} from '../mathf/vector';
import {Quaternion} from '../mathf/quaternion';
import {func} from '../func/func';
import {is} from '../is/is';
import {MouseTracker} from './mouse-tracker';
import {DomWatcher} from './dom-watcher';
import {ElementVisibilityObject, elementVisibility} from './element-visibility';
import {
  VectorDomTimeline,
  VectorDomTimelineOptions,
} from './vector-dom-timeline';
import {VectorDomForce} from './vector-dom-force';

/**
 * VectorDom Component interface.
 */
export interface VectorDomComponent {
  init: Function;
  render: Function;
  resize: Function;
  dispose: Function;
}

export interface VectorDomOptions {
  timeline?: VectorDomTimelineOptions;
}

/**
 * VectorDom is a general object is similar to a GameObject in many engines (but
 * much simpler).
 *
 * Vector-DOM allows you to specify the position (vec3), rotation (Quaternion) of
 * an html element using matrix3d transforms.
 *
 * The z value of the position vector gets translated as the scale and z-index
 * is automatically adjusted based on the depth.
 *
 *
 * #### Basic Usage:
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
 *
 * // Sets the Eular based rotation. See more on rotation below.
 * vectorElement.setRotation( new Vector(30, 20, 10));
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
 *   this.vectorElement.rx += 0.03;
 *   this.vectorElement.ry += 0.03;
 *   this.vectorElement.rz += 0.03;
 *
 *   // Move the element up 1px on each raf.
 *   let up = new Vector(1, 0, 0);
 *   this.vectorElement.position.add(rotate);
 *
 *   // Render updates the style.  It is automatically culled so only updated
 *   // when values change.
 *   this.vectorElement.render(true);
 * })
 *
 * ```
 *
 * #### Element Visibility
 *
 * Each vector dom also tracks its visility on the page using elementVisiblity.
 * You can access the element state with it.
 *
 * ```ts
 *
 * let v = new VectorDom(myElement);
 * v.state().inview; // true or false.  The element is current inview.
 * v.state().inview && doSomething();
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
 * ```ts
 *
 * vectorDom.renderOnlyWhenInview = false;
 *
 * ```
 *
 * #### Rotations
 *
 * VectorDom uses Quaternions under the hood but provides ways to think in terms
 * of Euler rotations.
 *
 * In the object, internal Euler rotations are cached in `eulerRotation` and
 * the quaternion rotation is cache in `rotation`.
 *
 * At the core, on each render, the quaternion rotation is USED to create the
 * rotation matrix.  This means that ultimately, VectorDOM is a quaternion
 * based system to avoid the issues associated with Euler rotation (gimbal lock).
 *
 * So while you can update the values of `eularRotation`, changing those
 * values, will have NO effect unless, you sync it and tell VectorDOM to
 * use the current eularRotation values and apply that to VectorDOM.
 *
 *
 * To do this, run `syncEularRotation` and VectorDOM will internally,
 * convert the current eularRotation values and OVERWRITE the rotation quaternion
 * values - effectively, setting and applying the eular rotation to the VectorDOM.
 *
 * ```ts
 *
 * // Tell Vector dom to update internal rotation with the values of
 * // eularRotation.
 * vectorDom.syncEularRotation();
 * vectorDom.render();
 *
 * ```
 *
 * By using this, you can manipulate the rotation values in Euler.
 *
 * ```ts
 *
 * vectorDom.rx = 90;  // Set rotationX to 90 degrees.
 * vectorDom.eularRotation.x = 90;  // Same as above, set rotationX to 90 degrees.
 *
 * // Sync it and render it.
 * vectorDom.syncEularRotation();
 * vectorDom.render();
 *
 *
 * // Sets the euler rotation and quaternion rotation at once at anytime.
 * vectorDom.setRotation(new Vector(180, 90, 0));
 *
 * ```
 *
 * To keep it short you can also just pass, `true` to the render, which will tell
 * VectorDom that you want to sync on every render.
 *
 * ```ts
 *
 * vectorDom.render(true);
 *
 * ```
 *
 *
 * Now if you prefer to use quaternions, you can access the internal rotation
 * and NOT sync the eular rotation.  Using quaternions will have more flexibility.
 *
 *
 * ```ts
 * // Set the X rotation to 90.
 * let q = Quaternion.fromEuler(90, 0, 0);
 * vectorDom.rotation = q;
 * vectorDom.render();
 *
 * ```
 *
 * You can do more advanced things as well.
 *
 * ```ts
 * // Set initial rotation.
 * vectorDom.rotation = Quaternion.fromEular(30,30,30);
 *
 * // Add 90 degrees in X rotation to whatever it is now.
 * vectorDom.rotation.addEular(90, 0, 0);
 *
 * // Another way to do it.
 * // Add rotation by 90 degrees in X and 20 degress in y and 10 on the Z.
 * let xRadian = mathf.degreesToRadian(90);
 * let yRadian = mathf.degreesToRadian(20);
 * let zRadian = mathf.degreesToRadian(10);
 * let q1 = Quaternion.IDENTITY.angleAxis(xRadian, Vector.RIGHT); // x
 * let q2 = Quaternion.IDENTITY.angleAxis(yRadian, Vector.UP); /// y
 * let q3 = Quaternion.IDENTITY.angleAxis(yRadian, Vector.FORWARD); /// Z
 * vectorDOm.rotation.multiply(q1).multiply(q2).multiply(q3);
 *
 *
 * // Slerp to a specific Euler degree.
 *  let target = Quaternion.fromEuler(90, 20, 0);
 *  myQuat.slerp(target, this.progress);
 *
 *
 * // Lastely render without the sync option.
 * vectorDom.render();
 * ```
 *
 * Getting Eular values from Quaternion.  In general, it is a one way street
 * for now in which you can convert from Euler -> Quaternion but not the other
 * way around.  If needed, you can use the following but there are some rare
 * accuracy issues at the moment.
 *
 * ```ts
 * let eularRotation = vectorDom.rotation.toEulerVector();
 * eularRotation.x // the x rotation in degrees
 * eularRotation.y // the y rotation in degrees
 * eularRotation.z // the z rotation in degrees
 *
 * ```
 *
 * To reiterate, the sync option overwrite the Eular rotation so doing this
 * won't work.
 *
 * ```ts
 *
 * // Internally update the quaternion rotation.
 *  let target = Quaternion.fromEuler(90, 20, 0);
 *  myQuat.slerp(target, this.progress);
 *
 * // Now the eularRotation which was still at 0,0,0 overwrote the internal
 * // quaternion values.
 * this.syncEularRotation();
 *
 * // vectorDom will remain at 0,0,0.
 * vectorDom.render();
 * ```
 *
 *
 * The best of both worlds is that Quaternions are good at slerping and euler
 * is more intuitive.  You can use the internal rx, ry, rz values in degrees,
 * then apply that to the final quaternion rotation.
 *
 * ```ts
 *
 * // Add some rotation to eularRotation and then slerp the quaternion rotation.
 * this.flowerVector.eularRotation.x += 0.1;
 * this.flowerVector.rotation.slerpEulerVector(
 *     this.flowerVector.eularRotation, 0.08);
 * this.render();
 *
 * ```
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
 * #### Other notes
 * - globalPosition
 *   Don't add padding to body element.
 *   In order to avoid layout thrashing, VectorDom internally calculates the
 *   globalPosition.  However this relies on the document.body to not have
 *   padding.
 * - globalPosition
 *   Global position attempts to optimize calls to getBoundClientRect.
 *   If you are having issues with this, try setting useBoundsForGlobalCalculation
 *   to true.
 *
 * @unstable
 */
export class VectorDom {
  /**
   * The html element that VectorDom should control.
   */
  public element: HTMLElement;

  /**
   * The position of this html element.  Z value refers to scale.
   */
  public position: Vector;

  /**
   * The acceleration of this element.
   */
  public acceleration: Vector;

  /**
   * The velocity of this element.
   */
  public velocity: Vector;

  /**
   * The rotation of this VectorDom in Quaternion.  See setRotation to set
   * this in Eular angles and also rx, ry, rz.
   */
  public rotation: Quaternion;
  public eularRotation: Vector;

  /**
   * The total offset of this vector.  This is useful in realigning centeral
   * coordinates.
   */
  public offset: Vector;

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
   * Whether to use getBoundingClientRect to calculate the global position
   * of the element.  This is turned to "false" by default and instead,
   * the global position is calculated internally based on the amount of
   * scroll.  However, this value can be incorrect if your VectorDom element
   * resides inside of a position "sticky" in which case, the positioning
   * goes off.
   *
   * In short, if you are using position sticky or some other crazy layouting
   * system and having issues with globalElementCenter or globalPosition
   * try setting this to true.
   */
  public useBoundsForGlobalCalculation: boolean;

  /**
   * An option to prevent VectorDom to writing out to the "style" attribute
   * of the element.  This option maybe used when you want to just use VectorDom
   * to calculate positions and transforms in memory but not actually have
   * VectorDom update the style value of the element.  It is also used by
   * VectorDomTimeline cssOnly option where the user can option to update
   * element positions via css variables.
   *
   * A common usecase to enable this might when you want to NOT use the
   * internal VectorDom matrix system that updates the DOM transform3d and
   * instead just use the VectorDOM timeline feature with css variables.
   *
   * This value defaults to false.
   */
  public disableStyleRenders: boolean;

  /**
   * An option to completely ignore the internal quaternion based rotation and
   * instead use `eularRotation` values as the rotational matrix.  Since this
   * forces VectorDOM to use eularRotation instead (which is not the default),
   * this option may make certain components not work
   * (since they need Quaternions).  Defaults to false.
   */
  public eularRotationAsRotationMatrix: boolean;

  /**
   * The list of options passed to VectorDom upon creation.
   */
  public options: VectorDomOptions;

  /**
   * The forced zIndex for this VectorDom.  This defaults to null where
   * VectorDom will automatically calculate the zIndex based on the depth of the
   * object.  Set zIndex only if you want to override this.
   */
  public forcedZIndex: number | null;

  /**
   * In the render loop, whether to create a project, view matrix
   * and render this VectorDom in a pseudo3dworld.
   *
   * This is turned on by default to assist with calculating certain
   * methods but for most cases, you may be able to turn this off
   * for a performance boost.
   */
  public renderWith3dProjectMatrix: boolean;

  /**
   * VectorDom extension components that add funcitonality to the base
   * VectorDom.
   */
  public components: {[name: string]: VectorDomComponent};
  /**
   * An alias to components.  This makes it shorter to write out components.
   */
  public _: {[name: string]: VectorDomComponent};

  constructor(element: HTMLElement, options?: VectorDomOptions) {
    this.element = element;
    this.offset = Vector.ZERO;
    this.position = Vector.ZERO;
    this.acceleration = Vector.ZERO;
    this.velocity = Vector.ZERO;
    this.rotation = Quaternion.IDENTITY;
    this.eularRotation = Vector.ZERO;
    this.transformOrigin = 'center center';
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    this.anchorX = 0.5;
    this.anchorY = 0.5;
    this.alpha = 1;
    this.forcedZIndex = null;
    this.zIndexScalar = 30;
    this.mouse = documentMouseTracker;
    this.watcher = new DomWatcher();
    this.renderOnlyWhenInview = true;
    this.options = options || {};
    this.disableStyleRenders = false;
    this.useBoundsForGlobalCalculation = false;
    this.eularRotationAsRotationMatrix = false;
    this.renderWith3dProjectMatrix = true;

    this.gx_ = 0;
    this.gy_ = 0;

    // Add element visibility to the VectorDom.
    this.elementVisibility = elementVisibility.inview(this.element);

    this.watcher.add({
      element: window,
      on: 'resize',
      callback: this.resize.bind(this),
      eventOptions: {passive: true},
    });

    // Initialize all components.
    this.components = {
      /**
       * The vector dom timeline component.
       */
      timeline: new VectorDomTimeline(this),
      /**
       * The vector dom force component.
       */
      force: new VectorDomForce(this),
    };
    // Create an alias to components.
    this._ = this.components;

    // Memoize getBoundingClient .
    this.getBoundingClient = func.memoizeSimple(
      this.getBoundingClient.bind(this)
    ) as any;
    // Make sure render only runs when changes are detected.
    this.render_ = func.runOnceOnChange(this.render_.bind(this));
  }

  init() {
    this.resize();
    this.setTransformOrigin();

    for (const key in this.components) {
      this.components[key].init();
    }
  }

  resize() {
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    // Cache the global gx_ and gy_ values.
    const bounds = this.bounds;
    this.gx_ = bounds.left;
    this.gy_ = bounds.top + window.scrollY;

    // Update components.
    for (const key in this.components) {
      this.components[key].resize();
    }
  }

  setTransformOrigin(value = 'center center') {
    if (this.disableStyleRenders) {
      return;
    }
    this.transformOrigin = value;
    this.element.style.transformOrigin = 'center center';
  }

  setPosition(v: Vector) {
    this.position = v;
  }

  // /**
  //  * Returns the eularRotation Vector.
  //  */
  // get eularRotation() {
  //     return Quaternion.toEulerVector(this.rotation);
  // }

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
    return this.eularRotation.x;
  }

  set rx(value: number) {
    this.eularRotation.x = value;
  }

  get ry(): number {
    return this.eularRotation.y;
  }

  set ry(value: number) {
    this.eularRotation.y = value;
  }

  get rz(): number {
    return this.eularRotation.z;
  }

  set rz(value: number) {
    this.eularRotation.z = value;
  }

  /**
   * Gets the global position of this element in relation to the window.
   * If the element is in the top, left of the window, this value would
   * would return 0,0.
   *
   * This value can be incorrect if you element is in the sticky container
   * in which case, set the useBoundForGlobalCalculation to true.
   */
  get globalPosition() {
    let x = 0;
    let y = 0;
    const anchorOffsetVector = this.anchorOffsetVector;
    if (!this.useBoundsForGlobalCalculation) {
      x = this.gx_ + this.offset.x + anchorOffsetVector.x;
      y = this.gy_ - window.scrollY + this.offset.y + anchorOffsetVector.y;
    } else {
      x = this.bounds.left;
      y = this.bounds.top;
    }

    return new Vector(x, y, this.position.z);
  }

  /**
   * Returns the amount to offset to the center of the vectorDom
   * based on the anchor.
   */
  get anchorOffsetVector(): Vector {
    const anchorOffsetVector = new Vector(
      -(this.anchorX * this.width),
      -(this.anchorY * this.height),
      0
    );
    return anchorOffsetVector;
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
    let hw = this.width / 2;
    let hh = this.height / 2;
    if (this.useBoundsForGlobalCalculation) {
      hw = this.bounds.width / 2;
      hh = this.bounds.height / 2;
    }
    const x = g.x + hw;
    const y = g.y + hh;
    return new Vector(x, y, this.position.z);
  }

  /**
   * The element bounds including left, top, width, height. Watch out calling
   * this on RAF since it can cause layout thrashing.  If possible,
   * use other values since they are cached.  Consider using globalPosition instead
   * which is more optimized.
   *
   * Since this is using getBoundingClientRect() it is the
   * rendered width / height versus actual.
   */
  get bounds() {
    const bounds = this.getBoundingClient(
      window.scrollY,
      window.innerWidth,
      window.innerHeight
    );
    return bounds;
  }

  /**
   * Gets the bounding client rect. The scrollY, window width and height are
   * passed to memoize results and reevaluation happens when those values have
   * changed.
   */
  private getBoundingClient(
    y: number,
    width: number,
    height: number
  ): ClientRect {
    return this.element.getBoundingClientRect();
  }

  setOffset(v: Vector) {
    this.offset = v;
  }

  /**
   * Set the rotation with a Eular degree vector.  Note this method will
   * overwrite the internal Quaternion rotation.
   *
   * ```ts
   *
   * vectorDom.setRotation(new Vector(360, 0, 0));
   * ```
   * @param v
   */
  setRotation(v: Vector) {
    this.rotation = Quaternion.fromEulerVector(v);
    this.syncEularRotation();
  }

  /**
   * Tells VectorDom to use the eularRotation values and overrite the internal
   * Quaternion rotation (which is ultimately used to calculate and generate
   * the rotational matrix.)
   */
  syncEularRotation() {
    this.rotation = Quaternion.fromEulerVector(this.eularRotation);
  }

  /**
   * Similar to syncEularRotation, syncs and overwrites the quaternion
   * rotation execpt does it with a slerp.  Use in place of syncEularRotation
   * and add a slerp amount.
   *
   * In raf loop:
   * ```ts
   *
   * vectorDom.rx += 1
   * vectorDom.slerpEularRotation(0.08);
   * // Note we don't pass true here since we don't want to sync.
   * vectorDom.render();
   *
   * ```
   * @param amount The amount to slerp.
   */
  slerpEularRotation(amount: number) {
    this.rotation.slerpEulerVector(this.eularRotation, amount);
  }

  /**
   * Forces a zIndex on this VectorDom.  Normally, zIndex is auto calculated
   * by VectorDom based on the depth of the object.  This allows you to
   * force a given zIndex.  Pass null to release zIndex control back to
   * VectorDom.
   *
   * ```ts
   *
   * vectorDom.forceZIndex(20);
   * vectorDom.forceZIndex(null); // release control
   *
   * ```
   *
   * @param zIndex
   */
  forceZIndex(zIndex: number | null) {
    this.forcedZIndex = zIndex;
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
    );

    const offsetMatrix = new MatrixIV();
    const offsetVector = this.offset.clone().add(anchorOffsetVector);
    offsetMatrix.setVectorColumn(3, offsetVector);

    // Scale based on the z position.
    const z = mathf.clamp(-1, 10, this.position.z + 1);

    const scaleMatrix = new MatrixIV().scaleXyz(z, z, z);
    scaleMatrix.value[15] = 1;

    // Don't use YPR Eular because of gimble lock unless really needed.
    let rotationMatrix;
    if (this.eularRotationAsRotationMatrix) {
      const radianEular = this.eularRotation.clone().degreeToRadians();
      rotationMatrix = new MatrixIV().ypr(
        -radianEular.y,
        -radianEular.x,
        radianEular.z
      );
    } else {
      rotationMatrix = MatrixIV.fromQuaternion(this.rotation);
    }

    // Apply SRT.
    const baseMatrix = MatrixIV.IDENTITY.multiply(scaleMatrix)
      .multiply(rotationMatrix)
      .multiply(translationMatrix)
      .multiply(offsetMatrix);

    if (!this.renderWith3dProjectMatrix) {
      return baseMatrix;
    } else {
      const projectionMatrix = new MatrixIV().perspective(
        mathf.degreeToRadian(90),
        1,
        -1,
        100
      );

      const viewMatrix = new MatrixIV().lookAt(
        new Vector(0, 0, 1),
        new Vector(0, 0, 0),
        Vector.DOWN
      );

      return projectionMatrix.multiply(viewMatrix).multiply(baseMatrix);
    }
  }

  toCss3dMatrix(): string {
    const matrixValue = this.toMatrixIV().toCss3dMatrix();
    return matrixValue;
  }

  /**
   * Renders the VectorDom.
   * @param {syncEularRotation} Whether to sync the eular rotation on each
   *   render.  Defaults to true but turn off if you want to manipulate the
   *   internal quaternion rotation.
   */
  render(syncEularRotation = false) {
    if (syncEularRotation) {
      this.syncEularRotation();
    }

    // Components render out first.
    for (const key in this.components) {
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
    if (
      this.renderOnlyWhenInview &&
      this.elementVisibility.state().ready &&
      !this.elementVisibility.state().inview
    ) {
      return;
    }

    this.element.style.transform = transform;
    this.element.style.opacity = alpha + '';
    if (!is.null(this.forcedZIndex)) {
      this.element.style.zIndex = this.forcedZIndex + '';
    } else {
      this.element.style.zIndex =
        ((this.zIndexScalar * (this.position.z + 1)) >> 0) + '';
    }
  }

  dispose() {
    for (const key in this.components) {
      this.components[key].dispose();
    }

    this.watcher.dispose();
    this.elementVisibility.dispose();
  }
}
