
import { X } from '../lib/x/x';
import { XGameObject } from '../lib/x/x-game-object';
import { XLine } from '../lib/x/x-line';
import { XRectangle } from '../lib/x/x-rectangle';
import { XStage } from '../lib/x/x-stage';
import { XTexture } from '../lib/x/x-texture';
import { XText } from '../lib/x/x-text';
import { ImageLoader } from '../lib/loader/image';
import { Vector } from '../lib/mathf/Vector';
import { mathf } from '../lib/mathf/mathf';
import { Raycast } from '../lib/mathf/raycast';
import { MatrixIV } from '../lib/mathf/matrixIV';
import { timingSafeEqual } from 'crypto';


export default class RayCastingSample {

    constructor() {
        console.log('raycasting');
        this.imageTextures = {};
        this.hitObjects = [];
        this.rays = [];

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

        this.lines = [];
        this.lines.push(new XLine({
            lineWidth: 5,
            startX: 800,
            startY: 800,
            endX: 0,
            endY: 890,
        }));


        this.lines.push(new XLine({
            lineWidth: 5,
            startX: 100,
            startY: 100,
            endX: 400,
            endY: 0,
        }));
        this.lines.push(new XLine({
            lineWidth: 5,
            startX: 400,
            startY: 100,
            endX: 200,
            endY: 400,
        }));

        this.lines.push(new XLine({
            lineWidth: 5,
            startX: 500,
            startY: 600,
            endX: 200,
            endY: 600,
        }));

        this.lines.forEach((line) => {
            this.X.stage.addChild(line);
        });



        this.line = new XLine({
            strokeStyle: 'green',
            lineWidth: 1,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
        });
        this.X.stage.addChild(this.line);


        // Get the x-Engine pointer.
        const pointer = this.X.getPointer();

        // Start the angle of the origin at 0.
        this.angle = 0;

        this.X.onTick(() => {
            // Remove all previous hit object.
            this.hitObjects.forEach((object) => {
                this.X.stage.removeChild(object);
            });

            this.hitObjects = [];

            this.rays.forEach((ray) => {
                this.X.stage.removeChild(ray);
            });
            this.rays = [];


            // Create a rotational matrix to rotate all the rays on each frame.
            let rotationMatrix = new MatrixIV()
                .ypr(0, 0, this.angle);
            this.angle += 0.01;

            // The origin will always be the mouse poition.
            let origin = pointer.position;




            // Define the number of rays and the angles we want to generate.
            let rayAngles = [
                0, 20, 40, 60, 80, 100, 120, 140, 160, 180,
                200, 220, 240, 260, 280, 300, 320, 340
            ];

            // Create a directional vector from the angles we just defined.
            let directionalVectors = rayAngles.map((angle) => {
                // This creates a basic directional vector.
                const direction = Vector.fromAngle(mathf.degreeToRadian(angle));
                // Now multiply it with the rotationMatrix so that it kind of
                // spins with an offset every frame.
                return direction.transformWithMatrixIV(rotationMatrix);
            });

            // Draw out each ray so they can visually be seen.. All rays start from origin.
            directionalVectors.forEach((direction) => {

                const ray = new XLine({
                    strokeStyle: 'grey',
                    lineWidth: 1,
                    startX: origin.x,
                    startY: origin.y,
                    endX: Vector.add(pointer, direction).x,
                    endY: Vector.add(pointer, direction).y
                });
                this.X.stage.addChild(ray);
                this.rays.push(ray);
            });

            // Loop through each line object to see if there is a collision.
            this.lines.forEach((line) => {
                // For each ray test to see if there is a collision.
                directionalVectors.forEach((direction) => {
                    const raycast = Raycast.cast2d(origin, direction,
                        new Vector(line.startX, line.startY),
                        new Vector(line.endX, line.endY)
                    );

                    if (raycast.hit) {
                        const hitRect = new XRectangle({
                            fillStyle: 'green',
                            x: raycast.collision.x - 5,
                            y: raycast.collision.y - 5,
                            width: 10,
                            height: 10
                        });
                        this.X.stage.addChild(hitRect);
                        this.hitObjects.push(hitRect);
                    }

                });
            });
        });

        this.X.start();

    }


}


