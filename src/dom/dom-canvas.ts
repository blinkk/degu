import {Vector} from '../mathf/vector';
import {color, ColorRGB} from '../mathf/color';

/**
 * Very basic HTML5 canvas helper methods.
 * @unstable
 */
export class domCanvas {
  constructor() {}

  static setFillColor(context: CanvasRenderingContext2D, fillColor: string) {
    context.fillStyle = fillColor;
  }

  static setStrokeColor(
    context: CanvasRenderingContext2D,
    strokeColor: string
  ) {
    context.strokeStyle = strokeColor;
  }

  static line(
    context: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
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
  static quickText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
  ) {
    context.font = '12px sans-serif';
    context.strokeText(text, x, y);
  }

  static point(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    size = 5
  ) {
    context.fillRect(x, y, size, size);
  }

  static vectorLine(context: CanvasRenderingContext2D, v1: Vector, v2: Vector) {
    domCanvas.line(context, v1.x, v1.y, v2.x, v2.y);
  }

  static vectorPoint(context: CanvasRenderingContext2D, v: Vector, size = 5) {
    domCanvas.point(context, v.x, v.y, size);
  }

  static vectorQuadrilateral(
    context: CanvasRenderingContext2D,
    v1: Vector,
    v2: Vector,
    v3: Vector,
    v4: Vector
  ) {
    context.beginPath();
    context.moveTo(v1.x, v1.y);
    context.lineTo(v2.x, v2.y);
    context.lineTo(v3.x, v3.y);
    context.lineTo(v4.x, v4.y);
    context.closePath();
    context.fill();
  }

  /**
   * Given a list of Vectors, draws lines from start to end.
   */
  static drawVectors(
    context: CanvasRenderingContext2D,
    vectors: Array<Vector>
  ) {
    context.beginPath();
    context.moveTo(vectors[0].x, vectors[0].y);
    vectors.forEach(v => {
      context.lineTo(v.x, v.y);
    });
    context.closePath();
    context.fill();
  }

  /**
   * Acquires the pixel color of given coordinates on the canvas.
   */
  static getColorAtPointAsRgb(
    context: CanvasRenderingContext2D,
    coords: Vector
  ): ColorRGB {
    const pixelData = context.getImageData(coords.x, coords.y, 1, 1).data;
    const rgb = {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2],
    };

    return rgb;
  }

  /**
   * Acquires the pixel color of given coordinates on the canvas
   * as returns it as a hex value.
   */
  static getColorAtPointAsHex(
    context: CanvasRenderingContext2D,
    coords: Vector
  ): string {
    const rgb = domCanvas.getColorAtPointAsRgb(context, coords);

    return color.rgbToHex(rgb);
  }
}
