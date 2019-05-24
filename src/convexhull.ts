
/**
 * A utility class to run a simple convex hull monotone chain algo.
 * @see https://goo.gl/20M7Aw
 */
export class ConvexHull {
    constructor() { }

    /**
     * Calculates and returns the outer points.
     * @param {Array.<number>} An array of x, y.
     * @return {Array.<number>} A set of x,y points.
     */
    calculate(points: number[]) {
        points.sort(function(a, b) {
            return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
        });

        let lower = [];
        for (let i = 0; i < points.length; i++) {
            while (lower.length >= 2 &&
                this.cross(lower[lower.length - 2],
                    lower[lower.length - 1],
                    points[i]) <= 0) {
                lower.pop();
            }
            lower.push(points[i]);
        }

        let upper: number[] = [];

        for (let i = points.length - 1; i >= 0; i--) {
            while (upper.length >= 2 &&
                this.cross(
                    upper[upper.length - 2],
                    upper[upper.length - 1],
                    points[i]) <= 0) {
                upper.pop();
            }
            upper.push(points[i]);
        }

        upper.pop();
        lower.pop();
        return lower.concat(upper);
    }

    /**
     * Determines if a set of points cross.
     * @param  {number} o The origin point.
     * @param  {number} a The first point.
     * @param  {number} b The second point.
     * @return {boolean} Whether the points cross.
     */
    cross(o: number, a: number, b: number): any {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }
}