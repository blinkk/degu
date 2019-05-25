

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
        // Moving the range input, will change the progress from 0-1.
        //
        // It is important to note that there are two levels of easing.
        // The first is to the x, y positions of the ball.
        //
        // This is calculated with:
        //    x = mathf.ease(0, 500, this.progress, EASE.easeOutSine);
        //    y = mathf.ease(0, 500, this.progress, EASE.easeInCubic);
        //
        // However, if we just did this, then the x and y positions
        // are linearly fixed to the progress (the range input).
        //
        // In order to smooth out the interaction (create a slight delay),
        // we add a second level of easing to the progress itself.
        //
        //    this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
        //
        // Try applying around with the demo.
        //
        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');
        this.progress = +this.range.value;

        const raf = new Raf(() => {
            let progress = +this.range.value;

            // Add a lerp to the progress itself.
            // This creates a ease, delayed motion when scrolling.
            // Note, it's usually recommended to apply only EASE.linear
            // for progress lerping.
            this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);

            // Uncomment me to see the difference without progress lerping.
            // this.progress = progress;

            // Positions with just pure math lerping.
            x = mathf.ease(0, 500, this.progress, EASE.easeOutSine);
            y = mathf.ease(0, 500, this.progress, EASE.easeInCubic);


            this.updateBallPosition(x, y);
        });

        // raf.setFps(1);
        raf.start();
    }

    updateBallPosition(x, y) {
        this.ball.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
}
