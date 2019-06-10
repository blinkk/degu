
import { EASE } from '../ease/ease';
import { mathf } from './mathf';

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

    constructor(x: number, y: number, z: number = 0) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
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
     * var v = Vector.fromArray(0,2,2);
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
     * Adds this vector to another.
     */
    add(v: Vector): Vector {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z || 0;

        return this;
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
    device(v: Vector): Vector {
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
    negate(v: Vector): Vector {
        this.x = -this.x;
        this.y = -this.y;
        this.z = mathf.absZero(-this.z);
        return this;
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