
import { PerlinNoise } from '../lib/mathf/perlin-noise';
import { mathf } from '../lib/mathf/mathf';

export default class PerlinNoiseSample {
    constructor() {
        console.log('perlin noise');
        const canvas = document.getElementById('canvas');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        this.context = canvas.getContext('2d');

        this.offset = 0;
        this.offsetZ = 0;
        this.y = 0;
        this.z = 0;

        this.draw();
    }


    draw() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.context.save();
        this.context.beginPath();

        for (let i = 0; i < canvas.width; i += 10) {
            let x = i / canvas.width;
            let y = this.y / canvas.height;
            let n = PerlinNoise.noise3(i / canvas.width,
                this.y / canvas.height,
                this.y / canvas.height);
            this.context.lineTo(i, (n * 500) + 0);
            this.context.stroke();
        }

        this.y = mathf.sinNormalized(this.offset) * canvas.height;
        this.z = mathf.sinNormalized(this.offsetZ) * canvas.height;
        this.offset += 0.01;
        this.offsetZ += 0.02;


        requestAnimationFrame(() => {
            this.draw();
        });
    }
}