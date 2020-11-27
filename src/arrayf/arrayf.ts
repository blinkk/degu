

/**
 * A static class that helps with arrays.
 */
export class arrayf {


    /**
     * A deep copy that works with objects or arrays.
     */
    static deepCopy(input: Array<any> | Object):Array<any>|Object {
        let output, value, key;

        if (typeof input !== "object" || input === null) {
            return input;
        }

        output = Array.isArray(input) ? [] : {}

        for (key in input) {
            value = input[key]

            output[key] = (typeof value === "object" && value !== null) ?
                arrayf.deepCopy(value) : value;
        }

        return output;
    }

    /**
     * Return every value before the first occurrence of a value that evaluates
     * to false when passed to the conditionFn.
     * ```
     * // Returns [1, 3, 7]
     * arrayf.filterUntilFalse([1,3,7,40,2,6], (x) => x < 10);
     * ```
     */
    static filterUntilFalse<T>(
        values: T[], conditionFn: (value: T, index: number) => boolean
    ): T[] {
        let index: number = 0;
        while (index < values.length && conditionFn(values[index], index)) {
            index++;
        }
        return values.slice(0, index);
    }
}
