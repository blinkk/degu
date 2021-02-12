import { DraggableSynchronizer } from './draggable-synchronizer';
import { dom, DomWatcher, Raf } from '../..';
import { Vector } from '../../mathf/vector';
import { CachedMouseTracker } from '../../dom/cached-mouse-tracker';

/**
 * Type of a function that can be used to constrain the movement of a vector.
 */
export type DraggableConstraint =
    (draggable: Draggable, delta: Vector) => Vector;

const HORIZONTAL_ONLY_CONSTRAINT =
    (draggable: Draggable, delta: Vector) => new Vector(delta.x, 0);

/**
 * Events to dispatch on the start and end of a drag.
 */
export enum DraggableEvent {
  START = 'deguDraggableStart',
  END = 'deguDraggableEnd'
}

export interface DraggableOptions {
  constraints?: DraggableConstraint[],
  horizontal?: boolean
}

/**
 * Makes a DOM element draggable by adjusting the element's transform.
 */
export class Draggable {
  /**
   * Creates a set of constraints considering special-value options passed.
   *
   * For readability there is an option "horizontal" that needs to add an
   * additional constraint to the configured constraints. This is handled here.
   */
  static createConstraintsFromOptions(options: DraggableOptions) {
    const optionConstraints = options.constraints || [];
    if (options.horizontal) {
      return [HORIZONTAL_ONLY_CONSTRAINT, ...optionConstraints];
    }
    return optionConstraints;
  }

  readonly element: HTMLElement;
  protected mouseTracker: CachedMouseTracker;
  private constraints: DraggableConstraint[];
  private readonly raf: Raf;
  private readonly draggableSynchronizer: DraggableSynchronizer;
  private lastPosition: Vector;
  private domWatcher: DomWatcher;

  constructor(
    element: HTMLElement,
    options: DraggableOptions = {}
  ) {
    this.element = element;
    this.raf = new Raf(() => this.loop());
    this.lastPosition = null;
    this.constraints = Draggable.createConstraintsFromOptions(options);
    this.mouseTracker = CachedMouseTracker.getSingleton(this);
    this.draggableSynchronizer = DraggableSynchronizer.getSingleton(this);
    this.domWatcher = new DomWatcher();
    this.init();
  }

  /**
   * Disposes of the Draggable instance.
   */
  dispose() {
    this.raf.stop();
    this.constraints = [];
    this.mouseTracker.dispose(this);
    this.draggableSynchronizer.dispose(this);
    this.domWatcher.dispose();
  }

  /**
   * Start a drag.
   */
  protected startInteraction(): void {
    this.raf.postWrite(() => { // Trigger after position has been updated
      if (this.isInteracting()) {
        return;
      }
      this.lastPosition = this.getMousePosition();
      dom.event(this.element, DraggableEvent.START, {});
    });
  }

  /**
   * End a drag.
   */
  protected endInteraction(): void {
    /**
     * Since global events are being listened to in order to end the interaction
     * then we must first verify we are in fact interacting.
     */
    if (!this.isInteracting()) {
      return;
    }

    this.raf.postWrite(() => {
      this.lastPosition = null;
      dom.event(this.element, DraggableEvent.END, {});
    });
  }

  /**
   * Returns whether or not the draggable is being dragged.
   */
  protected isInteracting(): boolean {
    return this.lastPosition !== null;
  }

  /**
   * Updates the position of the element according to the current drag
   * interaction.
   */
  protected loop(): void {
    this.raf.read(() => {
      if (!this.isInteracting()) {
        return;
      }
      const position = this.getMousePosition();
      if (position.equals(this.lastPosition)) {
        return;
      }
      const initialVector = new Vector(
          position.x - this.lastPosition.x,
          position.y - this.lastPosition.y);
      const delta = this.constraints.reduce(
          (result, constraint) => {
            return constraint(this, result);
          }, initialVector);
      this.lastPosition = position;
      if (delta.length() === 0) {
        return;
      }
      this.draggableSynchronizer.renderDrag(this, delta);
    });
  }

  /**
   * Setups up the raf loop and event listeners.
   */
  private init(): void {
    ['touchstart', 'mousedown']
        .forEach((event: string) => {
          this.domWatcher.add({
            element: this.element,
            on: event,
            callback: () => this.startInteraction()
          });
        });
    ['contextmenu', 'dragstart',  'touchend', 'mouseup']
        .forEach((event: string) => {
          this.domWatcher.add({
            element: window,
            on: event,
            callback: () => this.endInteraction()
          });
        });
    this.raf.start();
  }

  /**
   * Return the current mouse position.
   */
  private getMousePosition(): Vector {
    return this.mouseTracker.getClientPosition();
  }
}
