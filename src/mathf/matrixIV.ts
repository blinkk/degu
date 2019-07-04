import { Vector } from './vector';
import { Quaternion } from './quaternion';

/**
 * A 4 four dimensional homogenous matrix class.
 *
 * See examples in /examples for uses of matrix.
 *
 * ```
 * // Creates a new matrix.  Default matrix is set to identity.
 * let matrixA = new MatrixIV();
 *
 * matrixA.translateXyz(20, 30, 40);
 *
 *
 * // Creates an identity matrix.
 * let matrixB = MatrixIV.IDENTITY;
 *
 * // Rotate it on the Z axis by 90 degrees.
 * matrixB.scale(90 * Math.PI / 180, new Vector(0,0, 1));
 *
 * ```
 *
 * Referenced:
 * @see http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/
 * @see https://github.com/doxas/minMatrix.js/blob/master/minMatrix.js
 * @see https://github.com/photonstorm/phaser/blob/v3.17.0/src/math/Matrix4.js
 * @see https://www.youtube.com/channel/UCEhBM2x5MG9-e_JSOzU068w
 * @see https://www.useragentman.com/blog/2011/01/07/css3-matrix-transform-for-the-mathematically-challenged/
 * @see https://github.com/toji/gl-matrix
 * @see https://github.com/adragonite/math3d/blob/master/src/Matrix4x4.js
 * @see https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js
 *
 */
export class MatrixIV {

    /**
     * The internal matrix values.
     *
     * Roughly visualized as:
     *   x   y   z   t
     * [
     *   0,  1,  2,  3
     *   4,  5,  6,  7,
     *   8,  9, 10, 11,
     *  12, 13, 14, 15
     * ]
     *
     */
    public value: Float32Array;

    constructor(matrix?: MatrixIV) {
        this.value = new Float32Array(16);
        this.identity();

        // If matrix was provided, copy it, otherwise, create
        // an identity default matrix.
        if (matrix) {
            this.copy(matrix);
        } else {
            this.identity();
        }
    }

    /**
     * Sets this matrix to a default identity matrix.
     */
    identity(): MatrixIV {
        this.value[0] = 1;
        this.value[1] = 0;
        this.value[2] = 0;
        this.value[3] = 0;
        this.value[4] = 0;
        this.value[5] = 1;
        this.value[6] = 0;
        this.value[7] = 0;
        this.value[8] = 0;
        this.value[9] = 0;
        this.value[10] = 1;
        this.value[11] = 0;
        this.value[12] = 0;
        this.value[13] = 0;
        this.value[14] = 0;
        this.value[15] = 1;
        return this;
    }

    /**
     * Sets this matrix to have all 0 value.
     */
    zero(): MatrixIV {
        this.value[0] = 0;
        this.value[1] = 0;
        this.value[2] = 0;
        this.value[3] = 0;
        this.value[4] = 0;
        this.value[5] = 0;
        this.value[6] = 0;
        this.value[7] = 0;
        this.value[8] = 0;
        this.value[9] = 0;
        this.value[10] = 0;
        this.value[11] = 0;
        this.value[12] = 0;
        this.value[13] = 0;
        this.value[14] = 0;
        this.value[15] = 0;
        return this;
    }

    /**
     * Clones this matrix.
     *
     * ```ts
     * let m = myMatrix.clone();  // m is now a new clone of myMatrix.
     * ```
     */
    clone(): MatrixIV {
        return new MatrixIV(this);
    }

    /**
     * Copies the values of another matrix into this matrix.
     *
     * ```ts
     * matrixA.copy(matrixB) // Now matrixA has the values of matrixB.
     * ```
     * @param {MatrixIV} matrixIV
     */
    copy(matrix4: MatrixIV): MatrixIV {
        this.value = matrix4.value.slice(0);
        return this;
    }

    /**
     * Fills a specific column of this matrix with a vector values.
     *
     * ```
     *
     * For example, passing 2 as the column would:
     * [
     *   1,  0,  x,  0
     *   0,  1,  y,  0,
     *   0,  0,  z,  0,
     *   0,  0,  0,  1
     * ]
     *
     * ```
     * This is useful to create a basis matrix.  Below is a 4x4
     * matrix constructed of up, right and forward vectors.
     *
     * ```ts
     *
     *   let up = new Vector(0, 50);
     *   let right = new Vector(50, 0);
     *   let forward = Vector.ONE.cross(up);
     *   let basisMatrix = new MatrixIV();
     *   basisMatrix.setVectorColumn(0, right);
     *   basisMatrix.setVectorColumn(1, up);
     *   basisMatrix.setVectorColumn(2, foward);
     *
     * ```
     *
     * @param column The column number to fill.  A value between 0 and 3.
     * @param vector The vector to set.
     */
    setVectorColumn(column: number, v: Vector) {
        this.value[1 * column] = v.x;
        this.value[1 * column + 4] = v.y;
        this.value[1 * column + 8] = v.z;
    }



