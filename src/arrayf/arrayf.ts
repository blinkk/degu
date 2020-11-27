

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
     * Given an index that could be out-of-range for an array of the given
     * length, it will return a valid index, as if the array values looped
     * infinitely.
     *
     * ```
     * wrapIndex(2, 7); // Returns 2
     * wrapIndex(10, 7); // Returns 3
     * wrapIndex(21, 7); // Returns 0
     * wrapIndex(-1, 7); // Returns 6
     * ```
     */
    static wrapIndex(index: number, length: number): number {
        if (index < 0) {
            return length + (index % length);
        } else {
            return index % length;
        }
    }
}
