
import { Interpolate } from '../lib/interpolate/interpolate';
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';

export default class InterpolateSample {
    constructor() {
        console.log('running raf timer sample');


        //
        // Here is an example of updating the ball x, y positions
        // based on progress (a value between 0-1).
        //
        // Here progress is represented by the range input.
        //
        // See mathf.ease example as well.
        //

        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');
        this.progress = +this.range.value;


        let ballXInter = new Interpolate({
            from: 0,
            to: 500,
            easeFunction: EASE.easeOutSine
        });

        let ballYInter = new Interpolate({
            from: 0,
            to: 500,
            easeFunction: EASE.easeInCubic
        });

        // Note we are using Raf for demo purposes.  Use [[RafProgress]] to
        // ease progress and avoid layout thrashing.
        const raf = new Raf(() => {
            let progress = +this.range.value;

            // Add a lerp to the progress itself.
            // This creates a ease, delayed motion when scrolling.
            // Note, it's usually recommended to apply only EASE.linear
            // for progress lerping.
            // See mathf.ease example as well.
            this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);

            // Uncomment me to see the difference without progress lerping.
            // this.progress = progress;

            let x = ballXInter.calculate(this.progress);
            let y = ballYInter.calculate(this.progress);


            this.updateBallPosition(x, y);
        });

        // raf.setFps(1);
        raf.start();

    }

    updateBallPosition(x, y) {
        this.ball.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
}
