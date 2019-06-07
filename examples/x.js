
import { X } from '../lib/x/x';
import { XGameObject } from '../lib/x/x-game-object';
import { XLine } from '../lib/x/x-line';
import { XRectangle } from '../lib/x/x-rectangle';
import { XStage } from '../lib/x/x-stage';
import { XTexture } from '../lib/x/x-texture';
import { XText } from '../lib/x/x-text';
import { ImageLoader } from '../lib/loader/image';
import { Vector } from '../lib/mathf/Vector';


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

    constructor() {
        this.imageTextures = {};

        let images = new ImageLoader([
            '/public/boy.png',
            '/public/boy2.png',
            '/public/boy3.png',
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
            debugMode: true
        });

        // this.line = new XLine({
        //     lineWidth: 10,
        //     startX: 100,
        //     startY: 100,
        //     endX: 250,
        //     endY: 250
        // });

        this.test = new XGameObject({
            id: 'flower',
            x: 250,
            y: 250,
            anchorX: 0.5,
            anchorY: 0.5,
            scaleX: 1,
            scaleY: 1,
            rotation: 1.5,
            interactable: true,
            onMouseDown: (gameObject) => {
                console.log(gameObject);

                // gameObject.acceleration.add(Vector.ONE);

                // console.table(gameObject.globalComputedBox);
                // console.log('wh', gameObject.width, gameObject.height);
                // console.log('gx', gameObject.gx, gameObject.gy);
                // console.log('gcx', gameObject.gcx, gameObject.gcy);
                // console.table({
                //     anchor: gameObject.anchorX + ' ' + gameObject.anchorY,
                //     width: gameObject.width,
                //     height: gameObject.height,
                //     x: gameObject.x,
                //     y: gameObject.y,
                //     box: gameObject.globalComputedBox,
                //     parentX: gameObject.parent.x,
                //     parentY: gameObject.parent.y,
                //     gx: gameObject.gx,
                //     gy: gameObject.gy,
                // });
            },
            texture: this.imageTextures['/public/flower.jpg'],
        });
        // this.test.debug = true;
        this.X.stage.addChild(this.test);

        // this.rectangle = new XRectangle({
        //     id: 'yo',
        //     x: 20,
        //     y: 30,
        //     width: 250,
        //     height: 250,
        //     strokeStyle: 'blue',
        // });
        // this.X.stage.addChild(this.rectangle);






        // this.X.stage.addChild(this.line);
        // console.log(this.X.stage);

        // this.text = new XText({
        //     text: "This works"
        // });
        // this.X.stage.addChild(this.text);




        this.X.onTick(() => {
            // On every frame, we want to update the acceleration of the
            // test object so that it accelerates towards the mouse position.
            //  We look at the distance between the mouse and
            // the test object position.  To do this, we subtract the test position
            // and  mouse position vector and apply that distance as the
            // acceleration of the game object.


            const distance = Vector.subtract(
                new Vector(this.test.gcx, this.test.gcy),
                // mouse
                this.X.pointer.position
            );

            this.test.acceleration = distance;

            // Damp out the springing.
            this.test.acceleration.lerp(Vector.ZERO, 0.96);
            // this.test.rotation += 0.1;



        });

        this.X.start();

    }


}


