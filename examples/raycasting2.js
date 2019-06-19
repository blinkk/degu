
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
import { PerlinNoise } from '../lib/mathf/perlin-noise';


export default class RayCasting2Sample {

    constructor() {
        console.log('raycasting2 sample');
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
        for (let i = 0; i < 6; i += 1) {
            this.lines.push(new XLine({
                lineWidth: 5,
                startX: mathf.getRandomInt(0, 1000),
                startY: mathf.getRandomInt(0, 1000),
                endX: mathf.getRandomInt(0, 1000),
                endY: mathf.getRandomInt(0, 1000),
            }));
        }
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Create borders.
        this.lines.push(new XLine({
            lineWidth: 5, startX: 0, startY: 0, endX: w, endY: 0,
        }));
        this.lines.push(new XLine({
            lineWidth: 5, startX: w, startY: 0, endX: w, endY: h,
        }));
        this.lines.push(new XLine({
            lineWidth: 5, startX: w, startY: h, endX: 0, endY: h,
        }));
        this.lines.push(new XLine({
            lineWidth: 5, startX: 0, startY: h, endX: 0, endY: 0,
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
            for (let i = 0; i < 360; i += 1) {
                rayAngles.push(i);
            }

            let hitRaycasts = [];

            // Loop through each line object to see if there is a collision.
            this.lines.forEach((line) => {
                // For each ray test to see if there is a collision.
                rayAngles.forEach((angle) => {
                    const raycast = Raycast.castInfinite2dRay(origin, angle,
                        new Vector(line.startX, line.startY),
                        new Vector(line.endX, line.endY)
                    );

                    // If the current raycast is hitting.
                    if (raycast.hit) {
                        hitRaycasts.push(raycast);

                        // Now previously, there might have been other rays
                        // of the same angle.
                        //  In this case, we want the ray
                        // that is of the shortest distance over the longer one.
                        // This creates a visual effect, where a ray appears
                        // to not be able to penetrate walls - merely because
                        // we are filtered out duplicate angle rays that penetrate
                        // walls.
                        let shortestCast = raycast;
                        hitRaycasts.forEach((ray) => {
                            if (ray.angle == shortestCast.angle) {
                                if (ray == shortestCast) {
                                    return;
                                } else if (ray.distance >= shortestCast.distance) {
                                    hitRaycasts.splice(hitRaycasts.indexOf(ray), 1);
                                } else {
                                    hitRaycasts.splice(hitRaycasts.indexOf(shortestCast), 1);
                                    shortestCast = ray;
                                }
                            }
                        });

                    }
                });
            });

            // For each raycast, we are going to render it out.
            hitRaycasts.forEach((raycast) => {
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
            });
        });

        this.X.start();

    }


}


