
// https://threejs.org/docs/#manual/en/introduction/Loading-3D-models
// https://threejs.org/examples/#webgl_loader_gltf
// https://gist.github.com/bellbind/c4f8c502fcacbe29422e5ac315273858
// https://github.com/funwithtriangles/blender-to-threejs-export-guide/blob/master/readme.md
// https://threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
// https://discoverthreejs.com/book/first-steps/load-models/
// https://www.pentacreation.com/blog/2019/09/190916.html
// https://www.pentacreation.com/blog/2019/10/191016.html

// https://docs.blender.org/manual/ja/latest/addons/io_scene_gltf2.html
// https://gltf-viewer.donmccurdy.com/
// https://github.com/donmccurdy/three-gltf-viewer



import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import {DomWatcher} from '../lib/dom/dom-watcher';
import { RafProgress } from '../lib/raf/raf-progress';
import * as EASE from '../lib/ease/ease';
import * as dom from '../lib/dom/dom';

export default class ThreeObjectViewer3 {
    constructor() {
        console.log('ThreeJS Object Viewer Demo');

        this.parentElement = document.getElementById('parent');
        this.canvasContainer = document.getElementById('canvas-container');

        this.domWatcher = new DomWatcher();
        this.rafProgress = new RafProgress();
        this.rafProgress.watch(this.onProgressUpdate.bind(this));

        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: (event) => {
              this.progress =
                          dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
            //   this.rafProgress.easeTo(this.progress, 0.26, EASE.easeInOutExpo);
            //   this.rafProgress.easeTo(this.progress, 0.08, EASE.linear);
              this.rafProgress.easeTo(this.progress, 0.18, EASE.easeInOutQuad);
            },
            eventOptions: {passive: true},
          });

        this.scene = new THREE.Scene();



        var loader = new GLTFLoader();
        // const path = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
        // const path = './public/dude.glb';
        const path = './public/phone/phone.glb';
        loader.load(path, (gltf) => {
            this.clock = new THREE.Clock();
            const scene = gltf.scenes[0];
            this.activeScene = scene;
            this.animations = gltf.animations;
            // Animation Mixerインスタンスを生成
            this.mixer = new THREE.AnimationMixer(scene);


            //全てのAnimation Clipに対して
            for (var i = 0; i < this.animations.length; i++) {
                var animation = this.animations[i];

                //Animation Actionを生成
                var action = this.mixer.clipAction(animation);
                console.log('added', animation);
                action.play();
            }

            this.scene.add(scene);
            console.log(this.mixer);



            // http://learningthreejs.com/blog/2012/01/20/casting-shadows/
            this.scene.traverse((child) => {
                if(child instanceof THREE.Light) {
                    child.castShadow = true;

                    // Debugging light positions.
                    child.shadowCameraVisible = false;

                    // Adjust shadow bias.
                    child.shadow.bias = -0.002;
                    // Remove the rigged looking shadows.
                    child.shadow.mapSize.width = 1024;
                    child.shadow.mapSize.height = 1024;
                    // child.shadowDarkness = 0.5;
                    // child.shadow.camera.near = 0;
                    // child.shadow.camera.far = 1000;

                    // Lights come off a bit stronger compared to Eevee, so
                    // lower the intensity. Stronger = less shadows.
                    child.intensity = child.intensity * 0.3;


                    // var helper = new THREE.CameraHelper( child.shadow.camera );
                    // scene.add( helper );
                }
                else if(child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // child.geometry.computeVertexNormals(true);


                    // Get the image mappings.
                    // if(child.material && child.material.map) {
                    //   child.material.map.needsUpdate = true;
                    // }

                } else {
                }

                // if(child.name.startsWith('Cube003')) {
                //     child.receiveShadow = true;
                // }
                // Fix eyes
                if(child.name.startsWith('Cylinder')) {
                    child.castShadow = false;
                    child.receiveShadow = true;
                }
            });


            // Set the camera exported in gltf.
            // Requires camera to be exported for gltf.
            this.camera = gltf.cameras[0];
            console.log(this.camera);


            this.resize();
        }, undefined, (error) => {
            console.error(error);
        });


        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            // precision: 'highp'
            autoSize: true
        });
        this.composer = new EffectComposer(this.renderer);
        this.canvasContainer.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.resize.bind(this), false);
    }

    resize() {
        this.progress =
          dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
        this.rafProgress.easeTo(this.progress, 1, EASE.linear);

        this.width = this.canvasContainer.parentElement.offsetWidth;
        this.height = this.canvasContainer.parentElement.offsetHeight;


        // https://github.com/donmccurdy/three-gltf-viewer/blob/master/src/viewer.js
        // https://threejs.org/docs/#api/en/constants/Renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        // Important to get the correct colors.
        this.renderer.physicallyCorrectLights = true;

        // Background as black.
        this.renderer.setClearColor(0x4287f5);
        // this.renderer.setClearColor(0xE7E7E7, 1.0);

        // Affects how strongly lights come exposed.
        // this.renderer.toneMappingExposure = 0.4;

        // https://threejs.org/examples/#webgl_tonemapping
        this.renderer.toneMappingExposure = 0.35;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;


        // Enable shadows.
        // https://threejs.org/docs/#api/en/constants/Renderer
        this.renderer.shadowMap.enabled = true;
        // To antialias the shadow
        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;

        // Post processing
        this.composer.setSize( this.width, this.height);
        const fxaaPass = new ShaderPass( FXAAShader );
        fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.width * window.devicePixelRatio);
        fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.height * window.devicePixelRatio);
        this.composer.addPass(fxaaPass);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // var bloomPass = new UnrealBloomPass(1, 25, 5, 256);
        // this.composer.addPass(bloomPass);

        // The camera aspect goes off since it could be exported at a different
        // ratio.  Force update the aspect ratio.
        // this.camera.fov = 25; // Update FOV.
        this.camera.zoom = 1; // Update FOV.
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

    }


    getAnimationByName(name) {
        return this.animations.filter((animationClip) => {
            return animationClip.name == name;
        })[0];

    }

    getObjectByName(name) {
        return this.activeScene.children.filter((object3d) => {
            return object3d.name == name;
        })[0];
    }


    onProgressUpdate(progress) {

        //Animation Mixerを実行
        if (this.mixer) {
            // We need to find out how long the animation is.
            // The mixer appears to have no knowledge oft this so we need to
            // look up a specific animation and get the duration to
            // get the total duration of the animation.
            const cameraAnimation = this.getAnimationByName('CubeAction');
            const duration = cameraAnimation.duration;

            // When duration hits it's max, animationMixer seems to hit the first
            // frame so next allow it to reach the max value.
            this.mixer.setTime(Math.min(duration * progress, duration - 0.001));
        }




        // this.renderer.render(this.scene, this.camera);
        this.composer.render();
    }

}
