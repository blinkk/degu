import {mathf} from '../mathf/mathf';
import {XGameObject} from './x-game-object';
import {Vector} from '../mathf/vector';

/**
 * The main pointer class for x-engine.  Use this to detect collision with
 * GameObjects and respond to the pointer.
 * @unstable
 */
export class XPointer {
  public position: Vector;
  private radius: number;

  /**
   * Wehther the mouse is down.
   */
  public isMouseDown = false;

  /**
   * The html element to track pointer related events in.
   */
  private element: HTMLElement;
  constructor(element: HTMLElement) {
    this.position = Vector.ZERO;
    this.radius = 1;
    this.element = element;

    this.element.addEventListener(
      'mousedown',
      this.pointerDownHandler.bind(this),
      {passive: true}
    );
    this.element.addEventListener(
      'touchstart',
      this.pointerDownHandler.bind(this),
      {passive: true}
    );
    this.element.addEventListener('mouseup', this.pointerUpHandler.bind(this), {
      passive: true,
    });
    this.element.addEventListener(
      'touchend',
      this.pointerUpHandler.bind(this),
      {passive: true}
    );
    this.element.addEventListener(
      'mousemove',
      this.pointerMoveHandler.bind(this),
      {passive: true}
    );
    this.element.addEventListener(
      'touchmove',
      this.pointerMoveHandler.bind(this),
      {passive: true}
    );
  }

  get x() {
    return this.position.x;
  }

  set x(x: number) {
    this.position.x = x;
  }

  get y() {
    return this.position.y;
  }

  set y(y: number) {
    this.position.y = y;
  }

  pointerDownHandler(event: any) {
    this.isMouseDown = true;
  }

  pointerUpHandler(event: any) {
    this.isMouseDown = false;
  }

  pointerMoveHandler(event: any) {
    //Find the pointer’s x and y position (for mouse).
    //Subtract the element's top and left offset from the browser window.
    let pageX;
    let pageY;
    if (event.touches) {
      pageX = event.touches[0].pageX;
      pageY = event.touches[0].pageY;
    } else {
      pageX = event.pageX;
      pageY = event.pageY;
    }

    // TODO (uxder) Optimization point. Cache offset value to avoid thrashing.
    const x = pageX - this.element.offsetLeft;
    const y = pageY - this.element.offsetTop;

    this.position.set(x, y);
  }

  /**
   * Tests a collision with a GameObject.
   * @param object
   */
  testCollidingWithGameObject(object: XGameObject) {
    let point = {
      x: this.x,
      y: this.y,
    };

    // Generate a polygon out of the (possibly rotated)
    // box coordinates.
    let polygon = [
      object.globalComputedBox.topLeft,
      object.globalComputedBox.topRight,
      object.globalComputedBox.bottomRight,
      object.globalComputedBox.bottomLeft,
    ];

    // console.log(this.position);

    // Account for anchor.
    // rect.x += object.width * object.anchorX;
    // rect.y += object.height * object.anchorY;

    // console.log('rect.x', rect.x);
    // console.log('rect.y', rect.y);

    return mathf.collisionPointVersusConvexPolygon(point, polygon);
  }
}
