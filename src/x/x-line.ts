import { is } from '../is/is';

interface XLineConfig {
    strokeStyle: string;
    lineWidth: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
import { XGameObject } from './x-game-object';

/**
 * A single line in the x-engine.
 */
export class XLine extends XGameObject {
    private strokeStyle: string;
    private lineWidth: number;
    private lineJoin: string;
    private startX: number;
    private startY: number;
    private endX: number;
    private endY: number;

    constructor(config: XLineConfig) {
        super();

        this.strokeStyle = config.strokeStyle || 'red';
        this.lineWidth = is.undefinedNumber(config.lineWidth) ? config.lineWidth : 1;
        this.startX = is.undefinedNumber(config.startX) ? config.startX : 0;
        this.startY = is.undefinedNumber(config.startY) ? config.startY : 0;
        this.endX = is.undefinedNumber(config.endX) ? config.endX : 0;
        this.endY = is.undefinedNumber(config.endY) ? config.endY : 0;

        //Options are "round", "mitre" and "bevel".
        this.lineJoin = "round";
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.lineJoin = "round";
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        //ctx.closePath();
        ctx.stroke();
        // if (this..strokeStyle !== "none") ctx.stroke();
        // if (o.fillStyle !== "none") ctx.fill();
    }

}