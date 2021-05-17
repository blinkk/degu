import * as func from '../func/func';
import {XGameObject, XGameObjectConfig} from './x-game-object';
import {XOffScreenCanvas} from './x-offscreen-canvas';

interface XTextConfig extends XGameObjectConfig {
  text?: string;
  font?: string;
  fillStyle?: string;
  textBaseline?: string;
  textAlign?: string;
}

/**
 * A single text in the x-engine.
 * TODO (uxder) Add an option or alternate that is DOM based.
 * @unstable
 */
export class XText extends XGameObject {
  private text: string;
  private font: string;
  private fillStyle: string;
  private textBaseline: CanvasTextBaseline;
  private textAlign: CanvasTextAlign;
  private offScreenCanvas: XOffScreenCanvas;

  constructor(config: XTextConfig) {
    super(config);
    this.text = func.setDefault(config.text, 'Hello');
    this.font = func.setDefault(config.font, '12px sans-serif');
    this.textAlign = func.setDefault(config.textAlign, 'left');
    this.fillStyle = func.setDefault(config.fillStyle, 'red');
    this.textBaseline = func.setDefault(config.textBaseline, 'top');
    this.offScreenCanvas = new XOffScreenCanvas();
  }

  /**
   * Sets the font to measure the width.
   * https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
   */
  get width(): number {
    let width = 0;
    this.offScreenCanvas.context.font = this.font;
    this.offScreenCanvas.context.textAlign = this.textAlign;
    this.offScreenCanvas.context.textBaseline = this.textBaseline;
    width = this.offScreenCanvas.context.measureText(this.text).width;
    return width || 0;
  }

  /**
   * Sets the font to measure the height.  There isn't really a crossbrowser
   * or realiable way to measure text at the moment, so we measure the
   * width of a single character and multiply that by an assumed 1.2 line
   * height for now as an approximation.
   * https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
   */
  get height(): number {
    this.offScreenCanvas.context.font = this.font;
    this.offScreenCanvas.context.textAlign = this.textAlign;
    this.offScreenCanvas.context.textBaseline = this.textBaseline;
    const width = this.offScreenCanvas.context.measureText('w').width;
    return width * 1.2;
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
