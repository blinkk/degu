
import {PerlinNoise} from '../lib/mathf/perlin-noise';
import {mathf} from '../lib/mathf/mathf';

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

  // Draws one line.
  oneline(amplitude) {
    let frequency = 8;

    this.context.beginPath();
    for (let i = 0; i < canvas.width; i += 50) {
      let x = i / canvas.width;
      let y = this.y / canvas.height;
      let z = this.z / canvas.height;
      let n = PerlinNoise.noise3(x * frequency, y * frequency, z * frequency);
      this.context.lineTo(i, -(n * amplitude) + canvas.height);
      this.context.stroke();
    }
  }

  draw() {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.save();

    for (let i = 2; i < 10; i += 1) {
      let color = 'green';
      if (i % 2 == 0) {
        color = 'red';
      }
      if (i % 3 == 0) {
        color = 'orange';
      }
      this.context.strokeStyle = color;
      this.oneline((i + 1) * 100);
    }

    // this.y = mathf.sinNormalized(this.offset) * canvas.height;
    // this.z = mathf.sinNormalized(this.offsetZ) * canvas.height;
    // this.offset += 0.02;
    // this.offsetZ += 0.02;
    this.y += this.offset;
    this.z += this.offset;
    this.offset = 0.9;
    this.offsetZ = 0.8;


    requestAnimationFrame(() => {
      this.draw();
    });
  }
}
