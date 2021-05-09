import {EASE} from '../ease/ease';

export interface circ {
  radius: number;
  x: number;
  y: number;
}

export interface box {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface dimensionalBox {
  height: number;
  width: number;
}

export interface point {
  x: number;
  y: number;
}

export interface backgroundCoverBox {
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  scalar: number;
}

/**
 * Degu Math utility functions.
 */
export class mathf {
  /**
   * Returns 0 if value is 0 or -0, otherwise, passes through the value.
   * ```ts
   * mathf.absZero(-0)  --> 0
   * mathf.absZero(0)  --> 0
   * mathf.absZero(10)  --> 10
   * mathf.absZero(-12)  --> -12
   * ```
   * @tested
   */
  static absZero(value: number) {
    return value == -0 ? 0 : value;
  }

  /**
   * Takes a number like a float and fixes it's digits.
   * Example:
   * ```ts
   *   mathf.fixDigits(20.12345, 2) ==> 20.12
   *   mathf.fixDigits(20.12345, 3) ==> 20.123
   * ```
   * @tested
   * @param {number} value The number to convert
   * @param {number} digits The number of digits to output.
   */
  static fixDigits(value: any, digits: number): number {
    return +parseFloat(value).toFixed(digits);
  }

  /**
   * Takes a number and forces it to an int with rounding up.
   * ```ts
   *   mathf.int(20.3333)  --> 20
   *   mathf.int(20.32)    --> 20
   *   mathf.int(20.5)    --> 21
   *   mathf.int(20)       --> 20
   * ```
   * @tested
   * @param {number} value The number to convert
   * @param {number} digits The number of digits to output.
   */
  static int(value: number): number {
    return mathf.fixDigits(value, 0);
  }

  /**
   *
   * Takes a number and forces it to an int by simply dropping decimals.
   * ```ts
   *   mathf.int(20.3333)  --> 20
   *   mathf.int(20.32)    --> 20
   *   mathf.int(20.555)  --> 20
   *   mathf.int(20.9999)  --> 20
   *   mathf.int(20)       --> 20
   * ```
   * @tested
   * @param {number} value The number to convert
   * @param {number} digits The number of digits to output.
   */
  static int0(value: number): number {
    return value >> 0;
  }

  /**
   * Flips a coin.  Give you either a 1 or 0.
   */
  static flipCoin(): number {
    return mathf.getRandomInt(0, 1);
  }

  /**
   * Returns a random number (float) between min (inclusive) and max (exclusive)
   * @param {number} min The minimum range.
   * @param {number} max The maximum range.
   * @return {number} A random number between the provided range.
   * @function
   */
  static getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * @param {number} min The minimum range.
   * @param {number} max The maximum range.
   * @return {number} A random integer betwen the provided range.
   */
  static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Returns a random integrater between min and max but ensures it is not a
   * certain value.
   * @param {number} min The minimum range.
   * @param {number} max The maximum range.
   * @param {number} not The value it should not be.
   */
  static getUniqueRandomInt(min: number, max: number, not: number): number {
    const random = mathf.getRandomInt(min, max);
    if (random == not) {
      return mathf.getUniqueRandomInt(min, max, not);
    } else {
      return random;
    }
  }

  /**
   * Clamps a number to a given range.
   * ```ts
   * mathf.clamp(0, 10, 100)  --> 10
   * mathf.clamp(0, 10, -10)  --> 0
   * ```
   * @tested
   * @param {number} min The mininum value.
   * @param {number} max The maximum value:
   * @param {number} num The number to limit.
   * @return {number} A number within the min and max range.
   */
  static clamp(min: number, max: number, num: number): number {
    return Math.min(Math.max(num, min), max);
  }

  /**
   * Given a progress (a value that ranges from 0 to 1), this method allows you
   * to create a child progress based on the parent progress.
   *
   * Imaging the following progress.
   * ```
   * Parent progress
   * 0 -----0.2------0.4-------0.6-------0.8------1
   *
   * Child progress
   *        0.2----------------0.6
   *
   * mathf.childProgress(parentProgress, 0.2, 0.6)
   * ```
   * If you have a parent progress runnning from 0 to 1 and  you wanted your child
   * progress to start at 0.2 and end at 0.6.
   *
   * Given the parent progress,  this method would return:
   * ```
   * Parent progress        Output
   * 0            --------->   0
   * |
   * 0.2          --------->   0
   * 0.3          --------->   0.25
   * 0.4          --------->   0.5
   * 0.5          --------->   0.75
   * 0.6          --------->   1
   * 0.7          --------->   1
   * |
   * 1            --------->   1
   * ```
   *
   * @tested
   * @param {number} number The parent progress as a value between 0 and 1.
   * @param {number} start The starting value of the child progress.  Value
   *     between 0 and 1.
   * @param {number} end The end value of the child progress.  Value
   *     between 0 and 1.
   */
  static childProgress(
    progress: number,
    start: number,
    end: number,
    noClamp: boolean = false
  ): number {
    const range = end - start;
    let childProgress = mathf.clamp(0, 1, progress - start);

    if (noClamp) {
      childProgress = progress - start;
    }

    childProgress = childProgress / range;
    if (noClamp) {
      return childProgress;
    } else {
      return mathf.clampAsPercent(childProgress);
    }
  }

