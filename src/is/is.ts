
/**
 * A utility function that generally tests the state of things.
 */
export class is {

    /**
     * Helper function to do true type checking.
     * See https://gomakethings.com/true-type-checking-with-vanilla-js/
     * @param value
     * @param type
     */
    static type(value: any, type: String): boolean {
        const trueType =
            Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
        return type == trueType;
    }


    /**
     * @param value
     * @tested
     */
    static boolean(value: any): boolean {
        return is.type(value, 'boolean');
    }

    /**
     * @param value
     * @tested
     */
    static array(value: any): boolean {
        return is.type(value, 'array');
    }

    /**
     * @param value
     * @tested
     */
    static string(value: any): boolean {
        return is.type(value, 'string');
    }

    /**
     * @param value
     * @tested
     */
    static date(value: any) {
        return is.type(value, 'date');
    }

    /**
     * @param value
     * @tested
     */
    static number(value: any): boolean {
        return is.type(value, 'number');
    }

    /**
     * @param value
     * @tested
     */
    static function(value: any): boolean {
        return is.type(value, 'function');
    }

    /**
     * @param value
     * @tested
     */
    static null(value: any): boolean {
        return is.type(value, 'null');
    }

    /**
     * @param value
     * @tested
     */
    static undefined(value: any): boolean {
        return is.type(value, 'undefined');
    }

    /**
     * @param value
     * @tested
     */
    static defined(value: any): boolean {
        return !is.undefined(value);
    }

    /**
     * @param value
     * @tested
     */
    static regex(value: any): boolean {
        return is.type(value, 'regexp');
    }

    /**
     * @param value
     * @tested
     */
    static object(value: any): boolean {
        return is.type(value, 'object');
    }

    /**
     * @param value
     * @tested
     */
    static int(value: any): boolean {
        return is.number(value) && value % 1 == 0;
    }

    /**
     * @param value
     * @tested
     */
    static float(value: any): boolean {
        return is.number(value) && !is.int(value);
    }

    /**
     * @param value
     * @tested
     */
    static multipleOf(value: any, multiple: number): boolean {
        return is.number(value) && value % multiple == 0;
    }

    /**
     * @param value
     * @tested
     */
    static powerOf2(value: number): boolean {
        return value !== 0 && (value & (value - 1)) === 0;
    }

    /**
     * @param value
     * @tested
     */
    static even(value: any): boolean {
        return is.number(value) && is.multipleOf(value, 2);
    }

    /**
     * @param value
     * @tested
     */
    static odd(value: any): boolean {
        return is.number(value) && !is.even(value);
    }


    /**
     * https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
     * @param value
     * @tested
     */
    static nan(value: any): boolean {
        return value !== value;
    }

    static mobile(): boolean {
        return is.ios() || is.android();
    }


    static ios(): boolean {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    static android(): boolean {
        return /Android/i.test(navigator.userAgent);
    }

    static chrome(): boolean {
        return navigator.userAgent.indexOf('Chrome') != -1;
    }

    static safari(): boolean {
        return !is.chrome() && navigator.userAgent.indexOf('Safari') != -1;
    }

    static firefox(): boolean {
        return navigator.userAgent.indexOf('Firefox') != -1;
    }

    static ie(): boolean {
        return /MSIE\/\d+/.test(navigator.userAgent);
    }

    static ieOrEdge(): boolean {
        return /Edge\/\d+/.test(navigator.userAgent) ||
            /MSIE\/\d+/.test(navigator.userAgent) ||
            /Trident\/\d+/.test(navigator.userAgent);
    }

    static chromeOs(): boolean {
        return /\bCrOS\b/.test(navigator.userAgent)
    }


    /**
     * Detects support for offscreen canvas.
     * https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
     */
    static supportingOffScreenCanvas(): boolean {
        return !!window['OffscreenCanvas'];
    }

    /**
     * Detects support for webp images
     */
    static supportingWebp(): boolean {
        var elem = document.createElement('canvas');
        var canvasSupported = false;
        if (elem.toDataURL('image/webp')) {
            canvasSupported =
                elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
        }
        return canvasSupported;
    }

    /**
     * Whether the browser can handle more advanced css calc.
     * @see https://css-tricks.com/making-custom-properties-css-variables-dynamic/
     */
    static supportingAdvancedCssCalc(): boolean {
        document.body.style.transitionTimingFunction = 'cubic-bezier(calc(1 * 1),1,1,1)';
        return getComputedStyle(document.body).transitionTimingFunction != 'ease';
    }


    /**
     * Whether touch is supported or not.
     */
    static supportingTouch(): boolean {
        return (('ontouchstart' in window) || window['DocumentTouch'] && document instanceof window['DocumentTouch']);
    }


    /**
     * Whether device orientation is supported
     */
    static supportingDeviceOrientation(): boolean {
        return !!window['DeviceOrientationEvent'] as any;
    }


    /**
     * A string value that appears to be a css hex.
     *
     * ```
     * is.cssHex('#FFFFFF') // true
     * is.cssHex('#ffffff') // true
     * is.cssHex('FFFFFF') // false
     * is.cssHex(0) // false
     *
     * ```
     */
    static cssHex(value: any): boolean {
        return is.string(value) && value.startsWith('#');
    }


    /**
     * A string value that appears to be a css rgba like.
     *
     * ```
     * is.cssRgba("rgba(255, 255, 255, 0.3)") // true
     * is.cssRgba("rgba()") // true
     * is.cssRgba('rgb('255, 255, 255)') // false
     *
     * ```
     */
    static cssRgba(value: any) {
        return is.string(value) && value.startsWith('rgba(');
    }

    /**
     * A string value that appears to be a css rgb like.
     *
     * ```
     * is.cssRgb("rgb(255, 255, 255)") // true
     * is.cssRgb("rgba(')") // false
     * is.cssRgb(90) // false
     *
     * ```
     */
    static cssRgb(value: any) {
        return is.string(value) && value.startsWith('rgb(');
    }


    /**
     * Tests whether this is a hex value.
     * ```
     * is.hex('#FFFFFF') // false -> starts with #.
     * is.hex('FFFFFF') // true
     * is.hex('ffffff') // true
     * is.hex(0) // false
     *
     * ```
     * @param value
     */
    static hex(value: any): boolean {
        var a = parseInt(value, 16);
        return is.string(value) && (a.toString(16) === value.toLowerCase())
    }
}