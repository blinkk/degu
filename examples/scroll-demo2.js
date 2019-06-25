

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

export default class ScrollDemoSample2 {
    constructor() {
        console.log('hello');

        this.domWatcher = new DomWatcher();
        this.parentElement = document.getElementById("parent");
        this.moduleHeight = this.parentElement.offsetHeight;
        this.childElement = document.getElementById("child");
        this.pointer = Vector.ZERO;
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

        // Calculate the mouse position.
        this.domWatcher.add({
            element: this.childElement,
            on: 'mousemove',
            callback: (event) => {
                let pageX;
                let pageY;
                if (event.touches) {
                    pageX = event.touches[0].pageX;
                    pageY = event.touches[0].pageY;
                } else {
                    pageX = event.pageX;
                    pageY = event.pageY;
                }
                const x = (pageX - this.childElement.offsetLeft);
                const y = (pageY - this.childElement.offsetTop - this.parentElement.offsetTop);

                // A pointer vector.
                this.pointer = new Vector(x, y, 0);
            },
            eventOptions: { passive: true }
        });


        this.flowerElement = document.getElementById('flower');
        this.flowerVector = new VectorDom(this.flowerElement);
        this.flowerVector.anchorX = 0;
        this.flowerVector.anchorY = 0;

        this.flowerElement2 = document.getElementById('flower2');
        this.flowerVector2 = new VectorDom(this.flowerElement2);
        this.flowerVector2.anchorX = 0.5;
        this.flowerVector2.anchorY = 0.5;
        // keep this flower small.
        this.flowerVector2.z = -0.5;
        // Center this flower
        this.flowerVector2.setOffset(new Vector(
            this.childElement.offsetWidth / 2,
            this.childElement.offsetHeight / 2,
        ));

        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);

        this.raf = new Raf(this.onRaf.bind(this)).start();

    }


    onRaf() {
        this.easedProgress =
            mathf.lerp(this.easedProgress, this.progress, 0.25);
        this.wave.update();

        this.updateFirstFlower();
        this.updateSecondFlower();

    }


    /**
     * For this flower we will update it's position with acceleration.
     * The flower should accelerate to the target position + a 10% mouse shift
     * factor.
     */
    updateFirstFlower() {
        // Add some movement.
        let x = (window.innerWidth - this.flowerVector.width) * this.easedProgress;
        let y = (window.innerHeight - this.flowerVector.height) * this.easedProgress;

        // Since we need to offset.
        let z = (1 * this.easedProgress) - 0.5;

        // This is the target position.
        let targetPositionVector = new Vector(x, y, z);

        // Calcualte the distance.
        const distanceVector = Vector.subtract(
            targetPositionVector,
            this.flowerVector.position,
        );

        // Calculate the distance from the pointer.
        const pointerDistanceVector = Vector.subtract(
            this.pointer,
            this.flowerVector.position,
        );

        // Add the distance from the target to poitner but we don't want to
        // make the pointer too strong, so scale it down.
        distanceVector.add(pointerDistanceVector.scale(0.1));

        // Add that distance to the acceleration of the flowerVector.
        this.flowerVector.acceleration =
            Vector.ease(this.flowerVector.acceleration, distanceVector, 0.8);

        // Let's dampen the acceleration.
        this.flowerVector.acceleration.lerp(Vector.ZERO, 0.8);

        // Finally add a little movement to the position itself to create a
        // floaty feeling.
        let floatyVector = new Vector(
            0 * this.wave.sinWave,
            4 * this.wave.sinWave,
            0
        );
        this.flowerVector.position.add(floatyVector);

        // Finally also update alpha.
        this.flowerVector.alpha = (1 * this.easedProgress) + 0.5;

        this.flowerVector.render();

    }


    updateSecondFlower() {

        const pointer = this.pointer.clone();
        // We don't want the pointer to affect the scale.
        pointer.z = this.flowerVector2.z;
        const distanceVector = Vector.subtract(
            pointer.subtract(this.flowerVector2.offset),
            this.flowerVector2.position
        );
        this.flowerVector2.acceleration =
            Vector.ease(this.flowerVector2.acceleration, distanceVector, 0.8);
        this.flowerVector2.acceleration.lerp(Vector.ZERO, 0.8);

        // Finally add a little movement to the position itself to create a
        // floaty feeling.
        let floatyVector = new Vector(
            0 * this.wave.sinWave,
            10 * this.wave.sinWave,
            0
        );

        this.flowerVector2.position.add(floatyVector);

        this.flowerVector2.render();
    }
}