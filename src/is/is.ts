
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
    static type(value: any, type: String) {
        const trueType =
            Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
        return type == trueType;
    }


    /**
     * @param value
     * @tested
     */
    static boolean(value: any) {
        return is.type(value, 'boolean');
    }

    /**
     * @param value
     * @tested
     */
    static array(value: any) {
        return is.type(value, 'array');
    }

    /**
     * @param value
     * @tested
     */
    static string(value: any) {
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
    static number(value: any) {
        return is.type(value, 'number');
    }

    /**
     * @param value
     * @tested
     */
    static function(value: any) {
        return is.type(value, 'function');
    }

    /**
     * @param value
     * @tested
     */
    static null(value: any) {
        return is.type(value, 'null');
    }

    /**
     * @param value
     * @tested
     */
    static undefined(value: any) {
        return is.type(value, 'undefined');
    }

    /**
     * @param value
     * @tested
     */
    static regex(value: any) {
        return is.type(value, 'regexp');
    }

    /**
     * @param value
     * @tested
     */
    static object(value: any) {
        return is.type(value, 'object');
    }

    /**
     * @param value
     * @tested
     */
    static int(value: any) {
        return is.number(value) && value % 1 == 0;
    }

    /**
     * @param value
     * @tested
     */
    static float(value: any) {
        return is.number(value) && !is.int(value);
    }

    /**
     * @param value
     * @tested
     */
    static multipleOf(value: any, multiple: number) {
        return is.number(value) && value % multiple == 0;
    }

    /**
     * @param value
     * @tested
     */
    static even(value: any) {
        return is.number(value) && is.multipleOf(value, 2);
    }

    /**
     * @param value
     * @tested
     */
    static odd(value: any) {
        return is.number(value) && !is.even(value);
    }


    /**
     * https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
     * @param value
     * @tested
     */
    static nan(value: any) {
        return value !== value;
    }



}