  /**
   * Rounds to a specific precision.
   * ```
   * mathf.roundToPrecision(0.49999, 1)  --> 0.5
   * mathf.roundToPrecision(0.49999, 2)  --> 0.5
   * mathf.roundToPrecision(0.41199, 3)  --> 0.412
   * mathf.roundToPrecision(0.5555, 3)  --> 0.556
   * mathf.roundToPrecision(0.5555, 2)  --> 0.56
   * ```
   * @tested
   * @param value
   * @param precision
   */
  static roundToPrecision(value: number, precision: number): number {
    precision = mathf.int(precision);
    const shifter = Math.pow(10, precision);
    return Math.round(value * shifter) / shifter;
  }

  /**
   * Floors number to a specific precision.
   * ```
   * mathf.floorToPrecision(0.5555, 3)  --> 0.555
   * mathf.floorToPrecission(0.5555, 2)  --> 0.55
   * ```
   * @tested
   * @param value
   * @param precision
   */
  static floorToPrecision(value: number, precision: number): number {
    precision = mathf.int(precision);
    const shifter = Math.pow(10, precision);
    return Math.floor(value * shifter) / shifter;
  }

  /**
   * Ceils number to a specific precision.
   * ```
   * mathf.ceilToPrecision(0.5555, 3)  --> 0.555
   * mathf.ceilToPrecission(0.5555, 2)  --> 0.55
   * ```
   * @tested
   * @param value
   * @param precision
   */
  static ceilToPrecision(value: number, precision: number): number {
    precision = mathf.int(precision);
    const shifter = Math.pow(10, precision);
    return Math.ceil(value * shifter) / shifter;
  }

  /**
   * Converts a number to a specific number of decimasl
   * ```
   * mathf.toFixed(1.943, 2) --> 1.94
   * mathf.toFixed(1.943, 1) --> 1.9
   * ```
   * @param value
   * @param precision
   */
  static toFixed(value: number, precision: number): number {
    return +value.toFixed(precision);
  }

