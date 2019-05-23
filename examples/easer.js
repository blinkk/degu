
import { Raf } from '../lib/raf';
import { Easer } from '../lib/easer';
import { EASE } from '../lib/ease';

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
            easeFunction: EASE.easeInOutExpo
        });

        easer.onUpdate((progression, complete) => {
            console.log('progression', progression);

            ball.style.transform = `translateX(${progression * 80}vw)`;
        });
        easer.onComplete((progression, complete) => {
            console.log('complete', progression);
        });

        // Easer expects to be updated on each raf cycle.
        this.raf = new Raf(() => {
            easer.update();
        });

        this.raf.start();

        // Start the easer on clicking the button.
        document.getElementById('start').addEventListener('click', () => {
            console.log('starting easer');
            easer.start();
        });

        // Update
        document.getElementById('update').addEventListener('click', () => {
            console.log('updated settings');
            easer.reset({
                duration: +this.durationElement.value,
                delay: +this.delayElement.value
            });
        });
    }

}