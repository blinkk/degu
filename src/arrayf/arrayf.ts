

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


}