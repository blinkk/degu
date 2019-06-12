

import { domCanvas } from '../lib/dom/dom-canvas';
import { Vector } from '../lib/mathf/vector';
import { MatrixIV } from '../lib/mathf/matrixIV';
import { mathf } from '../lib/mathf/mathf';
import { func } from '../lib/func/func';


/**
 * An example of applying matrix transforms to a basis polygon.
 */
export default class MatrixIV2Sample {
    constructor() {
        console.log('matrixIV2 sample');

        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.context = this.canvas.getContext('2d');


        // Create a basic polygon.
        domCanvas.setFillColor(this.context, 'green');
        domCanvas.setStrokeColor(this.context, 'green');

        // Given an up and right vector,
        // We create a square shape with four points.
        //
        //
        //  p0-------------------------p1
        //   |           ^             |
        //   |           |             |
        //   |           up            |
        //   |           |             |
        //   |           x---right-->  |
        //   |                         |
        //   |                         |
        //   |                         |
        //  p3------------------------p2
        //
        //
        // X is the center of the square/ polygon.
        // From x we have up (vector) going up and
        // we also have right (vector) going right.
        //
        // From this we can calculate our basis.
        // p0 = up - right
        // p1 = up + right
        // p2 = -up + right
        // p3 = -up + -right
        //
        //
        let up = new Vector(0, 50);
        let right = new Vector(50, 0);
        let p0 = Vector.subtract(up, right);
        let p1 = Vector.add(up, right);
        let p2 = Vector.add(Vector.negate(up), right);
        let p3 = Vector.add(Vector.negate(up), Vector.negate(right));


        // We are going to place this in the middle of the screen.
        let basePositionVector = new Vector(250, 250);

        // Now create the points on the screen (without transformations)
        let t0 = Vector.add(p0, basePositionVector);
        let t1 = Vector.add(p1, basePositionVector);
        let t2 = Vector.add(p2, basePositionVector);
        let t3 = Vector.add(p3, basePositionVector);

        // Draw out the points without transformations
        domCanvas.vectorQuadrilateral(
            this.context,
            t0, t1, t2, t3
        );

        // // Now apply transformation.
        domCanvas.setFillColor(this.context, 'orange');
        domCanvas.setStrokeColor(this.context, 'orange');

        // Let's first create rotation matrix along the Z plan to rotate the
        // square by 45 degrees.
        var angle = 45 * Math.PI / 180;
        let rotationMatrix = new MatrixIV().rotate(
            angle,
            new Vector(0, 0, 1)
        );

        // Let's also add a scaling matrix to decrease the size of the
        // whole square.
        let scaleMatrix = new MatrixIV().scaleXyz(
            0.5, 0.5, 0.5
        );


        // We apply this transformation to the up and right vectors.
        // Now these are going to be rotated by 45 degress.
        up = up.clone()
            // This first rotation matrix will rotate the up vector 45 degrees.
            .transformWithMatrixIV(rotationMatrix)
            // Now we scale it.
            .transformWithMatrixIV(scaleMatrix);
        right = right.clone()
            // This first rotation matrix will rotate the right vector 45 degrees.
            .transformWithMatrixIV(rotationMatrix)
            // Now we scale it.
            .transformWithMatrixIV(scaleMatrix);

        // At this point, we still have up and right vectors except they are now
        // rotated 45 degrees (but are still perpendicular).
        // Based on this, we calculate the p0-p3 points.
        // This is shaped more like a diamond where p0 is the top and p2 is the bottom.
        p0 = Vector.subtract(up, right);
        p1 = Vector.add(up, right);
        p2 = Vector.add(Vector.negate(up), right);
        p3 = Vector.add(Vector.negate(up), Vector.negate(right));


        // Let's also add a translation to the base position
        // to draw this slighly to the side.
        let translateMatrix = new MatrixIV().translateXyz(
            -100, -100, 0
        );
        basePositionVector.transformWithMatrixIV(translateMatrix);

        // Now we shift each point to where we are suppose to draw it.
        t0 = Vector.add(p0, basePositionVector);
        t1 = Vector.add(p1, basePositionVector);
        t2 = Vector.add(p2, basePositionVector);
        t3 = Vector.add(p3, basePositionVector);



        console.log(t0, t1, t2, t3);

        domCanvas.vectorQuadrilateral(
            this.context,
            t0, t1, t2, t3
        );

    }
}