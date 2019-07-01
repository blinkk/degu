

import { Raf } from '../lib/raf/raf';
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { VectorDom } from '../lib/dom/vector-dom';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { mathf } from '../lib/mathf/mathf';
import { CatmullRom } from '../lib/mathf/catmull-rom';
import { Vector } from '../lib/mathf/vector';
import { Wave } from '../lib/mathf/wave';

export default class ScrollDemoSample4 {
    constructor() {
        console.log('Scroll Demo 4');

        this.domWatcher = new DomWatcher();
        this.parentElement = document.getElementById("parent");
        this.moduleHeight = this.parentElement.offsetHeight;
        this.childElement = document.getElementById("child");
        this.easedProgress = 0;
        this.progress = 0;

        this.wave = new Wave(0.03);


        // Update the progress value per scroll.
        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: (event) => {
                this.progress =
                    dom.getElementScrolledPercent(this.parentElement);
            },
            eventOptions: { passive: true }
        });


        this.flowerElements = Array.from(document.querySelectorAll('.flower'));

        this.flowerVectors = [];

        let ww = window.innerWidth;
        let wh = window.innerHeight;
        let columns = 6;
        let xIncrement = ww / columns;
        let yIncrement = wh * 0.2;
        let row = 0;
        let column = 0;
        this.flowerElements.forEach((flower, i) => {
            const flowerVector = new VectorDom(flower);
            flowerVector.anchorX = 0;
            flowerVector.anchorY = 0;

            let x = xIncrement * column;
            let y = yIncrement * row;
            // Use the offset feature to generalliy position the element.
            // We could also use top, left in css to do this as well.
            flowerVector.setOffset(new Vector(x, y));

            if (i % 2 == 1) {
                const timeline = [
                    { progress: 0, x: -100, y: -100, rx: -40, ry: 0, rz: -360, z: 0 - 1 },
                    { progress: 0.2, z: 0 - 1 },
                    { progress: 0.5, ry: 90 },
                    { progress: 0.9, x: -200, y: 0, rx: 10, ry: 0, rz: 10, z: 1 - 1 },
                ];
                flowerVector._.timeline.setTimeline(timeline);
            } else {
                const timeline = [
                    { progress: 0, x: -100, y: -100, z: 1 - 1, rz: 0, alpha: 1, '--blur': 1 },
                    { progress: 0.8, alpha: 1 },
                    { progress: 0.9, x: -200, y: 0, z: 0.2 - 1, rz: -360, alpha: 0, '--blur': 0 },
                ];
                flowerVector._.timeline.setTimeline(timeline);
            }

            flowerVector.id = i;
            flowerVector.useBoundsForGlobalCalculation = true;
            flowerVector.waveMovementFactor = mathf.getRandomInt(-20, 20);
            flowerVector.init();


            this.flowerVectors.push(flowerVector);

            if (column >= columns) {
                column = 0;
                row++;
            } else {
                column++;
            }
        });


        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        this.raf = new Raf(this.onRaf.bind(this)).start();
    }



    onRaf() {
        this.easedProgress =
            mathf.lerp(this.easedProgress, this.progress, 0.25);
        this.wave.update();

        let invertProgress = 1 - this.easedProgress;


        this.flowerVectors.forEach((vector) => {
            vector._.timeline.updateProgress(this.easedProgress);

            // Add a littie up and down motion.
            let floatyVector = new Vector(
                (vector.waveMovementFactor * this.wave.sinWave) * this.easedProgress,
                // We want the wave effect to be strong bottom and none at the top.
                (vector.waveMovementFactor * this.wave.sinWave) * this.easedProgress,
                0
            );

            vector.position.add(floatyVector);

            if (vector.id % 2 == 1) {
                vector._.force.mouseRotationForce(
                    0.05, 0.05, 0, 0.02
                );
            } else {
                vector._.force.scrollYRotationForce(
                    0, 0.05, 0, 0.02
                );
            }
            vector.render();
        });
    }

}