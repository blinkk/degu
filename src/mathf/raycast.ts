import {mathf} from './mathf';
import {Vector} from './vector';

interface RayCastObject {
  /**
   * Whether there was a hit detected or not.
   */
  hit: boolean;

  /**
   * If there was a hit, a vector representing the position of the hit itself.
   */
  collision?: Vector | null;

  /**
   * The distance recording from the origin.
   */
  distance?: number;

  /**
   * The original between the origin and the collision in radians.
   */
  angle?: number;
}

/**
 * A 2d based Raycast class which tests collisions.
 * @unstable
 */
export class Raycast {
  /**
   * Casts an inifinite ray (a vector of infinite maginitude) from the origin
   * at a specific angle and tests if it intersects with boundaryA - boundaryB.
   * See [[Raycast.cast2d]] for more.
   *
   * ```
   *                        x (boundary A)
   *        angle            |
   *    o ------------------- |-----------------------------Infinite--->
   *  (origin)                 |
   *                            |
   *                             |
   *                              x (boundary Bb)
   *
   * ```
   *
   * @param origin
   * @param angle The angle in radians
   * @param boundaryA
   * @param boundaryB
   */
  static castInfinite2dRay(
    origin: Vector,
    angle: number,
    boundaryA: Vector,
    boundaryB: Vector
  ) {
    let direction = Vector.fromAngle(angle);
    return Raycast.cast2d(origin, direction, boundaryA, boundaryB);
  }

  /**
   * Raycasts out to 2d coordinates ignoring z.  Basically we do a line-line
   * intersection test to see if the origin vector intersects the vector
   * the boundary created by boundaryA and boundaryB Vectors.
   *
   *
   * ```
   *                        x (boundary A)
   *        d (direction)    |
   *    o ----------------->  |
   *  (origin)                 |
   *                            |
   *                             |
   *                              x (boundary Bb)
   *
   * ```
   *
   * Usage:
   *
   * ```ts
   *
   * // Starting from 5, 10, cast out a ray at 10 degrees of 1000 length.
   * let origin = new Vector(5,10);
   * let direction = Vector.fromAngle(mathf.degreeToRadian(10), 1000);
   *
   * let linePointA = new Vector(8, 2);
   * let linePointB = new Vector(10, 20);
   *
   * // See if that intersects between linePointA and linePointB.
   * // If it does, castResults.collision will contain a vector point of
   * // intersection.
   * let castResults =
   *      Raycast.cast2d(origin, direction, linePointA, linePointB);
   *
   * if(castResults.hit) {
   *     console.log(castResults.collision) // The collision point vector
   * }
   *
   * ```
   *
   *
   * @param origin The origin vector
   * @param direction The origin vector
   * @param boundaryA The first point of the boundary vector
   * @param boundaryB The first point of the boundary vector
   * @return RayCastObject
   * @see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
   * @see https://bit.ly/2WPb4X3
   */
  static cast2d(
    origin: Vector,
    direction: Vector,
    boundaryA: Vector,
    boundaryB: Vector
  ): RayCastObject {
    // From wikipedia: The intersection point falls within the first line
    // segment if
    // 0.0 ≤ t ≤ 1.0, and it falls within the second line segment
    // if 0.0 ≤ u ≤ 1.0.
    // However since the ray is infinite, can we can just use u < 1.0.

    // Define endpoints.
    const x1 = boundaryA.x;
    const y1 = boundaryA.y;
    const x2 = boundaryB.x;
    const y2 = boundaryB.y;

    const x3 = origin.x;
    const y3 = origin.y;
    const x4 = Vector.add(origin, direction).x;
    const y4 = Vector.add(origin, direction).y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // If the denominator is 0, then the two lines are perfectly in
    // parallel so they would never intersect.
    if (denominator == 0) {
      return {
        hit: false,
      };
    }

    // Now calculate t and u.
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    // If there is a hit calculate the interaction vector point.
    if (t > 0 && t < 1 && u > 0) {
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      const collision = new Vector(x, y);
      return {
        hit: true,
        collision: collision,
        distance: Vector.subtract(origin, collision).length(),
        angle: mathf.toFixed(Vector.angle2d(origin, collision), 3),
      };
    } else {
      return {
        hit: false,
      };
    }
  }
}
