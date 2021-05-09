import globalWindow from './global-window';
import {VectorDom, VectorDomOptions, VectorDomComponent} from './vector-dom';
import {Vector} from '../mathf/vector';
import {mathf} from '..';

/**
 * A component class that adds external forces options to DOM vector.
 * @unstable
 * @hidden
 */
export class VectorDomForce implements VectorDomComponent {
  /**
   * The host of this vectorDom instance of this component.
   */
  private host: VectorDom;
  private element: HTMLElement;

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

  constructor(vc: VectorDom) {
    this.host = vc;
    this.element = vc.element;

    this.rotationMouseForce = Vector.ZERO;
    this.rotationScrollYForce = Vector.ZERO;
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
   *   myVector._.force.mouseRotationForce();
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
   *   myVector._.force.mouseRotationForce(-0.0005, -0.0005, 0, 0.03);
   *   myVector.render();
   * }).start();
   *
   * ```
   */
  public mouseRotationForce(
    xScalar = 0.0005,
    yScalar = 0.0005,
    zScalar = 0,
    lerp = 0.02
  ) {
    const mouse = this.host.mouse;
    const globalElementCenterPosition = this.host.globalElementCenterPosition;
    const globalMousePosition = mouse.position.clone();
    globalMousePosition.y = globalMousePosition.y - globalWindow.scrollY;

    // Get the angle difference between target and the center of this element.
    const angleDelta = Vector.getXyzRotationTo(
      globalElementCenterPosition,
      globalMousePosition
    );

    // Scale the angleDelta.
    angleDelta[0] = angleDelta[0] * xScalar;
    angleDelta[1] = angleDelta[1] * yScalar * 0;
    angleDelta[2] = angleDelta[2] * zScalar * 0;

    // Make that into a vector.
    const targetRotation = Vector.fromArray(angleDelta);

    // TODO (uxder) Is rx inverted?
    targetRotation.x = -targetRotation.x;

    console.log(targetRotation.x);
    // // Now lerp the cachec rotationMouseForce.
    // this.rotationMouseForce.lerp(targetRotation, lerp);

    // // Now figure out closest direction to reach the target rotation.
    // // What this helps with is when the element is complmetely reverted,
    // // it still maintains the same mouse force effect (non inverted).
    // let xDistance = mathf.angleDistanceRadian(targetRotation.x, diff.x);
    // let yDistance = mathf.angleDistanceRadian(targetRotation.y, diff.y);
    // let zDistance = mathf.angleDistanceRadian(targetRotation.z, diff.z);

    // let force = new Vector(xDistance, yDistance, zDistance);

    this.host.rotation = this.host.rotation.clone().add(targetRotation);
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
   *   myVector._.force.scrollYRotationForce();
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
   *   myVector._.force.scrollYRotationForce(-0.0004, 0);
   *   myVector.render();
   * }).start();
   *
   * ```
   */
  public scrollYRotationForce(
    xScalar = 0,
    yScalar = 0.0005,
    zScalar = 0,
    lerp = 0.02
  ) {
    const globalElementCenterPosition = this.host.globalElementCenterPosition;

    const windowCenter = new Vector(
      globalWindow.width / 2,
      globalWindow.height / 2
    );

    // Override the x and z values to the same coordinate as the element
    // sicne we don't care about the delta between those.
    windowCenter.x = globalElementCenterPosition.x;
    windowCenter.z = globalElementCenterPosition.z;

    // Get the angle difference between window center and the center of this element.
    const angleDelta = Vector.getXyzRotationTo(
      globalElementCenterPosition,
      windowCenter
    );

    // Since this is adding scrollY force, the amount of force we add to
    // the x and z is going to be the distance delta of y.
    angleDelta[0] = angleDelta[1] * xScalar;
    angleDelta[2] = angleDelta[2] * zScalar;

    // Scale the y angleDelta.
    angleDelta[1] = angleDelta[1] * yScalar;

    // Make that into a vector.
    const targetRotation = Vector.fromArray(angleDelta);

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
    const diffVector = Vector.subtract(
      this.rotationScrollYForce,
      targetRotation
    );

    this.host.rotation.add(diffVector);
  }

  render() {}
  init() {}
  resize() {}
  dispose() {}
}
