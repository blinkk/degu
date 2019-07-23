
import { XGameObject, XGameObjectDefaults } from './x-game-object';


/**
 * Base stage class used for the x-engine.
 * @unstable
 */
export class XStage extends XGameObject {
    private stage: boolean;
    private canvasElement: HTMLCanvasElement | null;
    private context: CanvasRenderingContext2D | null;

    constructor(config = XGameObjectDefaults) {
        super(config);
        /**
         * A flag to denote that this is a special GameObject of stage.
         */
        this.stage = true;
        this.canvasElement = null;
        this.context = null;
    }

    attachToCanvas(canvas: HTMLCanvasElement) {
        this.canvasElement = canvas;
        this.context = this.canvasElement.getContext('2d')!;
        this.naturalWidth = canvas.offsetWidth;
        this.naturalHeight = canvas.offsetHeight;
        this.setPosition(0, 0);
    }

}