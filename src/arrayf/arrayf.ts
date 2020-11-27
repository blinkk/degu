

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
     * Given a set of values and score functions returns the value with the
     * lowest score. If two objects tie using the first score function then the
     * next given score function (if any) is used to break the tie.
     * ```
     * const values = [2.2, 2.1, 3.4];
     * const fnA = (x) => Math.floor(x);
     * const fnB = (x) => x;
     * arrayf.min(values, fnA); // Returns 2.2
     * arrayf.min(values, fnA, fnB); // Returns 2.1
     * ```
     */
    static min<T>(values: T[], ...scoreFns: Array<(v: T) => number>): T {
        let minValue: T;
        let minScore: number = Number.POSITIVE_INFINITY;

        const scoreFn = scoreFns[0];

        values.forEach((value) => {
            const score = scoreFn(value);
            if (minScore > score) {
                minValue = value;
                minScore = score;
            } else if (minScore === score && scoreFns.length > 1) {
                let i = 1;
                let tieBreaker = scoreFns[i];
                while (
                    i < scoreFns.length &&
                    tieBreaker(minValue) === tieBreaker(value)
                ) {
                    tieBreaker = scoreFns[i++];
                }

                if (tieBreaker(minValue) > tieBreaker(value)) {
                    minValue = value;
                }
            }
        });
        return minValue;
    }
}
