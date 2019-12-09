
// https://svs.gsfc.nasa.gov/4720
// https://threejs.org/docs/#api/en/materials/MeshStandardMaterial

// https://qiita.com/adrs2002/items/dc6416d6fd2389c75ab5
// https://qiita.com/cx20/items/2b86cb5052cd7c36038a

// https://stackoverflow.com/questions/54283080/normal-map-values-with-threejs-gltf-blender-exporter?rq=1

// The glTF format does not allow bump maps.  Use normal maps.
// https://discourse.threejs.org/t/three-js-gltf-model-exported-from-editor-bump-map-not-rendering/10835

//
// - watch over exposure of normal map
// - png based normal map works better? (jpg over exposed?)
//

import { Datguif } from '../lib/datguif/datguif';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';


// import { Raf } from '../lib/raf/raf';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { RafProgress } from '../lib/raf/raf-progress';
import { dom } from '../lib/dom/dom';
import { EASE } from '../lib/ease/ease';
import { mathf } from '../lib/mathf/mathf';
import { threef } from '../lib/threef/threef';
import { makeRe } from 'minimatch';

export default class ThreeObjectViewer11 {
    constructor() {
        console.log('ThreeJS Object Viewer Demo');

        this.parentElement = document.getElementById('parent');
        this.canvasContainer = document.getElementById('canvas-container');

        this.domWatcher = new DomWatcher();
        this.rafProgress = new RafProgress();
        this.rafProgress.watch(this.onProgressUpdate.bind(this));

        this.scrollLerp = 0.38;
        this.scrollEase = 'easeInQuad';


        this.domCamera = document.getElementById('canvas-dom-camera');
        this.textMarker1 = document.getElementById('text-marker1');
        this.textMarker2 = document.getElementById('text-marker2');
        this.textMarker3 = document.getElementById('text-marker3');
        this.textMarker4 = document.getElementById('text-marker4');
        this.textMarker5 = document.getElementById('text-marker5');
        this.textMarker6 = document.getElementById('text-marker6');
        this.textMarkers = [];

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
        const path = '/public/moon/three-object-viewer11.gltf';
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
                    console.log(child.name);
                    console.log('light', child);



                    // Debugging light positions.
                    // child.shadowCameraVisible = false;

                    if(child.shadow) {
                        // Adjust shadow bias.
                        // child.shadow.bias = -0.002;
                        // Remove the rigged looking shadows.
                        child.shadow.mapSize.width = 1024;
                        child.shadow.mapSize.height = 1024;
                        child.shadowDarkness = 1;
                        // child.shadow.camera.near = 0;
                        // child.shadow.camera.far = 1000;
                        // var helper = new THREE.CameraHelper( child.shadow.camera );
                        // scene.add( helper );
                    }
                    // child.layers.set(1);

                    // // Point lights are defined in watts which goes waay off in three.js
                    if (child instanceof THREE.PointLight) {
                        child.intensity = child.intensity * 0.05;
                    }

                    // If it's a spot light, it needs to go down even more.
                    if (child.type == "SpotLight") {
                        child.intensity = child.intensity * 0.003;
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
                    // child.geometry.computeVertexNormals(true);
                    console.log(child.name);
                    console.log('mesh', child);


                    // If an object starts with 'text-' by convension, it will
                    // be considered a marker.
                    if(child.name.startsWith('text')) {
                        // Hide the marker
                        // child.visible = false;
                        this.textMarkers.push(child);
                    }


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
                        console.log('material', child.material);
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

                        if(child.material.normalMap) {
                            console.log('normal map');
                            console.log(child.material.normalMap);
                            console.log(child.material.normalScale);
                        }

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
            // this.renderer.gammaFactor = 2.2;

            // Important to get the correct colors.
            this.renderer.physicallyCorrectLights = true;

            // Background as black.
            // this.renderer.setClearColor(0x4287f5);
            this.renderer.setClearColor(this.rendererConfig.clearColor, this.rendererConfig.backgroundAlpha);

            // Affects how strongly lights come exposed.
            // https://threejs.org/examples/#webgl_tonemapping
            this.renderer.toneMappingExposure = 1;
            // this.renderer.toneMappingExposure = 0.3;
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
                ambientLightColor: '#FFFFFF',
                ambientLightAlpha: 1,
            };

            // Additional lighting outside the blender.
            // var light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );
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
        this.rafProgress.easeTo(this.progress, 1, EASE.Linear);

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

        threef.setFov(this.domCamera, this.camera);

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
            const cameraAnimation = this.getAnimationByName('CameraAction');
            const duration = cameraAnimation.duration;

            // When duration hits it's max, animationMixer seems to hit the first
            // frame so next allow it to reach the max value.
            this.mixer.setTime(Math.min(duration * progress, duration - 0.01));
        }

        const getMarkerByName = (name)=> {
            return this.textMarkers.filter((marker)=> {
                return marker.userData.name == name;
            })[0];
        };



        // Text marker1.
        const marker = getMarkerByName('text-marker1');
        const domCoordinates = threef.toDomCoordinates(
            marker, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        // Billboarded and not scaling.
        const domRotation = threef.toDomRotation(
            marker, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        threef.applyVectorToDom(this.textMarker1, domCoordinates, domRotation);

        // Text marker2.
        const marker2 = getMarkerByName('text-marker2');
        const domCoordinates2 = threef.toDomCoordinates(
            marker2, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        const domRotation2 = threef.toDomRotation(
            marker2, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        threef.applyVectorToDom(this.textMarker2, domCoordinates2, domRotation2);


        // Text marker3.
        const marker3 = getMarkerByName('text-marker3');
        const domCoordinates3 = threef.toDomCoordinates(
            marker3, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        const domRotation3 = threef.toDomRotation(
            marker3, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        threef.applyVectorToDom(this.textMarker3, domCoordinates3, domRotation3);

        const marker4 = getMarkerByName('text-marker4');
        const domCoordinates4 = threef.toDomCoordinates(
            marker4, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight, 0.3
        );
        const domRotation4 = threef.toDomRotation(
            marker4, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        threef.applyVectorToDom(this.textMarker4, domCoordinates4, domRotation4);

        const marker5 = getMarkerByName('text-marker5');
        const domCoordinates5 = threef.toDomCoordinates(
            marker5, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight, 0.3
        );
        const domRotation5 = threef.toDomRotation(
            marker5, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        threef.applyVectorToDom(this.textMarker5, domCoordinates5, domRotation5);

        // Billboarding sample.
        // Notice how rotation is not applied.
        // domCoodinates also don't pass a scale value so the text maintains it's original scale.
        const marker6 = getMarkerByName('text-marker6');
        const domBoundingRect = threef.toDomBoundingRect(
            marker6, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );
        const domCoordinates6 = threef.toDomCoordinates(
            marker6, this.camera, this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight
        );

        // Set to the topLeft corne of an element.
        threef.applyVectorToDom(this.textMarker6, {
            x: domBoundingRect.bottomLeft.x,
            y: domBoundingRect.bottomLeft.y,
            z: 1.0,
        });



        this.draw();
    }

    draw() {
        this.renderer.render(this.scene, this.camera);
    }

}
