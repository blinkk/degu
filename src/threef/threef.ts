import * as THREE from 'three';
import {mathf} from '../mathf/mathf';
import {is} from '..';
import {Defer} from '../func/defer';

export interface threefGltfLoader {
  gltfPath: string;
  animationMarkerPath: string;
  gltfLoader: any;
}

/**
 * A bunch of util for three.js
 */
export class threef {
  public static deguThreefTempBoxHelper: any;

  /**
   * GLTF + Animation Marker Export loader.
   *
   * Loads the gltf file and also the associated animation marker
   * export and appends it to the gltf object.
   *
   * ```
   * import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
   * import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
   *
   *   // Create instance of three glft loader.
   *   const gltfLoader = new GLTFLoader();
   *
   *   // Optional: Provide a DRACOLoader instance to decode compressed mesh data
   *   var dracoLoader = new THREE.DRACOLoader();
   *   dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
   *   gltfLoader.setDRACOLoader( dracoLoader );
   *
   *
   *   threef.load({
   *     gltfPath: 'public/dev/gltf/test1.gltf',
   *     // Optional animation marker path.
   *     animationMarkerPath: 'public/dev/gltf/test1.gltf',
   *     gltfLoader: gltfLoader
   *   }).then((gltf) => {
   *       // gltf.animationMarkers is available.
   *       // Everything else works the same as the three gltf loader.
   *   });
   *
   *   // Call again to load something else with the same loader.
   *   threef.load({
   *     gltfPath: 'public/dev/gltf/test2.gltf',
   *     animationMarkerPath: 'public/dev/gltf/test2.gltf',
   *     gltfLoader: gltfLoader
   *   }).then((gltf) => {
   *       // gltf.animationMarkers is available.
   *       // Everything else works the same as the three gltf loader.
   *   });
   * ```
   *
   * @see https://threejs.org/docs/#examples/en/loaders/GLTFLoader
   * @see https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco#readme
   */
  static loadGltf(config: threefGltfLoader) {
    const defer = new Defer();

    // Start loading gltf.
    let gltfData: Record<string, any> = {};
    const gltfFetch = new Promise(resolve => {
      config.gltfLoader.load(config.gltfPath, (gltf: any) => {
        gltfData = gltf;
        resolve({});
      });
    });

    let animationMarkerData = {};
    const markerFetch = new Promise(resolve => {
      if (!config.animationMarkerPath) {
        animationMarkerData = {};
        resolve({});
      } else {
        // Load the animation export
        fetch(config.animationMarkerPath)
          .then(response => {
            return response.json();
          })
          .then((markerData: any) => {
            animationMarkerData = markerData;
            resolve({});
          });
      }
    });

    // Merge out the data.
    Promise.all([gltfFetch, markerFetch]).then(() => {
      gltfData['animationMarkers'] = animationMarkerData;
      defer.resolve(gltfData);
    });

    return defer.getPromise();
  }

