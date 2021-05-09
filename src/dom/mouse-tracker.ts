declare function require(x: string): any;
import {mathf} from '../mathf/mathf';
import {Vector} from '../mathf/vector';
import {is} from '../is/is';
import {DomWatcher} from './dom-watcher';

/**
 * Class that helps with mouse tracking.
 * TODO (uxder): This is from a really old class.  I need to upgrade it.
 *      Could also still be buggy.
 * @unstable
 * @hidden
 */
export class MouseTracker {
  /**
   * The root element to calculate the center position of the effect.
   */
  private rootElement_: Element;

  /**
   * The vector position of the mouse.
   */
  public position: Vector;

  /**
   * The basic dimensions of the root element.
   * @type {Object}
   */
  private dimensions_: any;

  /**
   * The callback for when there is mouse movement.
   */
  private moveCallBack: Function;

  /**
   * The current mouse position data.
   */
  public mouseData: Object;

  /**
   * Instance of domWatcher.
   */
  private watcher: DomWatcher;

  /**
   * The last known windowY offset.
   */
  private windowY: number;
  private lastWindowY: number;
  private lastPosition: Vector;

  /**
   * @constructor
   */
  constructor(
    rootElement: Element,
    moveCallBack: Function,
    disableMobile: boolean
  ) {
    this.rootElement_ = rootElement;
    this.dimensions_ = null;
    this.moveCallBack = moveCallBack;
    this.mouseData = {};
    this.position = Vector.ZERO;
    this.windowY = window.scrollY;
    this.lastWindowY = window.scrollY;
    this.lastPosition = Vector.ZERO;

    this.calculateRootElementDimensions_();

    this.watcher = new DomWatcher();
    this.watcher.add({
      element: window,
      on: 'resize',
      callback: this.calculateRootElementDimensions_.bind(this),
      eventOptions: {passive: true},
    });
    this.watcher.add({
      element: window,
      on: 'scroll',
      callback: this.onScroll.bind(this),
      eventOptions: {passive: true},
    });

    if (!disableMobile && is.supportingDeviceOrientation()) {
      this.watcher.add({
        element: window,
        on: 'deviceorientation',
        callback: this.onDeviceOrientation.bind(this),
        eventOptions: {passive: true},
      });
    }

    this.watcher.add({
      element: document.body,
      on: 'mousemove',
      callback: this.onMouseMove.bind(this),
      eventOptions: {passive: true},
    });
    this.watcher.add({
      element: document.body,
      on: 'touchmove',
      callback: this.onMouseMove.bind(this),
      eventOptions: {passive: true},
    });
  }

  /**
   * Calculates the base dimensions of the rootElement.
   */
  calculateRootElementDimensions_() {
    let docRect = document.body.getBoundingClientRect();
    let rect = this.rootElement_.getBoundingClientRect();

    // Calculate the center point.
    let xCenter = rect.left + rect.width / 2;
    let yCenter = rect.top + rect.height / 2;

    this.dimensions_ = {
      width: rect.width,
      height: rect.height,
      halfWidth: rect.width / 2,
      halfHeight: rect.height / 2,
      top: rect.top,
      left: rect.left,
      xCenter: xCenter,
      yCenter: yCenter,
      docWidth: docRect.width,
      docHeight: docRect.height,
    };
  }

  /**
   * On scroll update the Y position so that the mouse
   * position always updates.
   */
  onScroll() {
    this.windowY = window.scrollY;
    let offset = this.windowY - this.lastWindowY;
    let y = this.lastPosition.y + offset;
    this.updateMouseData(this.lastPosition.x, y);
    this.moveCallBack && this.moveCallBack(this.mouseData);
  }

  /**
   * Handles the mouseRootElement move.
   * @type {MouseEvent}
   */
  private onMouseMove(e: any) {
    let x = e.pageX || e.clientX;
    let y = e.pageY || e.clientY;
    this.lastWindowY = window.scrollY;
    this.lastPosition = this.position.clone();
    this.updateMouseData(x, y);
    this.moveCallBack && this.moveCallBack(this.mouseData);
  }

  private updateMouseData(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.mouseData = {
      position: this.position,
      x: x,
      y: y,
      deltaX: x - this.dimensions_.xCenter,
      deltaY: y - this.dimensions_.yCenter,
      percentageX:
        ((x - this.dimensions_.xCenter) / this.dimensions_.docWidth) * 100,
      percentageY:
        ((y - this.dimensions_.yCenter) / this.dimensions_.docHeight) * 100,
    };
  }

  /**
   * Handles the device orientation.
   * @type {MouseEvent}
   */
  private onDeviceOrientation(event: any) {
    let x = mathf.clamp(-50, 50, event.gamma);
    let y = mathf.clamp(-50, 50, event.beta);

    this.mouseData = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      percentageX: x,
      percentageY: y,
    };
    this.moveCallBack && this.moveCallBack(this.mouseData);
  }

  /**
   * Gets the mouse positions.
   */
  getMousePosition(): any {
    return this.mouseData;
  }

  dispose() {
    this.watcher.dispose();
  }
}
