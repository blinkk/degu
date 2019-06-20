

export class color {

    constructor() { }

    /**
     * Converts a hex value such as 0xffffff to normalized Rbg values.
     *
     * ```ts
     * Color.hexToRgbNormalized(0xffffff) // >> [1, 1, 1];
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
     * Color.normalizedRgbToHex([1,1,1]) // >> 0xFFFFFF
     * ```
     * @param rgb
     */
    static normalizedRgbToHex(rgb: Array<number>) {
        return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
    }


}