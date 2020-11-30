


//
//
// Simple Image Texture.
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739104#questions
// https://codepen.io/nik-lever/pen/wvwZwMR
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

uniform sampler2D u_texture;

varying vec3 v_position;
varying vec2 v_uv;


void main (void)
{
  // Example 1.  Just diplay the image based on uv.
    // vec2 uv = v_uv;
  // Get the color for the current pixel location and interpolate it with v_uv.
    // vec3 color = texture2D(u_texture, uv).rgb;

  // Example 2.  Flip image.
  // Flip it upside down
  //   vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  //   vec3 color = texture2D(u_texture, uv).rgb;

  // Example 3: Rotate the image but this doesn't take care of aspect ratio
  // so as it rotates the image might warp.
  //   vec2 center = vec2(0.5);
  //   vec2 uv = rotate2d(v_uv - center, 1.0) + center;
  //   vec3 color = texture2D(u_texture, uv).rgb;

  // Example 4: Rotation with image aspect.  Time is used as the angle.
    vec2 center = vec2(0.5);
    float imageAspect = 300.0 / 448.0;
    vec3 backgroundColor = vec3(0.0);
    vec3 color = yanoRotate2dImage(
        u_texture, imageAspect, v_uv, center, u_time, backgroundColor);

  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground20 {
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