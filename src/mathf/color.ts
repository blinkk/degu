import { mathf } from './mathf';
import { is } from '..';

export interface ColorRGBA {
    r: number,
    g: number,
    b: number,
    a: number
}

export interface ColorRGB {
    r: number,
    g: number,
    b: number
}



/**
 * A class that helps with color transformations.
 *
 * @see https://www.alanzucconi.com/2016/01/06/colour-interpolation/
 */
export class color {

    constructor() { }

    /**
     * Converts a hex value such as 0xffffff to normalized Rbg values.
     *
     * ```ts
     * color.hexToRgbNormalized(0xffffff) // >> [1, 1, 1];
     * ```
     * @param hexValue
     */
    static hexToRgbNormalized(hexValue: number) {
        const out = [];
        out[0] = ((hexValue >> 16) & 0xFF) / 255;
        out[1] = ((hexValue >> 8) & 0xFF) / 255;
        out[2] = (hexValue & 0xFF) / 255;

        return out;
    }


    /**
     * Converts normalized rgb values back out to hex.
     * ```ts
     * color.normalizedRgbToHex([1,1,1]) // >> 0xFFFFFF
     * ```
     * @param rgb
     */
    static normalizedRgbToHex(rgb: Array<number>) {
        return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
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
    static rgbaLerp(start: ColorRGBA, end: ColorRGBA, t: number): ColorRGBA {
        return {
            r: mathf.lerp(start.r, end.r, t) >> 0,
            g: mathf.lerp(start.g, end.g, t) >> 0,
            b: mathf.lerp(start.b, end.b, t) >> 0,
            a: mathf.lerp(start.a, end.a, t)
        }
    }

    /**
     * Similar to to [[color.rgbaLerp]] but uses ease.
     * @param start
     * @param end
     * @param t
     */
    static rgbaEase(start: ColorRGBA, end: ColorRGBA, t: number, ease: Function): ColorRGBA {
        return {
            r: mathf.ease(start.r, end.r, t, ease) >> 0,
            g: mathf.ease(start.g, end.g, t, ease) >> 0,
            b: mathf.ease(start.b, end.b, t, ease) >> 0,
            a: mathf.ease(start.a, end.a, t, ease)
        }
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
    static rgbToHex(rgb: ColorRGB | ColorRGBA): string {
        let r = rgb.r;
        let g = rgb.g;
        let b = rgb.b;
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16).slice(1).toUpperCase();
    }



    /**
     * Converts a hex value to rgb.
     * Modified version of:
     * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     */
    static hexToRgba(hex: string, a: number = 1): ColorRGBA | null {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var rgba = null;
        if (result) {
            rgba = {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                a: a
            }
        }
        return rgba;
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
    static cssToRgba(css: string): ColorRGBA | null {
        if (is.cssHex(css)) {
            return color.hexToRgba(css);
        }

        if (is.cssRgb(css)) {
            // We are just going to modify the rgb string to be rgba like
            // and process it as a rgba type string.
            css = css.replace(')', ',1)');
            css = css.replace('rgb', 'rgba');
        }

        if (is.cssRgba(css)) {
            var match = css.match(/^rgba\(\s*?(\d{1,3})\s*?,\s*?(\d{1,3})\s*?,\s*?(\d{1,3})\s*?,\s*?(\d*(?:\.\d+)?)\)$/);
            if (match) {
                const rgba = {
                    r: +match[1],
                    g: +match[2],
                    b: +match[3],
                    a: +match[4]
                }

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
    static rgbaToCss(rgba: ColorRGBA): string {
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }
}