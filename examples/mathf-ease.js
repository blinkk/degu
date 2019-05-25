

import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';

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
        // Applying ease to progression works nicely in cases like this or
        // in cases like where you are using the window scroll as a input
        // for progression.
        //
        // Try applying around with the demo.
        //
        this.ball = document.getElementById('ball');
        this.checkbox = document.getElementById('checkbox');
        this.range = document.getElementById('range');
        this.progress = +this.range.value;


        const raf = new Raf(() => {

            let progress = +this.range.value;

            // Add a lerp to the progress itself.
            // This creates a ease, delayed motion when scrolling.
            // Note, it's usually recommended to apply only EASE.linear
            // for progress lerping.
            if (this.checkbox.checked) {
                this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
            } else {
                // No easing on progress.
                this.progress = progress;
            }

            // Positions with just pure math lerping.
            let x = mathf.ease(0, 500, this.progress, EASE.easeOutSine);
            let y = mathf.ease(0, 500, this.progress, EASE.easeInCubic);

            this.updateBallPosition(x, y);
        });

        // raf.setFps(1);
        raf.start();
    }

    updateBallPosition(x, y) {
        this.ball.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
}
