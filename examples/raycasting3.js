




import { X } from '../lib/x/x';
import { XLine } from '../lib/x/x-line';
import { XRectangle } from '../lib/x/x-rectangle';
import { Vector } from '../lib/mathf/Vector';
import { mathf } from '../lib/mathf/mathf';
import { Raycast } from '../lib/mathf/raycast';
import { DomWatcher } from '../lib/dom/dom-watcher';


/**
 * This is a quick demo of using raycasting to project 3d.
 */
export default class RayCasting3Sample {

    constructor() {
        console.log('raycasting3 sample');
        this.rays = [];

        this.domWatcher = new DomWatcher();
        this.keydown = false;

        this.domWatcher.add({
            element: document,
            on: 'keydown',
            callback: () => {
                this.keydown = true;
            }
        });

        this.domWatcher.add({
            element: document,
            on: 'keyup',
            callback: () => {
                this.keydown = false;
            }
        });

        this.projectionRays = [];
        // The field of view.
        this.fov = 40;


        this.startApp();
    }

    startApp() {
        const canvasElement = document.getElementById('mainCanvas');
        const canvas2Element = document.getElementById('projectionCanvas');
        this.X = new X({
            canvasElement: canvasElement,
            debugMode: true
        });
        this.projectionX = new X({
            canvasElement: canvas2Element,
            debugMode: false
        });

        this.X.setStageColor('black');
        this.projectionX.setStageColor('black');


        // Create the player
        this.player = new XRectangle({
            fillStyle: 'white',
            x: window.innerWidth / 2 / 2,
            y: window.innerHeight / 2,
            width: 2,
            heigth: 2
        });
        this.X.stage.addChild(this.player);


        // Create a bunch of lines in the world.
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
        // Create borders on the edge of the world.
        this.lines.push(new XLine({
            lineWidth: 5, startX: 0, startY: 0, endX: w / 2, endY: 0,
        }));
        this.lines.push(new XLine({
            lineWidth: 5, startX: w / 2, startY: 0, endX: w / 2, endY: h,
        }));
        this.lines.push(new XLine({
            lineWidth: 5, startX: w / 2, startY: h, endX: 0, endY: h,
        }));
        this.lines.push(new XLine({
            lineWidth: 5, startX: 0, startY: h, endX: 0, endY: 0,
        }));

        this.lines.forEach((line) => {
            this.X.stage.addChild(line);
        });


        // Get the x-Engine pointer.
        const pointer = this.X.getPointer();

        // Start the angle of the origin at 0.
        this.angle = 0;

        // Define the number of rays and the angles we want to generate.
        let rayAngles = [];
        for (let i = 0; i < this.fov; i += 0.1) {
            rayAngles.push(i);
        }


        this.X.onTick(() => {


            this.rays.forEach((ray) => {
                this.X.stage.removeChild(ray);
            });
            this.rays = [];

            // Origin should center from where the player stands.
            let origin = this.player.position;
            let mouseNormalized = pointer.position.x / (w / 2);
            let rotation = mathf.lerp(0, 360, mouseNormalized);


            // If the player is pressing some key we allow the player to move forward.
            if (this.keydown) {
                console.log(this.keydown);
                let forwardVector = Vector.fromAngle(
                    mathf.degreeToRadian(rotation, 1), 10);
                console.log(forwardVector);
                origin.add(forwardVector);
            }

            this.hitRaycasts = [];

            // Loop through each line object to see if there is a collision.
            this.lines.forEach((line) => {
                // For each ray test to see if there is a collision.
                rayAngles.forEach((angle) => {
                    const raycast = Raycast.castInfinite2dRay(origin,
                        mathf.degreeToRadian(angle + rotation),
                        new Vector(line.startX, line.startY),
                        new Vector(line.endX, line.endY)
                    );

                    // If the current raycast is hitting.
                    if (raycast.hit) {
                        this.hitRaycasts.push(raycast);

                        // Now previously, there might have been other rays
                        // of the same angle.
                        //  In this case, we want the ray
                        // that is of the shortest distance over the longer one.
                        // This creates a visual effect, where a ray appears
                        // to not be able to penetrate walls - merely because
                        // we are filtered out duplicate angle rays that penetrate
                        // walls.
                        let shortestCast = raycast;
                        this.hitRaycasts.forEach((ray) => {
                            if (ray.angle == shortestCast.angle) {
                                if (ray == shortestCast) {
                                    return;
                                } else if (ray.distance >= shortestCast.distance) {
                                    this.hitRaycasts.splice(this.hitRaycasts.indexOf(ray), 1);
                                } else {
                                    this.hitRaycasts.splice(this.hitRaycasts.indexOf(shortestCast), 1);
                                    shortestCast = ray;
                                }
                            }
                        });

                    }
                });
            });

            // For each raycast, we are going to render it out.
            this.hitRaycasts.forEach((raycast) => {

                // const endGradientVector = Vector.fromAngle(raycast.angle, 100);
                // let end = Vector.add(origin, endGradientVector);
                // const useEnd = end.magnitude() < raycast.distance;
                // end = useEnd ? end : raycast.collision;

                const ray = new XLine({
                    fillStyle: 'white',
                    lineWidth: 3,
                    startX: origin.x,
                    startY: origin.y,
                    endX: raycast.collision.x,
                    endY: raycast.collision.y
                });
                this.X.stage.addChild(ray);
                this.rays.push(ray);
            });


            this.projectionXUpdate(w, h);
        });

        this.X.start();
    }


    projectionXUpdate(w, h) {

        this.projectionX.clear();
        this.projectionRays.forEach((ray) => {
            this.projectionX.stage.removeChild(ray);
        });
        this.projectionRays = [];

        let widthPerRay = (w * 0.5) / (this.hitRaycasts.length - 1);

        // Create a rectangle for each ray.  The more distance, the more faded it
        // should look.
        this.hitRaycasts.forEach((ray, i) => {
            let scale = Math.abs(ray.distance) / 500;
            scale = 1 - mathf.clamp01(scale);
            scale *= 0.9;
            let height = Math.max(h * scale, 10);
            let halfHeight = height / 2;
            let centerV = h / 2;
            const rect =
                new XLine({
                    startX: i * widthPerRay,
                    startY: centerV - halfHeight,
                    lineWidth: widthPerRay,
                    fillStyle: 'red',
                    endX: i * widthPerRay,
                    endY: centerV + halfHeight,
                    alpha: Math.max(0.1, scale)
                });
            this.projectionRays.push(rect);
            this.projectionX.stage.addChild(rect);
        });

        // console.log(this.projectionRays[0]);

        this.projectionX.gameLoop();
    }


}


