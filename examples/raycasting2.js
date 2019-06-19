
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


export default class RayCasting2Sample {

    constructor() {
        console.log('raycasting2');
        this.imageTextures = {};
        this.hitObjects = [];
        this.rays = [];

        this.startApp();

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


            // The origin will always be the mouse poition.
            let origin = pointer.position;



            // Define the number of rays and the angles we want to generate.
            let rayAngles = [];
            for (let i = 0; i < 360; i += 5) {
                rayAngles.push(i);
            }

            // Loop through each line object to see if there is a collision.
            this.lines.forEach((line) => {
                // For each ray test to see if there is a collision.
                rayAngles.forEach((angle) => {
                    const raycast = Raycast.castInfinite2dRay(origin, angle,
                        new Vector(line.startX, line.startY),
                        new Vector(line.endX, line.endY)
                    );

                    if (raycast.hit) {
                        // Add a square for intersection point.
                        const hitRect = new XRectangle({
                            fillStyle: 'green',
                            x: raycast.collision.x - 5,
                            y: raycast.collision.y - 5,
                            width: 10,
                            height: 10
                        });
                        this.X.stage.addChild(hitRect);
                        this.hitObjects.push(hitRect);


                        // Draw a line from the origin to intersectin point.
                        const ray = new XLine({
                            strokeStyle: 'grey',
                            lineWidth: 1,
                            startX: origin.x,
                            startY: origin.y,
                            endX: raycast.collision.x,
                            endY: raycast.collision.y
                        });
                        this.X.stage.addChild(ray);
                        this.rays.push(ray);
                    }

                });
            });
        });

        this.X.start();

    }


}


