import { Draggable, DraggableConstraint } from './draggable';
import { Vector } from '../../mathf/vector';

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
