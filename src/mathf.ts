export interface box {
  height: number,
  width: number,
  x: number,
  y: number
}

/**
 * Yano Math utility functions.
 */
export class mathf {

  /**
   * Takes a number like a float and fixes it's digits.
   * Example:
   * ```ts
   *   mathf.fixDigits(20.12345, 2) ==> 20.12
   *   mathf.fixDigits(20.12345, 3) ==> 20.123
   * ```
   * @param {number} value The number to convert
   * @param {number} digits The number of digits to output.
   */
  static fixDigits(value: any, digits: number): number {
    return +parseFloat(value).toFixed(digits);
  }

  /**
   * Takes a number and forces it to a float.
   * @param {number} value The number to convert
   * @param {number} digits The number of digits to output.
   */
  static int(value: number): number {
    return mathf.fixDigits(value, 0);
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
    let random = mathf.getRandomInt(min, max);
    if (random == not) {
      return mathf.getUniqueRandomInt(min, max, not);
    } else {
      return random;
    }
  }

  /**
   * Clamps a number to a given range.
   * @param {number} min The mininum value.
   * @param {number} max The maximum value:
   * @param {number} num The number to limit.
   * @return {number} A number within the min and max range.
   */
  static clamp(min: number, max: number, num: number): number {
    return Math.min(Math.max(num, min), max);
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
   * Calculate the angle between two points.
   * @param  {number} x1 The x position of the first point.
   * @param  {number} y1 The y position of the first point.
   * @param  {number} x2 The x position of the second point.
   * @param  {number} y2 The y position of the second point.
   * @return {number} The angle in degrees.
   */
  static angleDegree(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }


  /**
   * Determine the angular distance between two angles in radians.
   *
   * In a 360 circle, if you had one degre at 90 and another at 80,
   * the angle distance is 10, the difference between the two.
   *
   * Other examples:
   * ```ts
   *   mathf.angleDistanceDegree(10, 10) ==> 0
   *   mathf.angleDistanceDegree(30, 10) ==> -20
   *   mathf.angleDistanceDegree(10, 50) ==> 40
   *   mathf.angleDistanceDegree(10, 340) ==> -30
   * ```
   *
   * angles should be in radians.
   * angle0 - angle in radians
   * angle1 - angle in radians
   * max - in radians.  Typically this would be 2 radian (360).
    * @return {number} distance in radians
    */
  static angleDistanceDegree(angle0: number, angle1: number, max?: number) {
    let angle0Rad = mathf.degreeToRadian(angle0);
    let angle1Rad = mathf.degreeToRadian(angle1);
    if (max) {
      max = mathf.degreeToRadian(max);
    }
    let result = mathf.angleDistanceRadian(angle0Rad, angle1Rad, max);
    return mathf.radianToDegree(result);
  }


  /**
   * Determine the angular distance between two angles in radians.
   * @see angleDistanceDegree for more information.
   * @return {number} distance in radians
   */
  static angleDistanceRadian(angle0: number, angle1: number, max?: number) {
    if (!max) {
      max = Math.PI * 2;
    }
    let delta = (angle1 - angle0) % max;
    return 2 * delta % max - delta;
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
    return radian * 180 / Math.PI;
  }


  /**
   * Checks for collision detection.
   * @param {Object} a An object with x, y, width and height.
   * @param {Object} b An object with x, y, width and height.
   * @return {boolean} Whether the areas are colliding.
   */
  static willCollide(a: box, b: box) {
    return !(
      ((a.y + a.height) < (b.y)) ||
      (a.y > (b.y + b.height)) ||
      ((a.x + a.width) < b.x) ||
      (a.x > (b.x + b.width))
    );
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
  static generateRandomPoints = (num: number,
    minX: number, maxX: number,
    minY: number, maxY: number
  ) => {
    var points = [];
    for (var i = 0; i < num; i++) {
      points.push({
        x: mathf.getRandomInt(minX, maxX),
        y: mathf.getRandomInt(minY, maxY)
      });
    }
    return points;
  }




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
  };

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
    * Example - example of center positioning something to the center of the
    * window size:
    * this.x = mathf.calculateCenterOffset(window.innerWidth, this.width);
    * this.y = mathf.calculateCenterOffset(window.innerHeight, this.height);
    */
  static calculateCenterOffset(parent: number, child: number): number {
    const halfParent = parent / 2;
    const halfChild = child / 2;
    const offset = halfParent - halfChild;
    return offset;
  }



  /**
   * Given a width and height, returns the aspect ratio.
   * @param {box} box An object containing the width and height.
   */
  static aspectRatio(box: box): number {
    return box.width / box.height;
  }

}
