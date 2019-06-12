import { Vector } from './vector';

/**
 * A 4 four dimensional matrix class.
 *
 * ```
 * // Creates a new matrix.  Default matrix is set to identity.
 * let matrixA = new MatrixIV();
 *
 * matrixA.set(new Vector(20, 30, 40));
 * matrixA.translateXyz(20, 30, 40);
 * ```
 *
 */
export class MatrixIV {

    /**
     * The internal matrix values.
     */
    public value: Float32Array;

    constructor(matrix?: MatrixIV) {
        this.value = new Float32Array(16);

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
     * Clones this matrix.
     *
     * ```
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
     * @param {MatrixIV} matrix4
     */
    copy(matrix4: MatrixIV): MatrixIV {
        this.value = matrix4.value.slice(0);
        return this;
    }


    /**
     * Sets the x,y,z values of this matrix.
     * @param x
     * @param y
     * @param z
     */
    setXyz(x: number, y: number, z: number) {
        // Reset this matrix to the identiy matrix.
        this.identity();
        this.value[12] = x;
        this.value[13] = y;
        this.value[14] = z;
        return this;
    }

    /**
     * Sets a vector to this matrix.
     */
    set(v: Vector) {
        return this.setXyz(v.x, v.y, v.z);
    }


    /**
     * Scales this matrix given x, y, z values.
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
     * myMatrix.scale(new Vector(1, 1, 1));
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
     * Apply a scale transformation to this matrix given a scale vector.
     *
     * ```ts
     * myMatrix.translate(new Vector(1, 1, 1));
     * ```
     */
    translate(v: Vector): MatrixIV {
        return this.translateXyz(v.x, v.y, v.z);
    }


    /**
     * Multiply the current matrix with another.
     *
     * ```ts
     * matrixA.multiply(matrixB); // Now value of matrixA is multiplied with B.
     *
     * matrixC = matrixA.multiply(matrixB).clone(); // matrixC is product.
     * ```
     * @param mat
     */
    multiply(mat: MatrixIV): MatrixIV {
        const a = this.value[0],
            b = this.value[1],
            c = this.value[2],
            d = this.value[3],
            e = this.value[4],
            f = this.value[5],
            g = this.value[6],
            h = this.value[7],
            i = this.value[8],
            j = this.value[9],
            k = this.value[10],
            l = this.value[11],
            m = this.value[12],
            n = this.value[13],
            o = this.value[14],
            p = this.value[15],
            A = mat[0],
            B = mat[1],
            C = mat[2],
            D = mat[3],
            E = mat[4],
            F = mat[5],
            G = mat[6],
            H = mat[7],
            I = mat[8],
            J = mat[9],
            K = mat[10],
            L = mat[11],
            M = mat[12],
            N = mat[13],
            O = mat[14],
            P = mat[15];
        this.value[0] = A * a + B * e + C * i + D * m;
        this.value[1] = A * b + B * f + C * j + D * n;
        this.value[2] = A * c + B * g + C * k + D * o;
        this.value[3] = A * d + B * h + C * l + D * p;
        this.value[4] = E * a + F * e + G * i + H * m;
        this.value[5] = E * b + F * f + G * j + H * n;
        this.value[6] = E * c + F * g + G * k + H * o;
        this.value[7] = E * d + F * h + G * l + H * p;
        this.value[8] = I * a + J * e + K * i + L * m;
        this.value[9] = I * b + J * f + K * j + L * n;
        this.value[10] = I * c + J * g + K * k + L * o;
        this.value[11] = I * d + J * h + K * l + L * p;
        this.value[12] = M * a + N * e + O * i + P * m;
        this.value[13] = M * b + N * f + O * j + P * n;
        this.value[14] = M * c + N * g + O * k + P * o;
        this.value[15] = M * d + N * h + O * l + P * p;
        return this;
    }


    /**
     *
     * @param angle
     * @param axis
     */
    rotate(angle: number, axis: Vector) {
        let mg = axis.magnitude();
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
        return this.value;
    }


    /**
     * Creates and returns an identity matrix.
     *
     * ```ts
     * let m = Matrix4.IDENTITY;
     * ```
     * @static
     */
    static get IDENTITY(): MatrixIV {
        return new MatrixIV().identity();
    }


}