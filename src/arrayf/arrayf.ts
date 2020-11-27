

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
     * Splits an array by a given split value. Useful when casting to string
     * for splitting won't cut it, such as when dealing with objects.
     *
     * ```
     * const a = {};
     * const b = {};
     * const c = {};
     * arrayf.split([a,b,c], b); // Returns [[a], [c]];
     * arrayf.split([a,b,c,b,c], b); // Returns [[a], [c], [c]];
     * arrayf.split([a,b,c,b,c], b, 1); // Returns [[a], [c, b, c]];
     * ```
     */
    static split<T>(
        values: T[],
        splitValue: T,
        limit: number = Number.POSITIVE_INFINITY
    ): T[][] {
        let remainder = values;
        const result = [];

        while (remainder.indexOf(splitValue) !== -1 && result.length < limit) {
            const splitPosition: number = remainder.indexOf(splitValue);
            const splitPiece: T[] = remainder.slice(0, splitPosition);
            remainder = remainder.slice(splitPosition + 1);
            result.push(splitPiece);
        }

        if (result.length < limit) {
            result.push(remainder);
        }

        return result;
    }
}
