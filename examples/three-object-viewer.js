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

import { Raf } from '../lib/raf/raf';

/**
 * Just a crude example of adding a gltf object file in three.js.
 *
 * Basic steps.
 * Take your blender file and export it out as a gtlf and set it the path
 *    in the code below.
 *
 * https://docs.blender.org/manual/ja/latest/addons/io_scene_gltf2.html
 * https://github.com/KhronosGroup/glTF-Blender-Exporter/blob/master/docs/user.md#pbr-materials
 *
 * To export, in Blender 2.8 to go:
 * File -> Export glTF2.0 -> save your file.
 * Make sure you have the following checked under the export settings.
 * - General -> Apply Modifiers
 * - General -> +Y up
 * - Meshes -> Uvs, Normals, Vertex Colors, Materials
 * - Objects -> Cameras, Punctual Lights
 * - Animations -> Animations, Limit Playback Range, Always Sample Animations, SKinning, Shape Keys, Shape Keys Normals.
 *
 * Save file as glb.
 *
 *
 * Lights
 * - Area lights don't seem to export correctly out of blender.
 * - Sun lights turn into directional lights.  This means, if there is an object
 *   obstructing, in three.js it will block the light.
 *   https://threejs.org/docs/#api/en/lights/RectAreaLight could be an alternative option
 *
 * - Shadows
 * Light shadow values are not respected in three.js
 *
 * - It's easier if you don't have an HDRI.
 * - Also in Shading to go background set color strength to 0.
 *
 *
 * Renderer Specifics
 * - Things like bloom in eevee won't carry over.
 *
 *
 * Materials
 * - Seems like just Princpled BSDF is the main supported (okay with images)
 *
 * UV Editing and Baking
 * - https://www.youtube.com/watch?v=c2ut0Trcdi0
 * - https://www.youtube.com/watch?v=ejSVHuHOb7U
 *
 *
 *
 * Camera Movement.  If you are exporting camera movement, note the following.
 * - You can't use path animation since even if you bake the animations,
 *  they don't get included.  This means that beizer-curve path animations
 *  like done here: https://www.youtube.com/watch?v=-2dd_qK54pg
 *  won't work.
 * - Instead, you have to animate the camera.  Prior to exporting as gltf,
 *  you MUST, bake the animation.  To do this, go to the Camera,
 *  Object -> Animation -> Bake Action.  Make sure the "Clear Constraints"
 *  and "Clear Parents" options are selected.
 *  @see /examples/public/blender-three/baking-instructions.mov for
 *  further insturctions.
 *
 *
 * More limitations:
 * https://github.com/KhronosGroup/glTF-Blender-Exporter/blob/master/docs/user.md#pbr-materials*
 */
export default class ThreeObjectViewer {
    constructor() {
        console.log('ThreeJS Object Viewer Demo');
        this.raf = new Raf(this.onRaf.bind(this));

        this.canvasContainer = document.getElementById('canvas-container');

        // Noraml camera.
        // this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.25, 1000);
        // this.camera.position.set( - 50, 10, 2.7 );

        this.scene = new THREE.Scene();

        // var ambient = new THREE.AmbientLight(0x222222);
        // this.scene.add(ambient);
        // this.scene.background = new THREE.Color(0x222222);
        // this.scene.add(new THREE.AmbientLight(0xFFFFFF));

        // var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        // this.scene.add( light );


        var loader = new GLTFLoader();
        // const path = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
        // const path = '/public/dude.glb';
        const path = '/public/monster-scene3.glb';
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

                // //ループ設定（1回のみ）
                // action.setLoop(THREE.LoopOnce);

                // //アニメーションの最後のフレームでアニメーションが終了
                // action.clampWhenFinished = true;

                //アニメーションを再生
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
                    child.intensity = child.intensity * 0.2;


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

            this.raf.start();

        }, undefined, (error) => {
            console.error(error);
        });

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.canvasContainer.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.resize.bind(this), false);
    }

    resize() {

        this.width = this.canvasContainer.parentElement.offsetWidth;
        this.height = this.canvasContainer.parentElement.offsetHeight;

        console.log('resizing', this.width);

        // https://github.com/donmccurdy/three-gltf-viewer/blob/master/src/viewer.js
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        // Important to get the correct colors.
        this.renderer.physicallyCorrectLights = true;

        this.renderer.setClearColor(0x000000);
        // this.renderer.setClearColor(0xFFFFFF, 1.0);

        // Affects how strongly lights come exposed.
        // this.renderer.toneMappingExposure = 0.4;
        this.renderer.shadowMap.enabled = true;
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


    onRaf() {

        //Animation Mixerを実行
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }



        // const cameraAnimation = this.getAnimationByName('camera-action');
        // const animationAction = this.mixer.clipAction(cameraAnimation);
        // console.log(animationAction);

        // console.log(this.mixer);
        // const camera = this.getObjectByName('Camera');
        // console.log(camera.position);
        // const camera = this.camera.parent;
        // if(cameraPosition) {
        //   this.camera.position.set(this.camera.parent.position);
        //   this.camera.scale.set(camera.scale);
        //   this.camera.setRotationFromEuler(this.camera.rotation);
        // }

        // Make camera follow target object.
        // const cameraTarget = this.getObjectByName('camera-target');
        // if (cameraTarget) {
        //     this.camera.lookAt(cameraTarget.position);
        // }

        // this.camera.scale.set(this.camera.parent.scale);
        // console.log(this.camera.position);


        this.renderer.render(this.scene, this.camera);
    }

}
