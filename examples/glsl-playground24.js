


//
//
//https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739152#questions/8753186
//



import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import {yanoMathf} from '../lib/shaders/three-shader-chunks/yano-mathf';
yanoMathf(THREE);

const vshader = `
#include <yanoMathf>
uniform float u_time;
uniform float u_radius;

void main() {
  // Normalize time with sin.
  float delta = normalizedSin(u_time);

  // Sphere positions.
  vec3 sphere = normalize(position) * u_radius;

  // Mix between square box and sphere.
  vec3 pos = mix(position, sphere, delta);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`;


const fshader = `
void main()
{
  vec3 color = vec3(0.5);
  gl_FragColor = vec4(color, 1.0);
}
`;


window.THREE = THREE;


export default class GlslPlayground24 {
    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000
          );
        this.camera.position.z = 100;

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
            u_time: { value: 0.0 },
            u_mouse: { value:{ x:0.0, y:0.0 }},
            u_resolution: { value:{ x:0, y:0 }},
            u_radius: { value: 20.0}
        };

        this.geometry = new THREE.BoxGeometry( 30, 30, 30, 10, 10, 10 );
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
            wireframe: true
        });

        this.ball = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.ball );


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
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}