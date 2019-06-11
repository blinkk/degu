
import { mathf } from './mathf';
import { Vector } from './vector';
import { HermiteCurve } from './hermite-curve';

/**
 * A basic catmull-rom class.  Useful for creating splines or catmull-rom
 * interpolations.  They are useful compared to other splines because they are
 * guaranteed to go through specified control points.
 *
 * This particular implementation uses hermite curves from point to point.
 * Given a set of points, we calculate the m0, m1 tangents between and
 * curve until we are out of points.
 *
 * TODO (uxder): Using interpolate, create a spline.
 * TDOO (uxder): Take on SVG spline interpolate.
 *
 * ```ts
 *    let catmullInterpolate = CatmullRom.interpolate(
 *        [
 *            new Vector(0, 0),
 *            new Vector(100, 100),
 *            new Vector(200, 200),
 *            new Vector(300, 400),
 *            ... // Can take any number of vectors.
 *        ],
 *        0.25,   // Optional m0 tension
 *        0.25    // Optional m1 tensions
 *    );
 *
 *   let progress = 0.5;
 *   let x = catmullInterplate(progress).x;  // Returns the x value at 0.5 progress.
 *   let y = catmullInterpolate(progress).y; // Returns the y value at 0.5 progress.
 * ```
 *
 * Or static method
 * ```ts
 *
 * let mypoints = [
 *           new Vector(0, 0),
 *           new Vector(100, 100),
 *           new Vector(200, 200),
 * ]
 * this.x = CatmullRom.getPoint(
 *    myPoints,
 *    0.5, // Progress
 * ).x;
 * this.y = CatmullRom.getPoint(
 *    myPoints,
 *    0.5, // Progress
 * ).y;
 *
 * ```
 *
 *
 * @see http://marina.sys.wakayama-u.ac.jp/~tokoi/?date=20150105
 * @see https://www.youtube.com/watch?v=w_uU_rPayoQ
 * @see https://en.wikibooks.org/wiki/Cg_Programming/Unity/Hermite_Curves
 * @see https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
 * @see http://hadashia.hatenablog.com/entry/2017/12/30/150556
 */
export class CatmullRom {


    /**
     * Create a function that can be called to apply camtull roll interpolations.
     * @param points  A point of vectors.
     * @param m0Tension
     * @param m1Tension
     */
    public static interpolate(points: Array<Vector>,
        m0Tension: number = 0.5,
        m1Tension: number = 0.5): Function {
        return (progress: number) => {
            return CatmullRom.getPoint(points, progress, m0Tension, m1Tension);
        }
    }

    /**
     * For the given set of vectors, finds the p0 and p1 (start and end)
     * vectors that apply to the current progress range and then calculates
     * the in-between m0 and m1 tangents and applies the hermite-curve
     * and returns a vector of the current catmull-rom interpolation.
     * @param points
     * @param progress
     */
    public static getPoint(points: Array<Vector>, progress: number,
        m0Tension: number = 0.5,
        m1Tension: number = 0.5): Vector {
        let pointCount = points.length - 1;
        let percentPerVector = 100 / pointCount;

        let i = mathf.clamp(
            Math.floor(mathf.lerp(0, pointCount, progress)),
            pointCount - 1,
            0);


        var p_1 = points[i - 1] && points[i - 1].clone();
        var p0 = points[i] && points[i].clone();
        var p1 = points[i + 1] && points[i + 1].clone();
        var p2 = points[i + 2] && points[i + 2].clone();

        // Calculate M0 tangent
        //   M0 = p1 - p_1 / 2
        var m0;
        if (i > 0) {
            m0 = Vector.subtract(p1, p_1).scale(m0Tension);
        } else {
            m0 = Vector.subtract(p1, p0);
        }


        // Calculate M1 tangent
        // M1 = p2 - p0 / 2
        var m1;
        if (i < pointCount - 2) {
            m1 = Vector.subtract(p2, p0).scale(m1Tension);
        } else {
            m1 = Vector.subtract(p1, p0);
        }

        // Calculate the child progress for this curve.
        let startProgress = percentPerVector * i / 100;
        let endProgress = percentPerVector * (i + 1) / 100;
        let childProgress = mathf.childProgress(
            progress, startProgress, endProgress
        )
        return HermiteCurve.getPoint(childProgress, p0, m0, p1, m1);
    }


}