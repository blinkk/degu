



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


import { Datguif } from '../lib/datguif/datguif';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { DomWatcher } from '../lib/dom/dom-watcher';
import { RafProgress } from '../lib/raf/raf-progress';
import * as EASE from '../lib/ease/ease';
import * as dom from '../lib/dom/dom';

export default class ThreeObjectViewer8 {
    constructor() {
        console.log('ThreeJS Object Viewer Demo');

        this.parentElement = document.getElementById('parent');
        this.canvasContainer = document.getElementById('canvas-container');

        this.domWatcher = new DomWatcher();
        this.rafProgress = new RafProgress();
        this.rafProgress.watch(this.onProgressUpdate.bind(this));

        this.scrollLerp = 0.38;
        this.scrollEase = 'easeInQuad';

        this.rendererConfig = {
            clearColor: '#000000',
            backgroundAlpha: 1.0
        };

        this.gui = new Datguif({
            load: JSON,
        });
        this.gui.addFolder('Settings').open();
        this.gui.addFolder('Renderer', 'Settings');
        this.gui.addFolder('Camera', 'Settings');
        this.gui.addFolder('Scroll', 'Settings');
        this.gui.addFolder('Lights');
        this.gui.addFolder('Objects');



        this.gui.addObjectToFolder(
            'Scroll',
            this,
            [
                { keyName: 'scrollLerp', min: 0, max: 1, step: 0.01 },
                {
                    keyName: 'scrollEase',
                    options: ['linear', 'easeOutQuad', 'easeInQuad']
                }
            ]
        );


        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: (event) => {
                this.progress =
                    dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
                //   this.rafProgress.easeTo(this.progress, 0.26, EASE.easeInOutExpo);
                //   this.rafProgress.easeTo(this.progress, 0.08, EASE.linear);
                this.rafProgress.easeTo(this.progress, this.scrollLerp, EASE[this.scrollEase]);
            },
            eventOptions: { passive: true },
        });

        this.scene = new THREE.Scene();


        this.gui.onUpdate((prop) => {
            this.draw();
        });


        var loader = new GLTFLoader();
        const path = './public/home/demo9.gltf';
        loader.load(path, (gltf) => {
            const gltfData = gltf.parser.json;

            const getNodeByName = (name)=> {
                return gltfData.nodes.filter((node)=> {
                    return node.name = name;
                })[0];
            };

            console.log('gltf data', gltfData);

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
            console.log('scene', scene);
            console.log('mixer', this.mixer);



            // http://learningthreejs.com/blog/2012/01/20/casting-shadows/
            this.scene.traverse((child) => {
                if (child instanceof THREE.Light) {
                    // child.castShadow = true;
                    // console.log('light', child);



                    // Debugging light positions.
                    // child.shadowCameraVisible = false;

                    // if(child.shadow) {
                    //     // Adjust shadow bias.
                    //     // child.shadow.bias = -0.002;
                    //     // Remove the rigged looking shadows.
                    //     // child.shadow.mapSize.width = 1024;
                    //     // child.shadow.mapSize.height = 1024;
                    //     // child.shadowDarkness = 0.5;
                    //     // child.shadow.camera.near = 0;
                    //     // child.shadow.camera.far = 1000;
                    //     // var helper = new THREE.CameraHelper( child.shadow.camera );
                    //     // scene.add( helper );
                    // }

                    // // Point lights are defined in watts which goes waay off in three.js
                    if (child instanceof THREE.PointLight) {
                        child.intensity = child.intensity * 0.0005;
                    }

                    // If it's a spot light, it needs to go down even more.
                    if (child.type == "SpotLight") {
                        child.intensity = child.intensity * 0.001;
                    }

                    // child.intensity = 0;

                    if(child.name == 'Point003_Orientation') {
                        // child.castShadow = true;
                        child.intensity = 0.6;
                    }


                    this.gui.addFolder(child.name, 'Lights');
                    this.gui.addObjectToFolder(
                        child.name,
                        child,
                        [
                            { keyName: 'castShadow' },
                            { keyName: 'intensity', min: 0, max: 3000 },
                            { keyName: 'color'},
                        ]
                    );

                    if(child.shadow) {
                        const shadowFolderId = child.name + ' shadow';
                        // console.log(child.shadow);
                        this.gui.addFolder(shadowFolderId, child.name);
                        this.gui.addObjectToFolder(
                            shadowFolderId,
                            child.shadow,
                            [
                                { keyName: 'bias', min: -1, max: 1, step: 0.00001 },
                                { keyName: 'radius', min: 0, max: 100, step: 0.01 },
                            ]
                        );
                    }


                }
                else if (child instanceof THREE.Mesh) {
                    // child.castShadow = true;
                    // child.receiveShadow = true;
                    // child.geometry.computeVertexNormals(true);
                //    const lightEnabled = [
                //         'p4-super-sm',
                //         'p4-super-sm001',
                //         'p4-super-sm002',
                //     ];

                //     if(~lightEnabled.indexOf(child.name)) {
                //         child.layers.set(1);
                //     }


                    this.gui.addFolder(child.name, 'Objects');
                    this.gui.addObjectToFolder(
                        child.name,
                        child,
                        [
                            { keyName: 'castShadow' },
                            { keyName: 'receiveShadow' },
                        ]
                    );

                    if(child.material) {
                        const materialId = child.name + ' material';
                        this.gui.addFolder(materialId, child.name);
                        this.gui.addObjectToFolder(
                            materialId,
                            child.material,
                            [
                                { keyName: 'emissiveIntensity', min: 0, max: 1 },
                                { keyName: 'flatShading', callback: ()=> {
                                   child.material.needsUpdate = true;
                                } },
                                { keyName: 'wireframe', callback: ()=> {
                                   child.material.needsUpdate = true;
                                } },
                            ]
                        );

                        // Enable smooth shading.
                        // child.material.flatShading = false;
                        // child.material.wireframe = false;
                        // child.material.needsUpdate = true;
                        // child.geometry.computeFaceNormals();
                        // child.geometry.computeVertexNormals(true);
                    }

                    if(child.name == 'Plane001') {
                      console.log('mesh', child);
                    }
                    // Get the image mappings.
                    // if(child.material && child.material.map) {
                    //   child.material.map.needsUpdate = true;
                    // }

                } else {
                    // console.log('other', child);
                }

            });


            // Set the camera exported in gltf.
            // Requires camera to be exported for gltf.
            this.camera = gltf.cameras[0];
            console.log('camera', this.camera);



            this.resize();


            // Use fog to cover far distances.
            // const color = 0x00000;
            // this.scene.fog = new THREE.Fog(color, 5, 8);


            // Enable shadows.
            // https://threejs.org/docs/#api/en/constants/Renderer
            this.renderer.shadowMap.enabled = true;
            // To antialias the shadow
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            this.renderer.gammaOutput = true;
            this.renderer.gammaFactor = 2.2;

            // Important to get the correct colors.
            // this.renderer.physicallyCorrectLigts = true;

            // Background as black.
            // this.renderer.setClearColor(0x4287f5);
            this.renderer.setClearColor(this.rendererConfig.clearColor, this.rendererConfig.backgroundAlpha);

            // Affects how strongly lights come exposed.
            // https://threejs.org/examples/#webgl_tonemapping
            this.renderer.toneMappingExposure = 1;
            // this.renderer.toneMappingExposure = 0.6;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;



            this.gui.addObjectToFolder(
                'Renderer',
                this.renderer,
                [
                    { keyName: 'toneMappingExposure', min: 0, max: 5, step: 0.01 },
                    { keyName: 'gammaFactor', min: 0, max: 10, step: 0.01 },
                ]
            );

            this.gui.addObjectToFolder(
                'Renderer',
                this.rendererConfig,
                [
                    { keyName: 'clearColor', callback: ()=> {
                       this.renderer.setClearColor(this.rendererConfig.clearColor, this.rendererConfig.backgroundAlpha);
                    }},
                    { keyName: 'backgroundAlpha', callback: ()=> {
                       this.renderer.setClearColor(this.rendererConfig.clearColor, this.rendererConfig.backgroundAlpha);
                    }},
                ]
            );


            this.gui.addObjectToFolder(
                'Camera',
                this.camera,
                [
                    { keyName: 'fov', min: 0, max: 50, step: 0.01, callback: ()=> {
                        this.camera.updateProjectionMatrix();
                    } },
                    { keyName: 'zoom', min: 0, max: 10, step: 0.0001, callback: ()=> {
                        this.camera.updateProjectionMatrix();
                    } },
                ]
            );


            this.gui.addFolder('General Lights');

            this.generalLightConfig = {
                ambientLightColor: '##7395b3',
                ambientLightAlpha: 1.3,
            };

            // Additional lighting outside the blender.
            // var light = new THREE.HemisphereLight( 0xffffbb, 0xffffff, 1 );
            // this.scene.add( light );

            this.ambientLight = new THREE.AmbientLight(this.generalLightConfig.ambientLightColor);
            this.ambientLight.intensity = this.generalLightConfig.ambientLightAlpha;
            scene.add(this.ambientLight);
            this.gui.addObjectToFolder(
                'General Lights',
                this.generalLightConfig,
                [
                    { keyName: 'ambientLightColor', callback: ()=> {
                        this.ambientLight.color = new THREE.Color(this.generalLightConfig.ambientLightColor);
                    } },
                    { keyName: 'ambientLightAlpha', callback: ()=> {
                        this.ambientLight.intensity = this.generalLightConfig.ambientLightAlpha;
                    } },
                ]
            );

            // var width = 50;
            // var height = 50;
            // var intensity = 0;
            // var rectLight = new THREE.RectAreaLight('#FFFFFF', intensity,  width, height );
            // rectLight.position.set( 0, 0, 25 );
            // // rectLight.lookAt( 0, 0, 0 );
            // this.scene.add( rectLight );

            // rectLightHelper = new THREE.RectAreaLightHelper( rectLight );
            // rectLight.add( rectLightHelper );


            this.gui.addButton('Refresh', this.refresh.bind(this));

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


        // Post processing
        // this.composer.setSize( this.width, this.height);
        // const fxaaPass = new ShaderPass( FXAAShader );
        // fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.width * window.devicePixelRatio);
        // fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.height * window.devicePixelRatio);
        // this.composer.addPass(fxaaPass);
        // this.composer.addPass(new RenderPass(this.scene, this.camera));

        // var bloomPass = new Unr2.2mealBloomPass(1, 25, 5, 256);
        // this.composer.addPass(bloomPass);

        // The camera aspect goes off since it could be exported at a different
        // ratio.  Force update the aspect ratio.
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

    }

    refresh() {
        this.renderer.setClearColor(this.rendererConfig.clearColor, this.rendererConfig.backgroundAlpha);
        this.resize();
        this.draw();
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
            const cameraAnimation = this.getAnimationByName('Action.003');
            const duration = cameraAnimation.duration;

            // When duration hits it's max, animationMixer seems to hit the first
            // frame so next allow it to reach the max value.
            this.mixer.setTime(Math.min(duration * progress, duration - 0.001));
        }




        this.draw();
        // this.renderer.render(this.scene, this.camera);
        // this.composer.render();
    }

    draw() {
        this.renderer.render(this.scene, this.camera);
    }

}
