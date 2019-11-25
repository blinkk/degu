import * as THREE from 'three';



/**
 * A bunch of util for three.js
 */
export class threef {

  /**
   * Given a three.js Mesh / Object3d, calculates the current position and maps that to the
   * DOM x, y position and considers camera position.
   *
   * For this to work, generally, you need your DOM element to be absolutely positioned.
   *
   *
   * Given:
   *```
   * .text {
   *   position: absolute;
   * }
   * <div style="position: relative; height: 100vh; width: 100vw">
   *   <canvas></canvas>
   *   <div class="text">Hello hello</div>
   * </div>
   * ```
   *
   * You would do:
   *
   * ```
   * const threef.
   *
   * ```
   *
   * @param object The three.js object to base the position off of.
   * @param camera The currently active camera.
   * @param width The canvas width
   * @param height The canvas width
   *
   * Inspired by:
   * - https://threejsfundamentals.org/threejs/lessons/threejs-align-html-elements-to-3d.html
   */
  static toDomCoordinates(object:THREE.Object3D, camera: THREE.Camera, width:number, height:number): THREE.Vector3 {
      const v = new THREE.Vector3();
      // Get the position of the center of the object.
      object.updateWorldMatrix(true, false);
      object.getWorldPosition(v);
      // Convert -1 - 1 world space to dom based 0-1 range.
      // Get the normalized screen coordinate of that position
      // x and y will be in the -1 to +1 range with x = -1 being
      // on the left and y = -1 being on the bottom
      v.project(camera);
      const x = (v.x *  0.5 + 0.5) * width;
      const y = (v.y * -0.5 + 0.5) * height;
      const z = 0;
      return new THREE.Vector3(x, y, z);
  }


  /**
   * Given a 3d object, "attempts" to calculate the x,y,z (vector) and the width
   * and height of the object.
   */
  static toDomGetBoundingRect() {

  }


}
