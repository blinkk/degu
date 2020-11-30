
// https://threejs.org/docs/#manual/en/introduction/Loading-3D-models
// https://threejs.org/examples/#webgl_loader_gltf
// https://gist.github.com/bellbind/c4f8c502fcacbe29422e5ac315273858
// https://github.com/funwithtriangles/blender-to-threejs-export-guide/blob/master/readme.md
// https://threejsfundamentals.org/threejs/lessons/threejs-load-gltf.html
// https://discoverthreejs.com/book/first-steps/load-models/
// https://www.pentacreation.com/blog/2019/09/190916.html
// https://www.pentacreation.com/blog/2019/10/191016.html

// https://gltf-viewer.donmccurdy.com/
// https://github.com/donmccurdy/three-gltf-viewer



import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// import { Raf } from '../lib/raf/raf';
import {DomWatcher} from '../lib/dom/dom-watcher';
import { RafProgress } from '../lib/raf/raf-progress';
import {dom} from '../lib/dom/dom';
import {EASE} from '../lib/ease/ease';

export default class ThreeObjectViewer2 {
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
                          dom.getElementScrolledPercent(this.parentElement);
              this.rafProgress.easeTo(this.progress, 0.18, EASE.Linear);
            },
            eventOptions: {passive: true},
          });

        this.scene = new THREE.Scene();



        var loader = new GLTFLoader();
        // const path = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
        // const path = './public/dude.glb';
        const path = './public/monster-scene3.glb';
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
                    console.log('cast', child);

                    // Debugging light positions.
                    child.shadowCameraVisible = true;

                    // Adjust shadow bias.
                    child.shadowBias = -0.005;
                    child.shadowDarkness = 0.1;
                    // child.shadow.camera.near = 0;
                    // child.shadow.camera.far = 1000;

                    // Lights come off a bit stronger compared to Eevee, so
                    // lower the intensity.
                    child.intensity = child.intensity * 0.3;


                    // var helper = new THREE.CameraHelper( child.shadow.camera );
                    // scene.add( helper );
                }
                else if(child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    console.log('receive', child);
                } else {
                    console.log('nothing', child);
                }

                // if(child.name.startsWith('Cube003')) {
                //     child.receiveShadow = true;
                // }
                // Fix eyes
                if(child.name.startsWith('Cube006')) {
                    child.castShadow = false;
                    child.receiveShadow = false;
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

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.canvasContainer.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.resize.bind(this), false);
    }

    resize() {
        this.progress =
          dom.getElementScrolledPercent(this.parentElement);
        this.rafProgress.easeTo(this.progress, 1, EASE.Linear);

        this.width = this.canvasContainer.parentElement.offsetWidth;
        this.height = this.canvasContainer.parentElement.offsetHeight;


        // https://github.com/donmccurdy/three-gltf-viewer/blob/master/src/viewer.js
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        // Important to get the correct colors.
        this.renderer.physicallyCorrectLights = true;

        // Background as black.
        this.renderer.setClearColor(0x000000);
        // this.renderer.setClearColor(0xFFFFFF, 1.0);

        // Affects how strongly lights come exposed.
        // this.renderer.toneMappingExposure = 0.4;


        // Enable shadows.
        this.renderer.shadowMap.enabled = true;
        // To antialias the shadow
        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;


        // The camera aspect goes off since it could be exported at a different
        // ratio.  Force update the aspect ratio.
        // this.camera.fov = this.width / this.height;
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
            const cameraAnimation = this.getAnimationByName('Action');
            const duration = cameraAnimation.duration;

            // When duration hits it's max, animationMixer seems to hit the first
            // frame so next allow it to reach the max value.
            this.mixer.setTime(Math.min(duration * progress, duration - 0.001));
        }




        this.renderer.render(this.scene, this.camera);
    }

}
