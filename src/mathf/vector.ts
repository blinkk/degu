
import { EASE } from '../ease/ease';
import { mathf } from './mathf';
import { MatrixIV } from './matrixIV';

/**
 *
 * A basic vector class that can be used for 2d or 3d.  When using for 2d,
 * the z defaults to 0.
 *
 * ```ts
 *
 * let v = new Vector(0,0,0);
 * let v2 = new Vector(2,1,0);
 *
 * v.add(v2);
 * let v3 = v.clone();
 * v3.scale(5);
 *
 * v3.dot(v2);
 *
 * ```
 *
 *
 * TODO (uxder): Add matrix transformations.
 *
 * TODO (uxder): Add more tests.
 *
 * Some good resource on Vectors if you are unfamiliar with them.
 * @see https://www.mathsisfun.com/algebra/vectors.html
 * @see https://bit.ly/2wGFKdv
 *
 * Inspirted by:
 * @see https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js
 * @see https://github.com/photonstorm/phaser/blob/v3.17.0/src/math/Vector3.js
 * @see https://evanw.github.io/lightgl.js/docs/vector.html
 *
 */
export class Vector {

    /**
     * The x component of this vector.
     */
    public x: number;
    /**
     * The y component of this vector.
     */
    public y: number;
    /**
     * The z component of this vector.
     */
    public z: number;
    /**
     * The w component of this vector.
     */
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 0;
    }


    /**
     * Makes a clone of this vector.
     *
     * ```ts
     * var v = new Vector(0,1,0);
     * var clonedVector = v.clone();
     * ```
     * @tested
     */
    clone(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    /**
     * Makes a clone of this vector.
     *
     * ```ts
     * var v = new Vector(0,1,0);
     * var clonedVector = Vecrtor3.clone(v);
     * ```
     * @tested
     */
    static clone(v: Vector) {
        return new Vector(v.x, v.y, v.z);
    }

    /**
     * Sets x,y,z.
     * @tested
     */
    set(x: number, y: number, z: number = 0): Vector {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }


    /**
     * Floors out the internal values to avoid subpixel rendering.
     */
    floor() {
        this.x = ~~this.x;
        this.y = ~~this.y;
        this.z = ~~this.z;
        return this;
    }

    /**
     * Converts internal values to int
     */
    int() {
        this.x = this.x >> 0;
        this.y = this.y >> 0;
        this.z = this.z >> 0;
        return this;
    }


    /**
     * Tests the equality of this vector against another.
     *
     * ```ts
     * var v = new Vector(0,1,0);
     * var v2 = new Vector(0,1,0);
     * v.equals(v2); // true
     * ```
     * @tested
     */
    equals(vector: Vector): boolean {
        return ((this.x === vector.x) && (this.y === vector.y) &&
            (this.z === vector.z));
    }

    /**
     * A static method testing the equality of two vectors.
     *
     * ```ts
     * var v = new Vectorr3(0,1,0);
     * var v2 = new Vector(0,1,0);
     * Vector.equals(v2); // true
     * ```
     *
     * @param v1
     * @param v2
     * @tested
     */
    static equals(v1: Vector, v2: Vector): boolean {
        return ((v1.x === v2.x) && (v1.y === v2.y) &&
            (v1.z === v2.z));
    }


    /**
     * Converts the current vector to an array.
     *
     * ```ts
     * var v = new Vector(0,1,0);
     * v.toArray(); // [0,1,0]
     * ```
     */
    toArray(): Array<number> {
        return [this.x, this.y, this.z];
    }

    /**
     * Converts the current vector to an array.
     *
     * ```ts
     * var v = new Vector(0,1,0);
     * var a = Vector.toArray(v);// [0,1,0]
     * ```
     */
    static toArray(v: Vector): Array<number> {
        return [v.x, v.y, v.z];
    }


    /**
     * Creates a new Vector from a set of arrays.
     *
     * ```ts
     * var v = Vector.fromArray([0,2,2]);
     * ```
     */
    static fromArray(values: Array<number>): Vector {
        return new Vector(values[0], values[1], values[2]);
    }

    /**
     * Creates a new Vector from static method.
     *
     * ```ts
     * var v = Vector.create(0,2,2);
     * ```
     * @param x
     * @param y
     * @param z
     * @tested
     */
    static create(x: number, y: number, z: number = 0): Vector {
        return new Vector(x, y, z);
    }


    /**
     * Creates a new 2d Vector with a specific angle and length.
     * This is useful to create a directional vector.
     *
     * Example:
     * ```ts
     *
     *  let origin = new Vector(10, 20);
     *  // Create a ray that goes 90 degrees down in 100 length.
     *  let ray = Vector.fromAngle(mathf.degreeToRadian(90), 100);
     *
     *  // Combine the origin and ray to get the endpoint (the tip of the ray).
     *  let endPoint = Vector.add(origin, ray);
     *
     * ```
     *
     *
     * @param angle Angle in radians
     * @param length The length, magnitude of the vector. Defaults to a
     *     semi-infinite length.
     */
    static fromAngle(angle: number, length: number = 100000) {
        return new Vector(
            length * Math.cos(angle),
            length * Math.sin(angle), 0);
    }


    /**
     * Gets the angle between two vectors.
     *
     *
     * ```ts
     *
     * let a = new Vector(100,200);
     * let b = new Vector(150,240);
     *
     * let angle = Vector.angle2d(a, b);
     *
     * ```
     *
     * @param a The first vector
     * @param b The second vector
     * @return The angle of the two vectors in radians.
     */
    static angle2d(a: Vector, b: Vector): number {
        var dx = a.x - b.x,
            dy = a.y - b.y;
        return Math.atan2(dy, dx);
    }



    /**
     * Given a targetVector, this will find the rotation angles of each
     * axis which you can then later use to on rotateX, rotateY, rotateZ
     * values on a matrix or rotational vector.
     *
     *
     * Basic Example:
     * ```ts
     *
     * let origin = Vector.ZERO;
     * let target = new Vector(10,15,20);
     * let angles = Vector.getXyzRotationTo(origin, target);
     *
     * angles[0] // 1.95.. -- radian x rotation value
     * angles[1] // 2.16.. -- radian y rotation value
     * angles[2] // 2.40.. -- radian z rotation value
     *
     * ```
     *
     * See for a reference but the below is not using this:
     * https://stackoverflow.com/questions/48532207/get-xyz-rotation-from-pvector
     * @param targetVector
     * @return Array<number> An array with three numbers,
     *      angleX, angleY and angleZ in radians.
     */
    static getXyzRotationTo(originVector: Vector, targetVector: Vector) {
        // Use the difference between current vector and target as the basis.
        let delta = originVector.clone().subtract(targetVector);
        let angleX = Math.atan(delta.x);
        let angleY = Math.atan(delta.y);
        let angleZ = Math.atan(delta.z);
        return [angleX, angleY, angleZ];
    }


    /**
     * Adds this vector to another.
     */
    add(v: Vector): Vector {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z || 0;

        return this;
    }

    static add(v2: Vector, v1: Vector) {
        const x = v2.x + v1.x;
        const y = v2.y + v1.y;
        const z = v2.z + v1.z;
        return new Vector(x, y, z);
    }

    /**
     * Subtract this vector from another .
     */
    subtract(v: Vector): Vector {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z || 0;
        return this;
    }


    /**
     * Subtract this vector from another and create a new vector.
     */
    static subtract(v2: Vector, v1: Vector) {
        const x = v2.x - v1.x;
        const y = v2.y - v1.y;
        const z = v2.z - v1.z;
        return new Vector(x, y, z);
    }

    /**
     * Multiply this vector with another.
     */
    multiply(v: Vector): Vector {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z || 1;
        return this;
    }

    /**
     * Divide this vector with another.
     */
    divide(v: Vector): Vector {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z || 1;
        return this;
    }


    /**
     * Scales this vector by the given scalar value.
     */
    scale(scalar: number): Vector {
        if (isFinite(scalar)) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
            return this;
        } else {
            return Vector.ZERO;
        }
    }


    /**
     * Negate this vector as a 3d vector.
     */
    negate(): Vector {
        this.x = -this.x;
        this.y = -this.y;
        this.z = mathf.absZero(-this.z);
        return this;
    }

    static negate(v: Vector): Vector {
        let x = -v.x;
        let y = -v.y;
        let z = mathf.absZero(-v.z);
        return new Vector(x, y, z);
    }


    /**
     * Calculates the distance between this vector and another.
     * @return The distance from this vector to another
     */
    distance(v: Vector): number {
        let dx = v.x - this.x;
        let dy = v.y - this.y;
        let dz = v.z - this.z || 0;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }


    /**
     * Calculates the length / magnitude of this vector.
     */
    length(): number {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        return Math.sqrt(x * x + y * y + z * z);
    }


    /**
     * Calculates the length squared
     */
    lengthSquared(): number {
        return (this.x * this.x + this.y * this.y);
    }

    /**
     * Calculates the magnitude of this vector.
     * Alias of [[Vector.length]]
     */
    magnitude(): number {
        return this.length();
    }

    /**
     * Normalizes this vector.
     */
    normalize(): Vector {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        var len = x * x + y * y + z * z;

        if (len > 0) {
            len = 1 / Math.sqrt(len);

            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
        }
        return this;
    }


    /**
     * Calculates the dot product of this Vector and the given vector.
     * @return The dot product of this vector and provided vector.
     */
    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }


    cross(v: Vector): Vector {
        let ax = this.x;
        let ay = this.y;
        let az = this.z;
        let bx = v.x;
        let by = v.y;
        let bz = v.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }



    /**
     * Transform this vector given the provided matrix4.
     */
    transformWithMatrixIV(matrix: MatrixIV): Vector {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let mat = matrix.value;

        let tx = (x * mat[0]) + (y * mat[4]) + (z * mat[8]) + mat[12];
        let ty = (x * mat[1]) + (y * mat[5]) + (z * mat[9]) + mat[13];
        let tz = (x * mat[2]) + (y * mat[6]) + (z * mat[10]) + mat[14];
        let tw = (x * mat[3]) + (y * mat[7]) + (z * mat[11]) + mat[15];
        tw = tw || 1.0;

        this.x = tx / tw;
        this.y = ty / tw;
        this.z = tz / tw;
        return new Vector(this.x, this.y, this.z);
    }


    /**
     * Transform the current vector with the provided matrix4 to a
     * 2d.  This effectively takes this 3d vector and makes it into
     * the cooresponding 2d coordinates using the transformMatrix.
     *
     * This operation is the same as transformWithMatrixIV except the
     * z is dropped.
     * @param matrix
     */
    transformWithMatrixIVTo2d(matrix: MatrixIV): Vector {
        return this
            .transformWithMatrixIV(matrix)
            .set(this.x, this.y, 0);
    }


    // /**
    //  * Adds a 3d rotation.  This is NOT a rotation based on the center of the
    //  * this vector but based from VECTOR.ZERO.  (so adding a rotation will move
    //  * the position not the direction it's looking).
    //  * https://ikeryou.hatenablog.com/entry/2018/01/07/104729
    //  * @param v
    //  * @param angle Angle in radians.
    //  * TODO (uxder): Maybe move to vector-dom instead?
    //  */
    // rotateX(angle: number) {
    //     const cos = Math.cos(angle);
    //     const sin = Math.sin(angle);
    //     this.y = this.y * cos - this.z * sin;
    //     this.z = this.z * cos + this.y * sin;
    //     return this;
    // }


    // /**
    //  * Adds a 3d rotation.  This is NOT a rotation based on the center of the
    //  * this vector but based from VECTOR.ZERO.  (so adding a rotation will move
    //  * the position not the direction it's looking).
    //  * https://ikeryou.hatenablog.com/entry/2018/01/07/104729
    //  * @param v
    //  * @param angle Angle in radians.
    //  * TODO (uxder): Maybe move to vector-dom instead?
    //  */
    // rotateY(angle: number) {
    //     const cos = Math.cos(angle);
    //     const sin = Math.sin(angle);
    //     this.x = this.x * cos - this.z * sin;
    //     this.z = this.z * cos + this.x * sin;
    //     return this;
    // }


    // /**
    //  * Adds a 3d rotation.  This is NOT a rotation based on the center of the
    //  * this vector but based from VECTOR.ZERO.  (so adding a rotation will move
    //  * the position not the direction it's looking).
    //  * https://ikeryou.hatenablog.com/entry/2018/01/07/104729
    //  * @param v
    //  * @param angle Angle in radians.
    //  * TODO (uxder): Maybe move to vector-dom instead?
    //  */
    // rotateZ(angle: number) {
    //     const cos = Math.cos(angle);
    //     const sin = Math.sin(angle);
    //     this.x = this.x * cos - this.y * sin;
    //     this.y = this.y * cos + this.x * sin;
    //     return this;
    // }

    /**
     * Linear interpolates this vector TOWARDS the provided vector.
     * @param v
     * @param progress A number between 0-1.
     */
    lerp(v: Vector, progress: number = 0): Vector {
        this.x = mathf.lerp(this.x, v.x, progress);
        this.y = mathf.lerp(this.y, v.y, progress);
        this.z = mathf.lerp(this.z, v.z, progress);
        return this;
    }

    /**
     * Similar to lerp but uses exponential decay.   Useful to
     * smooth out animations with damping.
     * @param v
     * @param progress A number between 0-1.
     */
    damp(v: Vector, progress: number = 0, damp: number): Vector {
        this.x = mathf.damp(this.x, v.x, progress, damp);
        this.y = mathf.damp(this.y, v.y, progress, damp);
        this.z = mathf.damp(this.z, v.z, progress, damp);
        return this;
    }

    /**
     * Ease interpolates this vector TOWARDS the provided vector.
     * @param v
     * @param progress A number between 0-1.
     * @param easeFunction An easing function. See [[mathf.ease]].
     */
    ease(v: Vector, progress: number = 0, easeFunction = EASE.linear): Vector {
        this.x = mathf.ease(this.x, v.x, progress, easeFunction);
        this.y = mathf.ease(this.y, v.y, progress, easeFunction);
        this.z = mathf.ease(this.z, v.z, progress, easeFunction);
        return this;
    }



    /**
     * Ease interpolates and eases 1 vector towards another.
     * @param v1 startVector
     * @param v2 endVector
     * @param progress
     * @param easeFunction
     */
    static ease(v1: Vector, v2: Vector,
        progress: number = 0, easeFunction = EASE.linear): Vector {
        const x = mathf.ease(v1.x, v2.x, progress, easeFunction);
        const y = mathf.ease(v1.y, v2.y, progress, easeFunction);
        const z = mathf.ease(v1.z, v2.z, progress, easeFunction);
        return new Vector(x, y, z);
    }


    /**
     * Given vector a and vector b, takes the Math.min values of x,y,z and
     * returns a new Vector.
     * @param a Vector A
     * @param b Vector B
     */
    static min(a: Vector, b: Vector): Vector {
        return new Vector(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.min(a.z, b.z),
        )
    }

    /**
     * Given vector a and vector b, takes the Math.max values of x,y,z and
     * returns a new Vector.
     * @param a Vector A
     * @param b Vector B
     */
    static max(a: Vector, b: Vector): Vector {
        return new Vector(
            Math.max(a.x, b.x),
            Math.max(a.y, b.y),
            Math.max(a.z, b.z),
        )
    }


    /**
     * Clamps a given vector between a min and max vector.
     * @param min The min vector
     * @param max The max vector
     * @param vector The vector to clamp
     */
    static clamp(min: Vector, max: Vector, vector: Vector): Vector {
        return new Vector(
            mathf.clamp(min.x, max.x, vector.x),
            mathf.clamp(min.y, max.y, vector.y),
            mathf.clamp(min.z, max.z, vector.z),
        )
    }


    /**
     * A static zero vector.
     *
     * ```ts
     * let positon = Vector.ZERO;
     * ```
     */
    static get ZERO(): Vector {
        return new Vector(0, 0, 0);
    }

    /**
     * A static one vector.
     *
     * ```ts
     * let positon = Vector.ONE;
     * ```
     */
    static get ONE(): Vector {
        return new Vector(1, 1, 1);
    }

    /**
     * A static right vector for reference .
     *
     * ```ts
     * let positon = Vector.ONE;
     * position.add(Vector.RIGHT.scale(4))
     * ```
     */
    static get RIGHT(): Vector {
        return new Vector(1, 0, 0);
    }

    /**
     * A static left vector for reference .
     */
    static get LEFT(): Vector {
        return new Vector(-1, 0, 0);
    }

    /**
     * A static up vector for reference .
     */
    static get UP(): Vector {
        return new Vector(0, -1, 0);
    }

    /**
     * A static down vector for reference .
     */
    static get DOWN(): Vector {
        return new Vector(0, 1, 0);
    }

    /**
     * A static foward vector for reference .
     */
    static get FORWARD(): Vector {
        return new Vector(0, 0, 1);
    }

    /**
     * A static foward vector for reference .
     */
    static get BACK(): Vector {
        return new Vector(0, 0, -1);
    }
}