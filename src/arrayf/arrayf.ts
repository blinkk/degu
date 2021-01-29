/**
 * A static class that helps with arrays.
 */
import {mathf} from '..';


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
     * Multiple score functions can be passed with later functions used only to
     * break ties for values returned from the previous score function.
     *
     * Example:
     * ```
     * const values = [{'a': 2, 'b': 3}, {'a': 1, 'b': 4}];
     * arrayf.max(values, (x) => x.a); // Returns {'a': 2, 'b': 3}
     * arrayf.max(values, (x) => x.b); // Returns {'a': 1, 'b': 4}
     * ```
     */
    static max<T>(values: T[], ...scoreFns: Array<(v: T) => number>): T {
        let maxValue: T;
        let maxScore = Number.NEGATIVE_INFINITY;
        const scoreFn = scoreFns[0];
        values.forEach((value) => {
            const score = scoreFn(value);
            if (maxScore < score) {
                maxValue = value;
                maxScore = score;
            } else if (maxScore === score && scoreFns.length > 1) {
                let i = 1;
                let tieBreaker = scoreFns[i];
                while (
                    i < scoreFns.length &&
                    tieBreaker(maxValue) === tieBreaker(value)
                ) {
                    tieBreaker = scoreFns[i++];
                }

                if (tieBreaker(maxValue) > tieBreaker(value)) {
                    maxValue = value;
                }
            }
        });
        return maxValue;
    }

    /**
     * Return value from array that generates the lowest return value when
     * passed as a parameter to the score function.
     *
     * Multiple score functions can be passed with later functions used only to
     * break ties for values returned from the previous score function.
     *
     * Example:
     * ```
     * const values = [{'a': 2, 'b': 3}, {'a': 1, 'b': 4}];
     * arrayf.max(values, (x) => x.a); // Returns {'a': 1, 'b': 4}
     * arrayf.max(values, (x) => x.b); // Returns {'a': 2, 'b': 3}
     * ```
     */
    static min<T>(values: T[], ...scoreFns: Array<(v: T) => number>): T {
        return arrayf.max(
            values,
            ...scoreFns.map((scoreFn) => {
                return (v: T) => -1 * scoreFn(v);
            }));
    }

    /**
     * Operates as per the built in slice with the option to wrap around from
     * the end of the array to the start and vice versa. Can also slice in the
     * reverse direction if given a negative value for `direction`.
     * @param values
     * @param startIndex
     * @param rawEndIndex
     * @param direction
     */
    static loopSlice<T>(
        values: T[], startIndex: number, rawEndIndex: number,
        direction: number = 1
    ): T[] {
        const result: T[] = [];
        const length = values.length;
        const increment = Math.sign(direction);
        const endIndex = mathf.wrap(rawEndIndex, 0, length);
        let index = mathf.wrap(startIndex, 0, length);
        while (index !== endIndex) {
            result.push(values[index]);
            index = mathf.wrap(index + increment, 0, length);
        }
        return result;
    }

    /**
     * Return the given values in order up until the value that returns a
     * false value when passed to the given condition function.
     * @param values
     * @param conditionFn
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
