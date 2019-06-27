

import { is } from '../is/is';
import { ColorRGBA, color } from '../mathf/color';

/**
 * The different types of structures that can be passed.
 * @see https://css-tricks.com/converting-color-spaces-in-javascript/
 */
enum CssUnitObjectTypes {
    /**
     * A number.
     */
    number = 'num',

    /**
     * A standard numerical value + unit such as '1px' or '10%'
     */
    unit = 'unit',

    /**
     * A css hex unit such as '#FFFFFF'
     */
    cssHex = 'cssHex',

    /**
     * A css rgba unit such as 'rgba(255, 255, 255, 0.3)'
     */
    rgba = 'rgba',

    /**
     * A css rgb unit such as 'rgba(255, 255, 255)'
     */
    rgb = 'rgb',
}

interface CssUnitObject {
    value: number | ColorRGBA | null,
    valueType: CssUnitObjectTypes | string | null;
    originalValue: string | null,
    unit: string | null
    type: CssUnitObjectTypes | string | null;
}


/**
 * A class that helps parsing of css units.
 *
 *
 * ```ts
 *
 * cssUnit.parse('10%').unit // %
 * cssUnit.parse('10%').type // unit
 * cssUnit.parse('10%').value // 10
 *
 *
 *
 * let rgba = 'rgba(255, 255, 255, 0.3)'
 * cssUnit.parse(rgba).unit // null
 * cssUnit.parse(rgba).type // rgba
 * cssUnit.parse(rgba).value // Return ColorRgba
 * cssUnit.parse(rgba).value.r // 255
 * cssUnit.parse(rgba).value.g // 255
 * cssUnit.parse(rgba).value.b // 255
 * cssUnit.parse(rgba).value.a // a
 *
 *
 * let hex = '#FFFFFF'
 * cssUnit.parse(rgba).unit // null
 * cssUnit.parse(rgba).type // cssHex
 * cssUnit.parse(rgba).originalValue // '#FFFFFF'
 * cssUnit.parse(rgba).value // Return ColorRgba (we use rgba as the centeral unit)
 * cssUnit.parse(rgba).value.r // 255
 * cssUnit.parse(rgba).value.g // 255
 * cssUnit.parse(rgba).value.b // 255
 * cssUnit.parse(rgba).value.a // a
 *
 * let rgba = 'rgb(255, 255, 255)'
 * cssUnit.parse(rgba).unit // null
 * cssUnit.parse(rgba).type // rgba
 * cssUnit.parse(rgba).value // Return ColorRgba
 *
 * ```
 */
export class cssUnit {

    /**
     * Takes a css unit value like '10px' or '20vw' and parses it into
     * a CssUnitObject.
     * @param css
     */
    static parse(css: string): CssUnitObject {
        const value = css.match(/\d+/g);
        const unit = css.match(/[a-zA-Z%]+/g);

        let result: CssUnitObject = {
            value: null,
            unit: null,
            type: null,
            valueType: null,
            originalValue: css,
        };


        if (is.cssHex(css)) {
            result.value = color.cssToRgba(css);
            result.type = CssUnitObjectTypes.cssHex;
            result.valueType = CssUnitObjectTypes.rgba;
        } else if (is.cssRgba(css)) {
            result.type = CssUnitObjectTypes.rgba;
            result.value = color.cssToRgba(css);
            result.valueType = CssUnitObjectTypes.rgba;
        } else if (is.cssRgb(css)) {
            result.type = CssUnitObjectTypes.rgb;
            result.value = color.cssToRgba(css);
            result.valueType = CssUnitObjectTypes.rgba;
        } else {
            result.value = value ? +value[0] : null;
            result.unit = unit ? unit[0] : null;
            result.type = CssUnitObjectTypes.unit;
            result.valueType = CssUnitObjectTypes.number;
        }

        result.originalValue = css;


        return result;
    }




}