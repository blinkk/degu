

import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';
import { CubicBezier } from '../lib/mathf/cubic-bezier';
import { CatmullRom } from '../lib/mathf/catmull-rom';
import { Vector } from '../lib/mathf/vector';

export default class MathfEaseSample {
    constructor() {
        console.log('Mathf Ease Sample');

        //
        // Here is an example of updating the ball x, y positions
        // based on progress (a value between 0-1).
        //
        // Moving the range input, will change the progress from 0-1.
        //
        // It is important to note that there are two levels of easing.
        // The first level of ease is to the x, y POSITIONS of the ball.
        // This is not easing of the animations (smoothing out interactions),
        // but is easing calculations of the PATH that the ball should
        // follow.
        //
        // This is calculated with:
        //    x = mathf.ease(0, 500, this.progress, EASE.easeOutSine);
        //    y = mathf.ease(0, 500, this.progress, EASE.easeInCubic);
        //
        //
        // In order to smooth out the interaction (create a slight delay,
        // smoothness),we add a second level of easing to the progress itself.
        // This is adding EASE to the timeline rather than the path so there is
        // a distinction.
        //
        //    this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
        //
        // Applying ease to progression works nicely in cases like this or
        // in cases like where you are using the window scroll as a input
        // for progression.
        //
        // Below is a demo but for a more performance way to ease progress,
        // see [[RafProgress]].
        //
        // Try applying around with the demo.
        //
        this.ball = document.getElementById('ball');
        this.checkbox = document.getElementById('checkbox');
        this.range = document.getElementById('range');
        this.progress = +this.range.value;


        // Note we are using Raf for demo purposes.  Use [[RafProgress]] to
        // ease progress and avoid layout thrashing.
        const raf = new Raf(() => {

            let progress = +this.range.value;

            // Add a lerp to the progress itself.
            // This creates a ease, delayed motion when scrolling.
            // Note, it's usually recommended to apply only EASE.linear
            // for progress lerping.
            if (this.checkbox.checked) {
                // this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
                // this.progress = mathf.ease(this.progress, progress, 0.02, EASE.linear);
                this.progress = mathf.damp(this.progress, progress, 0.25, 0.3);
            } else {
                // No easing on progress.
                this.progress = progress;
            }

            // EASE Example
            // let x = mathf.ease(0, 500, this.progress, EASE.easeOutSine);
            // let y = mathf.ease(0, 500, this.progress, EASE.easeInCubic);


            // Cubic Bezier  Example
            // Keep X as linear so you can see the bezier on the y.
            // https://cubic-bezier.com/
            // let x = mathf.ease(0, 500, this.progress,
            //     EASE.linear);
            // let y = mathf.ease(500, 0, this.progress,
            //     CubicBezier.makeEasingFunction(0.17, 0.67, 0.93, -0.12));



            // Catmull-Rom example.
            let catmullEasing = CatmullRom.interpolate(
                [
                    new Vector(0, 500),
                    new Vector(100, 400),
                    new Vector(300, 300),
                    new Vector(200, 100),
                    new Vector(100, 400),
                    new Vector(200, 80),
                    new Vector(200, 250),
                    new Vector(0, 0),
                    new Vector(0, 500),
                    new Vector(400, 400),
                    new Vector(500, 500),
                ], 0, 0
            );
            // let x = mathf.ease(0, 500, this.progress,
            //     EASE.linear);
            // console.log('x');
            let x = catmullEasing(this.progress).x;
            let y = catmullEasing(this.progress).y;
            // console.log(y);

            // console.log(y);




            this.updateBallPosition(x, y);
        });

        // raf.setFps(1);
        raf.start();
    }

    updateBallPosition(x, y) {
        this.ball.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
}
