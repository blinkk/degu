import * as THREE from 'three';

import { elementVisibility } from '../dom/element-visibility';
import { DomWatcher } from '../dom/dom-watcher';
import { mathf } from '../mathf/mathf';
import { threef } from './threef';
import { Vector3 } from 'three';

export enum SceneResizingAlgo {



    /**
     * This is most commonly used three.js aspect ratio based resizing but
     * doesn't really work great on mobile if you are using the full viewport.
     *
     * Basically doing:
     *  camera.aspect = aspect;
     *  camera.updateProjectionMatrix();
     *
     * Basically, the camera will project out objects to the aspect ratio
     * of the dom element.  It contains Y but clips X.
     *
     * Thinking in terms of css, you can think of this similar to a
     * background-size: contain for height only and background-cover for width.
     *
     * Using this, as you resize your scene, the tops and bottom will never be
     * clipped but the sides can be clipped.  All of this is relative to
     * how you setup your scene as well (camera position, object positions etc)
     *
     * Nuthsell:
     * - If you resize the height, your object will go down in size.
     * - If you resize the width, your objects will not change in size.
     * - Resizing is based on a NDC 0,0 coordinates.
     */
    standardAspect = 'standardAspect',

    /**
     * An algo that attempts to recreate a similar effect as background: contain
     * but it's based on zoom.  This require you to pass the resizeScalar value
     * which in this case would be used to multiply the zoom value.
     *
     * Nuthsell:
     * - If you resize the height, your object will go down in size.
     * - If you resize the width, your objects will go down in size by changing
     *   the camera zoom.
     * - Resizing is based on a NDC 0,0 coordinates.
     * - resizingScalar can be passed to adust the zoom levels.
     */
    resizeWithZoom = 'resizeWithZoom',


    /**
     * This algo can be useful because it calculates the FOV
     * based on a scalar value.
     *
     * This is useful in two scenerios.
     * 1) You want to force an absolute size for your objects.
     *    By passing a resizingScalar that doesn't change,
     *    the projection will always be of a consistent size regardless
     *    of the canvas size.
     *
     *    The easiest way to describe this is to image a window in your house.
     *    The window would be the canvas size (scene size).  By using a resizingScalar,
     *    you can basically create a scene where your house window size might
     *    change but what is projected out the window is exaclty the same size.
     *    It more like peaking into another world without the world changing.
     *
     *    To use this, set your resizingAlgo to 'resizeWithFov' and also pass
     *    a resizingScalar (something like 200 or 1000).  When you do this,
     *    you'll notice that your objects are always the same size.
     *
     *    If you have breakpoints in your project, could could change the
     *    resizingScalar based on your breakpoints and the objects in your scene,
     *    will nicely resizing and you have control over how it looks.
     *
     * 2) Knowing the characteristics described in 1,
     *    you can make a responsive scene by changing adjusting the resizingScalar.
     *    The basis of how it scales can change depending on how you want to
     *    adjust the scalar.
     *
     *    This provides you with the ability to resize the scene objects based on
     *    axis
     *    - x (element.offsetWidth)
     *    - y (element.offsetHeight)
     *    - x or y (Math.min(element.offsetWidth, element.offsetHeight))
     *
     * ```ts
     *  const scene = new THREE.Scene();
     *  const element = document.getElementById('my-element');
     *  sceneRenderer.addScene({
     *    resizingAlgo: 'resizingWithFov',
     *    domElement: element,
     *    // Update the scalar prior to resizing.
     *    onBeforeResize: ()=> {
     *     // Resizing the objects in your scene based on the current width of the
     *     // dom element.
     *     // If you do this, the objects will get smaller as you narrow your browser.
     *     // (or the element width gets smaller)
     *     scene.userData.resizingScalar = element.offsetWidth * 0.2
     *
     *
     *     // Resizing the objects in your scene based on the current height of the
     *     // dom element.
     *     // If you do this, the objects will get smaller as you shorten your browser
     *     // (or the element height gets smaller).
     *     scene.userData.resizingScalar = element.offsetHeight * 0.2;
     *
     *
     *     // Resize both in x and y scales.
     *     scene.userData.resizingScalar = Math.min(element.offsetHeight, element.offsetWidth) * 0.2;
     *   }
     * })
     *
     * ```
     */
    resizeWithFov = 'resizeWithFov',

