
//
//
// Simple Image Texture.
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739178#questions
// https://codepen.io/nik-lever/pen/wvwZwMR
//



import * as THREE from 'three';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import {deguMathf} from '../lib/shaders/three-shader-chunks/degu-mathf';
deguMathf(THREE);

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
#include <deguMathf>
#define PI 3.14159265359

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;
uniform float u_duration;

uniform sampler2D u_texture;

varying vec3 v_position;
varying vec2 v_uv;


void main (void)
{

    // Use varying position since center is 0.0 and it goes outwards.
    // This uses NDC coords.
    vec2 p = v_position.xy;

    // Create a new uv position called ripple that offset the current
    // uv by given values.
    //
    // The goal is to have an offset uv (ripple) and get the pixel color (texel)
    // of a different location to make the ripple wave effect.
    //

    // 1) Calculate radiant.
    // The amount and direction offset.  A diagnal line that extends from center.
    // Radian determins the "intensity" of the ripple, how much it changes.
    //
    // radiant
    //     \  |
    //      \ |
    // -------|------
    //        |
    //        |
    float len = length(p);
    vec2 radiant = p / len * 0.03;


    // Get new ripple cords adding v_uv and radian and also cos(u_time) offset.
    // Now we have an offset coordinates for uv in which we can project texel
    // colors.
    // Simplest form of ripple.
    // vec2 ripple = v_uv + radiant * cos(u_time);


    // More complex version that accounts for more ripple.
    float rippleCount = 20.0;
    vec2 ripple = v_uv + radiant * cos(len * rippleCount - u_time * 4.0);


    // Optional step - delta ripple.
    // We could add a delta to interpolate back and forth between
    // normal image and ripple image.
    //
    // The delta could also be passed as a uniform.  When delta is,
    // 1.0, the ripple would be animating and as it goes down to
    // 0.0, the ripple stops.
    //
    // The amount of time remaining in radians.  This is between 0 and 2PI.
    // float amountOfTimeRemainingInRadians =
    //     mod(u_time, u_duration) * (2.0 * PI / u_duration);
    // Using the time remaining in radians, set the delta as a normalizedSin.
    // float delta = normalizedSin(amountOfTimeRemainingInRadians);
    // Mix between ripple and non ripple
    // vec2 uv = mix(ripple, v_uv, delta);


    // Optional: Normal continous ripple
    // If skipping delta, you could just do a continous ripple.
    // vec2 uv = mix(ripple, v_uv, 0.0);
    vec2 uv = ripple;



    vec3 color = texture2D(u_texture, uv).rgb;

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
            u_texture: {
                value: new THREE.TextureLoader().load('./public/flower.jpg')
            },
            u_time: { value: 0.0 },
            u_duration: { value: 0.8 },
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