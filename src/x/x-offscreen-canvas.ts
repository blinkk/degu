

/**
 * A general canvas that exists in memery for x-engine to perform offscreen
 * calculatons.  Note this is NOT the same as the buffer rendering canvas
 * TODO (uxder) to be implemented.  But more a shared, singleton to canvas
 * that can be drawn on to do calculations.
 *
 * Note that since this is shared resource, there is no guarantee of state.
 * Objects using it should clean up.
 * @unstable
 */
export class XOffScreenCanvas {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    private dpr: number;
    constructor() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = 1000 * this.dpr;
        this.canvas.height = 1000 * this.dpr;
    }
}

export const xOffScreenCanvas = new XOffScreenCanvas();