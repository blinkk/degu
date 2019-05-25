
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

export interface backgroundCoverBox {
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  scalar: number;
}

/**
 * Yano Math utility functions.
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
   * Takes a number and forces it to a float.
   * ```ts
   *   mathf.in(20.3333)  --> 20
   *   mathf.in(20.32)    --> 20
   *   mathf.in(20)       --> 20
   * ```
   * @tested
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
  static childProgress(progress: number, start: number, end: number): number {
    const range = end - start;
    let childProgress = mathf.clamp(0, 1, progress - start);
    childProgress = childProgress / range;
    return mathf.clampAsPercent(childProgress);
  }

  /**
   * Rounds to the nearest precision.
   * ```
   * mathf.round(0.49999, 1)  --> 0.5
   * mathf.round(0.49999, 2)  --> 0.5
   * mathf.round(0.41199, 3)  --> 0.412
   * ```
   * @tested
   * @param {number} value
   * @param {number} precision
   * @return {number} A rounded number.
   * @see https://www.jacklmoore.com/notes/rounding-in-javascript/
   */
  static round(value: number, precision: number) {
    precision = precision == null ? 0 : precision;
    precision = mathf.clamp(-200, 200, precision);

    if (!precision) {
      return value;
    }

    if (precision) {
      const preformat: string = value + 'e' + precision;
      return Number(Math.round(<any>preformat) + 'e-' + precision);
    }

    return value;
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
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
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
   *   mathf.angleDistanceDegree(10, 50) ==> 40
   *   mathf.angleDistanceDegree(10, 340) ==> -30
   * ```
   *
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
    const points = [];
    for (let i = 0; i < num; i++) {
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
   * @param {box} dimensionalBox An object containing the width and height.
   */
  static aspectRatio(box: dimensionalBox): number {
    return box.width / box.height;
  }

  /**
   * Resizes a given dimensional box (width and height) to a given width while
   * maintaining the aspect ratio.  Useful for scaling up or down a box.
   * @param {number} box
   * @param {number} width
   * @return {dimensionalBox}
   */
  static resizedimensionalBoxToWidth(box: dimensionalBox, width: number): dimensionalBox {
    return {
      width,
      height: mathf.scaleY2(box.width, box.height, width)
    };
  }

  /**
   * Resizes a given dimensional box (width and height) to a given height while
   * maintaining the aspect ratio.  Useful for scaling up or down a box.
   * @param {number} box
   * @param {number} height
   * @return {dimensionalBox}
   */
  static resizedimensionalBoxToHeight(box: dimensionalBox, height: number): dimensionalBox {
    return {
      width: mathf.scaleY1(box.width, box.height, height),
      height
    };
  }

  /**
   * Clamps a value within 0-1.
   * ```
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
  static getValueInRangeByProgress(progress: number, min: number, max: number): number {
    // Alternative way to calculate lerp.
    //  return ((max - min) * percent) + min
    return mathf.lerp(min, max, progress);
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
   * An alias to getProgressInRangeByValue.
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
   * Lerp can be used for various things.  See [[mathf.getValueINRangeByProgress]]
   * which is an alias of lerp.
   *
   * Lerp can also be used for animations.   If you were doing the old school:
   * ```
   * onRafLoop() {
   *   // Update the position by 20% of the distance between position and target.
   *   position.x += (target.x - position.x) * 0.2;
   * }
   * ```
   * this can be replaced with:
   * ```
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
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
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
   * @param easeFunction An easing function. See [[ease]]
   */
  static lerpEase(value1: number, value2: number,
    amount: number, easeFunction: Function): number {
    amount = easeFunction(amount);
    return mathf.lerp(value1, value2, amount);
  }

  /**
   * An alias of [[mathf.lerpEase]]
   * @alias
   * @param {number} start The start of the range to lerp.
   * @param {number} end The target of the range to lerp.
   * @param {number} progress A value between 0-1 representing the progress of the
   *     lerp.
   * @param easeFunction An easing function. See [[ease]]
   */
  static ease(start: number, end: number,
    progress: number, easeFunction: Function): number {
    return mathf.lerpEase(start, end, progress, easeFunction);
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
    parentBox: dimensionalBox, childBox: dimensionalBox): backgroundCoverBox {
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
      (finalWidth / childBox.width),
      (finalHeight / childBox.height));
    // Position to vertical bottom.
    const offsetHeight = mathf.absZero(
      -Math.round((parentBox.height - finalHeight)));
    // Position to horizontal center.
    const offsetWidth = mathf.absZero(
      -Math.round((parentBox.width - finalWidth) / 2));

    return {
      width: Math.round(finalWidth),
      height: Math.round(finalHeight),
      xOffset: offsetWidth,
      yOffset: offsetHeight,
      scalar: finalScale
    };
  }

}
