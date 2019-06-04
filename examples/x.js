
import { X } from '../lib/x/x';
import { XGameObject } from '../lib/x/x-game-object';
import { XLine } from '../lib/x/x-line';
import { XStage } from '../lib/x/x-stage';
import { XTexture } from '../lib/x/x-texture';
import { ImageLoader } from '../lib/loader/image';


export default class XSample {

    constructor() {
        console.log('starting up x');
        this.imageTextures = {};

        let images = new ImageLoader([
            '/public/boy.png',
            '/public/boy2.png',
            '/public/boy3.png',
        ]).load().then((results) => {
            console.log('all images loaded', results);

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
        this.X = new X(canvasElement);

        this.line = new XLine({
            lineWidth: 10,
            startX: 100,
            startY: 100,
            endX: 250,
            endY: 250
        });

        this.X.stage.addChild(this.line);
        console.log(this.line);


        this.X.onTick(() => {
            this.line.x += 0.1;
            this.line.y += 0.1;
            this.line.rotation += 0.1;
        });

        this.X.start();

    }


}


