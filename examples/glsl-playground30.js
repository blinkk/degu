

/**
 *
 * https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739236#questions/8753186
 *
 * - normals are importing in lightin calcs
 * - three js does this but this sample is of doing a manual bump map.
 * - use the dot product of the normal and light vectors to determine the light intensity.
 * - We use directional light, the ligth position is unimportant.
 *
 *
 *
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import { yanoMathf } from '../lib/shaders/three-shader-chunks/yano-mathf';
yanoMathf(THREE);

// Extends: https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshlambert_vert.glsl.js
const vshader = `
varying vec3 vNormal;
varying vec2 vUv;
varying mat4 vModelMatrix;

void main() {
    vUv = uv;
    vNormal = normal;
    vModelMatrix = modelMatrix;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
#include <yanoMathf>
varying vec2 vUv;
varying vec3 vNormal;
varying mat4 vModelMatrix;

uniform vec3 u_light;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;
uniform sampler2D u_diffuse_map;
uniform sampler2D u_normal_map;

void main(){
  // Normalize light vecture.
  vec3 lightVector = normalize(u_light);

  // Normal map.
  vec4 normal = texture2D(u_normal_map, vUv);

  // Get the normal vector from the modelMatrix.
  vec3 normalVector = normalize((vModelMatrix * (normal + vec4(vNormal, 1.0))).xyz);

  // Get the dot product, clmap it so it ranges from 0-1.
  float lightIntensity = clamp(0.0, 1.0, dot(lightVector, normalVector)) + 0.2;

  // Add some pulsing to the light intensity.
  lightIntensity *= (normalizedSin(u_time) * 2.0);

  // Get the texel (current pixel color from the diffuse map)
  vec3 texel = texture2D(u_diffuse_map, vUv).rgb;

  // Set the light intensity.
  vec3 color = lightIntensity * texel;

  // Output
  gl_FragColor = vec4(color, 1.0);
}
`;




export default class GlslPlayground30 {
    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 2;


        // Add some lights.
        const light = new THREE.DirectionalLight(0xffda6f, 0.1);
        light.position.set(0,1.25,1.25);
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



        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );


        this.uniforms = {};
        this.uniforms.u_light = { value: new THREE.Vector3(0.5,0.8,0.1) };
        this.uniforms.u_resolution = { value: new THREE.Vector2(1.0, 1.0) };
        this.uniforms.u_color = { value: new THREE.Color( 0xaa6611 ) };
        this.uniforms.u_diffuse_map = { value: new THREE.TextureLoader().load('./public/bricks-diffuse3.png') };
        this.uniforms.u_normal_map = { value: new THREE.TextureLoader().load('./public/bricks-normal3.png') };
        this.uniforms.u_time = { value: 0.0 };
        this.uniforms.u_resolution = { value: {x:0.0, y:0.0} };

        console.log('uniforms');
        console.log(this.uniforms);


        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
            lights: false,
            wireframe: false
        });


        this.box = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.box);

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


    onRaf() {
        if(this.uniforms) {
          this.uniforms.u_time.value += this.raf.getDelta(true);
        }
        if(this.renderer) {
          this.renderer.render(this.scene, this.camera);
        }
    }

}