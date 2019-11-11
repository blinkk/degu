
/**
 * A class that helps with objects.
 */
export class objectf {

    /**
     * A quick JSON parse, stringify based copy.
     * This is fast but will destroy functions, Date etc so
     * has limited usage.
     * @param object
     */
    static jsonCopy(obj: Object): Object {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * A shallow 1 level equality check of objects.
     * @param a
     * @param b
     */
    static areEqual(a: Object, b: Object): boolean {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If the length of object isn't equal, we know they are equal.
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        return true;
    }


    /**
     * Copies an object (shallow).
     * @param object
     */
    static copy(obj: Object): Object {
        return Object.assign({}, obj);
    }

}