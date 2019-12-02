

//
//
// Simple Image Texture.
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739178#questions
// https://codepen.io/nik-lever/pen/wvwZwMR
// https://codepen.io/nik-lever/pen/PVMQbP
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import {yanoMathf} from '../lib/shaders/three-shader-chunks/yano-mathf';
yanoMathf(THREE);

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
#include <yanoMathf>
#define PI 3.14159265359

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;
uniform float u_duration;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

varying vec3 v_position;
varying vec2 v_uv;


void main (void)
{

    // Use varying position since center is 0.0 and it goes outwards.
    // This uses NDC coords.
    // vec2 p = v_position.xy;
    vec2 p = -1.0 + 2.0 * v_uv;

    // LEN
    //        |   /
    //        |  /
    // -------|------
    //        |
    //        |
    float len = length(p);
    // Intensity.
    vec2 radiant = p / len * 0.02;
    float rippleCount = 30.0;
    vec2 ripple = v_uv + radiant * cos(len * rippleCount - u_time * 4.0);


    // The time. 1.0 if the animation is complete.
    float progress = u_time / u_duration;
    // Mix between ripple and non ripple to get UV coords to map final texel.
    vec2 uv = mix(ripple, v_uv, progress);

    // Get texel at uv for the pic 1 and pic 2.
    vec3 color1 = texture2D(u_texture1, uv).rgb;
    vec3 color2 = texture2D(u_texture2, uv).rgb;

    // Simple cross fade.
    // vec3 color = mix(color1, color2, progress);

    // Optional:
    // Blend between 0.14 - 0.25 edge around progress.
    // Creates a circular wipe.
    // https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739182#questions
    float fade = smoothstep(progress * 1.4, progress * 2.5, len);

    // Mix it
    vec3 color = mix(color2, color1, fade);

    gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground21 {
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
            // Load a texture.
            // Ends up being a sampler2D type.
            u_texture1: {
                value: null
            },
            u_texture2: {
                value: null
            },
            u_time: { value: 0.0 },
            u_duration: { value: 2.0 },
            u_mouse: { value:{ x:0.0, y:0.0 }},
            u_resolution: { value:{ x:0, y:0 }}
        };

        // The plane size should be the same aspect ratio as the image otherwise,
        // the image gets stretched.
        this.geometry = new THREE.PlaneGeometry(0.669, 1);
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


        this.slideIndex = 0;
        this.textures=
        [
             new THREE.TextureLoader().load('/public/random.jpg'),
             new THREE.TextureLoader().load('/public/random2.jpg'),
             new THREE.TextureLoader().load('/public/random3.jpg'),
        ];

        // Fake a slideshow for now.
        setInterval(()=> {
            this.slideIndex++;
            this.displayIndex();
        }, 3000);
        this.displayIndex();
    }


    displayIndex() {
        // Reset the time value.
        this.uniforms.u_time.value = 0;

        this.uniforms.u_texture1.value = this.textures[this.slideIndex];
        this.uniforms.u_texture2.value = this.textures[this.slideIndex + 1];

        if(this.slideIndex >= this.textures.length - 1) {
          this.uniforms.u_texture1.value = this.textures[this.slideIndex];
          this.uniforms.u_texture2.value = this.textures[0];
          this.slideIndex = -1;
        }

        console.log(this.slideIndex);
        console.log(this.uniforms.u_texture1.value);
        console.log(this.uniforms.u_texture2.value);
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


    onRaf() {
        const delta = this.raf.getDelta(true);
        if (this.uniforms.u_time.value < this.uniforms.u_duration.value){
          this.uniforms.u_time.value += delta;
        } else {
           this.uniforms.u_time.value = this.uniforms.u_duration.value;

        }
        this.renderer.render(this.scene, this.camera);
    }

}