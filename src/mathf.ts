export interface box {
  height: number,
  width: number,
  x: number,
  y: number
}

export interface dimentionalBox {
  height: number,
  width: number
}

export interface backgroundCoverScalar {
  width: number,
  height: number,
  xOffset: number,
  yOffset: number,
  scalar: number
}

/**
 * Yano Math utility functions.
 */
export class mathf {

  /**
   * Tests whether if a given number if -0, in which case it will return
   * 0.  Any other number will just pass through.
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
   * Given a known set of sizes, scales and returns a y1.
   *
   * `````ts
   *  x1     y1 (return)
   * ---- = ----
   *  x2     y2
   *
   * ````
   */
  static scaleY1(x1: number, x2: number, y2: number) {
    return x1 * y2 / x2;
  }

  /**
   * Given a known set of sizes, scales and returns a y2.
   *
   * `````ts
   *  x1     y1
   * ---- = ----
   *  x2     y2 (return)
   *
   * ````
   */
  static scaleY2(x1: number, x2: number, y1: number) {
    return x2 * y1 / x1;
  }


  /**
   * Given a width and height, returns the aspect ratio.
   * @param {box} dimentionalBox An object containing the width and height.
   */
  static aspectRatio(box: dimentionalBox): number {
    return box.width / box.height;
  }


  /**
   * Resizes a given dimentional box (width and height) to a given width while
   * maintaining the aspect ratio.  Useful for scaling up or down a box.
   * @param {number} box
   * @param {number} width
   * @return {dimentionalBox}
   */
  static resizeDimentionalBoxToWidth(box: dimentionalBox, width: number): dimentionalBox {
    return {
      width: width,
      height: mathf.scaleY2(box.width, box.height, width)
    }
  }

  /**
   * Resizes a given dimentional box (width and height) to a given height while
   * maintaining the aspect ratio.  Useful for scaling up or down a box.
   * @param {number} box
   * @param {number} height
   * @return {dimentionalBox}
   */
  static resizeDimentionalBoxToHeight(box: dimentionalBox, height: number): dimentionalBox {
    return {
      width: mathf.scaleY1(box.width, box.height, height),
      height: height
    }
  }

  /**
   * Clamps a value within 0-1.
   * @param percent
   * @return percent A value within 0-1.
   */
  static clampAsPercent(percent: number) {
    return mathf.clamp(0, 1, mathf.absZero(percent));
  }


  /**
   * Used to get a value within a range by progress.
   * For instance, let's say you have a range of 325-1450.
   * You want 0% = 325 and 100% = 1450.
   * You can pass a percent (such as 20% or 0.2) and this will return the value
   * within that range.
   * @param {number} percent The percent to calculate.  Should be between 0 and 1.
   * @param {number} min The low end of the range.
   * @param {number} max The high end of the range.
   * @return {number} The value within the range.
   */
  static getValueInRangeByProgress(percent: number, min: number, max: number): number {
    return ((max - min) * mathf.clampAsPercent(percent)) + min;
  }

  /**
   * Used to get progress within a range by value.
   * For instance, let's say you have a range of 325-1450.
   * You want 0% = 325 and 100% = 1450.
   * You can pass a value 420 and this will return the progress (percentage).
   * @param {number} value The value to determine the progress.
   * @param {number} min The low end of the range.
   * @param {number} max The high end of the range.
   * @return {number} The progress within the range.
   */
  static getProgressInRangeByValue(val: number, min: number, max: number): number {
    return mathf.clampAsPercent((val - min) / (max - min));
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
   * width: What the child width should be
   * height: What the child height should be
   * xOffset: The Amount to offset x by in order to center.
   * yOffset: The Amount to offset y by in order to center.
   * scalar: The amount to scale
   *
   *
   * Note on xOffset and yOffset, this algo assumes that the child will scale
   * from the top left corner of the box and is positioned to the top left.
   *
   * @param {dimentionalBox} parentBox
   * @param {dimentionalBox} childBox
   */
  static calculateScalarToBackgroundCover(
    parentBox: dimentionalBox, childBox: dimentionalBox): backgroundCoverScalar {
    let parentRatio = mathf.aspectRatio(parentBox);
    let childRatio = mathf.aspectRatio(childBox);

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

    let finalScale = Math.max(
      (finalWidth / childBox.width),
      (finalHeight / childBox.height));
    // Position to vertical bottom.
    let offsetHeight = mathf.absZero(
      -Math.round((parentBox.height - finalHeight)));
    // Position to horizontal center.
    let offsetWidth = mathf.absZero(
      -Math.round((parentBox.width - finalWidth) / 2));

    return {
      width: Math.round(finalWidth),
      height: Math.round(finalHeight),
      xOffset: offsetWidth,
      yOffset: offsetHeight,
      scalar: finalScale,
    };
  }

}