  /**
   * Calculate the angle between two points.
   * @param  {number} x1 The x position of the first point.
   * @param  {number} y1 The y position of the first point.
   * @param  {number} x2 The x position of the second point.
   * @param  {number} y2 The y position of the second point.
   * @return {number} The angle in radians.
   */
  static angleRadians(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Calculate the angle between two points given cartesian coordinates system.
   * @param  {number} x1 The x position of the first point.
   * @param  {number} y1 The y position of the first point.
   * @param  {number} x2 The x position of the second point.
   * @param  {number} y2 The y position of the second point.
   * @return {number} The angle in degrees.
   */
  static angleDegree(x1: number, y1: number, x2: number, y2: number) {
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  }

  /**
   * Determine the angular distance between two angles in degree.
   *
   * In a 360 circle, if you had one degre at 90 and another at 80,
   * the angle distance is 10, the difference between the two.
   *
   * Examples
   * ```ts
   *   mathf.angleDistanceDegree(10, 10) ==> 0
   *   mathf.angleDistanceDegree(30, 10) ==> -20
   *   mathf.angleDistanceDegree(10, 50) ==> 40 *   mathf.angleDistanceDegree(10, 340) ==> -30 * ``` *
   * @tested
   * @param {number} angle0 The first angle in degrees.
   * @param {number} angle1 The second angle in degrees.
   * @param {number?} max The max value at which point the numerical system
   *     repeats.  In a circle this would be 360.  This value defaults to 360.
   * @return {number} Distance in degrees.
   */
  static angleDistanceDegree(angle0: number, angle1: number, max?: number) {
    const angle0Rad = mathf.degreeToRadian(angle0);
    const angle1Rad = mathf.degreeToRadian(angle1);
    if (max) {
      max = mathf.degreeToRadian(max);
    }
    const result = mathf.angleDistanceRadian(angle0Rad, angle1Rad, max);
    return mathf.radianToDegree(result);
  }

  /**
   * Determine the angular distance between two angles in radians.
   * [[mathf.angleDistanceDegree]] for more information and equivelant degree
   * samples.
   * @tested
   * @param {number} angle0 The first angle in radians
   * @param {number} angle1 The second angle in degrees.
   * @param {number?} max The max value at which point the numerical system
   *     repeats.  In a circle this would be 2 radian.  This value defaults to
   *     2 radian.
   * @return {number} Distance in radians
   */
  static angleDistanceRadian(angle0: number, angle1: number, max?: number) {
    if (!max) {
      max = Math.PI * 2;
    }
    const delta = (angle1 - angle0) % max;
    return ((2 * delta) % max) - delta;
  }

  /**
   * Converts radians to degrees.
   * @param  {number} deg The degree value.
   * @return {number} The converted radian.
   */
  static degreeToRadian(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Converts radians to degrees.
   * @param  {number} radian The radian value.
   * @return {number} The converted degree.
   */
  static radianToDegree(radian: number): number {
    return (radian * 180) / Math.PI;
  }

  /**
   * Checks for collision detection.
   * @param {Object} a An object with x, y, width and height.
   * @param {Object} b An object with x, y, width and height.
   * @return {boolean} Whether the areas are colliding.
   */
  static boxCollision(a: box, b: box) {
    return !(
      a.y + a.height < b.y ||
      a.y > b.y + b.height ||
      a.x + a.width < b.x ||
      a.x > b.x + b.width
    );
  }

  /**
   * Given a circular and rectangular object, detects when the two collide
   * with each other on a 2d space.  Assumes Box is unrotated.
   * @param rect An object with x, y, width and height.
   * @see https://yal.cc/rectangle-circle-intersection-test/
   */
  static collisionCircVsBox(circ: circ, rect: box) {
    let dx = circ.x - Math.max(rect.x, Math.min(circ.x, rect.x + rect.width));
    let dy = circ.y - Math.max(rect.y, Math.min(circ.y, rect.y + rect.height));
    return dx * dx + dy * dy < circ.radius * circ.radius;
  }

  /**
   * Performs a test whether a point resized inside a convex polygon using
   * raycasting.
   * @param point An object with x,y coords of the point.
   * @param poly An array of x,y points of a polygon.
   * @return Whether the point is inside the polygon or not.
   * @see http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
   * @see https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
   * @see https://www.gamedevelopment.blog/collision-detection-circles-rectangles-and-polygons/
   * @see https://stackoverflow.com/questions/22521982/check-if-point-inside-a-polygon
   * @see https://github.com/mikolalysenko/robust-point-in-polygon/blob/master/robust-pnp.js
   */
  static collisionPointVersusConvexPolygon(
    point: point,
    poly: Array<point>
  ): boolean {
    // We go around in the polygon.
    // Assuming there are four point (but could be more),
    //
    //   0----1
    //   |    |
    //   3----2
    // We perform raycasting, 0-3, 1-0, 2-1, 3-2 points.
    //
    let isInside = false;
    const size = poly.length;
    let pointPolyAIndex = 0;
    let pointPolyBIndex = size - 1;
    for (var i = 0; i < size; i++) {
      const polyA = poly[pointPolyAIndex];
      const polyB = poly[pointPolyBIndex];

      var intersects =
        polyA.y > point.y != polyB.y > point.y &&
        point.x <
          ((polyB.x - polyA.x) * (point.y - polyA.y)) / (polyB.y - polyA.y) +
            polyA.x;
      if (intersects) {
        isInside = !isInside;
      }

      pointPolyBIndex = pointPolyAIndex;
      pointPolyAIndex++;
    }

    return isInside;
  }

  /**
   * Use rotational matrix to calculate the new coordinates of a rotated
   * point.
   *
   * Put another way, given point x and y, and a center point of cx and cy,
   * calculates the translated x, y points when rotated at a given angle.
   *
   * For example:
   *
   *      0,0--------------4,0
   *       |               |
   *       |       2,2     |
   *       |               |
   *      0,4 ------------ 4,4
   *
   * Say for example you have a rectangle.  The rotational center of the
   * rectangle is the center in this case at 2,2.
   *
   * You can use this algo to calculate rotation.
   * Lets say you rotate the rectangle by 1 radian (~57 degrees).
   * What is the new coordinates of the top right corner?
   *
   * ```
   * const newCoords = mathf.calculate2dPointRotation(2,2,4,0,1);
   *
   * newCoords.x;  // 1.398
   * newCoords.y;  // -0.764
   *
   * ```
   *
   * Troubleshoot?
   *
   * The most common issue is that your rotation value is inverted.
   * Try passing in -rotation and see if that helps.
   *
   * https://www.youtube.com/watch?v=xsN8cD6oisY&feature=youtu.be
   * https://www.youtube.com/watch?v=a59YQ4qe7mE
   * https://en.wikipedia.org/wiki/Rotation_matrix
   *
   * @param cx The x center point to rotate around.
   * @param cy The y center point to rotate around.
   * @param x The x value of the point to be rotated prior to rotation.
   * @param y The y value of the point to be rotated prior to rotation.
   * @param angle The angle in radians
   * @tested
   */
  static calculate2dPointRotation(
    cx: number,
    cy: number,
    x: number,
    y: number,
    angle: number
  ) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    const tx = cos * (x - cx) + sin * (y - cy) + cx;
    const ty = cos * (y - cy) - sin * (x - cx) + cy;
    return {
      x: tx,
      y: ty,
    };
  }

  /**
   * Rotates a point around another point with angle and distance.
   * This is similar to
   * [[mathf.calculate2dPointRotation]] except that you are specifying a
   * distance as well.
   * @param cx The x center point to rotate around.
   * @param cy The y center point to rotate around.
   * @param x The x value of the point to be rotated prior to rotation.
   * @param y The y value of the point to be rotated prior to rotation.
   * @param angle The angle in radians
   * @param distance The distance from cx and cy in which we should place the
   *     new coordinates to.
   */
  static calculate2dPointRotationWithDistance(
    cx: number,
    cy: number,
    x: number,
    y: number,
    angle: number,
    distance: number
  ) {
    var t = angle + Math.atan2(y - cy, x - cx);

    x = cx + distance * Math.cos(t);
    y = cy + distance * Math.sin(t);

    return {
      x: x,
      y: y,
    };
  }

  /**
   * Generates a set of random x,y points.
   * @param {number} num Number of points.
   * @param {number} minX Minimum of x.
   * @param {number} maxX Maximum of x.
   * @param {number} minY Minimum of y.
   * @param {number} maxY Maximum of y.
   * @return {Array.<Object>} An array of objects containing x, y values.
   */
  static generateRandomPoints = (
    num: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) => {
    const points = [];
    for (let i = 0; i < num; i++) {
      points.push({
        x: mathf.getRandomInt(minX, maxX),
        y: mathf.getRandomInt(minY, maxY),
      });
    }
    return points;
  };

  /**
   * Calculates the distance of two sets of x, y coordinates.
   * @param  {number} x1 The x value of point 1.
   * @param  {number} y1 The y value of point 1.
   * @param  {number} x2 The x value of point 2.
   * @param  {number} y2 The y value of point 2.
   * @return {number} The distance between point 1 and point 2.
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Gets the direction in which a number is progress.
   * 0 means the same, no movement.
   * 1 means moving forward.
   * -1 means moving backwards.
   * ```ts
   * matfh.direction(1, 2) ---> 1
   * matfh.direction(3, 1) ---> -1
   * matfh.direction(1, 1) ---> 0
   * ```
   * @param previous
   * @param current
   * @tested
   */
  static direction(previous: number, current: number): number {
    if (previous == current) {
      return 0;
    }

    return previous < current ? 1 : -1;
  }

  /**
   * Calculates the offset value to center a given element within a container.
   *
   * Imagine the below:
   *
   * ```
   * ------------------8 (parent)----------------
   * |                                           |
   * |             |----5(child)-----|           |
   * |                                           |
   * |---offset--|                               |
   * --------------------------------------------
   * ```
   *
   *  You have a parent of width 8 and child of with 5 and you want to
   *  center the child.
   *
   *  In the example above, parent = 8, child = 5, would return the offset of 1.5
   *  So you know that if you offsetted the child element by 1.5, it would
   *  horizontally center.
   *
   *  You can also use this method to calculate vertical alignment as well.
   *
   * Example:
   * Here is an example of calculating the x, y offsets to center an object
   * to the screen.
   * ```ts
   *  let x = mathf.calculateCenterOffset(
   *     screen.width, object.width);
   *  let y = mathf.calculateCenterOffset(
   *     screen.height, object.width);
   * ```
   * @tested
   * @param {number} parent The parent value
   * @param {number} child The child value
   * @return {number} The offset value.
   */
  static calculateCenterOffset(parent: number, child: number): number {
    const halfParent = parent / 2;
    const halfChild = child / 2;
    const offset = halfParent - halfChild;
    return offset;
  }

  /**
   * Given a known set of sizes, scales and returns a y1.
   *
   * `````ts
   *  x1     x2 (return)
   * ---- = ----
   *  y1     y2
   *
   * ````
   */
  static scaleX(x1: number, y1: number, y2: number): number {
    return (x1 * y2) / y1;
  }

  /**
   * Given a known set of sizes, scales and returns a y2.
   *
   * `````ts
   *  x1     x2
   * ---- = ----
   *  y1     y2 (return)
   *
   * ````
   */
  static scaleY(x1: number, y1: number, x2: number): number {
    return (x2 * y1) / x1;
  }

  /**
   * Given a width and height, returns the aspect ratio.
   * @param {box} dimensionalBox An object containing the width and height.
   */
  static aspectRatio(box: dimensionalBox): number {
    return box.width / box.height;
  }

  /**
   * Tests if a given value is between a range.
   * @param testValue
   * @param range1
   * @param range2
   * @param inclusive Whether the test should be inclusive.
   * @return Whether the test value is between range1 and range2.
   */
  static isBetween(
    testValue: number,
    range1: number,
    range2: number,
    inclusive = true
  ): boolean {
    const min = Math.min(range1, range2);
    const max = Math.max(range1, range2);

    return inclusive
      ? testValue >= min && testValue <= max
      : testValue > min && testValue < max;
  }

  /**
   * Resizes a given dimensional box (width and height) to a given width while
   * maintaining the aspect ratio.  Useful for scaling up or down a box.
   * @param {number} box
   * @param {number} width
   * @return {dimensionalBox}
   * @tested
   */
  static resizeDimensionalBoxToWidth(
    box: dimensionalBox,
    width: number
  ): dimensionalBox {
    return {
      width,
      height: mathf.scaleY(box.width, box.height, width),
    };
  }

  /**
   * Resizes a given dimensional box (width and height) to a given height while
   * maintaining the aspect ratio.  Useful for scaling up or down a box.
   * @param {number} box
   * @param {number} height
   * @return {dimensionalBox}
   * @tested
   */
  static resizeDimensionalBoxToHeight(
    box: dimensionalBox,
    height: number
  ): dimensionalBox {
    return {
      width: mathf.scaleX(box.width, box.height, height),
      height,
    };
  }

  /**
   * Clamps a value within 0-1.
   * ```ts
   * mathf.clampAsPercent(0.2) --> 0.2
   * mathf.clampAsPercent(1) --> 1
   * mathf.clampAsPercent(-2) --> 0
   * mathf.clampAsPercent(2) -->  1
   * ```
   * @tested
   * @param percent
   * @return percent A value within 0-1.
   */
  static clampAsPercent(percent: number) {
    return mathf.clamp(0, 1, mathf.absZero(percent));
  }

  /**
   * Clamps a number to within 0-1.
   * An alias of [[mathf.clampAsProgress]]
   * @tested
   * @param progress
   * @return progress A value within 0-1.
   */
  static clampAsProgress(progress: number) {
    return mathf.clampAsPercent(progress);
  }

  /**
   * Clamps a number to within 0-1.
   * An alias of [[mathf.clampAsProgress]]
   * @tested
   * @param progress
   * @return progress A value within 0-1.
   */
  static clamp01(progress: number) {
    return mathf.clampAsPercent(progress);
  }

  /**
   * Used to get a value within a range by progress.
   * Note this is an alias of [[mathf.lerp]] since it's the same thing.
   *
   * For instance, let's say you have a range of 325-1450.
   * You want 0% = 325 and 100% = 1450.
   *
   * You can pass a progress (such as 20% or 0.2) and this will return the value
   * within that range.
   *
   * @tested
   * @param {number} progress The percent to calculate.  Should be between 0 and 1.
   * @param {number} min The low end of the range.
   * @param {number} max The high end of the range.
   * @return {number} The value within the range.
   */
  static getValueInRangeByProgress(
    progress: number,
    min: number,
    max: number
  ): number {
    return mathf.lerp(min, max, progress);
  }

  /**
   * Normalizes a given range (min and max) to a progress (a value between 0 and
   * 1)
   * For instance, let's say you have a range of 325-1450.
   * You want 0% = 325 and 100% = 1450.
   * You can pass a value 420 and this will return the progress (percentage).
   *
   * ```ts
   *
   *    mathf.getProgressInRangeByValue(2, 0, 10) // 0.2
   *    mathf.getProgressInRangeByValue(10, 0, 10) // 1
   *    mathf.getProgressInRangeByValue(7, 2, 12) // 0.5
   *
   * ```
   *
   * @param {number} value The value to determine the progress.
   * @param {number} min The low end of the range.
   * @param {number} max The high end of the range.
   * @return {number} The progress within the range.
   */
  static getProgressInRangeByValue(
    val: number,
    min: number,
    max: number
  ): number {
    return mathf.clampAsPercent((val - min) / (max - min));
  }

  /**
   * Normalized a value between a min and max returning a value between
   * 0 and 1.
   * An alias to [[mathf.getProgressInRangeByValue]].
   */
  static normalize(val: number, min: number, max: number): number {
    return mathf.getProgressInRangeByValue(val, min, max);
  }

  /**
   * Linear interpolate from start to end given amount.
   * ```ts
   * mathf.lerp(0, 1, 0)   ---> 0
   * mathf.lerp(0, 1, 0.2) ---> 0.2
   * mathf.lerp(0, 1, 0.5) ---> 0.5
   * mathf.lerp(0, 2, 0.5) ----> 1
   * mathf.lerp(25, 79, 0.2) ----> 35.8
   * ```
   *
   * Lerp can be used for various things.  See [[mathf.getValueInRangeByProgress]]
   * which is an alias of lerp.
   *
   * Lerp can also be used for animations.   If you were doing the old school:
   * ```ts
   * onRafLoop() {
   *   // Update the position by 20% of the distance between position and target.
   *   position.x += (target.x - position.x) * 0.2;
   * }
   * ```
   * this can be replaced with:
   * ```ts
   * onRafLoop() {
   *   // Same thing. Update the position by 20% of the distance between
   *   // position and target on each raf loop.  This has the effect of
   *   // tweening in the position to the target.
   *   position.x = mathf.lerp(position.x, target.x, 0.2);
   * }
   * ```
   *
   * @tested
   * @param {number} value1 The start of the range to lerp.
   * @param {number} value2 The target of the range to lerp.
   * @param {number} amount A value between 0-1 representing the progress of the
   *     lerp.
   * @return {number} The interporalated value.
   */
  static lerp(value1: number, value2: number, amount: number): number {
    const clampedAmount = mathf.clamp01(amount);
    return (1 - clampedAmount) * value1 + clampedAmount * value2;
    // Alternative ways to calculate lerp.
    // Neither behave properly for lerping from negative to positive
    // return value1 + (value2 - value1) * mathf.clamp01(amount);
    // return ((value2 - value1) * amount) + amount
  }

  /**
   * Inverse lerp function
   * @param a Start value
   * @param b End value
   * @param value  Value beteen start and end.
   * @param noClamp Defaults to false, whether to disable clamping.
   * @return {number} A normalized value between 0-1
   */
  static inverseLerp(
    a: number,
    b: number,
    value: number,
    noClamp: boolean = false
  ): number {
    if (noClamp) {
      return (value - a) / (b - a);
    } else {
      return mathf.clamp01((value - a) / (b - a));
    }
  }

  /**
   * Another linear interpolation option.   Same as mathf.lerp but different algo
   * with no hard clamping.
   *
   * ```ts
   * mathf.mix(a, b, 0.0) ---> a
   * mathf.mix(a, b, 1.0) ---> b
   * mathf.mix(a, b, 0.5) ---> between x and y, blended values.
   * ```
   * @param a
   * @param b
   * @param blend
   * @untested
   */
  static mix(a: number, b: number, blend: number) {
    return a * (1 - blend) + b * blend;
  }

  /**
   * Step method.  Will  return 0 or 1.
   * If n is greater than edge, 1
   * If n is less than edge, 0
   *
   * ```ts
   * mathf.step(1, 2) ---> 1
   * mathf.step(1, 0.2) ---> 0
   * mathf.step(1, 1.1) ---> 1
   * ```
   */
  static step(edge: number, n: number) {
    if (n > edge) {
      return 1.0;
    } else {
      return 0.0;
    }
  }

  /**
   * Performs smoothstep from min to max using the given value using Hermite
   * interpolation.
   *
   * Given three values, min, max and input, this will return a number between 0
   * and 1 that represents the progress of the input value to the min and max
   * values.
   *
   * This is similar too [[mathf.normalize]] or
   * [[mathf.getProgressInRangeByValue]] except the curve is slightly smoothed
   * out.
   *
   * ```ts
   * mathf.smoothStep(100, 200, 100); // 0
   * mathf.smoothStep(100, 200, 150); // 0.5
   * mathf.smoothStep(100, 200, 300); // 1
   * ```
   * @see  https://en.wikipedia.org/wiki/Smoothstep
   * @see http://www.fundza.com/rman_shaders/smoothstep/index.html
   * @param {number} min The min of the range to lerp.
   * @param {number} max The max of the range to lerp.
   * @param {number} input A value between
   */
  static smoothStep(min: number, max: number, input: number): number {
    var x = Math.max(0, Math.min(1, (input - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  /**
   * Lerps within a given range.
   *
   * Let's say you have to ranges that
   * you want to make a linear association to.
   *
   * The easiest way to imagine this is imagine two ranges.
   *
   * ```
   * 0     Range1        100
   * |------10------------|
   *
   * 0               Range2                 200
   * |-------------?-------------------------|
   *```
   *
   * range1: 0 - 100
   * range2: 0 - 200
   *
   * You have the value of 20 on range1 and want to know what the value would
   * be on range2.
   *
   * The above would return 20 since 10% of 200 = 20.
   *
   * ```ts
   * mathf.interpolateRange(0, 0, 100, 0, 200); // 0
   * mathf.interpolateRange(10, 0, 100, 0, 200); // 20
   * mathf.interpolateRange(30, 0, 100, 0, 200); // 60
   *
   * ```
   *
   * A practical example.
   * Here when the screen width is 300, the padding is 0
   * and when it's 1200, the padding is 500 and everything
   * it clculates everything between.
   * ```ts
   *
   * let padding = mathf.interpolateRange(
   *     screenWidth,
   *     300, 1200,
   *     0, 500
   * );
   * ```
   *
   *
   */
  static interpolateRange(
    range1Value: number,
    range1Min: number,
    range1Max: number,
    range2Min: number,
    range2Max: number
  ) {
    let progress = mathf.clampAsProgress(range1Value / (range1Max - range1Min));
    return mathf.lerp(range2Min, range2Max, progress);
  }

  /**
   * A normalized sin - so instead of returning -1 to 1, normalized sin returns
   * a value between 0 and 1.
   * @param time
   */
  static sinNormalized(time: number): number {
    return mathf.interpolateRange(Math.sin(time) + 1, 0, 2, 0, 1);
  }

  /**
   * Same as lerp but will apply an easingFunction to the current
   * progress, prior to running lerp.
   *
   * @tested
   * @param {number} value1 The start of the range to lerp.
   * @param {number} value2 The target of the range to lerp.
   * @param {number} amount A value between 0-1 representing the progress of the
   *     lerp.
   * @param easeFunction An easing function. See [[ease]].  Defaults to linear
   *   in which case, linear is equal to a regular lerp.
   */
  static lerpEase(
    value1: number,
    value2: number,
    amount: number,
    easeFunction: Function = EASE.linear
  ): number {
    amount = easeFunction(amount);
    return mathf.lerp(value1, value2, amount);
  }

  /**
   * Similar to [[mathf.lerp]] but is damped and smoothed out with exponential
   * decay.  Useful to use as an alternative to [[mathf.lerp]] or [[mathf.ease]]
   * to smooth out animation movement.
   * @see http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
   * @tested
   * @param {number} value1 The start of the range to lerp.
   * @param {number} value2 The target of the range to lerp.
   * @param {number} amount A value between 0-1 representing the progress of the
   *     lerp.
   * @param {number} damp A value between 0-1 representing the amount to damp.
   * @param easeFunction An easing function. See [[ease]].  Defaults to linear
   *   in which case, linear is equal to a regular lerp.
   */
  static damp(value1: number, value2: number, amount: number, damp: number) {
    return mathf.lerp(value1, value2, 1 - Math.exp(-amount * damp));
  }

  /**
   * An alias of [[mathf.lerpEase]]
   *
   * This is a general ease function that is pretty handy for animations.
   *
   * This is basically a way of saying, given my start and end values, what is the
   * value when it's at x percent (progress) with easing.
   *
   * Under the hood, it is simply an alias of [[mathf.lerpEase]] which is
   * essentially a regular lerp but it passes the progress value (0-1) through
   * an easing function first.
   *
   *
   * Using mathf.ease, you can pretty easily calculate eases for numberic values.
   *
   * Say I wanted to animate a box.x position from 0 - 100.
   * Without specifying a easing function, you will just get linear interpolation.
   *
   * ```
   * mathf.ease(0, 100, 0) ---> 0
   * mathf.ease(0, 100, 0.3) ---> 30
   * mathf.ease(0, 100, 0.5) ---> 50
   * mathf.ease(0, 100, 0.9) ---> 90
   * mathf.ease(0, 100, 1) ---> 100
   * ```
   *
   * Now lets try this with easing.  You can see the returned values between
   * 0 and 1 are different than a linear ease.
   *
   * You can also combine with CubicBezier.makeEasingFunction or a catmull-roll.
   * ```
   * import { EASE, mathf} from '@blinkk/degu'
   * mathf.ease(0, 100, 0, EASE.easeInExpo)   ---> 0
   * mathf.ease(0, 100, 0.3, EASE.easeInExpo) ---> 0.1953125
   * mathf.ease(0, 100, 0.5, EASE.easeInExpo) ---> 3.125
   * mathf.ease(0, 100, 0.9, EASE.easeInExpo) ---> 70.710678
   * mathf.ease(0, 100, 1, EASE.easeInExpo) ---> 100
   *
   *
   *
   * import { CubicBezier, EASE, mathf} from '@blinkk/degu'
   * mathf.ease(0, 100, 0.3, CubicBezier.makeEasingFunction(0, 1, 0.75, 0.9)) ---> 100
   *
   * ```
   *
   * How can I use this with animations?
   *
   * You can ease out positions, opacity etc based on "progress".
   * Progress can be time, scroll position, mouse position etc but it needs to
   * be normalized to a value between 0 and 1.
   *
   * See examples of this in [[RafTimer]] where there is a demo of easing an
   * element for a set duration.
   *
   * For an exmaple where you may want to tie ease with window.scroll or another
   * input represented by a normalized value/ progress (a number between 0 and 1)i
   * see mathf-ease.html in the /examples folder where there is element and
   * progress level easing to smooth
   * interaction.
   *
   * Also related is [[Interpolate]].
   *
   * @alias
   * @param {number} start The start of the range to lerp.
   * @param {number} end The target of the range to lerp.
   * @param {number} progress A value between 0-1 representing the progress of the
   *     lerp.
   * @param easeFunction An easing function. See [[ease]]
   */
  static ease(
    start: number,
    end: number,
    progress: number,
    easeFunction: Function = EASE.linear
  ): number {
    return mathf.lerpEase(start, end, progress, easeFunction);
  }

  /**
   * Wraps a given number between two values.
   *
   * ```ts
   *
   * mathf.wrap(angle, 0, 360);  // Wrap between 0 and 360 degress
   * mathf.wrap(angle, -90, 90); // Wrap between -90 and 90 degress
   *
   *
   * mathf.wrap(15, 0, 10); // Wrap between 0 and 10 --> result 5
   * mathf.wrap(400, 0, 360); // --> result 40
   * mathf.wrap(120, -90, 90); // --> -60
   *
   * ```
   *
   * @param value
   * @param min
   * @param max
   */
  static wrap(value: number, min: number, max: number): number {
    const diff = max - min;
    return min + ((((value - min) % diff) + diff) % diff);
  }

  /**
   * Given two boxes of different aspect ratios,
   * calculates the values in order to make the child cover the parent.
   * This acts similar to background: cover of css.
   *
   * Imagine the following:
   * ```
   * -------p--------
   * |               |
   * |   -----       |
   * |   | C  |      |
   * |   -----       |
   * |               |
   * -----------------
   * ```
   *
   * This case, c would have to scale up to cover the
   * parent.  It would return something like:
   *
   * - width: What the child width should be
   * - height: What the child height should be
   * - xOffset: The Amount to offset x by in order to center.
   * - yOffset: The Amount to offset y by in order to center.
   * - scalar: The amount to scale
   *
   *
   * Note on xOffset and yOffset, this algo assumes that the child will scale
   * from the top left corner of the box and is positioned to the top left.
   *
   * @param {dimensionalBox} parentBox The parent element dimensions
   * @param {dimensionalBox} childBox The child elment dimensions
   * @return {backgroundCoverBox} backgroundCoverBox The dimensions required to
   *     transform the child element to background cover.
   */
  static calculateBackgroundCover(
    parentBox: dimensionalBox,
    childBox: dimensionalBox
  ): backgroundCoverBox {
    const parentRatio = mathf.aspectRatio(parentBox);
    const childRatio = mathf.aspectRatio(childBox);

    let finalWidth;
    let finalHeight;
    let scale;

    if (childRatio >= parentRatio) {
      finalHeight = parentBox.height;
      scale = parentBox.height / childBox.height;
      finalWidth = childBox.width * scale;
    } else {
      finalWidth = parentBox.width;
      scale = parentBox.width / childBox.width;
      finalHeight = childBox.height * scale;
    }

    const finalScale = Math.max(
      finalWidth / childBox.width,
      finalHeight / childBox.height
    );
    // Position to vertical bottom.
    const offsetHeight = mathf.absZero(
      -Math.round((parentBox.height - finalHeight) / 2)
    );
    // Position to horizontal center.
    const offsetWidth = mathf.absZero(
      -Math.round((parentBox.width - finalWidth) / 2)
    );

    return {
      width: Math.round(finalWidth),
      height: Math.round(finalHeight),
      xOffset: offsetWidth,
      yOffset: offsetHeight,
      scalar: finalScale,
    };
  }

  /**
   * Given two boxes of different sizes calculates the amount that the childBox
   * would need to scale in order to mimic the background:contain effect in html.
   *
   * Imagine the following:
   * ```
   * -------p--------
   * |               |
   * |   -----       |
   * |   | C  |      |
   * |   -----       |
   * |               |
   * -----------------
   * ```
   *
   * This case, c would have to scale up to cover the
   * parent.      This method would return the amount that C needs to scale
   * (up or down).
   *
   * Since this is contain, applying the scale value to the child would never
   * exceed the width or height of the parent (no bleeding).
   *
   * Note that this method assumes that the child is absolutely centered against
   * the parent.
   *
   * ```ts
   * parentBox = { width: 100, height: 100 };
   * childBox = { width: 200, height: 100 };
   * mathf.calculateBackgroundContain(parentBox, childBox) // return 0.5.
   *
   *
   * parentBox = { width: 500, height: 500 };
   * childBox = { width: 50, height: 50 };
   * mathf.calculateBackgroundContain(parentBox, childBox) // return 10
   *
   * ```
   *
   * @param parentBox
   * @param childBox
   */
  static calculateBackgroundContain(
    parentBox: dimensionalBox,
    childBox: dimensionalBox
  ): number {
    let pw = parentBox.width;
    let ph = parentBox.height;
    let cw = childBox.width;
    let ch = childBox.height;
    let heightScale = parentBox.height / childBox.height;
    let widthScale = parentBox.width / childBox.width;

    let scale = Math.min(heightScale, widthScale);

    return scale;
  }

  /**
   * Implements asympotic average which is an additive average.
   * Basically says, given the current value, catch up to the target by X% every
   * frame.
   *
   * This is similar to lerp but respects the last given amount the most which
   * results in a smooth response to sudden jumps in the difference between
   * current and target.
   *
   * This can be used for things like camera movement or scroll movement where
   * sudden jerks in movement can happen.
   *
   * ```
   * onRaf() {
   *    // Update target value.
   *    targetValue = this.value + (this.mouseInputX * 30);
   *    // Update the current value to the target value by 30%.
   *    this.value = mathf.asymptoticAverage(this.value, targetValue, 0.3);
   * }
   * ```
   *
   * @param current
   * @param target
   * @param amount
   */
  static asymptoticAverage(
    current: number,
    target: number,
    amount: number
  ): number {
    return (current += (target - current) * amount);
  }

  /**
   * Implements basic smooth start.  See EASE for more.
   */
  static smoothStart2(t: number): number {
    return t * t;
  }

  /**
   * Implements basic smooth stop.  See EASE for more.
   */
  public static smoothStop2(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * Implements basic smooth start.  See EASE for more.
   */
  static smoothStart3(t: number): number {
    return t * t * t;
  }

  /**
   * Implements basic smooth stop.  See EASE for more.
   */
  public static smoothStop3(t: number): number {
    return 1 - (1 - t) * (1 - t) * (1 - t);
  }

  /**
   * Basic smooth step2 allowing you to specify the gradient between
   * smoothstart and smoothstop with mix value.
   * @param value
   * @param mix
   * @param t
   *
   * ```
   *   value = mathf.smoothStep2(value, 0.5, t);
   * ```
   */
  public static smoothStep2(value: number, mix: number, t: number): number {
    return (
      mathf.lerp(mathf.smoothStart2(value), mathf.smoothStop2(value), mix) * t
    );
  }

  /**
   * Basic sigmoid function with option to move the mix value.
   * Mix value of 0 mixes to smoothstart. 1 mixes to smoothstop.
   * A clean sigmoidish curve woud be 0.5.
   *
   * Based on smoothStep2 curves.
   * @param value
   * @param mix
   */
  public static sigmoid(value: number, mix: number) {
    return this.smoothStep2(value, mix, value);
  }

  /**
   Creates a basic remap.

   Let's say you want to make a color bar go from 20, 50
   when your health goes from 0, 100.

  ```
   mathf.remap(20, 50, 0, 100, health);  --> output a value between 20-50 based on health.
   ```
   */
  public static remap(
    minA: number,
    maxA: number,
    minB: number,
    maxB: number,
    valueB: number
  ): number {
    const t = mathf.inverseLerp(minB, maxB, valueB);
    return mathf.lerp(minA, maxA, t);
  }

  /**
   * Total/sum/add-up the given values.
   */
  static sum(values: number[]) {
    return values.reduce((result, value) => result + value, 0);
  }
}