    /**
     * An algo that "attempts" to recreate contain type effects.
     */
    contain = 'contain',

    /**
     * Indicates that scene-renders should not attempt to resize and fix
     * camera aspect on resizing.  This will be handled manually.  Scene
     * defaults to manual if nothing is specified for resizingAlgo.
     *
     *
     * An example of manually handing the resizing.
     * ```
     *
     *       this.sceneRenderer.addScene({
     *           resizingAlgo: 'manual',
     *           scene: scene,
     *           camera: camera,
     *           domElement: element,
     *           onResize() {
     *               camera.aspect = element.offsetWidth / element.offsetHeight;
     *               camera.updateProjectionMatrix();
     *           }
     *       });
     *
     * ```
     */
    manual = 'manual',
}

export interface SceneConfig {
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    // A callback to execute prior to this scene being renders.
    onBeforeRender?: Function,
    // A callback to execute after this scene gets renders.
    // This can be considered a clean up of actions that maybe done during
    // onBeforeRender.  For example, a scene may alter the renderer temporarily
    // in onBeforeRender (such as adding gammaOutput).  Each scene should clean up
    // after itself so that it undoes any actions.
    onAfterRender?: Function,
    // A callback to executed on each resize event.
    onBeforeResize?: Function,
    // A callback to executed on each resize event.
    onResize?: Function,
    // A callback to executed on each dispose
    onDipose?: Function,

    // The type of resizing that should be used.
    resizingAlgo: string,
    // A scalar value used to control resizing when an applicable resizingAlgo
    // is specified.
    resizingScalar?: number
    // Optional object that can be passed to certain resizing
    resizingOptions?: object
}


export interface SceneRendererConfig {

    /**
     * The root element to create the main canvas.
     * Optional and typically this would default to the document.body.
     */
    rootElement?: HTMLElement;

    /**
     * The standard THREE.WEbGLRenderer options such as antialias:true.
     * If you leave this empty, sceneRender will default to it's internal
     * options for renderer which makes best effort to cover most cases.
     */
    rendererOptions?: Object;

    /**
     * Whether to use absolute positioning of the master canvas.
     * Defaults to false.
     * This can have performance benefits but as of now, it is experimental.
     */
    useAbsolutePositioning?: boolean;
}


/**
 * A class that attempts to get around max webGL context issues by having a
 * single renderer on the page.
 *
 * At a high level the issue is that you can't have more than 8 or so webGL
 * contexts as a general browser limitation.  Each context also can't share
 * resources.   So on pages where you might want to have like multiple webGL
 * canvases, you hit a road block.
 *
 * The solution here is to have a single canvas that covers the entire page (100vw x 100vh)
 * This single renderer would accept three.js scenes, which each define
 * a root html element to indicate the size and position to render.
 *
 * These scenes get reigstered to the sceneRenderer which upon calling,
 * sceneRenderer, will check the location of each registered scene dom element
 * and render it at the right place.
 *
 * This means that you could potentially export out a single gltf file with
 * multiple scenes and load it once to render on various DOM elements allowing
 * you to recycle geometry and avoid the webGL context limitations.
 *
 * For example usage, see:
 * @see /examples/three-scene-renderer.js
 * @see /examples/three-scene-renderer2.js
 *
 *
 * A high level example:
 *
 * ```
 * // Create an instance of SceneRenderer
 * this.sceneRenderer = new SceneRenderer({});
 *
 * // Add as many scenes as you like.
 *  this.sceneRenderer.addScene({
 *      // The resizing algo.
 *      resizingAlgo: 'resizeWithFov',
 *      resizingScalar: 1.0,
 *      scene: scene,
 *      camera: camera,
 *      // The dom element that this scene should render and size to.
 *      domElement: document.getElementById('my-element'),
 *      onBeforeRender: (renderer)=> {
 *           // Add some animations or whatever you need on render.
 *           scene.children[ 0 ].rotation.y = Date.now() * 0.001;
 *      },
 *      onAfterRender: (renderer)=> {}
 *      onBeforeResize: (renderer)=> {},
 *      onResize(renderer) {}
 *     });
 *  });
 *
 * // Whereever you have RAF setup,
 * this.sceneRenderer.render();
 *
 * // Later dispose to clean up.
 * this.sceneRenderer.dispose();
 *
 * ```
 *
 *
 * @see https://stackoverflow.com/questions/41919341/is-there-a-limit-to-the-number-of-three-webglrenderer-instances-in-a-page
 * @see https://stackoverflow.com/questions/30608723/is-it-possible-to-enable-unbounded-number-of-renderers-in-three-js/30633132#30633132
 * @see https://threejs.org/examples/webgl_multiple_elements.html
 */
