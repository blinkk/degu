

import {domCanvas} from '../lib/dom/dom-canvas';
import {Vector} from '../lib/mathf/vector';
import {CubicBezier} from '../lib/mathf/cubic-bezier';

/**
 * Demonstrates basic usage of BezierCurve
 */
export default class BezierCurveSample {
  constructor() {
    console.log('Bezier Curve Sample');
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.context = this.canvas.getContext('2d');

    // Control points, since the CubicBezier class.
    let c1 = new Vector(50, 400);
    let c2 = new Vector(100, 200);
    let c3 = new Vector(300, 300);
    let c4 = new Vector(400, 400);

    // Set the number of points we want to draw.
    let drawPoints = 500;
    // The amount of progress to per dot.
    let progressSpan = 1 / drawPoints;
    for (let step = 0; step < drawPoints; step++) {
      // Draw a dot along the curve.  The progress value goes from 0-1.
      let progress = step * progressSpan;
      domCanvas.setFillColor(this.context, 'orange');
      domCanvas.setStrokeColor(this.context, 'orange');
      const vector = CubicBezier.getPoint(
          progress, c1, c2, c3, c4
      );
      domCanvas.vectorPoint(this.context, vector, 2);
    }


    // Now draw out a large dot for each point.
    domCanvas.setFillColor(this.context, 'red');
    domCanvas.setStrokeColor(this.context, 'red');
    domCanvas.vectorPoint(this.context, c1);
    domCanvas.quickText(this.context, 'c1', c1.x, c1.y - 4);

    domCanvas.setFillColor(this.context, 'blue');
    domCanvas.setStrokeColor(this.context, 'blue');
    domCanvas.quickText(this.context, 'c2', c2.x, c2.y - 4);
    domCanvas.vectorPoint(this.context, c2);


    domCanvas.setFillColor(this.context, 'green');
    domCanvas.setStrokeColor(this.context, 'green');
    domCanvas.quickText(this.context, 'c3', c3.x, c3.y - 4);
    domCanvas.vectorPoint(this.context, c3);

    domCanvas.setFillColor(this.context, 'purple');
    domCanvas.setStrokeColor(this.context, 'purple');
    domCanvas.quickText(this.context, 'c4', c4.x, c4.y - 4);
    domCanvas.vectorPoint(this.context, c4);
  }
}
