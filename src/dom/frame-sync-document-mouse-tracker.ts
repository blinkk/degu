import {dom, Raf} from '..';
import {Vector} from '../mathf/vector';
import {arrayf} from '../arrayf/arrayf';

// Note: Using acronym FSDMT for FrameSyncDocumentMouseTracker


class CursorPosition {
  private readonly position_: Vector;
  private readonly pressed_: boolean;
  private readonly time_: Date;

  constructor(position: Vector, pressed: boolean) {
    this.position_ = position;
    this.pressed_ = pressed;
    this.time_ = new Date();
  }

  static fromXY(x: number, y: number, pressed: boolean): CursorPosition {
    return new this(new Vector(x, y), pressed);
  }

  isPressed(): boolean {
    return this.pressed_;
  }

  getPosition(): Vector {
    return this.position_;
  }

  getTime(): Date {
    return this.time_;
  }
}

const GESTURE_TIME_LIMIT: number = 1000; // Time limit in ms
const POSITION_LIMIT: number = 100;
const ZERO_POSITION: CursorPosition = new CursorPosition(Vector.ZERO, false);

class EventType {
  static CURSOR_DOWN: string[] = ['mousedown', 'touchstart'];
  static CURSOR_UP: string[] = ['mousemove', 'touchmove'];
  static CURSOR_MOVE: string[] = ['mouseup', 'touchend'];
}

class CursorData {
  private readonly positions_: CursorPosition[];

  constructor(
      currentPosition: CursorPosition = ZERO_POSITION,
      ...pastPositions: CursorPosition[]
  ) {
    this.positions_ = [currentPosition, ...pastPositions];
  }

  public update(position: CursorPosition): CursorData {
    return new CursorData(
        position, ...this.positions_.slice(0, POSITION_LIMIT - 1));
  }

  private getLatestPosition(): CursorPosition {
    return this.positions_[0];
  }

  public getPosition(): Vector {
    return this.getLatestPosition().getPosition();
  }

  public getGestureDelta(): Vector {
    return CursorData.getGestureDeltaFromPositions_(...this.positions_);
  }

  public getPressedGestureDelta(): Vector {
    return CursorData.getGestureDeltaFromPositions_(
        ...this.getPressedGesturePositions_());
  }

  public getLastFrameVelocity(): Vector {
    const framesWithTimeDifference = this.getFramesWithTimeDifference_();
    const firstFrame = framesWithTimeDifference[0];
    const lastFrame = framesWithTimeDifference.slice(-1)[0];
    const frameDeltaInSeconds =
        (firstFrame.getTime().valueOf() - lastFrame.getTime().valueOf()) /
        1000;
    return this.getLastFrameDelta().scale(1/frameDeltaInSeconds);
  }

  public getLastFrameDelta(): Vector {
    const framesWithTimeDifference = this.getFramesWithTimeDifference_();
    const firstFrame = framesWithTimeDifference[0];
    const lastFrame = framesWithTimeDifference.slice(-1)[0];
    return firstFrame.getPosition().subtract(lastFrame.getPosition());
  }

  private getFramesWithTimeDifference_(): CursorPosition[] {
    const firstPosition = this.positions_[0];
    const positionWithDifference =
        this.positions_
            .find(
                (position) => {
                  return position.getTime().valueOf() !==
                      firstPosition.getTime().valueOf();
                });
    return this.positions_
        .slice(0, this.positions_.indexOf(positionWithDifference) + 1);
  }

  private getPressedGesturePositions_(): CursorPosition[] {
    const currentTime: number = new Date().valueOf();
    const conditionFn =
        (position: CursorPosition) => {
          const timeDiff = currentTime - position.getTime().valueOf();
          return timeDiff < GESTURE_TIME_LIMIT && position.isPressed();
        };

    return arrayf.filterUntilFalse(this.positions_, conditionFn);
  }

  public static getGestureDeltaFromPositions_(
      ...positions: CursorPosition[]
  ): Vector {
    const deltas: Vector[] =
        Vector.getDeltas(
            ...positions.map((position: CursorPosition) => position.getPosition()));
    const scaledDeltas: Vector[] =
        deltas.map(
            (delta, index) => delta.scale((deltas.length - index) / deltas.length));
    return Vector.add(...scaledDeltas);
  }
}

