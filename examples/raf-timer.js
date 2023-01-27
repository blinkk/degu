

import {RafTimer} from '../lib/raf/raf-timer';
import * as mathf from '../lib/mathf/mathf';
import * as EASE from '../lib/ease/ease';

export default class RafTimerSample {
  constructor() {
    console.log('running raf timer sample');
    this.startElement = document.getElementById('start');
    this.stopElement = document.getElementById('stop');

    this.box = document.getElementById('box');

    // Start the box at 0.
    this.currentX = 0;
    this.end = 80; // The end position of the box.
    ball.style.transform = `translateX(${this.currentX}vw)`;

    this.rafTimer = new RafTimer((progress) => {
      // Ease the ball position on each raf.
      ball.style.transform = `translateX(${
        mathf.ease(this.currentX, this.end, progress, EASE.easeOutExpo)
      }vw)`;
    });

    // Set it so that the raf stops after 1000ms.
    this.rafTimer.setDuration(1000);

    this.rafTimer.onComplete(() => {
      console.log('animation complete');
    });

    this.startElement.addEventListener('click', () => {
      this.rafTimer.play();
    });

    this.stopElement.addEventListener('click', () => {
      this.rafTimer.pause();
    });
  }
}
