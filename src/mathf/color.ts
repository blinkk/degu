import * as mathf from '../mathf/mathf';
import * as is from '../is/is';

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}
/**
 * Converts a hex value such as 0xffffff to normalized Rbg values.
 *
 * ```ts
 * color.hexToRgbNormalized(0xffffff) // >> [1, 1, 1];
 * ```
 * @param hexValue
 */
export function hexToRgbNormalized(hexValue: number) {
  const out = [];
  out[0] = ((hexValue >> 16) & 0xff) / 255;
  out[1] = ((hexValue >> 8) & 0xff) / 255;
  out[2] = (hexValue & 0xff) / 255;

  return out;
}

/**
 * Converts a colorRGB to an rgb array.
 */
export function colorRgbToRgb(colorRgb: ColorRGB): Array<number> {
  return [colorRgb.r, colorRgb.g, colorRgb.b];
}

/**
 * Converts normalized rgb values back out to hex.
 * ```ts
 * color.normalizedRgbToHex([1,1,1]) // >> 0xFFFFFF
 * ```
 * @param rgb
 */
export function normalizedRgbToHex(rgb: Array<number>) {
  return ((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + ((rgb[2] * 255) | 0);
}

/**
 * Converts rgb to normalized rgb.
 * ```ts
 * color.rgbToNormalizedRgb([255,255,255]) // >> [1,1,1]
 * color.rgbToNormalizedRgb([0,0,0]) // >> [0,0,0]
 * ```
 *
 * @param rgb
 */
export function rgbToNormalizedRgb(rgb: Array<number>): Array<number> {
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

/**
 * Converts normalized rgb to rgb.
 * ```ts
 * color.normalizedRgbToRgb([1,1,1]) // >> [255,255,255]
 * color.normalizedRgbToRgb([0,0,0]) // >> [0,0,0]
 * ```
 *
 * @param rgb
 */
export function normalizedRgbToRgb(rgb: Array<number>): Array<number> {
  return [(rgb[0] * 255) >> 0, (rgb[1] * 255) >> 0, (rgb[2] * 255) >> 0];
}

/**
 * A stardard lerp between two rgba values.  This simple algo is a
 * straight line interpolation and isn't always going to
 * guarantee the right hue between values.  In short,
 * it's not gonna be very colorful between values.
 *
 * ```ts
 *
 * let a = { r: 0, g: 0, b: 0, a: 0};
 * let b = { r: 255, g: 255, b: 255, a: 1};
 * let lerp = color.rgbaLerp(a, b, 0.5);
 * ```
 *
 * @param start The starting rgba color.
 * @param end The ending rgba color.
 * @param t The current progress.j
 */
export function rgbaLerp(
  start: ColorRGBA,
  end: ColorRGBA,
  t: number
): ColorRGBA {
  return {
    r: mathf.lerp(start.r, end.r, t) >> 0,
    g: mathf.lerp(start.g, end.g, t) >> 0,
    b: mathf.lerp(start.b, end.b, t) >> 0,
    a: mathf.lerp(start.a, end.a, t),
  };
}

/**
 * Similar to to [[color.rgbaLerp]] but uses ease.
 * @param start
 * @param end
 * @param t
 */
export function rgbaEase(
  start: ColorRGBA,
  end: ColorRGBA,
  t: number,
  ease: Function
): ColorRGBA {
  return {
    r: mathf.ease(start.r, end.r, t, ease) >> 0,
    g: mathf.ease(start.g, end.g, t, ease) >> 0,
    b: mathf.ease(start.b, end.b, t, ease) >> 0,
    a: mathf.ease(start.a, end.a, t, ease),
  };
}

/**
 * Converts an rgb out to a standard hex value.
 *
 * Modified version of:
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 *
 * ```ts
 *
 * color.rgbToHex({r: 255, g: 255, b: 255}); // #FFFFFF
 * color.rgbToHex({r: 0, g: 0, b: 0}); // #000000
 *
 * // You can pass RGBA but it will simply get ignored.
 * color.rgbToHex({r: 255, g: 255, b: 255, a: 1}); // #FFFFFF
 * ```
 * @param rgb
 */
export function rgbToHex(rgb: ColorRGB | ColorRGBA): string {
  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

/**
 * Converts a hex value to rgb.
 * Modified version of:
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
export function hexToRgba(hex: string, a = 1): ColorRGBA | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let rgba = null;
  if (result) {
    rgba = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: a,
    };
  }
  return rgba;
}

/**
 * Converts a css color name constant to a hex value
 *
 * ```ts
 * color.cssToRgba('blue') // '#0000FF'
 * color.cssToRgba('dodgerblue') // #1E90FF
 */
export function cssColorNameToHex(css: string) {
  const mapping = new Map([
    ['black', '#000000'],
    ['navy', '#000080'],
    ['darkblue', '#00008B'],
    ['mediumblue', '#0000CD'],
    ['blue', '#0000FF'],
    ['darkgreen', '#006400'],
    ['green', '#008000'],
    ['teal', '#008080'],
    ['darkcyan', '#008B8B'],
    ['deepskyblue', '#00BFFF'],
    ['darkturquoise', '#00CED1'],
    ['mediumspringgreen', '#00FA9A'],
    ['lime', '#00FF00'],
    ['springgreen', '#00FF7F'],
    ['aqua', '#00FFFF'],
    ['cyan', '#00FFFF'],
    ['midnightblue', '#191970'],
    ['dodgerblue', '#1E90FF'],
    ['lightseagreen', '#20B2AA'],
    ['forestgreen', '#228B22'],
    ['seagreen', '#2E8B57'],
    ['darkslategray', '#2F4F4F'],
    ['darkslategrey', '#2F4F4F'],
    ['limegreen', '#32CD32'],
    ['mediumseagreen', '#3CB371'],
    ['turquoise', '#40E0D0'],
    ['royalblue', '#4169E1'],
    ['steelblue', '#4682B4'],
    ['darkslateblue', '#483D8B'],
    ['mediumturquoise', '#48D1CC'],
    ['indigo', '#4B0082'],
    ['darkolivegreen', '#556B2F'],
    ['cadetblue', '#5F9EA0'],
    ['cornflowerblue', '#6495ED'],
    ['rebeccapurple', '#663399'],
    ['mediumaquamarine', '#66CDAA'],
    ['dimgray', '#696969'],
    ['dimgrey', '#696969'],
    ['slateblue', '#6A5ACD'],
    ['olivedrab', '#6B8E23'],
    ['slategray', '#708090'],
    ['slategrey', '#708090'],
    ['lightslategray', '#778899'],
    ['lightslategrey', '#778899'],
    ['mediumslateblue', '#7B68EE'],
    ['lawngreen', '#7CFC00'],
    ['chartreuse', '#7FFF00'],
    ['aquamarine', '#7FFFD4'],
    ['maroon', '#800000'],
    ['purple', '#800080'],
    ['olive', '#808000'],
    ['gray', '#808080'],
    ['grey', '#808080'],
    ['skyblue', '#87CEEB'],
    ['lightskyblue', '#87CEFA'],
    ['blueviolet', '#8A2BE2'],
    ['darkred', '#8B0000'],
    ['darkmagenta', '#8B008B'],
    ['saddlebrown', '#8B4513'],
    ['darkseagreen', '#8FBC8F'],
    ['lightgreen', '#90EE90'],
    ['mediumpurple', '#9370DB'],
    ['darkviolet', '#9400D3'],
    ['palegreen', '#98FB98'],
    ['darkorchid', '#9932CC'],
    ['yellowgreen', '#9ACD32'],
    ['sienna', '#A0522D'],
    ['brown', '#A52A2A'],
    ['darkgray', '#A9A9A9'],
    ['darkgrey', '#A9A9A9'],
    ['lightblue', '#ADD8E6'],
    ['greenyellow', '#ADFF2F'],
    ['paleturquoise', '#AFEEEE'],
    ['lightsteelblue', '#B0C4DE'],
    ['powderblue', '#B0E0E6'],
    ['firebrick', '#B22222'],
    ['darkgoldenrod', '#B8860B'],
    ['mediumorchid', '#BA55D3'],
    ['rosybrown', '#BC8F8F'],
    ['darkkhaki', '#BDB76B'],
    ['silver', '#C0C0C0'],
    ['mediumvioletred', '#C71585'],
    ['indianred', '#CD5C5C'],
    ['peru', '#CD853F'],
    ['chocolate', '#D2691E'],
    ['tan', '#D2B48C'],
    ['lightgray', '#D3D3D3'],
    ['lightgrey', '#D3D3D3'],
    ['thistle', '#D8BFD8'],
    ['orchid', '#DA70D6'],
    ['goldenrod', '#DAA520'],
    ['palevioletred', '#DB7093'],
    ['crimson', '#DC143C'],
    ['gainsboro', '#DCDCDC'],
    ['plum', '#DDA0DD'],
    ['burlywood', '#DEB887'],
    ['lightcyan', '#E0FFFF'],
    ['lavender', '#E6E6FA'],
    ['darksalmon', '#E9967A'],
    ['violet', '#EE82EE'],
    ['palegoldenrod', '#EEE8AA'],
    ['lightcoral', '#F08080'],
    ['khaki', '#F0E68C'],
    ['aliceblue', '#F0F8FF'],
    ['honeydew', '#F0FFF0'],
    ['azure', '#F0FFFF'],
    ['sandybrown', '#F4A460'],
    ['wheat', '#F5DEB3'],
    ['beige', '#F5F5DC'],
    ['whitesmoke', '#F5F5F5'],
    ['mintcream', '#F5FFFA'],
    ['ghostwhite', '#F8F8FF'],
    ['salmon', '#FA8072'],
    ['antiquewhite', '#FAEBD7'],
    ['linen', '#FAF0E6'],
    ['lightgoldenrodyellow', '#FAFAD2'],
    ['oldlace', '#FDF5E6'],
    ['red', '#FF0000'],
    ['fuchsia', '#FF00FF'],
    ['magenta', '#FF00FF'],
    ['deeppink', '#FF1493'],
    ['orangered', '#FF4500'],
    ['tomato', '#FF6347'],
    ['hotpink', '#FF69B4'],
    ['coral', '#FF7F50'],
    ['darkorange', '#FF8C00'],
    ['lightsalmon', '#FFA07A'],
    ['orange', '#FFA500'],
    ['lightpink', '#FFB6C1'],
    ['pink', '#FFC0CB'],
    ['gold', '#FFD700'],
    ['peachpuff', '#FFDAB9'],
    ['navajowhite', '#FFDEAD'],
    ['moccasin', '#FFE4B5'],
    ['bisque', '#FFE4C4'],
    ['mistyrose', '#FFE4E1'],
    ['blanchedalmond', '#FFEBCD'],
    ['papayawhip', '#FFEFD5'],
    ['lavenderblush', '#FFF0F5'],
    ['seashell', '#FFF5EE'],
    ['cornsilk', '#FFF8DC'],
    ['lemonchiffon', '#FFFACD'],
    ['floralwhite', '#FFFAF0'],
    ['snow', '#FFFAFA'],
    ['yellow', '#FFFF00'],
    ['lightyellow', '#FFFFE0'],
    ['ivory', '#FFFFF0'],
    ['white', '#FFFFFF'],
  ]);
  return mapping.get(css);
}

/**
 * Converts a css like rgba string to an RGBA object.
 *
 * ```ts
 *
 * color.cssToRgba('#FFFFFF') // { r: 255, b: 255, g: 255, a: 1}
 * color.cssToRgba('rgba(255, 255, 255, 0.3)') // { r: 255, b: 255, g: 255, a: 0.3}
 * color.cssToRgb('rgb(255, 255, 255)') // { r: 255, b: 255, g: 255, a: 1}
 *
 * color.cssToRgba(20) // null
 * color.cssToRgba('hello') // null
 * ```
 */
export function cssToRgba(css: string): ColorRGBA | null {
  if (is.cssColorName(css)) {
    return hexToRgba(cssColorNameToHex(css));
  }

  if (is.cssHex(css)) {
    return hexToRgba(css);
  }

  if (is.cssRgb(css)) {
    // We are just going to modify the rgb string to be rgba like
    // and process it as a rgba type string.
    css = css.replace(')', ',1)');
    css = css.replace('rgb', 'rgba');
  }

  if (is.cssRgba(css)) {
    const match = css.match(
      /^rgba\(\s*?(\d{1,3})\s*?,\s*?(\d{1,3})\s*?,\s*?(\d{1,3})\s*?,\s*?(\d*(?:\.\d+)?)\)$/
    );
    if (match) {
      const rgba = {
        r: +match[1],
        g: +match[2],
        b: +match[3],
        a: +match[4],
      };

      return rgba;
    } else {
      return null;
    }
  }

  return null;
}

/**
 * Converts ColorRGBA to a css string.
 *
 * ```ts
 *
 * color.rgbaToCss({r: 255, g: 255, b: 255, a: 1}); // rgba(255, 255, 255, 1)
 *
 * ```
 *
 * @param rgba
 */
export function rgbaToCss(rgba: ColorRGBA): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

/**
 * A class that helps with color transformations.
 *
 * @see https://www.alanzucconi.com/2016/01/06/colour-interpolation/
 */
export const color = {
  hexToRgbNormalized,
  colorRgbToRgb,
  normalizedRgbToHex,
  rgbToNormalizedRgb,
  normalizedRgbToRgb,
  rgbaLerp,
  rgbaEase,
  rgbToHex,
  hexToRgba,
  cssToRgba,
  rgbaToCss,
};