export class SceneRenderer {
    /**
     * The internal instance of domWatcher.
     */
    private watcher: DomWatcher;

    /**
     * The root element to attach the renderer to.  This would
     * typically just be the document body.
     */
    private rootElement: HTMLElement;


    /**
     * The main canvas used to render scenes.  This would cover the whole screen.
     */
    private canvas: HTMLCanvasElement;

    /**
     * The dpr.
     */
    private dpr: number;

    /**
     * The Three webGLRenderer.
     */
    private renderer: THREE.WebGLRenderer;

    /**
     * An internal list of scenes that need to be renderered.
     */
    private scenes: Array<THREE.Scene>;


    /**
     * The last known root element width (usually window size)
     */
    private width: number;

    /**
     * The last known root element height (usually window size)
     */
    private height: number;

    /**
     *  The z-index of the main canvas.
     */
    private zIndex: number;

    /**
     * Whether to use absolute position on the root canvas or no.
     */
    private useAbsolutePositioning: boolean;

    constructor(config: SceneRendererConfig) {
        console.log('scene renderer');
        this.watcher = new DomWatcher();

        this.watcher.add({
            element: window,
            callback: this.onResize.bind(this),
            eventOptions: { passive: true },
            on: 'smartResize',
        });

        this.useAbsolutePositioning = !!config.useAbsolutePositioning;


        this.rootElement = config.rootElement || document.body;
        this.dpr = window.devicePixelRatio || 1;
        this.scenes = [];

        // Generate canvas.
        this.zIndex = 1;
        this.canvas = document.createElement('canvas');
        this.canvas.style.pointerEvents = 'none';
        if (this.useAbsolutePositioning) {
            this.canvas.style.position = 'absolute';
        } else {
            this.canvas.style.position = 'fixed';
        }
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';

        this.setZIndex(this.zIndex);

        this.rootElement.append(this.canvas);

        // Initial renderer setup.
        this.renderer = new THREE.WebGLRenderer(
            config.rendererOptions ||
            {
                canvas: this.canvas,
                antialias: true,
                alpha: true
            }
        );
        // Set to transparency.
        this.renderer.setClearColor(0xffffff, 0);
        this.renderer.setPixelRatio(this.dpr);

        this.onResize();
    }


    /**
     * Forces a resize event on the scene-renderer.
     */
    public resize() {
        this.onResize();
    }


    /**
     * Handles resizing events.
     */
    private onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        const aspectRatio = this.width / this.height;

        this.scenes.forEach((scene: THREE.Scene) => {
            const element = scene.userData.domElement;

            scene.userData.onBeforeResize && scene.userData.onBeforeResize(
                this.getRenderer()
            );

            // Now for each, figure out the right resizing strategy.
            const camera = scene.userData.camera;

            // let width, height;
            // if (aspectRatio >= 1) {
            //     width = 1;
            //     height = (window.innerHeight / window.innerWidth) * width;
            // } else {
            //     width = aspectRatio;
            //     height = 1;
            // }
            // camera.left = -width;
            // camera.right = width;
            // camera.top = height;
            // camera.bottom = -height;
            // camera.updateProjectionMatrix();


            // Cover on X, Contain on Y
            // camera.aspect = element.offsetWidth / element.offsetHeight;
            // camera.updateProjectionMatrix();

            // Contain
            let h = element.offsetHeight;
            let w = element.offsetWidth;
            const aspect = w / h;
            // let width, height;
            // if (aspect >= 1) {
            //     width = 1;
            //     height = aspect;
            // } else {
            //     width = aspect;
            //     height = 1;
            // }
            // camera.left = -width / 2;
            // camera.right = width / 2;
            // camera.top = height / 2;
            // camera.bottom = -height / 2;

            // Contain zoom algo.
            if (scene.userData.resizingAlgo == SceneResizingAlgo.resizeWithZoom) {
                const scalar = scene.userData.resizingScalar || 1.0;
                if (aspect <= 1) {
                    camera.zoom = aspect * scalar;
                } else {
                    camera.zoom = 1;
                }
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            // Standard Aspect algo
            if (scene.userData.resizingAlgo == SceneResizingAlgo.standardAspect) {
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }

            // Resize with FOV
            if (scene.userData.resizingAlgo == SceneResizingAlgo.resizeWithFov) {
                const z = scene.userData.resizingScalar || 1.0;
                camera.fov = Math.atan(h / 2 / z) * 2 * THREE.Math.RAD2DEG;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }


            // If contain type algo.
            if (scene.userData.resizingAlgo == SceneResizingAlgo.contain) {

                // Fake contain.  Control the x,y scalar values to control
                // resize points.
                const scalarX = 3.8;
                const scalarY = 2.6;
                const hFov = Math.atan(h / 2 / (w * scalarX)) * 2 * THREE.Math.RAD2DEG;
                const vFov = Math.atan(h / 2 / (h * scalarY)) * 2 * THREE.Math.RAD2DEG;
                camera.fov = Math.max(vFov, hFov);

                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }




            scene.userData.onResize && scene.userData.onResize(this.getRenderer());
        });

        this.renderer.setSize(this.width, this.height);
        this.render();
    }

