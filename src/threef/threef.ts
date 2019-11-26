import * as THREE from 'three';
import { mathf } from '../mathf/mathf';
import { Quaternion } from '../mathf/quaternion';



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
     *     const domCoordinates = threef.toDomCoordinates(
     *         marker, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
     *     );
     *     threef.applyVectorToDom(this.textMarker1, domCoordinates);
     * ```
     *
     * @see three-object-viewer10.html in examples for billboard, scaled versions.
     *
     * @param object The three.js object to base the position off of.
     * @param camera The currently active camera.
     * @param width The canvas width
     * @param height The canvas width
     *
     * Inspired by:
     * - https://threejsfundamentals.org/threejs/lessons/threejs-align-html-elements-to-3d.html
     * - https://stackoverflow.com/questions/27409074/converting-3d-position-to-2d-screen-position-r69
     * - https://stackoverflow.com/questions/46667395/three-js-vector3-to-2d-screen-coordinate-with-rotated-scene
     * - https://gist.github.com/ChiChou/a671a0bbe514364255f9
     */
    static toDomCoordinates(object: THREE.Object3D, camera: THREE.Camera, width: number, height: number): THREE.Vector3 {
        const v = new THREE.Vector3();
        // Get the position of the center of the object.
        object.updateWorldMatrix(true, false);
        object.getWorldPosition(v);
        // Convert -1 - 1 world space to dom based 0-1 range.
        // Get the normalized screen coordinate of that position
        // x and y will be in the -1 to +1 range with x = -1 being
        // on the left and y = -1 being on the bottom
        v.project(camera);

        const x = (v.x * 0.5 + 0.5) * width;
        const y = (v.y * -0.5 + 0.5) * height;


        // One method to "fake" scale.  But this returns a three dimension and
        // what axis to base it off of it unknown.
        //   const scale = new THREE.Vector3();
        //   object.getWorldScale(scale);
        //   scale.project(camera);




        // Another crude scaling.
        // const max = 5;
        // const cv = new THREE.Vector3();
        // camera.updateWorldMatrix(true, false);
        // camera.getWorldPosition(cv);
        // const scale = Math.max(0, max - cv.distanceTo(v));
        const scale = 1;



        return new THREE.Vector3(x, y, scale);
    }


    static setFov(element: HTMLElement, camera: THREE.Camera) {
        const fov = 0.5 / Math.tan(camera.fov * Math.PI / 360) * element.offsetHeight;
        element.style.perspectiveOrigin = "50% 50%";
        element.style.perspective = fov + 'px';
    }


    static toDomRotation(object: THREE.Object3D, camera: THREE.Camera, width: number, height: number): THREE.Euler {

          const convertCoordinateSystem = (q:THREE.Quaternion):THREE.Quaternion => {
            q = q.clone();
            return new THREE.Quaternion(
                q.x,
                -q.y,
                q.z,
                q.w
            );
          }

        if(object.userData.name == 'text-marker4') {
            console.log('------------------------------');
            console.log(object.rotation);
            console.log('------------------------------');
        }

        // Get the object rotation.
        let q = new THREE.Quaternion();
        q = convertCoordinateSystem(object.quaternion);
        q.normalize();

        // object.updateWorldMatrix(true, true);
        // object.getWorldQuaternion(q);
        // var position = new THREE.Vector3();
        // var scale = new THREE.Vector3();
        // object.matrixWorld.decompose(position, q, scale);

        // let objectMatrix = object.matrix.clone();
        // let camMatrix = camera.matrixWorld.clone();
        // let combined = objectMatrix.multiply(camMatrix);



        // Get the camera rotation (world)
        let cq = new THREE.Quaternion();
        camera.updateWorldMatrix(true, false);
        camera.getWorldQuaternion(cq);
        cq.normalize();


        //   // Multiply the two rotations
        // cq.multiply(q.normalize());

        cq = convertCoordinateSystem(cq);


        const euler = new THREE.Euler();
        euler.setFromQuaternion(cq.normalize());
        //   Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];
        // euler.reorder("ZYX")

        // euler.setFromRotationMatrix(objectMatrix);
        // euler.reorder("ZYX")

        // Convert quaternion over to Eular.
        return euler;
    }


    /**
     *
     */
    static applyVectorToDom(element: HTMLElement, v?: THREE.Vector3, euler?: THREE.Euler) {
        const deg = {
            x: mathf.radianToDegree(euler.x),
            y: mathf.radianToDegree(euler.y),
            z: mathf.radianToDegree(euler.z),
        }
        if (v && euler) {
            element.style.transform = `translate(-50%, -50%) translate(${v.x}px, ${v.y}px) rotateX(${deg.x}deg) rotateY(${deg.y}deg) rotateZ(${deg.z}deg) scale(${v.z})`;
        } else if (v && !euler) {
            element.style.transform = `translate(-50%, -50%) translate(${v.x}px, ${v.y}px) scale(${v.z})`;
        } else {
            element.style.transform = `rotateX(${deg.x}deg) rotateY(${deg.y}deg) rotateZ(${deg.z}deg)`;
        }
    }


    /**
     * Given a 3d object, "attempts" to calculate the x,y,z (vector) and the width
     * and height of the object.
     */
    static toDomGetBoundingRect() {

    }


}
