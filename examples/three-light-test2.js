


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SceneRenderer } from '../lib/threef/scene-renderer';
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { threef } from '../lib/threef/threef';

// Import shader chunks
import { yanoMathf } from '../lib/shaders/three-shader-chunks/yano-mathf';
yanoMathf(THREE);

const vshader = `
#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>

varying vec3 vPosition;
varying vec2 v_uv;
varying vec3 vWorldNormal;
varying mat4 vModelMatrix;

void main() {
  vPosition = position;
  v_uv = uv;

//   vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vModelMatrix = modelMatrix;

  #include <begin_vertex>
  #include <project_vertex>
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}
`;

const fshader = `
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <dithering_pars_fragment>


// https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/shadowmask_pars_fragment.glsl.js
// Get the shadow value at specific coordinates.
float getCustomShadowMask(vec2 offset) {
    float shadow = 1.0;

    #ifdef USE_SHADOWMAP
    #if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLight directionalLight;
	#pragma unroll_loop
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
        directionalLight = directionalLights[ i ];

        // Get the shadow value.
        float s = 1.0;
        vec4 coords = vDirectionalShadowCoord[ i ];
        coords.x += offset.x;
        coords.z += -offset.y;
        s =
           getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize,
           directionalLight.shadowBias,
           directionalLight.shadowRadius,
           coords
          );

        shadow *= s;
	}
	#endif

    #endif

	return shadow;
}



uniform vec2 u_resolution;
varying vec2 v_uv;
varying vec3 vPosition;
varying vec3 vWorldNormal;
varying mat4 vModelMatrix;

void main() {
  float zReceiver = vPosition.z;
  vec3 worldPosition = ( vModelMatrix * vec4( vPosition, 1.0 )).xyz;
  vec2 uv = vec2(gl_FragCoord.xy / u_resolution.xy);

  vec3 finalColor = vec3(1.0, 1.0, 1.0);
  vec3 shadowColor = vec3(0, 0, 0);
  float shadowPower = 0.1;
  float shadowStrength = 1.0;

  for ( int i = 0; i < 20; i ++ ) {
    vec2 offset = vec2(
            float(i) * 0.01,
            float(i) * 0.01);

    float s = mix(
        getCustomShadowMask(vec2(0.0, 0.0)),
        getCustomShadowMask(offset),
        0.5);

    shadowStrength *= s;
  }

//   shadowStrength *= shadowPower;


  vec3 color = mix(finalColor, shadowColor, shadowStrength);

  vec2 direction = vec2(1.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
  #include <fog_fragment>
  #include <dithering_fragment>
}
`;

export default class ThreeLightTest2 {

    constructor() {
        console.log("Three Lighting Test2");
        this.raf = new Raf(this.onRaf.bind(this));
        this.sceneRenderer = new SceneRenderer({});

        this.boxElements = {
            box1: document.getElementById('box-1'),
        };




        this.createGltfScene1();

        this.sceneRenderer.resize();

        this.raf.start();
    }



    createGltfScene1() {
        const domElement = this.boxElements.box1;
        const scene = new THREE.Scene();
        const camera =
            new THREE.PerspectiveCamera(30, domElement.offsetWidth / domElement.offsetWidth, 1, 10000);

        camera.position.x = 7;
        camera.position.y = 13;
        camera.position.z = 7;

        // Setup uniforms.
        this.uniforms = {};
        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib["common"],
            THREE.UniformsLib["lights"],
            THREE.UniformsLib["fog"],
        ]);
        // this.uniforms.u_light = { value: new THREE.Vector3(0.5, 0.8, 0.1) };
        // this.uniforms.u_resolution = { value: new THREE.Vector2(1.0, 1.0) };
        // this.uniforms.u_color = { value: new THREE.Color(0xaa6611) };
        // this.uniforms.u_diffuse_map = { value: new THREE.TextureLoader().load('./public/bricks-diffuse3.png') };
        // this.uniforms.u_normal_map = { value: new THREE.TextureLoader().load('./public/bricks-normal3.png') };
        // this.uniforms.u_time = { value: 0.0 };
        this.uniforms.u_resolution = { value: { x: 0.0, y: 0.0 } };




        // Primary shader maaterial
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
            lights: true,
            wireframe: false,
            dithering: true,
            transparent: true,
        });

        this.sceneRenderer.addScene({
            resizingAlgo: 'contain',
            resizingOptions: {
                scalarX: 1,
                scalarY: 1,
                useFov: false
            },
            domElement: domElement,
            scene: scene,
            camera: camera,
            onInit: (renderer, scene, camera) => {
                scene.userData.sphereGroup = this.addRandomSpheres(scene);
                scene.userData.group = this.addGround(scene);

                const ambientLight = new THREE.AmbientLight('#FFFFFF');
                ambientLight.intensity = 0.5;
                scene.add(ambientLight);


                // Light 1
                var light = new THREE.DirectionalLight(0xdfebff, 1);
                light.position.set(2, 8, 4);
                light.castShadow = true;
                light.shadow.mapSize.set(2048, 2048);

                // This blurs but doesn't look great.
                // light.shadow.radius = 1;
                // light.shadow.camera.far = 200;
                light.shadowDarkness = 0.5;

                // Adjust for blurryness
                light.shadow.camera.far = 50;
                light.shadow.camera.near = 1;
                scene.add(light);
                scene.add(new THREE.CameraHelper(light.shadow.camera));


                renderer.gammaInput = true;
                renderer.gammaOutput = true;
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.shadowMap.soft = true;
                renderer.shadowMap.needsUpdate = true;

                renderer.shadowMap.bias = 0.000001;

                // Add orbit controls.
                var controls = new OrbitControls(camera, domElement);
                controls.maxPolarAngle = Math.PI * 0.5;
                controls.minDistance = 10;
                controls.maxDistance = 75;
                controls.target.set(0, 2.5, 0);
                controls.update();
                scene.userData.controls = controls;
            },

            onResize: (renderer, scene) => {
                this.uniforms.u_resolution.value.x = domElement.offsetWidth;
                this.uniforms.u_resolution.value.y = domElement.offsetHeight;
            },

            onBeforeRender: (renderer, scene) => {
                // if (this.uniforms) {
                //     this.uniforms.u_time.value += this.raf.getDelta(true);
                // }


                scene.userData.sphereGroup.traverse((child) => {
                    if ('phase' in child.userData) {
                        child.position.y = Math.abs(Math.sin(
                            this.raf.getElapsedTime()
                            + child.userData.phase)) * 5 + 0.3;
                    }
                });
            }
        }, true);
    }




    /**
     * Add shadow casting spheres.
     */
    addRandomSpheres(scene) {
        const group = new THREE.Group();
        for (var i = 0; i < 2; i++) {
            var geometry = new THREE.SphereBufferGeometry(
                0.3,
                mathf.getRandomInt(10, 50),
                mathf.getRandomInt(10, 50));
            var material;
            if (i % 2 == 0) {
                material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            } else {
                material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
            }
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = Math.random() - 0.5;
            sphere.position.z = Math.random() - 0.5;
            sphere.position.normalize();
            sphere.position.multiplyScalar(Math.random() * 2 + 1);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.userData.phase = Math.random() * Math.PI;
            group.add(sphere);
        }
        scene.add(group);

        return group;
    }

    addGround(scene) {
        var groundMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0xFFFFFFF });

        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000, 8, 8),
            this.material
        );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;

        scene.add(mesh);

        mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 4, 1), groundMaterial);
        mesh.position.y = 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    }


    onRaf() {
        this.sceneRenderer.render();
    }
}