    /**
     * Scales this matrix given x, y, z values.
     *
     * ```ts
     * myMatrix.scaleXyz(0.5, 0.5, 0.5);
     * ```
     *
     * @param x
     * @param y
     * @param z
     * @return {MatrixIV}
     */
    scaleXyz(x: number, y: number, z: number): MatrixIV {
        this.value[0] = this.value[0] * x;
        this.value[1] = this.value[1] * x;
        this.value[2] = this.value[2] * x;
        this.value[3] = this.value[3] * x;

        this.value[4] = this.value[4] * y;
        this.value[5] = this.value[5] * y;
        this.value[6] = this.value[6] * y;
        this.value[7] = this.value[7] * y;

        this.value[8] = this.value[8] * z;
        this.value[9] = this.value[9] * z;
        this.value[10] = this.value[10] * z;
        this.value[11] = this.value[11] * z;
        return this;
    }

    /**
     * Apply a scale transformation to this matrix given a scale vector.
     *
     * ```ts
     * myMatrix.scale(new Vector(0.5, 0.5, 0.5));
     * ```
     *
     * @param v {Vector} The vector to scale this matrix.
     * @return {MatrixIV}
     */
    scale(v: Vector): MatrixIV {
        return this.scaleXyz(v.x, v.y, v.z);
    }




    /**
     * Translates this matrix given the values.
     *
     * ```ts
     * myMatrix.translateXyz(10, 20, 0));
     * ```
     * @param x
     * @param y
     * @param z
     */
    translateXyz(x: number, y: number, z: number): MatrixIV {
        this.value[12] = this.value[0] * x + this.value[4] * y +
            this.value[8] * z + this.value[12];
        this.value[13] = this.value[1] * x + this.value[5] * y +
            this.value[9] * z + this.value[13];
        this.value[14] = this.value[2] * x + this.value[6] * y +
            this.value[10] * z + this.value[14];
        this.value[15] = this.value[3] * x + this.value[7] * y +
            this.value[11] * z + this.value[15];
        return this;
    }


    /**
     * Apply a translation.
     *
     * ```ts
     * myMatrix.translate(new Vector(1, 1, 1));
     * ```
     */
    translate(v: Vector): MatrixIV {
        return this.translateXyz(v.x, v.y, v.z);
    }


