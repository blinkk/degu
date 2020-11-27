

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
    static zip<T>(...lists:T[][]): T[][] {
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

}
