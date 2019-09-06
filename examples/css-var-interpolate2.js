

import {mathf} from '../lib/mathf/mathf';
import {RafProgress} from '../lib/raf/raf-progress';
import {EASE} from '../lib/ease/ease';
import {CssVarInterpolate} from '../lib/interpolate/css-var-interpolate';

export default class CssVarInterpolateSample2 {
  constructor() {
    console.log('css var interpolate sample 2');

    this.ball = document.getElementById('ball');
    this.range = document.getElementById('range');

    this.cssVarInterpolate = new CssVarInterpolate(
        document.getElementById('container'),
        {
          interpolations: [
            {
              progress: [
                {
                  from: 0, to: 0.5,
                  start: 'rgba(255, 128, 0, 0.3)', // orange
                  end: 'rgba(255, 153, 204, 1)', // pink
                },
                {
                  from: 0.5, to: 1,
                  start: 'rgba(255, 153, 204, 1)', // pink
                  end: 'rgba(0, 0, 255, 1)', // blue
                },
              ],
              id: '--background',
            },
            {
              progress: [
                {from: 0, to: 1, start: '0px', end: '500px'},
              ],
              id: '--x',
            },
            {
              progress: [
                {from: 0, to: 0.2, start: '0px', end: '100px', easingFunction: EASE.easeOutSine},
                {from: 0.2, to: 0.3, start: '100px', end: '300px', easingFunction: EASE.easeOutSine},
                {from: 0.3, to: 0.5, start: '300px', end: '0px', easingFunction: EASE.easeOutSine},
                {from: 0.5, to: 1, start: '0px', end: '500px', easingFunction: EASE.easeInQuad},
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


    rafProgress.setCurrentProgress(this.range.value);

    // Update rafProgress each time the value of range changes.
    this.range.addEventListener('input', () => {
      rafProgress.easeTo(+this.range.value, 0.1, EASE.easeInOutQuad);
    });
  }
}
