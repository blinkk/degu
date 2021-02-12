/**
 * Sample showing Draggable instances.
 */
import {Draggable} from '../lib/ui/draggable/draggable';
import {mathf} from '../lib/mathf/mathf';
import {Vector} from '../lib/mathf/vector';

export default class DraggableSample {
  constructor() {
    new Draggable(
        document.querySelector('[draggable-demo-1]'),
        {
          constraints: [
            (draggable, delta) => {
              return new Vector(delta.x, mathf.clamp(-10, 10, delta.y));
            }]
        });
    new Draggable(
        document.querySelector('[draggable-demo-2]'),
        {horizontal: true});
    new Draggable(document.querySelector('[draggable-demo-3]'));
  }
}