  /**
   * Given a three.js Mesh / Object3d, calculates the current position and maps that to the
   * DOM x, y, z position and considers camera position.
   *
   * The returning x,y values are in pixels.
   * x / canvasWidth or y / canvasHeight would give you the percentage values.
   *
   * @see three-object-viewer11.html for examples and also three-object-viewer11.blend
   *
   * @param object The three.js object to base the position off of.
   * @param camera The currently active camera.
   * @param width The canvas width
   * @param height The canvas width
   * @param scalar? An optional scalar value.  You can pass a value like 1 to tell
   *   the dom element to scale along with the camera movement.  We can't do this
   *   automatically, since we have no reference to what scale 1 should be
   *   when the camera is a certain distance from the object.
   *
   *
   * Inspired by:
   * - https://ics.media/tutorial-three/position_project/
   * - https://threejsfundamentals.org/threejs/lessons/threejs-align-html-elements-to-3d.html
   * - https://stackoverflow.com/questions/27409074/converting-3d-position-to-2d-screen-position-r69
   * - https://stackoverflow.com/questions/46667395/three-js-vector3-to-2d-screen-coordinate-with-rotated-scene
   * - https://gist.github.com/ChiChou/a671a0bbe514364255f9
   * - https://github.com/mrdoob/three.js/blob/master/examples/js/renderers/CSS3DRenderer.js#L6-L31
   * - https://github.com/mrdoob/three.js/blob/master/examples/js/renderers/CSS3DRenderer.js#L254
   */
  static toDomCoordinates(
    object: THREE.Object3D,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
    scalar?: number
  ): THREE.Vector3 {
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

    let z = 1;
    if (is.defined(scalar)) {
      // Since the canvas scales based on height, use that as the basis.
      z = (v.z * -0.5 + 0.5) * height;
      z *= scalar!;
      z *= camera.zoom || 1.0;
    }

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Converts a Three local Vec3 position to exact screen coordinates.
   * @param position
   * @param camera
   * @param width
   * @param height
   */
  static toScreenXY(
    position: THREE.Vector3,
    camera: THREE.Camera,
    width: number,
    height: number
  ) {
    const pos = position.clone();
    const mat4 = new THREE.Matrix4();
    mat4.multiply(camera.projectionMatrix);
    mat4.multiply(camera.matrixWorldInverse);
    // mat4.multiplyVector3(pos);
    pos.applyMatrix4(mat4);
    return {
      x: ((pos.x + 1) * width) / 2,
      y: ((-pos.y + 1) * height) / 2,
      z: pos.z,
    };
  }

  /**
   * Gets the bounding rect in pixel values of a given object.
   * This basically, allows you to calculate the width / height of a given
   * object in screen space.  It will also get you x,y coordinates of the bounding
   * box around your object.
   *
   * Imagine a cube on your screen
   * and you want to know the pixel width and height it occupies on the screen.
   * This makes sense if you are looking head on but what happens if the
   * camera is at an angle or the object is rotated.
   * Or you might want the approximate width and height of a sphere or
   * actual screen height and width of a human model when the camera is looking from a
   * top angle.
   *
   * This method will allow you to do that.
   *
   * It will start by drawing a Box3d cube (boundingBox) around the object.
   * It will then convert the Box3d into a square of 2d coordinate.
   * Using that square, it will then calculate the screenXY coordinates of each
   * corner of the cube.
   * It will then calculate the width and height this object occupies on
   * the screen based on these values.
   *
   *
   * If working on this method, since calculations can be involved, it is helpful
   * to pass in the current working scene to debug the corners.
   * ```
   *
   * const box = three.toDomBoudingRect(
   *   myObject, camera, canvas.offsetWidth, canvas.offsetHeight,
   *   {
   *     scalar: 1, // For z scaling factor
   *     scene: scene, // Pass in your scene to debug the corner.
   *   }
   * )
   *
   * box.width --> The pixel width on the screen.
   * box.height --> The pixel height on the screen.
   * box.topLeft --> The top left corner of the bounding box.
   *
   * ```
   *
   */
  static toDomBoundingRect(
    object: THREE.Mesh,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
    options?: any
  ): any {
    const box = new THREE.Box3().setFromObject(object);

    // Get box corners.
    const corners: Record<string, Record<string, any>> = {
      '000': {
        color: 0xffffff, // White
        vec: new THREE.Vector3().set(box.min.x, box.min.y, box.min.z), // 000
      },
      '001': {
        color: 0x0fff00, // Lime Green
        vec: new THREE.Vector3().set(box.min.x, box.min.y, box.max.z), // 001
      },
      '010': {
        color: 0xff00f7, // Purple
        vec: new THREE.Vector3().set(box.min.x, box.max.y, box.min.z), // 010
      },
      '011': {
        color: 0x9d9d9d, // Grey
        vec: new THREE.Vector3().set(box.min.x, box.max.y, box.max.z), // 011
      },
      '100': {
        color: 0x003eff, // Blue
        vec: new THREE.Vector3().set(box.max.x, box.min.y, box.min.z), // 100
      },
      '101': {
        color: 0xf3ff00, // Yellow
        vec: new THREE.Vector3().set(box.max.x, box.min.y, box.max.z), // 101
      },
      '110': {
        color: 0xff0000, // Red
        vec: new THREE.Vector3().set(box.max.x, box.max.y, box.min.z), // 110
      },
      '111': {
        color: 0x000000, // Black
        vec: new THREE.Vector3().set(box.max.x, box.max.y, box.max.z), // 111
      },
    };

    // Generate an array of the XY screen coordinate of every single corner
    // of the box3d.
    const cornerPositions = [];
    for (const key of Object.keys(corners)) {
      const corner = corners[key];
      const xy = threef.toScreenXY(corner.vec, camera, width, height);
      cornerPositions.push(xy);
    }

    const center = threef.toScreenXY(object.position, camera, width, height);

    // console.log(object.position, camera);
    const xs = cornerPositions.map(xy => {
      return xy.x;
    });
    const ys = cornerPositions.map(xy => {
      return xy.y;
    });

    const scene = options && options.scene;
    const scalar = options && options.scalar;

    // This is our virtual 2d square from the 3d cube.  This is a square
    // drawn over the box3d bounding box, representing the space
    // this object takes up on the screen.
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Based on there, we can calculate the size.
    const finalSize = {
      width: maxX - minX,
      height: maxY - minY,
    };

    // Calculate relative depth (z)
    let z = 1;
    if (scalar) {
      const v = new THREE.Vector3();
      object.updateWorldMatrix(true, false);
      object.getWorldPosition(v);
      v.project(camera);
      // Since the canvas scales based on height, use that as the basis.
      z = (v.z * -0.5 + 0.5) * height;
      z *= scalar;
      z *= camera['zoom'] || 1.0;
    }

    // Calcualte the corners of the box from top left clockwise.
    center.z = z;
    const corner1 = new THREE.Vector3(minX, minY, z);
    const corner2 = new THREE.Vector3(maxX, minY, z);
    const corner3 = new THREE.Vector3(minX, maxY, z);
    const corner4 = new THREE.Vector3(minX, maxY, z);

    // If a scene has been passed, add
    if (scene) {
      object.visible = false;
      // TODO (uxder): This doesn't exist on mesh according to docs.
      // Need to investigate if we can just remove this.
      // @ts-ignore
      object['alwaysInvisible'] = true;
      for (const key of Object.keys(corners)) {
        const corner = corners[key];
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({color: corner.color});
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(corner.vec.x, corner.vec.y, corner.vec.z);
        scene.add(cube);
      }
    }

    return {
      topLeft: corner1,
      topRight: corner2,
      center: center,
      bottomLeft: corner3,
      bottomRight: corner4,
      width: finalSize.width,
      height: finalSize.height,
    };
  }

  /**
   * Converts from the blender coordinate system over to three (XYZ).
   * This assumes that within blender, you are using the XYZ Euler rotation
   * settings.
   *
   * If your settings are off, it's likely the object your exported
   * has rotations.  Select your object to Apply -> Rotation & Scale
   * in blender.
   *
   * Example:
   * ```
   *  threef.blenderToThreeCoordinates({
   *     x: mathf.degreeToRadian(51.9),
   *     y: mathf.degreeToRadian(192),
   *     z: mathf.degreeToRadian(200)
   * }),
   * ```
   * @param object Object contains x,y,z
   */
  static blenderToThreeEuler(euler: any) {
    return {
      x: -euler.x,
      y: euler.z,
      z: -euler.y,
    };
  }

  /**
   * Converts blender coords to three.js
   * ```
   * targetPosition = threef.blenderToThreeVec3({
   *   // Specify in blender coords
   *   x: 0,
   *   y: 0,
   *   z: 1.0,
   * });
   *
   * ```
   * @param vec3
   */
  static blenderToThreeVec3(vec3: any) {
    return {
      x: -vec3.x,
      y: vec3.z,
      z: -vec3.y,
    };
  }

  /**
   * Given a three.js object, calculates the euler rotation over to values that can
   * be applied via css.  Note this return euler rotations in radians (THREE.Euler).
   * @param object
   * @param camera
   * @param width
   * @param height
   */
  static toDomRotation(
    object: THREE.Object3D,
    camera: THREE.Camera,
    width: number,
    height: number
  ): THREE.Euler {
    // Get the local transform values.
    const q = new THREE.Quaternion();
    // object.updateWorldMatrix(true, false);
    object.getWorldQuaternion(q);
    // Convert coordinate system.
    q.x = -q.x;
    q.y = q.y;
    q.z = -q.z;

    // Get the camera rotation (world)
    const cq = new THREE.Quaternion();
    // camera.updateWorldMatrix(true, false);
    camera.getWorldQuaternion(cq);

    // Convert coordinate system.
    cq.x = cq.x;
    cq.y = -cq.y;
    cq.z = cq.z;

    // Combine the camera and object rotation
    cq.multiply(q);

    const euler = new THREE.Euler();
    euler.setFromQuaternion(cq.normalize());
    //   Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];
    // euler.reorder("ZYX")

    return euler;
  }

  /**
   * Gets the visible height at a specific depth given a three.js camera.
   *
   * Example:
   * You have a 100x100x100 cube and want to know the "pixel" size it is
   * rendered at when it's at a depth of 200.
   * ```
   * // Add 50 to account for size from the center of cube.
   * const depth = (cube.position.z + 50) - camera.position.z;
   *
   * const visibleSize = threef.getVisibleHeightAndWidthAtDepth(depth, camera);
   *
   * // So relative to the height, how much does the cube take up.
   * const heightScalar = 100 / visibleSize.height;
   *
   * // Now normalize that to the size in pixels.
   * const heightInPixels = canvasSize.height * heightScalar;
   * ```
   * @untested
   * @experimental
   * @dontuse
   * @hidden
   */
  /*
    static getVisibleHeightAndWidthAtDepth(distance: number, camera: THREE.Camera): any {
        var vFOV = camera['fov'] * Math.PI / 180;
        var height = 2 * Math.tan(vFOV / 2) * distance;
        var width = height * camera['aspect'];
        return {
            width: width,
            height: height,
        };
    }
    */

  /**
   * Given a known size of an object, calculate the actual size it is rendered
   * on the screen (pixel).
   *
   * ```
   * const pixelSize = threef.convertObjectSizeToPixel(
   *    cube.geometry.parameters.width,
   *    cube.geometry.parameters.height,
   *    cube.geometry.parameters.depth,
   *    camera,
   *    canvasWidth, canvasHeight
   * );
   *
   * console.log(pixelSize.width); // The actual rendered size of the cube in pixels
   * console.log(pixelSize.height); // The actual rendered size of the cube in pixels.
   *
   * ```
   *
   * @untested
   * @experimental
   * @dontuse
   * @hidden
   */
  /*
    static convertObjectSizeToPixels(
        width: number, height: number, depth: number, zPosition: number,
        camera: THREE.Camera,
        sceneWidth: number, sceneHeight: number): any {

        // First calculate the z distance from the cam to object considering the
        // depth (z size) of the object.
        const zDepth = (zPosition + depth) - camera.position.z;
        const visibleSize = threef.getVisibleHeightAndWidthAtDepth(zDepth, camera);
        const heightScalar = height / visibleSize.height;
        const heightInPixels = sceneHeight * heightScalar;
        const widthScalar = width / visibleSize.height;
        const widthInPixels = sceneWidth * widthScalar;

        return {
            width: widthInPixels,
            height: heightInPixels,
        }
    }
    */

  /**
   * Provides the ability to convert a vec3 into another coordinate system
   * as needed given the mapping.
   *
   * Mapping supports the following strings: x,y,z,-x,-y,-z
   *
   * Example:
   * ```
   * threef.convertCoordinateSystem(
   *    new THREE.Vector3(1, 2, 3),
   *   ['-y', 'z', 'x']
   * );  // x -> -2, y -> 3, z -> 1
   *
   * This internally converts the Vector3 using this logic:
   *  x -> -y, y -> z, z-> x
   * ```
   *
   * @param vec3
   * @param orientation
   */
  static convertCoordinateSystem(vec3: THREE.Vector3, map: Array<string>) {
    const x = map[0].toLowerCase().split('');
    const xFactor = x[0] === '-' ? -1 : 1;
    const xValue = x[0] === '-' ? x[1] : x[0];

    const y = map[1].toLowerCase().split('');
    const yFactor = y[0] === '-' ? -1 : 1;
    const yValue = y[0] === '-' ? y[1] : y[0];

    const z = map[2].toLowerCase().split('');
    const zFactor = z[0] === '-' ? -1 : 1;
    const zValue = z[0] === '-' ? z[1] : z[0];

    return new THREE.Vector3(
      // TODO (uxder): Figure out type fix here.
      // @ts-ignore
      vec3[xValue] * xFactor,
      // @ts-ignore
      vec3[yValue] * yFactor,
      // @ts-ignore
      vec3[zValue] * zFactor
    );
  }

  /**
   * Sets the FOV as camera on a DOM element.
   * @param element
   * @param camera
   */
  static setFov(element: HTMLElement, camera: THREE.PerspectiveCamera) {
    const fov =
      (0.5 / Math.tan((camera['fov'] * Math.PI) / 360)) * element.offsetHeight;
    element.style.perspectiveOrigin = '50% 50%';
    element.style.perspective = fov + 'px';
  }

  /**
   * Given vector and euler rotations, applies transforms to an html element.
   * This works if your dom element is absolutely positions with the canvas.
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
   *   const domCoordinates = threef.toDomCoordinates(
   *       threeObject, threeCamara, canvasWidth, canvasHeight, 0.5
   *   );
   *   const domRotation = threef.toDomRotation(
   *      threeObject, threeCamera, canvasWidth, canvasHeight
   *   );
   *
   *   // Set the position and rotation of myDomElement to match the threeObject
   *   threef.applyVectorToDom(myDomElement, domCoordinates, domRotation);
   *
   *   // Set the position, rotation only of myDomElement to match the threeObject without scaling
   *   domCoodinates.z = 1; // No scaling.
   *   threef.applyVectorToDom(myDomElement, domCoordinates, domRotation);
   *
   *   // Set the position only of myDomElement to match the threeObject
   *   // This results in a billboarding effect.
   *   threef.applyVectorToDom(myDomElement, domCoordinates);
   * ```
   */
  static applyVectorToDom(
    element: HTMLElement,
    v?: THREE.Vector3,
    euler?: THREE.Euler
  ) {
    if (euler) {
      const deg = {
        x: mathf.radianToDegree(euler.x),
        y: mathf.radianToDegree(euler.y),
        z: mathf.radianToDegree(euler.z),
      };
      if (v) {
        element.style.transform = `translate(-50%, -50%) translate(${v.x}px, ${v.y}px) rotateX(${deg.x}deg) rotateY(${deg.y}deg) rotateZ(${deg.z}deg) scale(${v.z})`;
      } else {
        element.style.transform = `rotateX(${deg.x}deg) rotateY(${deg.y}deg) rotateZ(${deg.z}deg)`;
      }
    } else {
      element.style.transform = `translate(-50%, -50%) translate(${v?.x}px, ${v?.y}px) scale(${v?.z})`;
    }
  }

  /**
   * Given an array THREE.AnimationClips, does a search for an animation
   * clip of the given name.
   */
  static getAnimationByName(
    name: string,
    animationClips: Array<THREE.AnimationClip>
  ) {
    return animationClips.filter((animationClip: THREE.AnimationClip) => {
      return animationClip.name === name;
    })[0];
  }

  /**
   * Traverses the current scene checking for match conditions.
   *
   * ```ts
   * // Look for any meshes that are of the name 'hohoho' or 'hohoho2'.
   * // and change the anistropy to 100.
   *
   * threef.traverseSceneFor(
   *   // Test condition
   *   (threeObject)=> {
   *      return
   *         (threeObject instance of THREE.MESH) &&
   *         ~['hohoho', 'hohoho2'].indexOf(threeObject.name)
   *   },
   *   (threeObject)=> {
   *      threeObject.material.map.anistropy = 100;
   *      threeObject.material.needsUpdate = true;
   *   },
   *   myScene
   * )
   *
   *
   * ```
   */
  static traverseSceneFor(
    matchCondition: Function,
    execution: Function,
    scene: THREE.Scene
  ) {
    scene.traverse(child => {
      if (matchCondition(child)) {
        execution(child);
      }
    });
  }

  /**
   * Given a list of names, looks through the objects in the scenes
   * and returns a dictionary of them so they can be quickly accessed
   * at a later time.
   *
   * ```ts
   * // Specify the types of objects you want.
   * const typeMap = {
   *     // Normally just pass a string for the "object" type
   *     mesh: 'Mesh',
   *     // Pass array for multiple
   *     myStuff: ['Mesh', 'PointLight'],
   *     // Custom search logic.
   *     materials: (object, type) => {
   *         return object.material
   *     },
   *     lights: (object, type)=> {
   *         return ~type.toLowerCase().indexOf('light');
   *      }
   *     pointLight: 'PointLight',
   *     cameras: 'PerspectiveCamera',
   * }
   * const objectDictionary = threef.makeObjectDictionaryFromScene(
   *   scene, typeMap
   * );
   *
   * ```
   *
   * Based on your typemap, a dictionary is returns with that type of
   * object contained.
   *
   * ```
   * objectDictionary.byName['myObject1']; // Your THREE object
   * objectDictionary.byName['myPointlight1']; // Your THREE pointlight.
   *
   * // All text markers.
   * // By convention, text markers are any object that starts with the
   * // naming 'text-marker' (IE: text-marker1, text-marker2 etc.)
   * objectDictionary.textMarkers;
   *
   * objectDictionary.mesh; // All your meshes
   * objectDictionary.materials; // All your materials
   * objectDictionary.lights; // All your lights
   *
   * ```
   *
   * @param name
   * @param THREE.Scene
   */
  static createObjectDictionaryFromScene(
    scene: THREE.Scene,
    mapping: Record<string, any>
  ): Object {
    const dictionary: Record<string, any> = {
      // Stores objects by name.
      byName: {},
      textMarkers: <Array<THREE.Object3D>>[],
    };

    for (const key of Object.keys(mapping)) {
      dictionary[key] = [];
    }

    scene.traverse(child => {
      dictionary.byName[child.name] = child;

      if (child.name.startsWith('text-')) {
        dictionary.textMarkers.push(child);
      }

      // Check if this object matches a specific mapping.
      for (const key of Object.keys(mapping)) {
        const value = mapping[key];
        if (is.string(value)) {
          if (child.type === value) {
            dictionary[key].push(child);
          }
        }
        if (is.array(value)) {
          if (~value.indexOf(child.type)) {
            dictionary[key].push(child);
          }
        }
        if (is.function(value)) {
          if (value(child, child.type)) {
            dictionary[key].push(child);
          }
        }
      }
    });

    return dictionary;
  }

  static findSceneByName(name: string, scenes: Array<THREE.Scene>) {
    const scene = scenes.filter(scene => {
      return scene.name === name;
    })[0];

    return scene;
  }
}
