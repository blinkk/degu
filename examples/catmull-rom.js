import * as domCanvas from '../lib/dom/dom-canvas';
import {Vector} from '../lib/mathf/vector';
import {CatmullRom} from '../lib/mathf/catmull-rom';


/**
 * Demonstrates basic usage of CatmullRom
 */
export default class CatmullRomSample {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.context = this.canvas.getContext('2d');
    console.log('catmull rom sample');


    // Start by defining our control points
    const points = [
      new Vector(0, 500),
      new Vector(100, 200),
      new Vector(200, 400),
      new Vector(300, 200),
      new Vector(400, 350),
      new Vector(500, 300),
    ];


    // Now create a catmullRom Interpolation.
    let catmullInterpolation = CatmullRom.interpolate(
        points,
        0.5,
        0.5
    );

    // Now create a catmullRom with low tension
    let catmullInterpolationLow = CatmullRom.interpolate(
        points,
        0,
        0
    );

    // Now create a catmullRom with high tension
    let catmullInterpolationHigh = CatmullRom.interpolate(
        points,
        1,
        1
    );

    // Set the number of points we want to draw along the spline.
    let drawPoints = 500;
    // The amount of progress to per dot.
    let progressSpan = 1 / drawPoints;

    // Loop throught the drawPoints.
    for (let step = 0; step < drawPoints; step++) {
      // Get the x,y value along the catmull rom spline based on the
      // current progress.
      let progress = step * progressSpan;

      let vector;


      // Draw the low tension vesion.
      domCanvas.setFillColor(this.context, 'orange');
      domCanvas.setStrokeColor(this.context, 'orange');
      vector = catmullInterpolationLow(progress);
      domCanvas.vectorPoint(this.context, vector, 2);

      // Draw the high tension vesion.
      domCanvas.setFillColor(this.context, 'blue');
      domCanvas.setStrokeColor(this.context, 'blue');
      vector = catmullInterpolationHigh(progress);
      domCanvas.vectorPoint(this.context, vector, 2);

      // Now draw it out.
      domCanvas.setFillColor(this.context, 'green');
      domCanvas.setStrokeColor(this.context, 'green');
      vector = catmullInterpolation(progress);
      domCanvas.vectorPoint(this.context, vector, 5);
    }


    // Now draw out the original points in red.
    domCanvas.setFillColor(this.context, 'red');
    domCanvas.setStrokeColor(this.context, 'red');
    points.forEach((point) => {
      domCanvas.vectorPoint(this.context, point);
    });
  }
}
