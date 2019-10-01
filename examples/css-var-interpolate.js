
import {RafProgress} from '../lib/raf/raf-progress';
import {EASE} from '../lib/ease/ease';
import {CssVarInterpolate} from '../lib/interpolate/css-var-interpolate';

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
                {from: 0, to: 1, start: 0, end: 500},
              ],
              id: '--x',
            },
            {
              progress: [
                {from: 0, to: 0.2, start: 0, end: 100, easingFunction: EASE.easeOutSine},
                {from: 0.2, to: 0.3, start: 100, end: 300, easingFunction: EASE.easeOutSine},
                {from: 0.3, to: 0.5, start: 300, end: 0, easingFunction: EASE.easeOutSine},
                {from: 0.5, to: 1, start: 0, end: 500, easingFunction: EASE.easeInQuad},
              ],
              id: '--y',
            },
          ],
        }
    );


    // Here is an example of using RafProgress to ease out the progress
    // values.
    const rafProgress = new RafProgress((easedProgress) => {
      this.cssVarInterpolate.update(easedProgress);
    });


    rafProgress.setCurrentProgress(+this.range.value);

    // Update rafProgress each time the value of range changes.
    this.range.addEventListener('input', () => {
      rafProgress.easeTo(+this.range.value, 0.1, EASE.easeInOutQuad);
    });
  }
}
