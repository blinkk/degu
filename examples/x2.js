
import { X } from '../lib/x/x';
import { XGameObject } from '../lib/x/x-game-object';
import { XLine } from '../lib/x/x-line';
import { XRectangle } from '../lib/x/x-rectangle';
import { XStage } from '../lib/x/x-stage';
import { XTexture } from '../lib/x/x-texture';
import { XText } from '../lib/x/x-text';
import { ImageLoader } from '../lib/loader/image-loader';
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
export default class X2Sample {

    constructor() {
        console.log('x2');
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


        this.txt = new XText({
            x: 100,
            y: 100,
            text: 'Hello yoyoyo;yoyoyoyoyo'
        });
        this.X.stage.addChild(this.txt);
        console.log(this.txt);

        const rect = new XRectangle({
            x: 900,
            y: 500,
            width: 100,
            height: 150,
            fillStyle: 'red'
        });

        this.X.stage.addChild(rect);

        // this.line = new XLine({
        //     lineWidth: 10,
        //     startX: 100,
        //     startY: 100,
        //     endX: 250,
        //     endY: 250
        // });

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
        this.X.stage.addChild(this.flower);

        this.X.onTick(() => {
        });

        this.X.start();

    }


}


