

import { Vector } from './vector';


/**
 * Calculates the points on a hermite curve given contrl points and a time.
 *
 *
 * ```ts
 *
 * let hermitCurve = HermiteCurve.getPoint(
 *          0.3,
 *          new Vector(0, 100),
 *          new Vector(50, 100),
 *          new Vector(100, 200),
 *          new Vector(300, 300),
 * )
 *
 * let myXPoint = hermiteCurve.x;
 * let myYPoint = hermiteCurve.y;
 * ```
 *
 * @see http://marina.sys.wakayama-u.ac.jp/~tokoi/?date=20150105
 * @see https://en.wikibooks.org/wiki/Cg_Programming/Unity/Hermite_Curves#/media/File:Hermite_spline_2-segments.svg
 * @see https://en.wikipedia.org/wiki/Cubic_Hermite_spline
 * @see https://en.wikibooks.org/wiki/Cg_Programming/Unity/Hermite_Curves
 */
export class HermiteCurve {
    constructor() { }

    /**
     * Given start point p0 and it's tangent m0 and the endpoint p1 and it's
     * tangent m1, calculates a cubic hermit curve.
     *
     * Keep in mind that t here is a progress of value 0-1 but it is for this
     * curve.  So at 0, we would be at the start point and 1 would be at the end
     * point.
     *
     *
     * @param t The current progress.
     * @param p0 The start voint p0
     * @param m0 The tangent of p0
     * @param p1 The end point
     * @param m1 The tangent of p1
     */
    public static getPoint(t: number, p0: Vector, m0: Vector, p1: Vector, m1: Vector): Vector {
        return p0.clone().scale(1 - 3 * t * t + 2 * t * t * t)
            // h1
            .add(
                m0.clone().scale(t - 2 * t * t + t * t * t)
            )
            // h2
            .add(
                m1.clone().scale(-t * t + t * t * t)
            )
            // h3
            .add(
                p1.clone().scale(3 * t * t - 2 * t * t * t)
            )
    }
}