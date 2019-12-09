
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { SceneRenderer } from '../lib/threef/scene-renderer';
import { Raf } from '../lib/raf/raf';
import { threef } from '../lib/threef/threef';


export default class ThreeSceneRenderer2 {

    constructor() {
        this.raf = new Raf(this.onRaf.bind(this));
        this.sceneRenderer = new SceneRenderer({});

        this.boxElements = {
            box1: document.getElementById('box-1'),
            box2: document.getElementById('box-2'),
            box3: document.getElementById('box-3'),
            box4: document.getElementById('box-4'),
            box5: document.getElementById('box-5'),
            box6: document.getElementById('box-6'),
        };


        // Create first scene1.
        this.createGltfScene(
             this.boxElements.box1,
             'public/scene-size-test2.gltf',
            {
                resizingAlgo: 'contain',
                resizingOptions: {
                    scalarX: 2.6,
                    scalarY: 3.8,
                },
            }
        );

        // Create second scene.
        this.createGltfScene(
             this.boxElements.box2,
             'public/scene-size-test2.gltf',
            {
                resizingAlgo: 'contain',
                resizingOptions: {
                    scalarX: 2.6,
                    scalarY: 3.8,
                    top: 0
                },
            }
        );


        // Create third scene.
        this.createGltfScene(
             this.boxElements.box3,
             'public/scene-size-test2.gltf',
            {
                resizingAlgo: 'contain',
                resizingOptions: {
                    scalarX: 2.6,
                    scalarY: 3.8,
                    bottom: 0,
                    left: 0
                },
            }
        );

        this.createGltfScene(
             this.boxElements.box4,
             'public/scene-size-test2.gltf',
            {
                resizingAlgo: 'cover',
                resizingOptions: {
                    scalarX: 2.6,
                    scalarY: 3.8,
                },
            }
        );


        this.createGltfScene(
             this.boxElements.box5,
             'public/scene-size-test2.gltf',
            {
                resizingAlgo: 'cover',
                resizingOptions: {
                    scalarX: 2.6,
                    scalarY: 3.8,
                    top: 0
                },
            }
        );

        this.createGltfScene(
             this.boxElements.box6,
             'public/scene-size-test2.gltf',
            {
                resizingAlgo: 'cover',
                resizingOptions: {
                    scalarX: 2.6,
                    scalarY: 3.8,
                    bottom: 0,
                    left: 0
                    // right: 1
                },
            }
        );

        this.sceneRenderer.resize();


        this.raf.start();
    }

    createGltfScene(domElement, gltfPath, options) {
        const gltfLoader = new GLTFLoader();
        threef.loadGltf({
          gltfPath: gltfPath,
          gltfLoader: gltfLoader
        }).then((gltf) => {
            // Add some lights.
            const ambientLight = new THREE.AmbientLight('#FFFFFF');
            ambientLight.intensity = options.ambientLightIntensity || 1.0;
            // Add the light to the scene.
            gltf.scene.add(ambientLight);
            this.sceneRenderer.addScene({
                resizingAlgo: options.resizingAlgo,
                resizingOptions: options.resizingOptions,
                domElement: domElement,
                scene: gltf.scene,
                camera: gltf.cameras[0],
                onBeforeRender: (renderer)=> {
                  // Since this loads a gltf, we need to correct out the colors.
                  renderer.physicallyCorrectLights = true;
                  renderer.gammaOutput = true;
                }
            }, true);
        });

    }

    onRaf() {
        this.sceneRenderer.render();
    }


}
