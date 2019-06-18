
import { mathf } from './mathf';
import { Vector } from './vector';

interface RayCastObject {
    /**
     * Whether there was a hit detected or not.
     */
    hit: boolean;

    /**
     * If there was a hit, a vector representing the position of the hit itself.
     */
    collision: Vector;
}

/**
 * A 2d based RayCast class which tests collisions.
 */
export class RayCast {

    /**
     * Raycasts out to 2d coordinates ignoring z.
     * ```
     *                        x (boundary A)
     *                         |
     *    o ----------------->  |
     *  (origin)                 |
     *                            |
     *                             |
     *                              x (boundary Bb)
     *
     * ```
     * @param origin The origin vector
     * @param boundaryA The first point of the boundary vector
     * @param boundaryB The first point of the boundary vector
     */
    static raycast2d(origin: Vector, boundaryA: Vector, boundaryB: Vector) {

    }

}