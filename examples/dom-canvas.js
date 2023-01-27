import { Vector } from '../lib/mathf/vector';
import * as domCanvas from '../lib/dom/dom-canvas';

export default class DomCanvasSample {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.context = this.canvas.getContext('2d');

    // Add some text.
    domCanvas.setFillColor(this.context, 'orange');
    domCanvas.setStrokeColor(this.context, 'orange');
    domCanvas.quickText(this.context, 'hello this is some text', 500, 500);

    // Draw quad
    domCanvas.setFillColor(this.context, 'blue');
    domCanvas.setStrokeColor(this.context, 'blue');
    domCanvas.vectorQuadrilateral(this.context,
        new Vector(10, 10),
        new Vector(100, 10),
        new Vector(100, 100),
        new Vector(10, 100)
    );

    domCanvas.setFillColor(this.context, '#EFEFEF');
    domCanvas.setStrokeColor(this.context, '#EFEFEF');
    domCanvas.vectorQuadrilateral(this.context,
        new Vector(200, 200),
        new Vector(400, 200),
        new Vector(400, 400),
        new Vector(200, 400)
    );

    // Let's get the color at 205, 205.
    let rgb = domCanvas.getColorAtPointAsHex(this.context, new Vector(205, 205));
  }
}
