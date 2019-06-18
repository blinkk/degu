
import { X } from '../lib/x/x';
import { XGameObject } from '../lib/x/x-game-object';
import { XLine } from '../lib/x/x-line';
import { XRectangle } from '../lib/x/x-rectangle';
import { XStage } from '../lib/x/x-stage';
import { XTexture } from '../lib/x/x-texture';
import { XText } from '../lib/x/x-text';
import { ImageLoader } from '../lib/loader/image';
import { Vector } from '../lib/mathf/Vector';


export default class RayCastingSample {

    constructor() {
        console.log('raycasting');
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

        this.line = new XLine({
            lineWidth: 5,
            startX: 200,
            startY: 200,
            endX: 500,
            endY: 500
        });
        this.X.stage.addChild(this.line);


        this.rectangle = new XRectangle({
            fillStyle: 'red',
            x: 100,
            y: 100,
            width: 20,
            height: 20
        });
        this.X.stage.addChild(this.rectangle);

        this.rectangle = new XRectangle({
            fillStyle: 'red',
            x: 550,
            y: 400,
            width: 50,
            height: 20
        });
        this.X.stage.addChild(this.rectangle);


        // Get the x-Engine pointer.
        const pointer = this.X.getPointer();

        this.X.onTick(() => {
            console.log(pointer.position);


        });

        this.X.start();

    }


}


