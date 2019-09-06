
import {X} from '../lib/x/x';
import {XGameObject} from '../lib/x/x-game-object';
import {XLine} from '../lib/x/x-line';
import {XRectangle} from '../lib/x/x-rectangle';
import {XStage} from '../lib/x/x-stage';
import {XTexture} from '../lib/x/x-texture';
import {XText} from '../lib/x/x-text';
import {ImageLoader} from '../lib/loader/image-loader';
import {Vector} from '../lib/mathf/vector';
import {mathf} from '../lib/mathf/mathf';
import {EASE} from '../lib/ease/ease';


/**
 *
 * This is the an example of accelerating an XGameObject towards the
 * mouse position.
 *
 * Each XGameObject, has the following:
 * positon - vector
 * velocity - vector
 * acceleration - vector
 *
 *
 *
 *
 */
export default class XSample {
  /**
     * Loads teh required images and saves them to a cache with Xtexture.
     * This starts the app.
     */
  constructor() {
    this.imageTextures = {};
    let images = new ImageLoader([
      '/public/flower.jpg',
    ]).load().then((results) => {
      // Make textures out of the images.
      Object.keys(results).forEach((key) => {
        this.imageTextures[key] =
                    new XTexture(results[key]);
      });


      this.startApp();
    });
  }

  startApp() {
    const canvasElement = document.getElementById('mainCanvas');
    this.X = new X({
      canvasElement: canvasElement,
      debugMode: true,
    });


    this.flower = new XGameObject({
      id: 'flower',
      x: 250,
      y: 250,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      rotation: 1.5,
      interactable: true,
      texture: this.imageTextures['/public/flower.jpg'],
    });
    this.X.stage.addChild(this.flower);


    this.X.onTick(() => {
      // On every frame, we want to update the acceleration of the
      // test object so that it accelerates towards the mouse position.
      //  We look at the distance between the mouse and
      // the test object position.  To do this, we subtract the test position
      // and  mouse position vector and apply that distance as the
      // acceleration of the game object.


      const distanceVector = Vector.subtract(
          // mouse
          this.X.pointer.position,
          new Vector(this.flower.gcx, this.flower.gcy)
      );

      // We could just set the acceleration to the distance but then
      // the flower image would just exactly be the position of the
      // mouse.  To add some delay and smoothing, we ease the
      // vales.
      this.flower.acceleration =
                Vector.ease(this.flower.acceleration, distanceVector, 0.08);

      // Damping. We still get a of sprining so we damp out the springing.
      this.flower.acceleration.lerp(Vector.ZERO, 0.8);

      // Based on the distance to the mouse, let's increase or decrease
      // the rotation.
      const minRotation = 0;
      const maxRotation = 0.5;
      const minMagnitude = 0;
      const maxMagnitude = 500;

      // Now we get a value between 0-0.5 based on when the distance
      // is between 0 and 500.
      const rotation = mathf.interpolateRange(
          distanceVector.length(), // The magnitude of the distance vector
          minMagnitude, maxMagnitude, minRotation, maxRotation);

      // Let's make it more interesting and ease out the rotation per frame.
      this.flower.rotaton = mathf.ease(
          this.flower.rotation,
          rotation,
          0.08,
          EASE.linear
      );

      this.flower.rotation += rotation;

      console.log(
          this.flower.velocity.magnitude(),
          this.flower.acceleration.magnitude()
      );
    });

    this.X.start();
  }
}


