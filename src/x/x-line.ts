import { func } from '../func/func';

import { XGameObject, XGameObjectConfig } from './x-game-object';

interface XLineConfig extends XGameObjectConfig {
    strokeStyle: string;
    lineWidth: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

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
        super(config);

        this.strokeStyle = func.setDefault(config.strokeStyle, 'red');
        this.lineWidth = func.setDefault(config.lineWidth, 1);
        this.startX = func.setDefault(config.startX, 0);
        this.startY = func.setDefault(config.startY, 0);
        this.endX = func.setDefault(config.endX, 0);
        this.endY = func.setDefault(config.endY, 0);

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