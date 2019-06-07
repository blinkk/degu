import { func } from '../func/func';
import { XGameObject, XGameObjectConfig } from './x-game-object';


interface XTextConfig extends XGameObjectConfig {
    text?: string;
    font?: string;
    fillStyle?: string;
    textBaseline?: string;
}

/**
 * A single text in the x-engine.
 * TODO (uxder) Add an option or alternate that is DOM based.
 */
export class XText extends XGameObject {
    private text: string;
    private font: string;
    private fillStyle: string;
    private textBaseline: CanvasTextBaseline;

    constructor(config: XTextConfig) {
        super(config);
        this.text = func.setDefault(config.text, 'Hello');
        this.font = func.setDefault(config.font, '12px sans-serif');
        this.fillStyle = func.setDefault(config.fillStyle, 'red');
        this.textBaseline = func.setDefault(config.textBaseline, 'top');
    }

    // get width(): number {
    //     return this.context && this.context.measureText(this.text).width || 0;
    // }
    // // TODO (uxder) What's the best way to get height?
    // get height(): number {
    //     return this.context && this.context.measureText(this.text).width || 0;
    // }

    get textMetrics(): TextMetrics | null {
        return this.context && this.context.measureText(this.text);
    }


    setText(text: string) {
        this.text = text;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fillStyle;
        ctx.translate(this.naturalAnchorXOffset, this.naturalAnchorYOffset);
        ctx.font = this.font;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.text, 0, 0);
    }
}
