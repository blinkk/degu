

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
     * Return value from array that generates the highest return value when
     * passed as a parameter to the score function.
     *
     * Example:
     * ```
     * const values = [{'a': 2, 'b': 3}, {'a': 1, 'b': 4}];
     * arrayf.max(values, (x) => x.a); // Returns {'a': 2, 'b': 3}
     * arrayf.max(values, (x) => x.b); // Returns {'a': 1, 'b': 4}
     * ```
     */
    static max<T>(values: T[], scoreFn: (v: T) => number): T {
        let maxValue;
        let maxScore = Number.NEGATIVE_INFINITY;
        values.forEach((value) => {
            const score = scoreFn(value);
            if (maxScore < score) {
                maxValue = value;
                maxScore = score;
            }
        });
        return maxValue;
    }
}
