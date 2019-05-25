
import { CssProgressTween } from '../lib/dom/cssProgressTween';
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';

export default class CssProgressTweenSample {
    constructor() {
        console.log('running css progress tween sample');

        this.ball = document.getElementById('ball');
        this.tween = new CssProgressTween({
            rootElement: ball,
            tweens: [
                {
                    progress: { from: 0, to: 0.5, start: 0, end: 100 },
                    cssVar: '--transformX',
                    easingFunction: EASE.easeInOutQuad,
                },
                {
                    progress: { from: 0, to: 1, start: 0, end: 150 },
                    cssVar: '--transformY',
                    easingFunction: EASE.easeInOutQuad,
                }
            ]
        });

    }
}
