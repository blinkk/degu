
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { EASE } from '../lib/ease/ease';
import { CssVarInterpolate } from '../lib/interpolate/css-var-interpolate';

export default class CssVarInterpolateSample {
    constructor() {
        console.log('css var interpolate sample');

        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');

        this.cssVarInterpolate = new CssVarInterpolate(
            this.ball,
            {
                interpolations: [
                    {
                        progress: [
                            { from: 0, to: 1, start: 0, end: 500 },
                        ],
                        id: '--x'
                    },
                    {
                        progress: [
                            { from: 0, to: 0.2, start: 0, end: 100, easingFunction: EASE.easeOutSine },
                            { from: 0.2, to: 0.3, start: 100, end: 300, easingFunction: EASE.easeOutSine },
                            { from: 0.3, to: 0.5, start: 300, end: 0, easingFunction: EASE.easeOutSine },
                            { from: 0.5, to: 1, start: 0, end: 500, easingFunction: EASE.easeInQuad },
                        ],
                        id: '--y'
                    },
                ]
            }
        );

        this.progress = +this.range.value;


        // Note that cssVarInterpolate, will cull uncessary calls to
        // avoid layout updates/thrashing.  If the value of progress is the
        // same, won't make any uncessary calls but allow the animations
        // to complete.
        //
        // Note that it is recommended to use RafProgress to manage progress
        // easing but here to keep the demo simple, we are using a simplified
        // model.
        const raf = new Raf(() => {
            let progress = +this.range.value;
            // Add a little ease to smooth things out.
            this.progress = mathf.ease(this.progress, progress, 0.25, EASE.easeInOutQuad);
            // Reduce the precision of progress.  We dont need to report progress differences
            // of 0.0000001.
            this.progress = mathf.round(this.progress, 3);

            this.cssVarInterpolate.update(this.progress);
        }).start();

    }

}