interface FSDMTEvent {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
}

const singletonUses: Set<any> = new Set();
let singleton: FrameSyncDocumentMouseTracker = null;

export class FrameSyncDocumentMouseTracker {
  private readonly raf: Raf;
  private frame: number;
  private clientPosition: CursorData;
  private pagePosition: CursorData;
  private screenPosition: CursorData;
  private pressed: boolean;
  private readonly cursorDownHandler: EventListenerOrEventListenerObject;
  private readonly cursorUpHandler: EventListenerOrEventListenerObject;
  private readonly cursorMoveHandler: EventListenerOrEventListenerObject;

  constructor() {
    this.raf = new Raf();
    this.clientPosition = new CursorData();
    this.pagePosition = new CursorData();
    this.screenPosition = new CursorData();
    this.pressed = false;
    this.frame = 0;
    this.cursorDownHandler = (event: Event) => this.updatePress(event, true);
    this.cursorUpHandler = (event: Event) => this.updatePress(event, false);
    this.cursorMoveHandler = (event: Event) => this.updatePosition(event);
    this.init_();
  }

  private init_() {
    dom.addEventListeners(window, EventType.CURSOR_DOWN, this.cursorDownHandler);
    dom.addEventListeners(window, EventType.CURSOR_UP, this.cursorUpHandler);
    dom.addEventListeners(window, EventType.CURSOR_MOVE, this.cursorMoveHandler);
  }

  public static getSingleton(use: any): FrameSyncDocumentMouseTracker {
    singletonUses.add(use);
    if (singleton === null) {
      singleton = new FrameSyncDocumentMouseTracker();
    }
    return singleton;
  }

  public isPressed(): boolean {
    return this.pressed;
  }

  public getClient(): CursorData {
    return this.clientPosition;
  }

  public getPage(): CursorData {
    return this.pagePosition;
  }

  public getScreen(): CursorData {
    return this.screenPosition;
  }

  private updatePress(event: Event, isPressed: boolean): void {
    this.pressed = isPressed;
    this.updatePosition(event);
  }

  private updatePosition(event: Event): void {
    if (event instanceof MouseEvent) {
      this.updatePositionFromEvent_(event);
    } else if (event instanceof TouchEvent) {
      this.updatePositionFromTouchEvent(event);
    }
  }

  private updatePositionFromTouchEvent(touchEvent: TouchEvent): void {
    if (touchEvent.touches.length > 0) {
      this.updatePositionFromEvent_(touchEvent.touches[0]);
    } else {
      this.endTouch();
    }
  }

  private endTouch(): void {
    this.raf.preRead(() => {
      this.pagePosition = this.duplicatePosition_(this.pagePosition);
      this.clientPosition = this.duplicatePosition_(this.clientPosition);
      this.screenPosition = this.duplicatePosition_(this.screenPosition);
    });
  }

  private updatePositionFromEvent_(event: FSDMTEvent): void {
    this.raf.preRead(() => {
      this.pagePosition =
          this.updatePositionWithXY_(
              this.pagePosition, event.pageX, event.pageY);

      this.clientPosition =
          this.updatePositionWithXY_(
              this.clientPosition, event.clientX, event.clientY);

      this.screenPosition =
          this.updatePositionWithXY_(
              this.screenPosition, event.screenX, event.screenY);
    });
  }

  private duplicatePosition_(position: CursorData): CursorData {
    return position.update(
        new CursorPosition(position.getPosition(), this.isPressed()));
  }

  private updatePositionWithXY_(
      position: CursorData, xValue: number, yValue: number
  ): CursorData {
    return position.update(
        CursorPosition.fromXY(xValue, yValue, this.isPressed()));
  }

  dispose(use: any): void {
    if (this === singleton) {
      singletonUses.delete(use);
      if (singletonUses.size <= 0) {
        singleton = null;
        this.removeEventListeners();
      }
    } else {
      this.removeEventListeners();
    }
  }

  private removeEventListeners(): void {
    dom.removeEventListeners(
        window, EventType.CURSOR_DOWN, this.cursorDownHandler);
    dom.removeEventListeners(
        window, EventType.CURSOR_UP, this.cursorUpHandler);
    dom.removeEventListeners(
        window, EventType.CURSOR_MOVE, this.cursorMoveHandler);
  }
}
