


//
//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';


// Import shader chunks
import {noise} from '../lib/shaders/three-shader-chunks/noise';
noise();

const vshader = `
varying vec3 v_position;
varying vec2 v_uv;
void main() {
  v_position = position;
  v_uv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
#include <noise>
#define PI 3.14159265359
#define PI2 6.28318530718

uniform vec3 u_LightColor;
uniform vec3 u_DarkColor;
uniform float u_Frequency;
uniform float u_NoiseScale;
uniform float u_RingScale;
uniform float u_Contrast;
uniform float u_time;


varying vec3 v_position;
varying vec2 v_uv;


void main (void)
{

  vec3 pos = v_position;
  pos.x += u_time;
  pos.y += u_time;
  float n = snoise(pos);
  float ring = u_Contrast - fract(u_NoiseScale * n);
  float lerp = pow(ring, u_RingScale) + n;
  vec3 color = mix(u_DarkColor, u_LightColor, lerp);

  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground19 {
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


        this.uniforms = {};
        this.uniforms.u_time = { value: 0.0 };
        this.uniforms.u_resolution = { value: new THREE.Vector2() };
        this.uniforms.u_LightColor = { value: new THREE.Color(0xbb905d) };
        this.uniforms.u_DarkColor = { value: new THREE.Color(0x7d490b) };
        this.uniforms.u_Frequency = { value: 20.0 };
        this.uniforms.u_NoiseScale = { value: 20.0 };
        this.uniforms.u_RingScale = { value: 0.5 };
        this.uniforms.u_Contrast = { value: 4.0 };

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
        // this.uniforms.u_mouse.value.x = (evt.touches) ? evt.touches[0].clientX : evt.clientX;
        // this.uniforms.u_mouse.value.y = (evt.touches) ? evt.touches[0].clientY : evt.clientY;
    }


    onRaf(delta) {
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}