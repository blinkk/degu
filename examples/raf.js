
import { Raf } from '../lib/raf/raf';

class RafSample {
    constructor() {
        console.log('running raf sample');
        this.startElement = document.getElementById('start');
        this.stopElement = document.getElementById('stop');
        this.frameRateElement = document.getElementById('frameRate');
        this.frameRateUpdateElement = document.getElementById('update');
        this.frameElement = document.getElementById('frame');

        this.raf = new Raf((frame, lastUpdateTime) => {
            // console.log('this is the raf loop running!');
            this.frameElement.textContent = frame;
        });

        this.displayFrameRate();

        this.startElement.addEventListener('click', () => {
            this.raf.start();
        });

        this.stopElement.addEventListener('click', () => {
            this.raf.stop();
        });

        this.frameRateUpdateElement.addEventListener('click', () => {
            this.raf.setFps(this.frameRateElement.value);
        });
    }


    displayFrameRate() {
        this.frameRateElement.value = this.raf.fps;
    }



}
export default RafSample;
