


import { domCanvas } from '../lib/dom/dom-canvas';
import { Vector } from '../lib/mathf/vector';
import { MatrixIV } from '../lib/mathf/matrixIV';
import { mathf } from '../lib/mathf/mathf';
import { func } from '../lib/func/func';


/**
 * An example of applying matrix transforms to a basis polygon.
 * @see https://www.youtube.com/watch?v=8sqv11x10lc&feature=youtu.be
 */
export default class MatrixIV3Sample {
    constructor() {
        console.log('matrixIV3 sample');

        this.canvas = document.getElementById('canvas');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.context = this.canvas.getContext('2d');


        domCanvas.setFillColor(this.context, 'green');
        domCanvas.setStrokeColor(this.context, 'green');

        // Out goal is to layout a 100x100 square in the middle of the screen.
        // We will then rotate that square by 45 degrees and scale it 0.5.
        //
        //
        // To begin, we want to think of a basisMatrix to formulate the square.
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
        // We will so have a forward (vector) going
        // in the z plane which is a cross product of up.
        //
        // You can see that each of the points, can also be
        // expressed as a vector from the center X.
        // p0 = Vector(-1, -1)
        // p1 = Vector(1, -1)
        // p2 = Vector(1, 1)
        // p3 = Vector(-1, 1)

        // We define our vectors.  Since we want 100x100 pixels, we set the
        // vectors from the x point.
        let up = new Vector(0, 50);
        let right = new Vector(50, 0);

        // To make this work, we are also going to
        // need a forward vector (going in 3D space)
        // which is the cross product of up vector.
        let forward = Vector.ONE.cross(up);

        //
        // Let's create out basisMatrix.
        // We create a 4x4 matrix with the right, up and foward vectors as
        // columns.
        //
        // This is visualized as:
        // Basic Matrix =
        // [
        //   Rx, Ux, Fx, 0
        //   Ry, Uy, Fy, 0
        //   Rz, Uz, Fz, 0
        //    0,  0,  0, 1
        // ]
        //
        // From here, we will then multiply that by a matrix
        // of each point of corner we want.
        //
        //     Basis Matrix         4x1 (Vector)
        //   Rx, Ux, Fx, 0               x
        //   Ry, Uy, Fy, 0     x         y
        //   Rz, Uz, Fz, 0               z
        //    0,  0,  0, 1               1
        //
        // The resulting 4x1 matrix will give us the x,y,z coordinates of
        // each point relative to the center point.
        let basisMatrix = new MatrixIV();
        basisMatrix.setVectorColumn(0, right);
        basisMatrix.setVectorColumn(1, up);
        basisMatrix.setVectorColumn(2, forward);

        //
        // Now we want to get the coordinates of each of the 4 corners of
        // the square as mentioned above.  First we create vectors for each point.
        let p0 = new Vector(-1, -1);
        let p1 = new Vector(1, -1);
        let p2 = new Vector(1, 1);
        let p3 = new Vector(-1, 1);

        // Now we are multiply this corner point vector by the 4x4 basis matrix.
        // Under the hood, multiplyByVector converts the vector to a 4x1
        // matrix and that is multiplied by the basisMatrix.
        // We get a new vector returns which is the product of multiplying the
        // vector and the basis matrix.
        // In short, we are multiplying the basisMatrix by the values of the
        // point vectors to calculate the relative x,y,z coordinates.
        let t0 = basisMatrix.clone().multiplyByVector(p0);
        let t1 = basisMatrix.clone().multiplyByVector(p1);
        let t2 = basisMatrix.clone().multiplyByVector(p2);
        let t3 = basisMatrix.clone().multiplyByVector(p3);


        // We are going to place this in the middle of the screen so let's
        // shift over each point.
        let basePositionVector = new Vector(250, 250);
        t0.add(basePositionVector);
        t1.add(basePositionVector);
        t2.add(basePositionVector);
        t3.add(basePositionVector);

        domCanvas.quickText(this.context, 't0', t0.x, t0.y - 4);
        domCanvas.quickText(this.context, 't1', t1.x, t1.y - 4);
        domCanvas.quickText(this.context, 't2', t2.x, t2.y - 4);
        domCanvas.quickText(this.context, 't3', t3.x, t3.y - 4);

        domCanvas.vectorPoint(this.context, t0);
        domCanvas.vectorPoint(this.context, t1);
        domCanvas.vectorPoint(this.context, t2);
        domCanvas.vectorPoint(this.context, t3);

        domCanvas.setFillColor(this.context, 'orange');
        domCanvas.setStrokeColor(this.context, 'orange');

        // Now let's draw another set of dots but this time, transform
        // the basisMatrix.
        basisMatrix
            .scaleXyz(0.5, 0.5, 0.5)
            .rotateZ(45 * Math.PI / 180);

        // Now that the basis Matrix is rotated, let's make the new square.
        // Again we are going to calculate the corners by multiplying the
        // the corner vectors.
        t0 = basisMatrix.clone().multiplyByVector(p0);
        t1 = basisMatrix.clone().multiplyByVector(p1);
        t2 = basisMatrix.clone().multiplyByVector(p2);
        t3 = basisMatrix.clone().multiplyByVector(p3);
        // Move the points to the center of the screen.
        t0.add(basePositionVector);
        t1.add(basePositionVector);
        t2.add(basePositionVector);
        t3.add(basePositionVector);

        // Draw the points.
        domCanvas.vectorPoint(this.context, t0);
        domCanvas.vectorPoint(this.context, t1);
        domCanvas.vectorPoint(this.context, t2);
        domCanvas.vectorPoint(this.context, t3);
    }
}