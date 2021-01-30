import { DraggableSynchronizer } from './draggable-synchronizer';
import { dom, Raf } from '../..';
import { Vector } from '../../mathf/vector';
import { CachedMouseTracker } from '../../dom/cached-mouse-tracker';
import {TrackedListener} from '../../dom/tracked-listener';

/**
 * Type of a function that can be used to constrain the movement of a vector.
 */
export type DraggableConstraint =
    (draggable: Draggable, delta: Vector) => Vector;

/**
 * Events to dispatch on the start and end of a drag.
 */
export enum DraggableEvent {
  START = 'deguDraggableStart',
  END = 'deguDraggableEnd'
}

/**
 * Makes a DOM element draggable by adjusting the element's transform.
 */
export class Draggable {
  readonly element: HTMLElement;
  protected interacting: boolean;
  protected mouseTracker: CachedMouseTracker;
  private constraints: DraggableConstraint[];
  private readonly raf: Raf;
  private readonly draggableSynchronizer: DraggableSynchronizer;
  private lastPosition: Vector;
  private listenerIds: number[];

  constructor(
    element: HTMLElement,
    { constraints = [] }: {constraints?: DraggableConstraint[]} = {}
  ) {
    this.element = element;
    this.raf = new Raf(() => this.loop());
    this.lastPosition = null;
    this.interacting = false;
    this.constraints = [...constraints];
    this.mouseTracker = CachedMouseTracker.getSingleton(this);
    this.draggableSynchronizer = DraggableSynchronizer.getSingleton(this);
    this.listenerIds = [
        ...TrackedListener.addMultipleEvents(
            this.element, ['touchstart', 'mousedown'],
            () => this.startInteraction()),
        ...TrackedListener.addMultipleEvents(
            window,
            ['contextmenu',  'dragstart',  'touchend', 'mouseup'],
            () => this.endInteraction())
    ];
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
    TrackedListener.remove(...this.listenerIds);
  }

  /**
   * Start a drag.
   */
  protected startInteraction(): void {
    this.lastPosition = this.getMousePosition();
    this.interacting = true;
    dom.event(this.element, DraggableEvent.START, {});
  }

  /**
   * End a drag.
   */
  protected endInteraction(): void {
    /**
     * Since global events are being listened to in order to end the interaction
     * then we must first verify we are in fact interacting.
     */
    if (!this.interacting) {
      return;
    }

    this.interacting = false;
    this.raf.read(() => {
      dom.event(this.element, DraggableEvent.END, {});
    });
  }

  /**
   * Returns whether or not the draggable is being dragged.
   */
  protected isInteracting(): boolean {
    return this.interacting;
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
    this.raf.start();
  }

  /**
   * Return the current mouse position.
   */
  private getMousePosition(): Vector {
    return this.mouseTracker.getClientPosition();
  }
}
