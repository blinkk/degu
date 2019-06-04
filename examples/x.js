
import { X } from '../lib/x/x';
import { Sprite } from '../lib/x/sprite';
import { Line } from '../lib/x/line';
import { Stage } from '../lib/x/stage';
import { ImageLoader } from '../lib/loader/image';


export default class XSample {

    constructor() {
        console.log('starting up x');

        let images = new ImageLoader([
            '/public/boy.png',
            '/public/boy2.png',
            '/public/boy3.png',
        ]).load().then((results) => {
            console.log('all images loaded', results);
            this.startApp();
        });


    }

    startApp() {
        const canvasElement = document.getElementById('mainCanvas');
        this.X = new X(canvasElement);

        this.line = new Line({
            lineWidth: 1,
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


