
//
//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';


const vshader = `
varying vec3 v_position; // Declare v_position
varying vec2 v_uv; // Declare v_uv
void main() {
  // Set the uv value.  Three.js passes the uv value by default of the current vertices.
  v_position = position;
  v_uv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
#define PI 3.14159265359
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color_a;
uniform vec3 u_color_b;
uniform float u_time;

varying vec3 v_position;
varying vec2 v_uv;

float random (vec2 st) {
    return fract(sin(dot(st, vec2(12.9898,78.233)))
                 * 43758.5453123);
}
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}


void main (void)
{
  vec2 st = v_uv;

  // Scale the coordinate system to see
  // some noise in action
  vec2 pos = vec2(
      v_uv.x * 1.4 + 0.01,
      v_uv.y - u_time * 0.69
  );

  // Use the noise function
  float n = noise(pos * 23.0);
  // Layer2
  pos = vec2(fract(v_uv.x * 0.5 - 0.0333), v_uv.y * 2.0 - u_time * 0.12);
  n+= noise(pos * 8.0);

  // Layer 3
  pos = vec2(v_uv.x * 0.94 - 0.02, v_uv.y * 3.0 - u_time * 0.61);
  n+= noise(pos * 0.5);
  n /= 3.0;


  vec3 color = mix(u_color_a, u_color_b, n);

  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground17 {
    constructor() {

        this.scene = new THREE.Scene();
        // 2x2
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.raf = new Raf(this.onRaf.bind(this));
        this.domWatcher = new DomWatcher();

        this.domWatcher.add({
            element: window,
            on: 'resize',
            callback: this.onResize.bind(this),
            eventOptions: { passive: true },
        });

        this.domWatcher.add({
            element: window,
            on: 'mousemove',
            callback: this.onMouseMove.bind(this),
        });


        this.uniforms = {
            u_color_a: { value: new THREE.Color(0xff0000) },
            u_color_b: { value: new THREE.Color(0x00ffff) },
            // Float
            u_time: { value: 0.0 },
            // Vec2 0,0 at top, left and window.innerWidth and window.innerHeight at bottom right.
            u_mouse: { value: { x: 0.0, y: 0.0 } },
            // Vec2 Screen resolution
            u_resolution: { value: { x: 0, y: 0 } }
        };

        // 2x2 so it fill the screen.
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader
        });

        // Create mesh (geom + material)
        this.plane = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.plane);

        this.camera.position.z = 1;

        this.onResize();

        this.raf.start();
    }


    onResize() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        let width, height;
        if (aspectRatio >= 1) {
            width = 1;
            height = (window.innerHeight / window.innerWidth) * width;
        } else {
            width = aspectRatio;
            height = 1;
        }
        this.camera.left = -width;
        this.camera.right = width;
        this.camera.top = height;
        this.camera.bottom = -height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.uniforms.u_resolution.value.x = window.innerWidth;
        this.uniforms.u_resolution.value.y = window.innerHeight;
    }


    onMouseMove(evt) {
        this.uniforms.u_mouse.value.x = (evt.touches) ? evt.touches[0].clientX : evt.clientX;
        this.uniforms.u_mouse.value.y = (evt.touches) ? evt.touches[0].clientY : evt.clientY;
    }


    onRaf(delta) {
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}