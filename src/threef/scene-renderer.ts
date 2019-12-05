import * as THREE from 'three';

import { elementVisibility } from '../dom/element-visibility';
import { DomWatcher } from '../dom/dom-watcher';

export interface SceneConfig {
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    // A callback to execute prior to this scene being renders.
    onBeforeRender?: Function
    // A callback to executed on each resize event.
    onResize?: Function
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
 * The solution here is to have a single canvas that covers the entire page.
 * This single renderer would accept three.js scenes, which each define
 * a root html element to indicate the size and position to render.
 *
 * These scenes get reigstered to the sceneRenderer which upon calling,
 * sceneRenderer, will check the location of each registered scene dom element
 * and render it at the right place.
 *
 *
 * @see /examples/three
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
        if(this.useAbsolutePositioning) {
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


    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.scenes.forEach((scene: THREE.Scene) => {
            scene.userData.onResize && scene.userData.onResize();
        });

        this.render();
    }

    /**
     * Updtes the z-index of the main renderer canvas.
     */
    public setZIndex(zIndex: number) {
        this.zIndex = zIndex;
        this.canvas.style.zIndex = this.zIndex + '';
    }


    /**
     * Returns the last known size of root canvas.  Usually thsi is teh window size.
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
    public addScene(sceneConfig: SceneConfig) {
        if (!sceneConfig.domElement || !sceneConfig.scene || !sceneConfig.camera) {
            console.warn(`SceneRenderer could not register scene.  It is missing either the scene, camere or domElement`);
            return;
        }

        const scene = sceneConfig.scene;
        // By convention, we save the domElement of the scene to the scene itself.
        scene.userData.element = sceneConfig.domElement;

        // Save the camera.
        scene.userData.camera = sceneConfig.camera;

        // Each scene will also contain element visibility as well to
        // be able to later check if the associated domElement is visible
        // in the viewport.
        scene.userData.ev = elementVisibility.inview(sceneConfig.domElement);

        scene.userData.onBeforeRender = sceneConfig.onBeforeRender;
        scene.userData.onResize = sceneConfig.onResize;



        this.scenes.push(scene);
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
        if(this.useAbsolutePositioning) {
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

            const element = scene.userData.element;
            // Get the element position relative to the page's viewport
            var rect = element.getBoundingClientRect();
            // set the viewport
            var width = rect.right - rect.left;
            var height = rect.bottom - rect.top;
            var left = rect.left;
            var bottom = this.renderer.domElement.clientHeight - rect.bottom;

            this.renderer.setViewport(left, bottom, width, height);
            this.renderer.setScissor(left, bottom, width, height);


            // Now run the render function associated with the scene.
            scene.userData.onBeforeRender && scene.userData.onBeforeRender();

            // Now render it out.
            this.renderer.render(scene, scene.userData.camera);

        });

    }


    public dispose() {
        // Clean up scenes.
        this.scenes.forEach((scene: THREE.Scene) => {
            // Dispose element visiblity.
            scene.userData.ev.dispose();

            // Remove dom association.
            scene.userData.element = null;
        });

        // Remove canvas from rootElement.

    }

}