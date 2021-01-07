


//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739196#questions/8753186
// https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/
// https://codepen.io/nik-lever/pen/PLYRWm


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import {deguMathf} from '../lib/shaders/three-shader-chunks/degu-mathf';
deguMathf(THREE);
import {noise} from '../lib/shaders/three-shader-chunks/noise';
noise(THREE);

const vshader = `
#include <noise>
#include <deguMathf>
uniform float u_time;

varying float v_noise;
varying vec2 vUv;
void main() {


    // 普通にこれでもいいがサンプル用にノーマルを下記でしよう
    // Uneune ball poi
    // float arms = 0.05;
    // float b = 5.0 * pnoise (arms * position + u_time, vec3(100.0));

    // Spike
    // float b = pnoise (position + u_time, vec3(100.0)) * 5.0;

    // Breathing
    float arms = 0.032;
    v_noise = 10.0 * -0.1 * turbulence(0.5 * normal + u_time * 0.2);
    float b = pnoise (arms * position + u_time, vec3(100.0)) * ((normalizedSin(u_time * 0.5) + 1.0) * 10.0);
    float displacement = b - 10.0 * v_noise;

    // Calculate a displancement amount with normal.
    // https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739196#questions/8753186
    // v_noise = 10.0 * -0.1 * turbulence(0.5 * normal + u_time);
    // float b = 5.0 * pnoise (0.05 * position, vec3(100.0));
    // float displacement = b - 10.0 * v_noise;

    vec3 pos = position + normal * displacement;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`;


const fshader = `
#include <noise>
#include <deguMathf>
#define PI 3.141592653589
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;
uniform sampler2D u_tex;


varying vec2 vUv;
varying float v_noise;
void main()
{
  // get a random offset
  float r = .01 * random( gl_FragCoord.xyz, 0.0 );
  // lookup vertically in the texture, using noise and offset
  // to get the right RGB colour
  // So really only consider the Y value in the texture.
//   vec2 uv = vec2( 0, 1.3 * v_noise + r );

  // Simple version.
  // Using a v_noise, look up a specific y point in the texture
  // and display that out to the current pixel.
  vec2 uv = vec2(0, 1.2 * v_noise);
  vec3 color = texture2D( u_tex, uv ).rgb;

  gl_FragColor = vec4( color, 1.0 );
}
`;




export default class GlslPlayground27 {
    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        this.camera.position.z = 100;


        // Add some lights.
        const ambient = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 1);
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set(0, 6, 2);
        this.scene.add(ambient);
        this.scene.add(light);


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



        this.geometry = new THREE.IcosahedronGeometry( 20, 4 );

        this.uniforms = {
            u_time: { value: 0.0 },
            u_mouse: { value:{ x:0.0, y:0.0 }},
            u_resolution: { value:{ x:0, y:0 }},
            u_color: { value: new THREE.Color(0xb7ff00)},
            u_tex: { value: new THREE.TextureLoader().load("/public/explosion.png")}
          };
        console.log('uniforms');
        console.log(this.uniforms);


        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
            // wireframe: true
        });


        this.ball = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.ball);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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
        if(this.uniforms) {
          this.uniforms.u_time.value += this.raf.getDelta(true);
        }
        if(this.renderer) {
          this.renderer.render(this.scene, this.camera);
        }
    }

}