    /**
     * Updates the z-index of the main renderer canvas.
     */
    public setZIndex(zIndex: number) {
        this.zIndex = zIndex;
        this.canvas.style.zIndex = this.zIndex + '';
    }


    /**
     * Returns the last known size of root canvas.  Usually this is usually the window size
     * since the main renderer canvas covers the whole page.
     */
    public getSize() {
        return {
            width: this.width,
            height: this.height,
            aspect: this.width / this.height
        }
    }

    /**
     * Add a THREE.Scene to be rendered when the given domElement is visible
     * in the scene.
     */
    public addScene(sceneConfig: SceneConfig, forceResize: boolean = false) {
        if (!sceneConfig.domElement || !sceneConfig.scene || !sceneConfig.camera) {
            console.warn(`SceneRenderer could not register scene.  It is missing either the scene, camere or domElement`);
            return;
        }

        const scene = sceneConfig.scene;

        // Set the scene config data to the scene.
        scene.userData = sceneConfig;

        // Add ev to able to later check if the associated domElement is visible
        // in the viewport.
        scene.userData.ev = elementVisibility.inview(sceneConfig.domElement);


        this.scenes.push(scene);

        if (forceResize) {
            window.setTimeout(() => {
                console.log('forced resize');
                this.resize();
            })
        }
    }



    /**
     * Gets the internal webGLRenderer.
     */
    public getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }


    /**
     * Renders out each scene.
     */
    public render(): void {

        // See note on: https://stackoverflow.com/questions/30608723/is-it-possible-to-enable-unbounded-number-of-renderers-in-three-js/30633132#30633132
        // Rather than using fixed, this keeps the canvas in sync.
        if (this.useAbsolutePositioning) {
            this.canvas.style.transform = `translateY(${window.scrollY}px)`;
        }

        this.renderer.setScissorTest(false);
        this.renderer.clear();
        this.renderer.setScissorTest(true);


        // Go through each scene and it's position and render it out in
        // pieces.
        this.scenes.forEach((scene: THREE.Scene) => {

            // If the scene is out of view, cull.
            if (!scene.userData.ev.state().inview) {
                return;
            }

            const element = scene.userData.domElement;
            // Get the element position relative to the page's viewport
            var rect = element.getBoundingClientRect();
            // set the viewport
            var width = rect.right - rect.left;
            var height = rect.bottom - rect.top;
            var left = rect.left;
            var bottom = this.renderer.domElement.clientHeight - rect.bottom;

            this.renderer.setViewport(left, bottom, width, height);
            this.renderer.setScissor(left, bottom, width, height);


            scene.userData.onBeforeRender && scene.userData.onBeforeRender(
                this.getRenderer()
            );
            this.renderer.render(scene, scene.userData.camera);
            scene.userData.onAfterRender && scene.userData.onAfterRender(
                this.getRenderer()
            );
        });

    }


    public dispose() {
        // Clean up scenes.
        this.scenes.forEach((scene: THREE.Scene) => {
            // Dispose element visiblity.
            scene.userData.ev.dispose();

            // Remove dom association.
            scene.userData.element = null;

            scene.userData.onDispose && scene.userData.onDispose();
        });

        // Remove canvas from rootElement.

    }

}