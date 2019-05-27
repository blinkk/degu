import { MultiInterpolate } from '../lib/interpolate/multi-interpolate';
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';

export default class MultiInterpolateSample {
    constructor() {
        console.log('Running MultiInterpolate Sample');

        // This is a demo of using multi-interpolate to shift the position
        // of the ball.

        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');
        this.progress = +this.range.value;

        this.multiInterpolate = new MultiInterpolate({
            interpolations: [
                {
                    progress: [
                        { from: 0, to: 1, start: 0, end: 500 },
                    ],
                    id: 'x',
                },
                {
                    progress: [
                        { from: 0, to: 0.2, start: 0, end: 100, easingFunction: EASE.easeOutSine },
                        { from: 0.2, to: 0.3, start: 100, end: 300, easingFunction: EASE.easeOutSine },
                        { from: 0.3, to: 0.5, start: 300, end: 0, easingFunction: EASE.easeOutSine },
                        { from: 0.5, to: 1, start: 0, end: 500, easingFunction: EASE.easeInQuad },
                    ],
                    id: 'y',
                }
            ]
        });

        // Note here we are using raf for demo purposes but not that this is
        // constantly updating the ball position even when the previous values
        // were unchanged.
        const raf = new Raf(() => {
            // Set the progress to the current range value.
            let progress = +this.range.value;

            // Add easing to progress itself to smooth out animations.
            this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);

            // Interpolate values based on current progress.
            let interpolationResults = this.multiInterpolate.calculate(this.progress);
            let x = interpolationResults['x'];
            let y = interpolationResults['y'];

            this.updateBallPosition(x, y);
        });

        raf.start();
    }

    updateBallPosition(x, y) {
        this.ball.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
}
