
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { SceneRenderer } from '../lib/threef/scene-renderer';
import { Raf } from '../lib/raf/raf';
import { threef } from '../lib/threef/threef';

export default class ThreeSceneRenderer {

    constructor() {
        console.log('scene renderer test.');

        this.raf = new Raf(this.onRaf.bind(this));
        this.sceneRenderer = new SceneRenderer({});

        this.boxElements = [
            document.getElementById('box-1'),
            document.getElementById('box-2'),
            document.getElementById('box-3'),
            document.getElementById('box-4'),
            document.getElementById('box-5'),
            document.getElementById('box-6'),
            document.getElementById('box-7'),
            document.getElementById('box-8'),
            document.getElementById('box-8'),
            document.getElementById('box-9'),
            document.getElementById('box-10'),
            document.getElementById('box-11'),
            document.getElementById('box-12'),
        ];

        this.generateScenes();

        this.sceneRenderer.resize();

        this.raf.start();
    }


    generateScenes() {
        var geometries = [
            new THREE.BoxBufferGeometry(1, 1, 1),
            new THREE.SphereBufferGeometry(0.5, 12, 8),
            new THREE.DodecahedronBufferGeometry(0.5),
            new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 12)
        ];

        this.boxElements.forEach((element) => {

            // Create a new scene.
            const scene = new THREE.Scene();
            // Add a new cam.
            var camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
            camera.position.z = 2;

            // Add some stuff to the sample scene.
            var geometry = geometries[geometries.length * Math.random() | 0];
            var material = new THREE.MeshStandardMaterial( {
                color: new THREE.Color().setHSL( Math.random(), 1, 0.75 ),
                roughness: 0.5,
                metalness: 0,
                flatShading: true
            } );
            scene.add( new THREE.Mesh( geometry, material ) );
            scene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ) );
            var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
            light.position.set( 1, 1, 1 );
            scene.add( light );

            // var controls = new OrbitControls( camera, element);
            // controls.minDistance = 2;
            // controls.maxDistance = 5;
            // controls.enablePan = false;
            // controls.enableZoom = false;


            // Register this to the sceneRenderer.
            const textElement = element.querySelector('.text');
            this.sceneRenderer.addScene({
                // resizingAlgo: 'resizeWithFov',
                // resizingScalar: 1.0,
                resizingAlgo: 'contain',
                resizingOptions: {
                    scalarX: 1.0,
                    scalarY: 1.0,
                },
                scene: scene,
                camera: camera,
                domElement: element,
                // On each render update, update the controls.
                onBeforeRender: ()=> {
                    // controls.update();
                    scene.children[ 0 ].rotation.y = Date.now() * 0.001;

                    // Example of moving DOM text with the scene.
                    // The element (not the scene renderer) size needs to be
                    // used to calculate positions.
                    // Because we are using FOV based resizing, we need to
                    // consider the resizingScalar and pass that over as a
                    // textScalar.
                    const textScalar = scene.userData.resizingScalar * 0.00003;
                    const domCoordinates = threef.toDomCoordinates(
                        scene.children[0],
                        camera, element.offsetWidth, element.offsetHeight,
                        textScalar
                    );

                    const domRotation = threef.toDomRotation(
                        scene.children[0],
                        camera, element.offsetWidth, element.offsetHeight
                    );
                   threef.applyVectorToDom(textElement, domCoordinates, domRotation);
                },
                onBeforeResize: ()=> {
                    // scene.userData.resizingScalar = element.offsetHeight * 0.5;
                    scene.userData.resizingScalar = Math.min(
                        element.offsetHeight,
                        element.offsetWidth
                    );
                },
                onResize() {
                    console.log('updating');
                    // camera.aspect = this.width / this.height;
                    // camera.updateProjectionMatrix();
                }
            });
        });
    }

    onRaf() {
        this.sceneRenderer.render();
    }

    resize() {

    }


}
