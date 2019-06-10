import { point } from './mathf';

/**
 * Implements a basic cubic beizer class with start point defined as 0,0 and
 * end point at 1,1.
 *
 * The most common usecase for this might to apply a CubiicBezier as an
 * easing function.  To do this, you can use the makeEasingFunction which
 * creates the CubicBezier internals and allows you to pass a t (time/progress),
 * to get results.
 *
 * ```ts
 *   var func = CubicBezier.makeEasingFunction(0.2,0.17,0.83,0.67));
 *   func(0.2); // Pass progress.
 * ```
 *
 * Use as instance:
 *
 * ```ts
 * let myBezier = new CubicBezier(0.2, 0.17, 0.83, 0.67);
 * myBezier.interporate(0);
 * myBezier.interporate(0.2);
 * myBezier.interporate(0.5);
 * myBezier.interporate(0.8);
 * myBezier.interporate(1);
 *
 * let x = mathf.ease(0, 500, this.progress,
 *            myBeizer.easingFunction());
 *
 * ```
 *
 *
 * Use static method.
 *
 * ```ts
 * CubicBezier.interporate(0, 0.2, 0.17, 0.83, 0.67);
 * CubicBezier.interporate(0.2, 0.2, 0.17, 0.83, 0.67);
 * CubicBezier.interporate(0.5, 0.2, 0.17, 0.83, 0.67);
 * CubicBezier.interporate(0.8, 0.2, 0.17, 0.83, 0.67);
 * CubicBezier.interporate(1, 0.2, 0.17, 0.83, 0.67);
 *
 *
 * let x = mathf.ease(0, 500, this.progress,
 *            CubicBezier.makeEasingFunction(0.2,0.17,0.83,0.67));
 *
 * ``1
 *
 *
 * References:
 * @see https://qiita.com/butchi_y/items/abb6d52fda6095b542e5
 * @see http://geom.web.fc2.com/
 * @see http://geom.web.fc2.com/geometry/bezier/cubic.html
 * @see https://stackoverflow.com/questions/27053888/how-to-get-time-value-from-bezier-curve-given-length
 */
export class CubicBezier {
    public x2: number;
    public y2: number;
    public x3: number;
    public y3: number;

    constructor(x2: number, y2: number, x3: number, y3: number) {
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x2;
        this.y3 = y3;
    }


    /**
     * Given 4 points, start, 2, 3 and end, generates the x,y point along the
     * bezier curve at progress (0-1) value.
     * @param progress
     * @param x1 Start point x
     * @param y1 Start point y
     * @param x2 Control point 2 x
     * @param y2 Control point 2 y
     * @param x3 Control point 3 x
     * @param y3 Control point 3 y
     * @param x4 End point x
     * @param y4 End point y
     */
    public static getBezierPoint(progress: number,
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): point {
        const tp = 1 - progress;
        const x = progress * progress * progress * x4 + 3 * progress * progress *
            tp * x3 + 3 * progress * tp * tp * x2 + tp * tp * tp * x1;
        const y = progress * progress * progress * y4 + 3 * progress * progress *
            tp * y3 + 3 * progress * tp * tp * y2 + tp * tp * tp * y1;

        return {
            x: x,
            y: y
        }
    }


    /**
     * Runs a basic cubic bezier interporalation given progress and point values
     * for the 2nd and 3rd controls of the cubic bezier.
     *
     * ```ts
     * let x = CubicBezier.interpolateProgress(0.2, 0.17, 0.67, 0.83, 0.67);
     *
     * ```
     * @param progress The progress of the interpolation.  Value between 0-1.
     * @param x2 The x of the second control point.
     * @param y2 The y of the second control point.
     * @param x2 The x of the third control point.
     * @param y3 The y of the fourth control point.
     * @return The interpolated value.
     */
    public static interpolateProgress(progress: number,
        x2: number, y2: number, x3: number, y3: number): number {

        // Get the point (x, y) for this current time.
        let point = CubicBezier.getBezierPoint(
            progress,
            0, 0,  // Start
            x2, y2, // Point2
            x3, y3, // Point 3
            1, 1  // End
        );

        // Simply return y since x is time and y is progression.
        return point.y;
    }

    /**
     * Runs a basic cubic bezier interporalation.
     *
     * ```ts
     * let myBezier = new CubicBezier(0.2, 0.17, 0.83, 0.67);
     * myBezier.interporate(0);
     * myBezier.interporate(0.2);
     *
     * ```
     * @param progress The progress of the interpolation.  Value between 0-1.
     * @return The interpolated value.
     */
    public interpolate(progress: number): Number {
        return CubicBezier.interpolateProgress(
            progress,
            this.x2, this.y2, this.x3, this.y3
        )
    }


    /**
     * Returns an easing function of this CubicBezier so it can be
     * used like other easing functions but used for instances.
     * @return A function that accepts a progresss value.
     */
    public easingFunction(): Function {
        return (progress: number) => {
            return this.interpolate(progress);
        }
    }


    /**
     * Returns an easing function of this CubicBezier so it can be
     * used like other easing functions.  A static method.
     * @param p0 The first control point.
     * @param p1 The second control point.
     * @param p2 The third control point.
     * @param p3 The fourth control point.
     * @return A function that accepts a progresss value.
     */
    public static makeEasingFunction(
        p0: number, p1: number, p2: number, p3: number): Function {
        return (progress: number) => {
            return this.interpolateProgress(progress, p0, p1, p2, p3);
        }
    }

}