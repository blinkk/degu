import { MultiInterpolate } from '../lib/interpolate/multi-interpolate';
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';

export default class MultiInterpolateSample {
    constructor() {
        console.log('Running MultiInterpolate Sample');

        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');
        this.progress = +this.range.value;

        this.tween = new MultiInterpolater({
            interpolations: [
                {
                    progress: [
                        { from: 0, to: 0.5, start: 0, end: 100 },
                        { from: 0.5, to: 1, start: 100, end: 800 },
                    ],
                    id: 'x',
                    easingFunction: EASE.linear
                }
            ]
        });

    }

    updateBallPosition(x, y) {
        this.ball.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
}
