
import { OffScreenCanvas } from '../lib/dom/off-screen-canvas';
import { is } from '../lib/is/is';
import { mathf } from '../lib/mathf/mathf';



export default class OffScreenCanvasSample {
    constructor() {

        if (!is.supportingOffScreenCanvas()) {
            throw new Error('Sorry your browser is not suppported');
        }

        const offScreenCanvas = new OffScreenCanvas();


        const canvas = document.getElementById('canvas');
        offScreenCanvas.setCanvas(canvas);


        // The contents of the tasks live inside the webworker.
        // Normal imports don't work athte moment.
        const task = (params) => {



            if (params.command == 'init') {
                self.canvas = params.canvas;
                console.log("Hello", params.name);
                self.ctx = canvas.getContext('2d');
            }

            var getRandomInt = (min, max) => {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            var animate = () => {
                let random = getRandomInt(0, 500);
                let random2 = getRandomInt(0, 500);
                let random3 = getRandomInt(0, 500);
                let random4 = getRandomInt(0, 500);

                ctx.fillRect(random, random2, random3, random4);
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    animate();
                }, 1);

                // You could use this.
                // requestAnimationFrame(animate);
            };

            if (params.command == 'animate') {
                console.log("Hello", params.name);
                animate();
                return { data: 'started animation' };
            }

            if (params.command == 'init') {
                ctx.fillRect(0, 0, 150, 75);
                return { data: 'initialized' };
            }
        };


        offScreenCanvas.setCanvasTask(task);


        offScreenCanvas.init({
            command: 'init',
            name: 'Scott'
        }).then((message) => {
            console.log(message.data);

            offScreenCanvas.sendMessageToCanvas({
                command: 'animate',
                name: 'John'
            }).then((message) => {
                console.log(message.data);
            });

        });
    }

}