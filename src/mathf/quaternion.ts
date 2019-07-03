
import { EASE } from '../ease/ease';
import { mathf } from './mathf';
import { MatrixIV } from './matrixIV';
import { Vector } from './vector';


/**
 * A basic quaternion class.
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


    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
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
     * var q = new Quaternion(0,0,0,0);
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
    set(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
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
            return Vector.ZERO;
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

}