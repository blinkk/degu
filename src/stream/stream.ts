

/**
 * An observable like class that uses getter / setter based mutation detection.
 *
 * ```ts
 *
 * let myStream = new Stream({
 *   name: John,
 *   age: 30
 * })
 *
 * myStream.observe('age', (data)=> {
 *   console.log('new age is', data.age);
 * })
 *
 * myStream.observe('name', (data)=> {
 *   console.log('new name is', data.name);
 * })
 *
 *
 * myStream.name = 'Amy';  // Triggers the subscriber above.
 * myStream.age = 30;  // Triggers the subscriber.
 *
 *
 *
 * ```
 */
export class Stream {
    /**
     * The data to watach and monitor.
     */
    private data: Object;
    private subscribers: Object;


    constructor(data: Object) {
        /**
         * The data set in which changes are monitored.
         */
        this.data = data;

        /**
         * All subscribers to given key values of the data object.
         * @param {Object}
         */
        this.subscribers = {}

    }


    /**
     *
     * @param key The key name in data property to watch.
     * @param subscriber The callback when a change has been detected to that
     *     property.
     */
    public observe(key: string, subscriber: Function) {
        if (!this.subscribers[key]) {
            this.subscribers[key] = [];
        }

        this.subscribers[key].push(subscriber);
    }



    /**
     * Loops through the current data set and makes each key in the object
     * as a reactive object.
     */
    private observeData(object: Object) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                this.watchKeyInObjectForChanges(object, key)
            }
        }
    }


    /**
     * When a given object property value is changed, notify change is called.
     * @param {string} key The key name of the property in which a change was
     *     detected.
     */
    private notifyChange(key: string) {
        if (!this.subscribers[key]) {
            return;
        }

        // Call all subscriber to the given key.
        this.subscribers[key].forEach((subscriber: Function) => {
            subscriber(this.data);
        })
    }


    /**
     * Sets up a base to watch any changes that happen on an object property by
     * modifying the getters and setters of an object to internally call
     * notifyChange when the object property has been modified.
     * @param {Object} object The object to modify.
     * @param {string} key The key in the object to modify.
     */
    private watchKeyInObjectForChanges(object: Object, key: string) {
        let value = object[key];

        Object.defineProperty(object, key, {
            get() {
                return value
            },
            set(newVal) {
                value = newVal
                this.notifyChange(key)
            }
        })
    }


}
