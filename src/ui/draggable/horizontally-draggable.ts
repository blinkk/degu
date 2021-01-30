import { Draggable, DraggableConstraint } from './draggable';
import { Vector } from '../../mathf/vector';

/**
 * Extension of Draggable that doesn't allow movement on the y axis.
 */
export class HorizontallyDraggable extends Draggable {
  constructor(
    element: HTMLElement,
    { constraints = [] }: {constraints?: DraggableConstraint[]} = {}
  ) {
    super(
        element,
        {
          constraints: [
            ...constraints,
            (draggable: Draggable, delta: Vector) => new Vector(delta.x, 0)
          ]
        });
  }
}
