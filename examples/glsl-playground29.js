

//
//
// https://www.udemy.com/course/learn-glsl-shaders-from-scratch/learn/lecture/13739244
//


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';

// Import shader chunks
import { deguMathf } from '../lib/shaders/three-shader-chunks/degu-mathf';
deguMathf(THREE);

// Extends: https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshlambert_vert.glsl.js
const vshader = `
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>



varying vec3 vPosition;
varying mat4 vModelMatrix;
varying vec3 vWorldNormal;
varying vec3 vLightIntensity;

void main() {
    vec3 vLightFront;
    vec3 vIndirectFront;
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

    // Save light intenity.
    vLightIntensity = vLightFront + ambientLightColor;

    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition = position;
    vModelMatrix = modelMatrix;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;


const fshader = `
#include <deguMathf>
uniform vec3 u_color;
uniform vec3 u_light_position;
uniform vec3 u_rim_color;
uniform float u_rim_strength;
uniform float u_rim_width;
uniform float u_time;


uniform samplerCube u_envmap_cube;
// How much the envmap should affect the calculations.
uniform float u_envmap_strength;

// Example varyings passed from the vertex shader
varying vec3 vPosition;
varying vec3 vWorldNormal;
varying mat4 vModelMatrix;
varying vec3 vLightIntensity;

void main()
{

  // Get the world position (not model)
  vec3 worldPosition = ( vModelMatrix * vec4( vPosition, 1.0 )).xyz;

  // Get the normalized light vector since we want direction not distance.
  vec3 lightVector = normalize( u_light_position - worldPosition );

  // Get the normalized view vector since we want direction not distance.

  vec3 viewVector = normalize(cameraPosition - worldPosition);

  // dot(a,b) = cos(theta)

  // cos of 90 degrees. cos(PI/2) = 0.0.
  float rightAngle = 0.0;

  // Change the angle based on time so that we get a glow going in and out
  float pulseRate = 5.0;
  rightAngle += normalizedSin(u_time * pulseRate);

  float rimndotv =  max(0.0, u_rim_width - clamp(dot(vWorldNormal, viewVector), rightAngle, 1.0));

  vec3 rimLight = rimndotv * u_rim_color * u_rim_strength;


  // Calculate the effects of the env map.
  vec3 reflection = reflect(-viewVector, vWorldNormal);
  vec3 envmapLight = textureCube(u_envmap_cube, reflection).rgb * u_envmap_strength;
  // Pulse env map light strength.
  envmapLight *= normalizedSin(u_time);


  vec3 color = vLightIntensity * u_color + envmapLight + rimLight;

  gl_FragColor = vec4( color, 1.0 );

}
`;




export default class GlslPlayground29 {
    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 10;


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



        this.geometry = new THREE.TorusKnotGeometry( 1, 0.5, 100, 16 );

        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib["common"],
            THREE.UniformsLib["lights"]
        ]);


        this.uniforms.u_color = { value: new THREE.Color(0xa6e4fa) };
        this.uniforms.u_light_position = { value: light.position.clone() };
        this.uniforms.u_rim_color = { value: new THREE.Color(0xffffff) };
        this.uniforms.u_rim_strength = { value: 3.6 };
        this.uniforms.u_rim_width = { value: 0.6 };
        this.uniforms.u_resolution = { value: {x:0.0, y:0.0} };
        this.uniforms.u_time = { value: 0.0};

        // Add env
        const envCube = new THREE.CubeTextureLoader()
        .setPath( './public/' )
        .load( [
            'skybox2_px.jpg',
            'skybox2_nx.jpg',
            'skybox2_py.jpg',
            'skybox2_ny.jpg',
            'skybox2_pz.jpg',
            'skybox2_nz.jpg'
        ] );
        this.uniforms.u_envmap_cube = { value: envCube };
        this.uniforms.u_envmap_strength = { value: 1.0 };


        console.log('uniforms');
        console.log(this.uniforms);


        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
            lights: true,
            wireframe: false
        });


        this.knot = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.knot);

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


    onRaf(delta) {
        this.uniforms.u_time.value += this.raf.getDelta(true);
        this.renderer.render(this.scene, this.camera);
    }

}