
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
        };


        this.createGltfScene(
             this.boxElements.box1,
             'public/scene-size-test.gltf',
            {
                resizingAlgo: 'standardAspect'
            }
        );

        this.sceneRenderer.resize();

        this.raf.start();
    }

    createGltfScene(domElement, gltfPath) {
        const gltfLoader = new GLTFLoader();
        threef.loadGltf({
          gltfPath: gltfPath,
          gltfLoader: gltfLoader
        }).then((gltf) => {
            // Add some lights.
            const ambientLight = new THREE.AmbientLight('#FFFFFF');
            ambientLight.intensity = 1.0;
            // Add the light to the scene.
            gltf.scene.add(ambientLight);
            this.sceneRenderer.addScene({
                resizingAlgo: 'contain',
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


    setupScene1() {

    };


    onRaf() {
        console.log('raf starated');
        this.sceneRenderer.render();
    }


}
