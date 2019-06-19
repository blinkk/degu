import { func } from '../func/func';
import { Raf } from '../raf/raf';
import { XGameObject } from './x-game-object';
import { XStage } from './x-stage';
import { XLine } from './x-line';
import { XPointer } from './x-pointer';
import { XText } from './x-text';
import { DomWatcher } from '../dom/dom-watcher';

interface XConfig {
    canvasElement: HTMLCanvasElement;
    debugMode?: boolean;
}

/**
 * # X is a mini canvas + dom 2d engine within yano-js.
 *
 * ```ts
 *
 *
 *
 * ```
 */
export class X {

    private canvasElement: HTMLCanvasElement;
    private width: number;
    private height: number;
    private context: CanvasRenderingContext2D;
    private raf: Raf;
    private dpr: number;
    private pointer: XPointer;
    public stage: XStage;
    private debugMode: boolean;
    private mouseCoordsTextDebugObject: XText;
    private watcher: DomWatcher;


    constructor(config: XConfig) {
        this.canvasElement = config.canvasElement;
        // Note the ! at the end.  Required to force typescript to assume
        // getContext('2d') never returns null.
        this.context = this.canvasElement.getContext('2d')!;

        // Force set the canvas size. When you set the canvas size via css,
        // css stretches the pixels within the canvas.
        // Setting it as such, forces the correct size.
        this.dpr = window.devicePixelRatio || 1;
        this.canvasElement.width = 0;
        this.canvasElement.height = 0;
        this.width = 0;
        this.height = 0;
        this.resize();

        this.watcher = new DomWatcher();
        this.watcher.add({
            element: window,
            on: 'resize',
            callback: this.resize.bind(this)
        })

        this.debugMode =
            func.setDefault(config.debugMode, false);

        // Create the main stage sprite.
        this.stage = new XStage();
        this.stage.attachToCanvas(this.canvasElement);

        // If we want to debug the mouse coords, add a text object to
        // display.
        this.mouseCoordsTextDebugObject = new XText({
            // Add it at a really high index.
            zIndex: 999999
        });
        this.mouseCoordsTextDebugObject.debugObject = true;

        if (this.debugMode) {
            window['X'] = this;
            window['X_STAGE'] = this.stage;
            this.stage.addChild(this.mouseCoordsTextDebugObject);
        }



        // Create the main pointer.
        this.pointer = new XPointer(this.canvasElement);

        this.raf = new Raf(() => {
            this.gameLoop();

            // Update the mouse display to follow the mouse and display the
            // current coordinates.
            if (this.debugMode && this.mouseCoordsTextDebugObject) {
                this.mouseCoordsTextDebugObject.setPosition(
                    this.pointer.x + 20,
                    this.pointer.y + 20,
                )
                this.mouseCoordsTextDebugObject.setText(
                    `x: ${this.pointer.x}, y: ${this.pointer.y}`
                )
            }
        })
    }

    resize() {
        this.dpr = window.devicePixelRatio || 1;
        this.canvasElement.width = this.canvasElement.offsetWidth * this.dpr;
        this.canvasElement.height = this.canvasElement.offsetHeight * this.dpr;
        this.width = this.canvasElement.offsetWidth * this.dpr;
        this.height = this.canvasElement.offsetHeight * this.dpr;
    }

    getPointer(): XPointer {
        return this.pointer;
    }

    /**
     * The main engine loop.  Here we call through all the
     * sprites on the main stage.
     */
    gameLoop() {
        //Clear the canvas.
        this.context.clearRect(0, 0, this.width, this.height);

        // Update the positions of each object
        this.stage.children.forEach((gameObject: XGameObject) => {
            gameObject.updatePositions();
        })

        // Render each object.
        this.stage.children.forEach((gameObject: XGameObject) => {
            this.renderGameObject(gameObject);
        })
    }

    /**
     * Renders a given sprite onto the canvas.  This is sort of imagined like
     * a stamping process in which we turn, scale, change alpha of the context
     * itself and stamp out the sprite per frame.
     * @param gameObject
     */
    renderGameObject(gameObject: XGameObject) {
        // Whether this gameObject is off screen.
        const shouldRender =
            gameObject.visible &&
            gameObject.gx < this.width + gameObject.width &&
            gameObject.gx + gameObject.width >= -gameObject.width &&
            gameObject.gy < this.height + gameObject.height &&
            gameObject.gy + gameObject.height >= -gameObject.height;

        if (!shouldRender) {
            return;
        }


        // If this object is interactable, check the collision state
        // with the pointer.
        let colliding = false;
        if (gameObject.interactable) {
            colliding = this.pointer.testCollidingWithGameObject(gameObject);

            if (colliding && this.pointer.isMouseDown) {
                gameObject.onMouseDown && gameObject.onMouseDown(gameObject);
            }
            if (colliding && !this.pointer.isMouseDown) {
                gameObject.onMouseUp && gameObject.onMouseUp(gameObject);
            }
            if (colliding) {
                gameObject.onMouseMove && gameObject.onMouseMove(gameObject);
            }
        }



        this.context.save();
        // this.context.translate(
        //         this.canvasElement.width  / 2,
        //         this.canvasElement.height / 2)

        // Scale to aspect ratio first.
        this.context.scale(this.dpr, this.dpr);

        // Adjust alpha
        this.context.globalAlpha = gameObject.alpha;

        // Move first
        this.context.translate(
            // gameObject.x + (gameObject.width * gameObject.anchorX),
            // gameObject.y + (gameObject.height * gameObject.anchorY)
            ~~gameObject.anchorGx,
            ~~gameObject.anchorGy,
        )

        // Then rotate
        // Not sure why but canvas calculations rotation in anticlockwise manner?
        // We counter this by interving the rotation value.
        this.context.rotate(-gameObject.rotation);

        // Now scale
        this.context.scale(
            gameObject.scaleX,
            gameObject.scaleY);

        // Call the gameObject render method to figure out how to draw this
        // GameObject.
        gameObject.render(this.context);

        // Renders debugging outlines for this object if it is colliding.
        if (this.debugMode && !gameObject.debugObject && colliding) {
            gameObject.renderDebuggingOutlines(this.context);
        }

        this.context.restore();


        // Now loop through each child and paint it out.
        gameObject.children.forEach((childGameObject) => {
            this.renderGameObject(childGameObject);
        })

    }

    /*
     * Adds a watcher callback to the raf loop.
     */
    onTick(callback: Function) {
        this.raf.watch(callback);
    }


    /**
     * Starts the main game loop.
     */
    start() {
        this.raf.start();
    }


}