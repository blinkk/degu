import { mathf } from './mathf';

interface ColorRGBA {
    r: number,
    g: number,
    b: number,
    a: number
}

interface ColorRGB {
    r: number,
    g: number,
    b: number
}


interface ColorHSV {
    h: number,
    s: number,
    v: number
}


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
            r: mathf.lerp(start.r, end.r, t),
            g: mathf.lerp(start.g, end.g, t),
            b: mathf.lerp(start.b, end.b, t),
            a: mathf.lerp(start.a, end.a, t)
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
}