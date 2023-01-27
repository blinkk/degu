import * as domCanvas from '../lib/dom/dom-canvas';
import {Vector} from '../lib/mathf/vector';
import {HermiteCurve} from '../lib/mathf/hermite-curve';


/**
 * Demonstrates basic usage of Hermite Curve
 */
export default class HermiteCurveSample {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.context = this.canvas.getContext('2d');

    let p0 = new Vector(50, 400);
    let m0 = new Vector(100, 200);
    let p1 = new Vector(300, 300);
    let m1 = new Vector(400, 400);

    // Set the number of points we want to draw.
    let drawPoints = 500;
    // The amount of progress to per dot.
    let progressSpan = 1 / drawPoints;
    for (let step = 0; step < drawPoints; step++) {
      // Draw a dot along the curve.  The progress value goes from 0-1.
      let progress = step * progressSpan;
      domCanvas.setFillColor(this.context, 'orange');
      domCanvas.setStrokeColor(this.context, 'orange');
      const vector = HermiteCurve.getPoint(
          progress, p0, m0, p1, m1
      );
      domCanvas.vectorPoint(this.context, vector, 2);
    }


    // Now draw out a large dot for each point.
    domCanvas.setFillColor(this.context, 'red');
    domCanvas.setStrokeColor(this.context, 'red');
    domCanvas.vectorPoint(this.context, p0);
    domCanvas.quickText(this.context, 'p0', p0.x, p0.y - 4);

    domCanvas.setFillColor(this.context, 'blue');
    domCanvas.setStrokeColor(this.context, 'blue');
    domCanvas.quickText(this.context, 'm0', m0.x, m0.y - 4);
    domCanvas.vectorPoint(this.context, m0);


    domCanvas.setFillColor(this.context, 'green');
    domCanvas.setStrokeColor(this.context, 'green');
    domCanvas.quickText(this.context, 'p1', p1.x, p1.y - 4);
    domCanvas.vectorPoint(this.context, p1);

    domCanvas.setFillColor(this.context, 'purple');
    domCanvas.setStrokeColor(this.context, 'purple');
    domCanvas.quickText(this.context, 'm1', m1.x, m1.y - 4);
    domCanvas.vectorPoint(this.context, m1);
  }
}
