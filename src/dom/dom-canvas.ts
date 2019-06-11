import { Vector } from '../mathf/vector';


/**
 * Very basic HTML5 canvas helper methods.
 */
export class domCanvas {

    constructor() { }

    static setFillColor(context: CanvasRenderingContext2D, fillColor: string) {
        context.fillStyle = fillColor;
    }

    static setStrokeColor(context: CanvasRenderingContext2D, strokeColor: string) {
        context.strokeStyle = strokeColor;
    }

    static line(context: CanvasRenderingContext2D,
        x1: number, y1: number, x2: number, y2: number) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    /**
     * Display text at given coordinates.   Quick because this method is
     * just if you want to output something quickly without concent to
     * font-size style.
     * @param context
     * @param text
     */
    static quickText(context: CanvasRenderingContext2D, text: string,
        x: number, y: number) {
        context.font = '12px sans-serif';
        context.strokeText(text, x, y);
    }


    static point(context: CanvasRenderingContext2D, x: number, y: number,
        size: number = 5) {
        context.fillRect(x, y, size, size);
    }

    static vectorLine(context: CanvasRenderingContext2D,
        v1: Vector, v2: Vector) {
        domCanvas.line(context, v1.x, v1.y, v2.x, v2.y);
    }

    static vectorPoint(context: CanvasRenderingContext2D, v: Vector,
        size: number = 5) {
        domCanvas.point(context, v.x, v.y, size);
    }
}