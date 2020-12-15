

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
     * Zips arrays together. zip(['a', 'b'], [1, 2]) becomes
     * [['a', 1], ['b', 2]]
     */
    static zip<T>(...lists: T[][]): T[][] {
        const result = [];
        let i = 0;
        let remainingLists = lists.filter((list) => list.length > i);
        while (remainingLists.length) {
            result[i] = remainingLists.map((list) => list[i]);
            i++;
            remainingLists = remainingLists.filter((list) => list.length > i);
        }
        return result;
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

    /**
     * Determines if the value in each index of each list matches the
     * corresponding value in that same index in each other list.
     * @param lists
     */
    static areArrayValuesIdentical<T>(lists: T[][]): boolean {
        // Short circuit on null values
        if (!lists.every((list: T[]) => list instanceof Array)) {
            return false;
        }
        // Check all lists have same lengths
        const lengths = lists.map((list: T[]) => list.length);
        const haveIdenticalLengths = arrayf.containsIdenticalValues(lengths);
        if (!haveIdenticalLengths) {
            return false;
        }
        // Verify that values match across lists
        return arrayf.zip(...lists)
            .every((zippedValues: T[]) => {
                return arrayf.containsIdenticalValues(zippedValues);
            });
    }

    /**
     * Determine if each value in the array is the same value.
     */
    static containsIdenticalValues<T>(values: T[]): boolean {
        return values.length === 0 ||
            values.every((value) => values[0] === value);
    }

    /**
     * Removes the first instance of a value from the given array.
     * Useful when tracking the places a singleton or service is used so that
     * it can dispose of itself when no longer needed.
     */
    static removeFirstInstance<T>(values: T[], value: T): T[] {
        return [
            ...values.slice(0, values.indexOf(value)),
            ...values.slice(values.indexOf(value) + 1)];
    }
}