    /**
     * Converts the current 4x4 matrix over to a css 3d matrix translation string.
     *
     * ```
     *
     * [
     * a1 a2 a3 a4
     * b1 b2 b3 b4
     * c1 c2 c3 c4
     * d1 d2 d3 d4
     * ]
     * = matrix3d(a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4)
     * ```
     *
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
     */
    toCss3dMatrix(): string {
        const a1 = this.value[0];
        const a2 = this.value[1];
        const a3 = this.value[2];
        const a4 = this.value[3];
        const b1 = this.value[4];
        const b2 = this.value[5];
        const b3 = this.value[6];
        const b4 = this.value[7];
        const c1 = this.value[8];
        const c2 = this.value[9];
        const c3 = this.value[10];
        const c4 = this.value[11];
        const d1 = this.value[12];
        const d2 = this.value[13];
        const d3 = this.value[14];
        const d4 = this.value[15];
        return `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2},
            ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
    }


    /**
     * Multiply the current matrix with another.
     *
     * ```ts
     * matrixA.multiply(matrixB); // Now value of matrixA is multiplied with B.
     *
     * matrixC = matrixA.clone().multiply(matrixB); // matrixC is product.
     * ```
     * @param mat
     */
    multiply(mat: MatrixIV): MatrixIV {
        var a00 = this.value[0];
        var a01 = this.value[1];
        var a02 = this.value[2];
        var a03 = this.value[3];

        var a10 = this.value[4];
        var a11 = this.value[5];
        var a12 = this.value[6];
        var a13 = this.value[7];

        var a20 = this.value[8];
        var a21 = this.value[9];
        var a22 = this.value[10];
        var a23 = this.value[11];

        var a30 = this.value[12];
        var a31 = this.value[13];
        var a32 = this.value[14];
        var a33 = this.value[15];

        var b = mat.value;

        var b0 = b[0];
        var b1 = b[1];
        var b2 = b[2];
        var b3 = b[3];

        this.value[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.value[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.value[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.value[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4];
        b1 = b[5];
        b2 = b[6];
        b3 = b[7];

        this.value[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.value[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.value[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.value[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8];
        b1 = b[9];
        b2 = b[10];
        b3 = b[11];

        this.value[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.value[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.value[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.value[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12];
        b1 = b[13];
        b2 = b[14];
        b3 = b[15];

        this.value[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.value[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.value[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.value[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return this;
    }

    /**
     * Multiplies this 4x4 matrix by a 4x1 matrix.  This results in
     * returning the results as a 4x1 matrix.
     *
     * ```
     *     4x4 Matrix         4x1 (Vector)
     *      a, b, c, d               x      = ax + by + cz + dw
     *      e, f, g, h     x         y      = ex + fy + gz + hw
     *      i, j, k, l               z      = ix + jy + kz + lw
     *     m,  n,  o, p              w      = mx + ny + oz + pw
     * ```
     *
     * @param x
     * @param y
     * @param z
     * @param w Use 1 for positions and 0 for direction.
     */
    multiplyBy4x1(x: number, y: number, z: number, w: number = 1): Array<number> {
        let a = this.value;
        return [
            a[0] * x + a[1] * y + a[2] * z + a[3] * w,
            a[4] * x + a[5] * y + a[6] * z + a[7] * w,
            a[8] * x + a[9] * y + a[10] * z + a[11] * w,
            a[12] * x + a[13] * y + a[14] * z + a[15] * w
        ]
    }

    /**
     * Multiplies this matrix by a vector that is converted to a 4x1.  Returns
     * a vector that was converted from the resulting 4x1.
     *
     * ```
     *     Basis Matrix         4x1 (Vector)
     *      a, b, c, d               x
     *      e, f, g, h     x         y
     *      i, j, k, l               z
     *     m,  n,  o, p              w
     *
     * ```
     *
     * ```ts
     *
     *   let up = new Vector(0, 50);
     *   let right = new Vector(50, 0);
     *   let forward = Vector.ONE.cross(up);
     *   let basisMatrix = new MatrixIV();
     *   basisMatrix.setVectorColumn(0, right);
     *   basisMatrix.setVectorColumn(1, up);
     *   basisMatrix.setVectorColumn(2, forward);
     *
     *   let p0 = new Vector(-1, -1);
     *   let p1 = new Vector(1, -1);
     *   let p2 = new Vector(1, 1);
     *   let p3 = new Vector(-1, 1);
     *   let t0 = basisMatrix.clone().multiplyByVector(p1);
     *   let t1 = basisMatrix.clone().multiplyByVector(p1);
     *   let t2 = basisMatrix.clone().multiplyByVector(p2);
     *   let t3 = basisMatrix.clone().multiplyByVector(p3);
     *
     *   // Now t0-t3 are vector of the corner points of a 100x100 square.
     *
     * ```
     */
    multiplyByVector(v: Vector, w: number = 1): Vector {
        let result = this.multiplyBy4x1(v.x, v.y, v.z, w);
        return new Vector(result[0], result[1], result[2]);
    }



    /**
     * Rotates this matrix at an given angle and axis.
     *
     *
     * ```
     *  // Rotate along X as the axis, similar to rotateX
     *   let matrix = new MatrixIV().rotate(angle, new Vector(1, 0, 0));
     *
     *  // Rotate along y as the axis, similar to rotateY
     *   matrix = new MatrixIV().rotate(angle, new Vector(0, 1, 0));
     *
     *  // Rotate along y as the axis, similar to rotateZ
     *   matrix = new MatrixIV().rotate(angle, new Vector(0, 0, 1));
     * ```
     *
     * @param angle An angle in radians
     * @param axis A vector point that acts as the axis.
     */
    rotate(angle: number, axis: Vector): MatrixIV | null {
        let mg = axis.magnitude();
        if (!mg) {
            return null;
        }
        let a = axis.x,
            b = axis.y,
            c = axis.z;
        if (mg != 1) {
            mg = 1 / mg;
            a *= mg;
            b *= mg;
            c *= mg;
        }
        const d = Math.sin(angle),
            e = Math.cos(angle),
            f = 1 - e,
            g = this.value[0],
            h = this.value[1],
            i = this.value[2],
            j = this.value[3],
            k = this.value[4],
            l = this.value[5],
            m = this.value[6],
            n = this.value[7],
            o = this.value[8],
            p = this.value[9],
            q = this.value[10],
            r = this.value[11],
            s = a * a * f + e,
            t = b * a * f + c * d,
            u = c * a * f - b * d,
            v = a * b * f - c * d,
            w = b * b * f + e,
            x = c * b * f + a * d,
            y = a * c * f + b * d,
            z = b * c * f - a * d,
            A = c * c * f + e;
        this.value[12] = this.value[12]; this.value[13] = this.value[13];
        this.value[14] = this.value[14]; this.value[15] = this.value[15];
        this.value[0] = g * s + k * t + o * u;
        this.value[1] = h * s + l * t + p * u;
        this.value[2] = i * s + m * t + q * u;
        this.value[3] = j * s + n * t + r * u;
        this.value[4] = g * v + k * w + o * x;
        this.value[5] = h * v + l * w + p * x;
        this.value[6] = i * v + m * w + q * x;
        this.value[7] = j * v + n * w + r * x;
        this.value[8] = g * y + k * z + o * A;
        this.value[9] = h * y + l * z + p * A;
        this.value[10] = i * y + m * z + q * A;
        this.value[11] = j * y + n * z + r * A;
        return this;
    }


    /**
     * Rotates this matrix along the x plane.
     * @param angle Angle in radians.
     */
    rotateX(angle: number) {
        this.rotate(angle, new Vector(1, 0, 0))
        return this;
    }

    /**
     * Rotates this matrix along the y plane.
     * @param angle Angle in radians.
     */
    rotateY(angle: number) {
        this.rotate(angle, new Vector(0, 1, 0))
        return this;
    }

    /**
     * Rotates this matrix along the z plane.
     * @param angle Angle in radians.
     */
    rotateZ(angle: number) {
        this.rotate(angle, new Vector(0, 0, 1))
        return this;
    }


    /**
     * Generates a View Matrix for the world-videw-projection matrix on a
     * left-handed projection.
     *
     * @see https://github.com/doxas/minMatrix.js/blob/master/minMatrix.js
     * http://web.archive.org/web/20131222170415/http:/robertokoci.com/world-view-projection-matrix-unveiled/
     *
     * ```ts
     *   var eye = new Vector(0.0, 0.0, 5.0);
     *   var center = new Vector(0.0, 0.0, 0.0);
     *   var up = new Vector(0.0, 1.0, 0.0);
     *   var martix = new Matrix().lookAt(eye, center, up);
     * ```
     *
     * @param eye The camera position vector
     * @param center The camera target vector
     * @param up The up vector relative to the camera.
     */
    lookAt(eye: Vector, center: Vector, up: Vector = Vector.UP): MatrixIV {

        var eyex = eye.x;
        var eyey = eye.y;
        var eyez = eye.z;

        var upx = up.x;
        var upy = up.y;
        var upz = up.z;

        var centerx = center.x;
        var centery = center.y;
        var centerz = center.z;

        if (Math.abs(eyex - centerx) < 0.00001 &&
            Math.abs(eyey - centery) < 0.00001 &&
            Math.abs(eyez - centerz) < 0.00001) {
            return MatrixIV.IDENTITY;
        }

        var z0 = eyex - centerx;
        var z1 = eyey - centery;
        var z2 = eyez - centerz;

        let len = 1 / Math.hypot(z0, z1, z2);

        z0 *= len;
        z1 *= len;
        z2 *= len;

        var x0 = upy * z2 - upz * z1;
        var x1 = upz * z0 - upx * z2;
        var x2 = upx * z1 - upy * z0;

        len = Math.hypot(x0, x1, x2);

        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        }
        else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        var y0 = z1 * x2 - z2 * x1;
        var y1 = z2 * x0 - z0 * x2;
        var y2 = z0 * x1 - z1 * x0;

        len = Math.hypot(y0, y1, y2);

        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        }
        else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        this.value[0] = x0;
        this.value[1] = y0;
        this.value[2] = z0;
        this.value[3] = 0;

        this.value[4] = x1;
        this.value[5] = y1;
        this.value[6] = z1;
        this.value[7] = 0;

        this.value[8] = x2;
        this.value[9] = y2;
        this.value[10] = z2;
        this.value[11] = 0;

        this.value[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        this.value[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        this.value[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        this.value[15] = 1;

        return this;
    }


    /**
     * Generates a left-handed perspection projection matrix with the given bounds.
     * The projection matrix is based on near and far view distance,
     * angle of the view of the camera and your screen resolution proportion.
     * @param fov The field of view in radians.
     * @param aspect The aspect ratio of the view.
     * @param near The near clipping bound of frustum. Should be larger than 0.
     * @param far The far clipping bound of frustum. Should be larger than 0.
     */
    perspective(fov: number, aspect: number, near: number, far: number): MatrixIV {
        let f = 1.0 / Math.tan(fov / 2);
        let nf;
        this.value[0] = f / aspect;
        this.value[1] = 0;
        this.value[2] = 0;
        this.value[3] = 0;
        this.value[4] = 0;
        this.value[5] = f;
        this.value[6] = 0;
        this.value[7] = 0;
        this.value[8] = 0;
        this.value[9] = 0;
        this.value[11] = -1;
        this.value[12] = 0;
        this.value[13] = 0;
        this.value[15] = 0;
        if (far != null && far !== Infinity) {
            nf = 1 / (near - far);
            this.value[10] = (far + near) * nf;
            this.value[14] = (2 * far * near) * nf;
        } else {
            this.value[10] = -1;
            this.value[14] = -2 * near;
        }

        return this;
    }



    /**
     * Sets the values of this matrix based on given yaw, pitch and roll.
     * Yano uses: YXZ Local Axes Yaw (y), Pitch (x), Roll (z)
     */
    ypr(yaw: number, pitch: number, roll: number) {
        this.zero();
        let temp = new MatrixIV().zero();
        let temp2 = new MatrixIV().zero();

        var m0 = this.value;
        var m1 = temp.value;
        var m2 = temp2.value;

        //  Rotate Z
        var s = Math.sin(roll);
        var c = Math.cos(roll);

        m0[10] = 1;
        m0[15] = 1;
        m0[0] = c;
        m0[1] = s;
        m0[4] = -s;
        m0[5] = c;

        //  Rotate X
        s = Math.sin(pitch);
        c = Math.cos(pitch);

        m1[0] = 1;
        m1[15] = 1;
        m1[5] = c;
        m1[10] = c;
        m1[9] = -s;
        m1[6] = s;

        //  Rotate Y
        s = Math.sin(yaw);
        c = Math.cos(yaw);

        m2[5] = 1;
        m2[15] = 1;
        m2[0] = c;
        m2[2] = -s;
        m2[8] = s;
        m2[10] = c;

        this.multiply(temp);
        this.multiply(temp2);

        return this;
    }

    /**
     * Sets this matrix from an array.
     * @param values
     */
    fromArray(values: Float32Array): MatrixIV {
        this.value = values;
        return this;
    }

    /**
     * Creates a new MatrixIV (rotational) from a quaternion.
     * Based off: https://github.com/toji/gl-matrix/blob/master/src/mat4.js
     */
    static fromQuaternion(q: Quaternion) {
        let position = Vector.ZERO;
        let scale = Vector.ONE;
        return MatrixIV.compose(position, q, scale);
    }

    /**
     * Composes a new matrixIV from a position, rotation and scale.
     *
     * ```ts
     *
     * let mat = MatrixIV.compose(position, rotation, scale);
     *
     * ```
     *
     * Thanks to Mr. Doob:
     * https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js
     *
     * @param position
     * @param quaternion
     * @param scale
     */
    static compose(position: Vector, rotation: Quaternion, scale: Vector) {
        var out = [];

        var x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;

        var sx = scale.x, sy = scale.y, sz = scale.z;

        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;

        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;

        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;

        out[12] = position.x;
        out[13] = position.y;
        out[14] = position.z;
        out[15] = 1;

        return new MatrixIV().fromArray(new Float32Array(out));

    }


    /**
     * Creates and returns an identity matrix.
     *
     * ```ts
     * let m = MatrixIV.IDENTITY;
     * ```
     * @static
     */
    static get IDENTITY(): MatrixIV {
        return new MatrixIV().identity();
    }

    /**
     * Alias to MatrixIV identity.
     */
    static get _(): MatrixIV {
        return new MatrixIV().identity();
    }


}