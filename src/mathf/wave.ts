


/**
 * A really simple utility class to manage sin, cos waves.
 *
 *
 * ```ts
 *
 * let myWave = new Wave(0.001);
 *
 *
 * new Raf(()=> {
 *   // Update the wave per Raf.
 *   myWave.update();
 *
 *   // Sin value
 *   console.log(myWave.sinWave);
 *   console.log(myWave.cosWave);
 *
 *   // Use the value to do calcutions.
 *   this.x += myWave.sinWave * 10;
 * }).start();
 *
 * ```
 */
export class Wave {
    /**
     * The internal clock.
     */
    private timer: number;
    /**
     * The amount to update per RAF cycle.
     */
    private speed: number;

    constructor(speed: number) {
        this.timer = 0;
        this.speed = speed;
    }

    get sinWave() {
        return Math.sin(this.timer);
    }

    get cosWave() {
        return Math.cos(this.timer);
    }

    update() {
        this.timer = this.timer + this.speed;
    }

}