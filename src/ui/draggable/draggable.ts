import { DraggableSyncManager } from './draggable-sync-manager';
import { dom, Raf } from '../..';
import { Vector } from '../../mathf/vector';
import { CachedMouseTracker } from '../../dom/cached-mouse-tracker';

export type DraggableConstraint = (draggable: Draggable, delta: Vector) => Vector;

export enum DraggableEvent {
  START = 'deguDraggableStart',
  END = 'deguDraggableEnd'
}

export class Draggable {
  protected interacting: boolean;
  protected mouseTracker: CachedMouseTracker;
  private readonly element: HTMLElement;
  private readonly raf: Raf;
  private lastPosition: Vector;
  private constraints: DraggableConstraint[];

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
    this.init();
  }

  getElement(): HTMLElement {
    return this.element;
  }

  dispose() {
    this.raf.stop();
    this.constraints = [];
    this.mouseTracker.dispose(this);
  }

  protected startInteraction(): void {
    this.lastPosition = this.getMousePosition();
    this.interacting = true;
    dom.event(this.element, DraggableEvent.START, {});
  }

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

  protected isInteracting(): boolean {
    return this.interacting;
  }

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
      DraggableSyncManager.getSingleton().renderDrag(this, delta);
    });
  }

  private init(): void {
    this.initInteraction();
    this.raf.start();
  }

  private initInteraction(): void {
    dom.addEventListeners(
        this.element,
        ['touchstart', 'mousedown'],
        () => this.startInteraction());
    dom.addEventListeners(
        window,
        ['contextmenu',  'dragstart',  'touchend', 'mouseup'],
        () => this.endInteraction());
  }

  private getMousePosition(): Vector {
    return this.mouseTracker.getClientPosition();
  }
}
