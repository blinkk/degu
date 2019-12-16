

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SceneRenderer } from '../lib/threef/scene-renderer';
import { mathf } from '../lib/mathf/mathf';
import { Raf } from '../lib/raf/raf';
import { threef } from '../lib/threef/threef';

// https://threejs.org/examples/webgl_shadowmap_pcss.html
const PCSS2 = `
#define LIGHT_WORLD_SIZE 0.005
				#define LIGHT_FRUSTUM_WIDTH 3.75
				#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
				#define NEAR_PLANE 9.5
				#define NUM_SAMPLES 30
				#define NUM_RINGS 10
				#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
				#define PCF_NUM_SAMPLES NUM_SAMPLES

				vec2 poissonDisk[NUM_SAMPLES];

				void initPoissonSamples( const in vec2 randomSeed ) {
					float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
					float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

					// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
					float angle = rand( randomSeed ) * PI2;
					float radius = INV_NUM_SAMPLES;
					float radiusStep = radius;

					for( int i = 0; i < NUM_SAMPLES; i ++ ) {
						poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
						radius += radiusStep;
						angle += ANGLE_STEP;
					}
				}

				float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
					return (zReceiver - zBlocker) / zBlocker;
				}

				float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
					// This uses similar triangles to compute what
					// area of the shadow map we should search
					float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
					float blockerDepthSum = 0.0;
					int numBlockers = 0;

					for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
						float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
						if ( shadowMapDepth < zReceiver ) {
							blockerDepthSum += shadowMapDepth;
							numBlockers ++;
						}
					}

					if( numBlockers == 0 ) return -1.0;

					return blockerDepthSum / float( numBlockers );
				}

				float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
					float sum = 0.0;
					for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
						float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
						if( zReceiver <= depth ) sum += 1.0;
					}
					for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
						float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
						if( zReceiver <= depth ) sum += 1.0;
					}
					return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
				}

				float PCSS ( sampler2D shadowMap, vec4 coords ) {
					vec2 uv = coords.xy;
					float zReceiver = coords.z; // Assumed to be eye-space z in this code

					initPoissonSamples( uv );
					// STEP 1: blocker search
					float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );

					//There are no occluders so early out (this saves filtering)
					if( avgBlockerDepth == -1.0 ) return 1.0;

					// STEP 2: penumbra size
					float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
					float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;

					// STEP 3: filtering
					//return avgBlockerDepth;
					return PCF_Filter( shadowMap, uv, zReceiver, filterRadius);
				}
`;




const PCSS = `
#define LIGHT_WORLD_SIZE 0.005
				#define LIGHT_FRUSTUM_WIDTH 3.75
				#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
				#define NEAR_PLANE 9.5

				#define NUM_SAMPLES 17
				#define NUM_RINGS 11
				#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
				#define PCF_NUM_SAMPLES NUM_SAMPLES

				vec2 poissonDisk[NUM_SAMPLES];

				void initPoissonSamples( const in vec2 randomSeed ) {
					float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
					float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

					// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
					float angle = rand( randomSeed ) * PI2;
					float radius = INV_NUM_SAMPLES;
					float radiusStep = radius;

					for( int i = 0; i < NUM_SAMPLES; i ++ ) {
						poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
						radius += radiusStep;
						angle += ANGLE_STEP;
					}
				}

				float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
					return (zReceiver - zBlocker) / zBlocker;
				}

				float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
					// This uses similar triangles to compute what
					// area of the shadow map we should search
					float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
					float blockerDepthSum = 0.0;
					int numBlockers = 0;

					for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
						float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
						if ( shadowMapDepth < zReceiver ) {
							blockerDepthSum += shadowMapDepth;
							numBlockers ++;
						}
					}

					if( numBlockers == 0 ) return -1.0;

					return blockerDepthSum / float( numBlockers );
				}

				float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
					float sum = 0.0;
					for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
						float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
						if( zReceiver <= depth ) sum += 1.0;
					}
					for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
						float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
						if( zReceiver <= depth ) sum += 1.0;
					}
					return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
				}

				float PCSS ( sampler2D shadowMap, vec4 coords ) {
					vec2 uv = coords.xy;
					float zReceiver = coords.z; // Assumed to be eye-space z in this code

					initPoissonSamples( uv );
					// STEP 1: blocker search
					float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );

					//There are no occluders so early out (this saves filtering)
					if( avgBlockerDepth == -1.0 ) return 1.0;

					// STEP 2: penumbra size
					float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
					float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;

					// STEP 3: filtering
					//return avgBlockerDepth;
					return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );
				}
`;


