
import { func } from '../func/func';
import { XGameObject, XGameObjectConfig } from './x-game-object';


interface XRectangleConfig extends XGameObjectConfig {
    fillStyle?: string,
    strokeStyle?: string,
    lineWidth?: number
}

export class XRectangle extends XGameObject {
    private fillStyle: string;
    private strokeStyle: string;
    private lineWidth: number;

    constructor(config: XRectangleConfig) {
        super(config);

        this.strokeStyle = func.setDefault(config.strokeStyle, null);
        this.fillStyle = func.setDefault(config.fillStyle, null);
        this.lineWidth = func.setDefault(config.lineWidth, 1);
    }



    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.rect(
            -this.naturalWidth * this.anchorX,
            -this.naturalHeight * this.anchorY,
            this.naturalWidth,
            this.naturalHeight
        );

        if (this.strokeStyle) {
            ctx.stroke();
        }

        if (this.fillStyle)
            ctx.fill();
    }
}
