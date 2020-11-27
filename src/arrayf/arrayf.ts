

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
     * Removes the first instance of the value from the given array.
     * Not a complex function but `removeFirstInstance` is more readable than
     * the function contents.
     * ```
     * const values = [1, 1, 2, 3, 5, 8];
     * removeFirstInstance(values, 1); // Returns [1, 2, 3, 5, 8]
     * ```
     */
    static removeFirstInstance<T>(values: T[], value: T): T[] {
        return [
            ...values.slice(0, values.indexOf(value)),
            ...values.slice(values.indexOf(value) + 1)];
    }
}