const PCSSGetShadow = `
 return PCSS( shadowMap, shadowCoord );
`;

export default class ThreeLightTest {

    constructor() {
        console.log("Three Lighting Test");
        this.raf = new Raf(this.onRaf.bind(this));
        this.sceneRenderer = new SceneRenderer({});

        this.boxElements = {
            box1: document.getElementById('box-1'),
        };


        this.overwriteShadowMap();

        this.createGltfScene1();

        this.sceneRenderer.resize();

        this.raf.start();
    }


    overwriteShadowMap() {
        var shader = THREE.ShaderChunk.shadowmap_pars_fragment;
        shader = shader.replace(
            '#ifdef USE_SHADOWMAP',
            '#ifdef USE_SHADOWMAP' + PCSS2
        );

        shader = shader.replace(
            '#if defined( SHADOWMAP_TYPE_PCF )',
            PCSSGetShadow +
            '#if defined( SHADOWMAP_TYPE_PCF )'
        );

        THREE.ShaderChunk.shadowmap_pars_fragment = shader;

    }

    createGltfScene1() {
        const domElement = this.boxElements.box1;
        const scene = new THREE.Scene();
        const camera =
            new THREE.PerspectiveCamera(30, domElement.offsetWidth / domElement.offsetWidth, 1, 10000);

        camera.position.x = 7;
        camera.position.y = 13;
        camera.position.z = 7;



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
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;

                // This blurs but doesn't look great.
                // light.shadow.radius = 20;
                // light.shadow.camera.far = 200;

                // Adjust for blurryness
                light.shadow.camera.far = 50;
                light.shadow.camera.near = 1;
                scene.add(light);
                scene.add(new THREE.CameraHelper(light.shadow.camera));


                // var light2 = new THREE.DirectionalLight(0xdfebff, 1);
                // light2.position.set(0, 8, -5);
                // light2.castShadow = true;
                // light2.shadow.mapSize.width = 1024;
                // light2.shadow.mapSize.height = 1024;

                // // This blurs but doesn't look great.
                // // light.shadow.radius = 20;
                // // light.shadow.camera.far = 200;

                // // Adjust for blurryness
                // light2.shadow.camera.far = 100;
                // scene.add(light2);
                // scene.add(new THREE.CameraHelper(light2.shadow.camera));



                // Add orbit controls.
                var controls = new OrbitControls(camera, domElement);
                controls.maxPolarAngle = Math.PI * 0.5;
                controls.minDistance = 10;
                controls.maxDistance = 75;
                controls.target.set(0, 2.5, 0);
                controls.update();
                scene.userData.controls = controls;
            },
            onBeforeRender: (renderer, scene) => {
                renderer.gammaInput = true;
                renderer.gammaOutput = true;
                renderer.shadowMap.enabled = true;

                // renderer.shadowMapSoft = true;
                // renderer.shadowMapType = THREE.PCFSoftShadowMap;

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
        for (var i = 0; i < 12; i++) {
            var geometry = new THREE.SphereBufferGeometry(
                mathf.getRandomFloat(0.1, 0.5),
                mathf.getRandomInt(10, 50),
                mathf.getRandomInt(10, 50));
            var material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
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
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000, 8, 8), groundMaterial);
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
