

//
//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739206#questions/8753186
//


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import {deguMathf} from '../lib/shaders/three-shader-chunks/degu-mathf';
deguMathf(THREE);

const vshader = `
#include <deguMathf>
// PIの定義などがあり、ライト情報を使うのに必要
#include <common>
// ライトの構造体、uniform変数などが定義されている
#include <lights_pars_begin>

uniform float u_time;
uniform float u_radius;

varying vec3 vPosition;
varying vec3 vLightIntensity;


void main() {
  float delta = normalizedSin(u_time) * 3.0;
  vec3 vLightFront;
  vec3 vLightBack;
  vec3 vIndirectFront;
  vec3 objectNormal = delta * normal + (1.0 - delta) * normalize(position);

  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
  #include <lights_lambert_vertex>



  // Get a varying light color for each pixel.
  vLightIntensity = vLightFront + ambientLightColor;
  vPosition = position;

  vec3 v = normalize(position) * u_radius;
  vec3 pos = delta * position + (1.0 - delta) * v;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`;


const fshader = `
varying vec3 vLightIntensity;
void main()
{
  vec3 color = vec3(0.5);
  gl_FragColor = vec4(vLightIntensity * color, 1.0);
}
`;




export default class GlslPlayground24 {
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



        this.geometry = new THREE.BoxGeometry(30, 30, 30, 10, 10, 10);

        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib["common"],
            THREE.UniformsLib["lights"]
        ]);
        this.uniforms.u_time = { value: 0.0 };
        this.uniforms.u_mouse = { value: { x: 0.0, y: 0.0 } };
        this.uniforms.u_resolution = { value: { x: 0, y: 0 } };
        this.uniforms.u_radius = { value: 20.0 };
        console.log('uniforms');
        console.log(this.uniforms);


        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
            lights: true
        });
        const material1 = new THREE.MeshBasicMaterial({
            color: 0xb7ff00,
            wireframe: true
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
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}