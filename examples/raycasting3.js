
import { X } from '../lib/x/x';
import { XLine } from '../lib/x/x-line';
import { XRectangle } from '../lib/x/x-rectangle';
import { Vector } from '../lib/mathf/vector';
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
        this.forwardKey = false;
        this.leftKey = false;
        this.rightKey = false;
        this.downKey = false;

        this.domWatcher.add({
            element: document,
            on: 'keydown',
            callback: (event) => {
                // up arrow
                if (event.keyCode == 38) {
                    this.forwardKey = true;
                }
                // right arrow
                if (event.keyCode == 39) {
                    this.rightKey = true;
                }
                // left arrow
                if (event.keyCode == 37) {
                    this.leftKey = true;
                }
                // Down arrow
                if (event.keyCode == 40) {
                    this.backKey = true;
                }
            }
        });

        this.domWatcher.add({
            element: document,
            on: 'keyup',
            callback: (event) => {
                if (event.keyCode == 38) {
                    this.forwardKey = false;
                }
                if (event.keyCode == 39) {
                    this.rightKey = false;
                }
                if (event.keyCode == 37) {
                    this.leftKey = false;
                }
                if (event.keyCode == 40) {
                    this.backKey = false;
                }
            }
        });

        this.projectionRays = [];
        // The field of view.
        this.fov = 45;
        this.rayPerAngle = 0.15;


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
            x: window.innerWidth / 2 / 2 - 300,
            y: window.innerHeight - 100,
            width: 2,
            heigth: 2
        });
        this.X.stage.addChild(this.player);


        // Create a bunch of lines in the world.
        this.lines = [];
        // for (let i = 0; i < 2; i += 1) {
        //     this.lines.push(new XLine({
        //         lineWidth: 5,
        //         startX: mathf.getRandomInt(0, 1000),
        //         startY: mathf.getRandomInt(0, 1000),
        //         endX: mathf.getRandomInt(0, 1000),
        //         endY: mathf.getRandomInt(0, 1000),
        //     }));
        // }

        this.lines.push(new XLine({ lineWidth: 5, startX: 50, startY: 50, endX: 200, endY: 50 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 200, startY: 50, endX: 200, endY: 200 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 200, startY: 200, endX: 50, endY: 200 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 50, startY: 200, endX: 50, endY: 50 }));


        this.lines.push(new XLine({ lineWidth: 5, startX: 300, startY: 300, endX: 500, endY: 300 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 500, startY: 300, endX: 500, endY: 500 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 500, startY: 500, endX: 300, endY: 500 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 300, startY: 500, endX: 300, endY: 300 }));

        this.lines.push(new XLine({ lineWidth: 5, startX: 650, startY: 650, endX: 800, endY: 650 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 800, startY: 650, endX: 800, endY: 800 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 800, startY: 800, endX: 650, endY: 800 }));
        this.lines.push(new XLine({ lineWidth: 5, startX: 650, startY: 800, endX: 650, endY: 650 }));

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
        for (let i = 0; i < this.fov; i += this.rayPerAngle) {
            rayAngles.push(i);
        }


        this.X.onTick(() => {


            this.rays.forEach((ray) => {
                this.X.stage.removeChild(ray);
            });
            this.rays = [];


            if (this.leftKey) {
                this.player.rotation -= 3;
            }
            if (this.rightKey) {
                this.player.rotation += 3;
            }
            this.player.rotation = mathf.wrap(this.player.rotation, 0, 360);

            // Origin should center from where the player stands.
            let origin = this.player.position;
            let rotation = this.player.rotation;

            // If the player is pressing some key we allow the player to move forward.
            if (this.forwardKey) {
                // Get the current rotation and add a forwardVector in that direction.
                let forwardVector = Vector.fromAngle(
                    mathf.degreeToRadian(rotation, 1), 10);
                origin.add(forwardVector);
            }



            if (this.backKey) {
                // Get the forward Vector and negate it.
                let forwardVector = Vector.fromAngle(
                    mathf.degreeToRadian(rotation, 1), 10);
                origin.add(forwardVector.negate());
            }

            this.hitRaycasts = [];

            // Loop through each line object to see if there is a collision.
            this.lines.forEach((line) => {
                // For each ray test to see if there is a collision.
                rayAngles.forEach((angle, i) => {
                    // // Offset the angle so the field of view is centered.
                    angle -= this.fov / 2;

                    const raycast = Raycast.castInfinite2dRay(origin,
                        mathf.degreeToRadian(angle + rotation),
                        new Vector(line.startX, line.startY),
                        new Vector(line.endX, line.endY)
                    );

                    // If the current raycast is hitting.
                    if (raycast.hit) {
                        raycast.originalAngle = angle;
                        raycast.order = i;
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
                    strokeStyle: 'white',
                    lineWidth: 3,
                    startX: origin.x,
                    startY: origin.y,
                    endX: raycast.collision.x,
                    endY: raycast.collision.y
                });
                this.X.stage.addChild(ray);
                this.rays.push(ray);
            });



            // Sort the ray casts correctly.
            this.hitRaycasts = this.hitRaycasts.sort((a, b) => {
                return a.order - b.order;
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
        let depth = 9;
        let visionDistance = 3000;
        this.hitRaycasts.forEach((ray, i) => {
            let distance = ray.distance;
            let scale = distance / visionDistance;
            scale = 1 - mathf.clamp01(scale);
            // Avoid fisheye so use square.
            scale = Math.pow(scale, depth);
            let height = Math.max(h * scale, 1);
            let halfHeight = height / 2;
            let centerV = h / 2;
            const rect =
                new XLine({
                    startX: i * widthPerRay + 1,
                    startY: centerV - halfHeight,
                    lineWidth: widthPerRay + 1,
                    strokeStyle: 'red',
                    endX: i * widthPerRay,
                    endY: centerV + halfHeight,
                    alpha: Math.max(0.1, scale)
                });
            const floor = new XLine({
                startX: i * widthPerRay + 1,
                startY: centerV + halfHeight,
                lineWidth: widthPerRay + 1,
                radialGradient: {
                    x0: i * widthPerRay + 1,
                    y0: centerV + halfHeight,
                    r0: 100,
                    x1: i * widthPerRay + 1,
                    y1: h,
                    r1: 500
                },
                gradientStops: [
                    { stop: 0, color: '#010101' },
                    { stop: 1, color: 'white' }
                ],
                endX: i * widthPerRay,
                endY: h,
                alpha: 1
                // alpha: Math.max(0.1, scale)
            });
            // const text =
            //     new XLine({
            //         fillStyle: 'white',
            //         x: i * widthPerRay + 1,
            //         y: h,
            //         text: ray.distance
            //     });
            this.projectionRays.push(rect);
            this.projectionRays.push(floor);
            // this.projectionRays.push(text);
            this.projectionX.stage.addChild(rect);
            this.projectionX.stage.addChild(floor);
            // this.projectionX.stage.addChild(text);
        });

        // console.log(this.projectionRays[0]);

        this.projectionX.gameLoop();
    }


}


