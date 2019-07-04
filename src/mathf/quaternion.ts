
import { EASE } from '../ease/ease';
import { mathf } from './mathf';
import { MatrixIV } from './matrixIV';
import { Vector } from './vector';


/**
 * A basic quaternion class.
 * Adapted from:
 * @see https://github.com/toji/gl-matrix
 * @see https://github.com/mattdesl/vecmath
 * @see https://cubap.github.io/phaser3-docs/math_Quaternion.js.html
 */
export class Quaternion {

    /**
     * The x component of this quaternion.
     */
    public x: number;
    /**
     * The y component of this quaternion.
     */
    public y: number;
    /**
     * The z component of this quaternion.
     */
    public z: number;
    /**
     * The w component of this quaternion.
     */
    public w: number;


    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }


    /***
     * Makes a clone of this quaternion.
     *
     * ```ts
     *
     * var q = new Quaternion(0.4,0,0,1);
     * var clone = q.clone();
     *
     * ```
     */
    clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }


    /**
     * Sets x, y, z, w of this quaternion.
     */
    set(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }


    /**
     * Adds a given quaternion or vector to this quaternion.
     *
     * ```ts
     *
     * var q = new Quaternion(0,0,0,0);
     * var q2 = new Quaternion(0,0,0,0);
     * q.add(q2);
     *
     * ```
     */
    add(q: Quaternion | Vector): Quaternion {
        this.x += q.x;
        this.y += q.y;
        this.z += q.z;
        this.w += q.w;
        return this;
    }


    /**
     * Adds a given quaternion or vector to another quaternion or vector and
     * return a new one.
     *
     * ```ts
     *
     * var q = new Quaternion(0,0,0,0);
     * var q2 = new Quaternion(0,0,0,0);
     * var q3 = Quaternion.add(q, q2);
     *
     * ```
     */
    static add(q1: Quaternion | Vector, q2: Quaternion | Vector): Quaternion {
        const x = q1.x + q2.x;
        const y = q1.y + q2.y;
        const z = q1.z + q2.z;
        const w = q1.w + q2.w;
        return new Quaternion(x, y, z, w);
    }


    /**
     * Adds eular degrees to the quaternion.
     *
     *```ts

     * var q = new Quaternion(0,0,0,0);
     * q.addEular(30, 0, 0);
     *
     * ```
     *
     * @param x x in degrees
     * @param y y in degrees
     * @param z z in degrees
     */
    addEuler(x: number, y: number, z: number): Quaternion {
        let v = Quaternion.toEulerVector(this.clone());
        v.add(new Vector(x, y, z));
        console.log(v.y);
        this.slerpEular(v.x, v.y, v.z, 1);
        return this;
    }


    /**
     * Subtracts a given quaternion or vector to this quaternion.
     *
     * ```ts
     *
     * var q = new Quaternion(0,0,0,0);
     * var q2 = new Quaternion(0,0,0,0);
     * q.subtract(q2);
     *
     * ```
     */
    subtract(q: Quaternion | Vector): Quaternion {
        this.x -= q.x;
        this.y -= q.y;
        this.z -= q.z;
        this.w -= q.w;
        return this;
    }


    /**
     * Subtracts a given quaternion or vector to another quaternion or vector and
     * return a new one.
     *
     * ```ts
     *
     * var q = new Quaternion(0,0,0,0);
     * var q2 = new Quaternion(0,0,0,0);
     * var q3 = Quaternion.subtract(q, q2);
     *
     * ```
     */
    static subtract(q1: Quaternion | Vector, q2: Quaternion | Vector): Quaternion {
        const x = q1.x - q2.x;
        const y = q1.y - q2.y;
        const z = q1.z - q2.z;
        const w = q1.w - q2.w;
        return new Quaternion(x, y, z, w);
    }

    /**
     * Scales this Quaternion by a given scale.
     */
    scale(scalar: number): Quaternion {
        if (isFinite(scalar)) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
            this.w *= scalar;
            return this;
        } else {
            return Quaternion.ZERO;
        }
    }


    /**
     * Calculates the length / magnitude of this quaternion.
     */
    length(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    /**
     * Calculates the length squared
     */
    lengthSquared(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return x * x + y * y + z * z + w * w;
    }

    /**
     * Calculates the magnitude of this quaternion.
     * Alias of [[Quaternion.length]]
     */
    magnitude(): number {
        return this.length();
    }


    /**
     * Normalizes this quaternion.
     */
    normalize(): Quaternion {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        let len = x * x + y * y + z * z + w * w;

        if (len > 0) {
            len = 1 / Math.sqrt(len);

            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
            this.w = w * len;
        }

        return this;
    }


    /**
     * Calculates the dot product of this Quaternion (or Vector) and the given
     * Quaternion (or Vector)
     * @return The dot product of this quarternion and the provided quaternion.
     */
    dot(q: Quaternion | Vector): number {
        return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
    }


    /**
     * Linear interpolates this Quaternion towards the given quaternion or vector.
     * @param q
     * @param progress
     */
    lerp(q: Quaternion | Vector, progress: number) {
        this.x = mathf.lerp(this.x, q.x, progress);
        this.y = mathf.lerp(this.y, q.y, progress);
        this.z = mathf.lerp(this.z, q.z, progress);
        this.w = mathf.lerp(this.w, q.z, progress);
        return this;
    }


    /**
     * Slerps to a specific rotation in Eular degrees.
     * ```ts
     *
     * myQuat.slerpEular(30, 0, 0, this.progress);
     *
     * ```
     * @param x
     * @param y
     * @param z
     */
    slerpEular(x: number, y: number, z: number, progress: number): Quaternion {
        let target = Quaternion.fromEuler(x, y, z);
        this.slerp(target, progress);
        return this;
    }

    /**
     * Slerps this quaternion towards the given quaternion or vector.
     * Inspired by: https://jsperf.com/quaternion-slerp-implementations
     *
     * ```ts
     *
     *  let target = Quaternion.fromEuler(90, 20, 0);
     *  myQuat.slerp(target, this.progress);
     *
     * ```
     *
     *
     * @param q
     * @param progress
     */
    slerp(q: Quaternion | Vector, progress: number): Quaternion {
        const EPSILON = 0.000001;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        var aw = this.w;

        var bx = q.x;
        var by = q.y;
        var bz = q.z;
        var bw = q.w;

        var cosom = ax * bx + ay * by + az * bz + aw * bw;

        if (cosom < 0) {
            cosom = -cosom;
            bx = - bx;
            by = - by;
            bz = - bz;
            bw = - bw;
        }

        let s0 = 1 - progress;
        let s1 = progress;

        if ((1 - cosom) > EPSILON) {
            var omega = Math.acos(cosom);
            var sinom = Math.sin(omega);
            s0 = Math.sin((1.0 - progress) * omega) / sinom;
            s1 = Math.sin(progress * omega) / sinom;
        }

        this.x = s0 * ax + s1 * bx;
        this.y = s0 * ay + s1 * by;
        this.z = s0 * az + s1 * bz;
        this.w = s0 * aw + s1 * bw;

        return this;
    }


    /**
     * Inverts this quaternion.
     */
    invert(): Quaternion {
        const a0 = this.x;
        const a1 = this.y;
        const a2 = this.z;
        const a3 = this.w;

        const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        const invDot = (dot) ? 1 / dot : 0;
        this.x = -a0 * invDot;
        this.y = -a1 * invDot;
        this.z = -a2 * invDot;
        this.w = a3 * invDot;
        return this;
    }


    /**
     * RotateX the quaternion by given radian
     * @param rad
     */
    rotateX(rad: number): Quaternion {
        rad *= 0.5;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;
        const bx = Math.sin(rad);
        const bw = Math.cos(rad);

        this.x = ax * bw + aw * bx;
        this.y = ay * bw + az * bx;
        this.z = az * bw - ay * bx;
        this.w = aw * bw - ax * bx;

        return this;
    }

    /**
     * RotateY the quaternion by given radian
     * @param rad
     */
    rotateY(rad: number): Quaternion {
        rad *= 0.5;

        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;
        const by = Math.sin(rad);
        const bw = Math.cos(rad);

        this.x = ax * bw - az * by;
        this.y = ay * bw + aw * by;
        this.z = az * bw + ax * by;
        this.w = aw * bw - ay * by;

        return this;
    }

    /**
     * RotateZ the quaternion by given radian
     * @param rad
     */
    rotateZ(rad: number): Quaternion {

        rad *= 0.5;
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;

        const bz = Math.sin(rad);
        const bw = Math.cos(rad);

        this.x = ax * bw + ay * bz;
        this.y = ay * bw - ax * bz;
        this.z = az * bw + aw * bz;
        this.w = aw * bw - az * bz;

        return this;
    }


    /**
     * Conjugate this quaternion
     */
    conjugate(): Quaternion {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }


    /**
     * Creates a Quaternion from the given eular angle x, y, z.
     *
     * ```ts
     *
     * let quat = Quaternion.fromEuler(180, 90, -90);
     *
     * ```
     * @see https://quaternions.online/
     * @see https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
     * @param x x
     * @param y y
     * @param z z
     */
    static fromEuler(x: number, y: number, z: number): Quaternion {
        x = mathf.degreeToRadian(x);
        y = mathf.degreeToRadian(y);
        z = mathf.degreeToRadian(z);
        var cos = Math.cos;
        var sin = Math.sin;

        var c1 = cos(x / 2);
        var c2 = cos(y / 2);
        var c3 = cos(z / 2);

        var s1 = sin(x / 2);
        var s2 = sin(y / 2);
        var s3 = sin(z / 2);

        // XYZ ordering.
        // https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js#L224
        let rx = s1 * c2 * c3 + c1 * s2 * s3;
        let ry = c1 * s2 * c3 - s1 * c2 * s3;
        let rz = c1 * c2 * s3 + s1 * s2 * c3;
        let rw = c1 * c2 * c3 - s1 * s2 * s3;

        return new Quaternion(rx, ry, rz, rw);
    }


    /**
     * Converts a Euler Degree vector to a Quaternion.
     *
     * ```ts
     *
     * let eulerVector = new Vector(90, 180, 0);
     * let quat = Quaternion.fromEulerVector(eulerVector);
     * ```
     *
     * @param v
     */
    static fromEulerVector(v: Vector) {
        return Quaternion.fromEuler(v.x, v.y, v.z);
    }


    /**
     * Converts a quaternion to a EulerVector consisting of degrees.
     * YXZ Local Axes Yaw (y), Pitch (x), Roll (z)
     * Outputs XYZ ordering.
     * @see https://bit.ly/1TzLyaC
     * @param q
     */
    static toEulerVector(q: Quaternion): Vector {
        let result = Vector.ZERO;

        // Create a rotation matrix from the quaternion.
        let matrix = MatrixIV.fromQuaternion(q.clone());

        var te = matrix.value;
        var m11 = te[0], m12 = te[4], m13 = te[8];
        var m21 = te[1], m22 = te[5], m23 = te[9];
        var m31 = te[2], m32 = te[6], m33 = te[10];

        // XYZ ordering
        // https://github.com/mrdoob/three.js/blob/master/src/math/Euler.js#L146
        result.y = Math.asin(mathf.clamp(- 1, 1, m13));

        if (Math.abs(m13) < 0.99999) {
            result.x = Math.atan2(- m23, m33);
            result.z = Math.atan2(- m12, m11);
        } else {
            result.x = Math.atan2(m32, m22);
            result.z = 0;
        }



        result.x = mathf.radianToDegree(result.x);
        result.y = mathf.radianToDegree(result.y);
        result.z = mathf.radianToDegree(result.z);


        return result;
    }


    /**
     * Creates a rotation which rotates angle degrees around axis.
     * ```ts
     *
     * // Rotate 23 degrees around Y axis.
     * let rad = mathf.degreesToRadian(23);
     *
     * let quat = Quaternion.ZERO;
     * quat.angleAxis(rad, Vector.UP); // Y
     * quat.angleAxis(rad, Vector.RIGHT); // X
     * quat.angleAxis(rad, Vector.FORWARD); // Z
     *
     * ```
     *
     * @param rad Angle in radians
     * @param axis An axis vector to rotate on. Axis should be normalized.
     */
    angleAxis(rad: number, axis: Vector) {
        rad = rad * 0.5;

        var s = Math.sin(rad);

        this.x = s * axis.x;
        this.y = s * axis.y;
        this.z = s * axis.z;
        this.w = Math.cos(rad);

        return this;
    }

    /**
     * Sets a quaternion to represent the shortest rotation from one vector
     * to another.
     *
     * Both vectors should be unit length (normalized).
     *
     * @param {Vector} a The initial vector (unit length)
     * @param {Vector} b The destination vector (unit length)
     */
    rotationTo(a: Vector, b: Vector) {
        var dot = a.x * b.x + a.y * b.y + a.z * b.z;
        var EPSILON = 0.000001;
        var xUnitVec3 = new Vector(1, 0, 0);
        var yUnitVec3 = new Vector(0, 1, 0);
        var tmpvec = Vector.ZERO;
        if (dot < -0.999999) {
            if (xUnitVec3.clone().cross(a).length() < EPSILON) {
                yUnitVec3.clone().cross(a);
            }

            tmpvec.normalize();

            return this.angleAxis(Math.PI, tmpvec);

        }
        else if (dot > 0.999999) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 1;

            return this;
        }
        else {
            a.clone().cross(b);

            this.x = tmpvec.x;
            this.y = tmpvec.y;
            this.z = tmpvec.z;
            this.w = 1 + dot;

            return this.normalize();
        }
    }




    /**
     * A static zero quaternion.
     *
     * ```ts
     * let q = Quaternion.ZERO;
     * ```
     */
    static get ZERO(): Quaternion {
        return new Quaternion(0, 0, 0, 0);
    }

    /**
     * A static identity quaternion.
     *
     * ```ts
     * let q = Quaternion.IDENTITY;
     * ```
     */
    static get IDENTITY(): Quaternion {
        return new Quaternion(0, 0, 0, 1);
    }

    /**
     * A static one quaternion.
     *
     * ```ts
     * let q = Quaternion.ONE;
     * ```
     */
    static get ONE(): Quaternion {
        return new Quaternion(1, 1, 1);
    }
}