import {Easer} from '../lib/ease/easer';
import * as EASE from '../lib/ease/ease';

export default class EaserSample {
  constructor() {
    console.log('easer');
    const ball = document.getElementById('ball');
    this.durationElement = document.getElementById('duration');
    this.delayElement = document.getElementById('delay');

    let duration = 1000;
    let delay = 0;
    this.durationElement.value = duration;
    this.delayElement.value = delay;


    // Create easer.
    const easer = new Easer({
      duration: duration,
      delay: delay,
      easeFunction: EASE.easeInOutExpo,
    });

    easer.onUpdate((progression, complete) => {
      console.log('progression', progression);

      ball.style.transform = `translateX(${progression * 80}vw)`;
    });


    // Start the easer on clicking the button.
    document.getElementById('start').addEventListener('click', () => {
      console.log('starting easer');
      easer.start().then(() => {
        console.log('all done');
      });
    });

    // Update
    document.getElementById('update').addEventListener('click', () => {
      console.log('updated settings');
      easer.reset({
        duration: +this.durationElement.value,
        delay: +this.delayElement.value,
      });
    });
  }
}
