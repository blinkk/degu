import { Raf } from '../raf/raf';
import { GameObject } from './game-object';
import { Stage } from './stage';
import { Line } from './line';

/**
 * X is a mini canvas 2d engine within yano-js.
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
    public stage: Stage;


    constructor(element: HTMLCanvasElement) {
        this.canvasElement = element;
        // Note the ! at the end.  Required to force typescript to assume
        // getContext('2d') never returns null.
        this.context = element.getContext('2d')!;

        // Force set the canvas size. When you set the canvas size via css,
        // css stretches the pixels within the canvas.
        // Setting it as such, forces the correct size.
        this.canvasElement.width = this.canvasElement.offsetWidth;
        this.canvasElement.height = this.canvasElement.offsetHeight;

        this.width = this.canvasElement.offsetWidth;
        this.height = this.canvasElement.offsetHeight;
        this.dpr = window.devicePixelRatio || 1;

        // Create the main stage sprite.
        this.stage = new Stage();
        this.stage.attachToCanvas(this.canvasElement);

        this.raf = new Raf(() => {
            this.gameLoop();
        })
    }


    /**
     * The main engine loop.  Here we call through all the
     * sprites on the main stage.
     */
    gameLoop() {
        //Clear the canvas.
        this.context.clearRect(0, 0, this.width, this.height);

        this.stage.children.forEach((gameObject: GameObject) => {
            this.renderGameObject(gameObject);
        })

        this.context.restore();
    }


    /**
     * Renders a given sprite onto the canvas.  This is sort of imagined like
     * a stamping process in which we turn, scale, change alpha of the context
     * itself and stamp out the sprite per frame.
     * @param gameObject
     */
    renderGameObject(gameObject: GameObject) {
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

        this.context.save();
        this.context.translate(
            gameObject.x + (gameObject.width * gameObject.pivotX),
            gameObject.y + (gameObject.height * gameObject.pivotY)
        )

        this.context.globalAlpha = gameObject.alpha;
        this.context.rotate(gameObject.rotation);
        this.context.scale(
            gameObject.scaleX * this.dpr,
            gameObject.scaleY * this.dpr);

        // Call the gameObject render method to figure out how to draw this
        // GameObject.
        gameObject.render(this.context);
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