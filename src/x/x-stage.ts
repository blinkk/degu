
import { XGameObject, XGameObjectDefaults } from './x-game-object';


/**
 * Base stage class used for the x-engine.
 */
export class XStage extends XGameObject {
    private stage: boolean;
    constructor(config = XGameObjectDefaults) {
        super(config);
        /**
         * A flag to denote that this is a special GameObject of stage.
         */
        this.stage = true;
    }

    attachToCanvas(canvas: HTMLCanvasElement) {
        this.canvasElement = canvas;
        this.naturalWidth = canvas.offsetWidth;
        this.naturalHeight = canvas.offsetHeight;
        this.context = this.canvasElement.getContext('2d');
        this.setPosition(0, 0);
    }

}