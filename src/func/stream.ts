
import { is } from '../is/is';

/**
 * An observable like class that uses getter / setter based mutation detection.
 * This class is useful in creating a central data store and implementing the
 * observer pattern.
 *
 *
 * TODO (uxder): The main draw back of this class is possible conflicts with
 * obfuscation since this.markObservable takes a string but in reality, that
 * might be changed per compiler.
 *
 *
 *
 * Start by extending the Stream class. And define your own properties.
 *
 * ```ts
 * class MyStream extends Stream {
 *   public name: string;
 *   public age: number;
 *   private count: number;
 *   constructor() {
 *     super();
 *
 *     // Set the initial values.
 *     this.name = 'John';
 *     this.age = 23;
 *
 *     // Count will be a non-observable. Changing this won't trigger any pushes.
 *     this.count = 0;
 *
 *     // Make name and age as observable properties.
 *     this.markObservable('name');
 *     this.markObservable('age');
 *   }
 *
 * }
 *
 *
 * // Create instance.
 * let myStream = new MyStream();
 *
 * ```
 *
 * Now set up your observers to react to changes.
 * There are two types.
 * - change --> called whenever ANY change happens on observed properties.
 * - watch --> watches a specfic property
 *
 * ```ts
 *
 * // CHANGE: Runs when ANY change happens to data object.
 * myStream.change((data)=> {
 *   console.log(some change happened);
 * })
 *
 *
 * // WATCH: Allows you to watch specific changes
 * myStream.watch('age', (data)=> {
 *   console.log('new age is', data.age);
 * })
 *
 * myStream.watch('name', (data)=> {
 *   console.log('new name is', data.name);
 * })
 *
 * ```
 *
 *
 * Now change the object as you need.
 *
 * ```ts
 * myStream.name = 'Amy';  // Triggers name watcher and change once.
 * myStream.age = 30;  // Triggers age watcher and change once.
 *
 *
 * // Use set data to make bulk data changes.
 * // The main difference is that change is called only once at the end
 * // of setData.
 * myStream.setData({
 *   name: 'Riki',
 *   age: 34
 * })
 *
 *
 * // To force a run
 * myStream.publish(); // Triggers change.
 * myStream.publishForKey('name'); // Tiggers name watchers to be called.
 *
 * ```
 *
 * You may also need to freeze at some points.  Freezing temporarily
 * disabled all updates while you make changes.  At the point of unfreeze,
 * all change / watch subscribers are notified.
 *
 *
 * ```ts
 * myStream.freeze();
 * myStream.name = 'Amy';  // Doesn't trigger
 * myStream.age = 30;  // Doesn't trigger
 * myStream.name = 'Santa';  // Doesn't trigger
 *
 * myStream.unfreeze(); // Now will trigger, change, name and age watchers once.
 *
 * ```
 *
 */
export class Stream {
    private observedKeys: Array<string>;
    private watchSubscribers: Object;
    private changeSubscribers: Array<Function>;
    private changedKeysDuringFreeze: Set<string>;
    public isFrozen: boolean;

    constructor() {
        /**
         * A list of all observable key names.
         */
        this.observedKeys = [];

        /**
         * All subscribers to given key values.
         */
        this.watchSubscribers = {}

        /**
         *  All the run subscribers.
         */
        this.changeSubscribers = [];

        /**
         * All changes to keys collected during a freeze.
         */
        this.changedKeysDuringFreeze = new Set();

        /**
         * Whether this stream is in a state of being "frozen", not allowing
         * any change to be notified during this period.
         */
        this.isFrozen = false;
    }


    /**
     * Allows monitoring of specific properties by key name.
     * @param key The key name in data property to watch.
     * @param subscriber The callback when a change has been detected to that
     *     property.
     */
    public watch(key: string, subscriber: Function) {
        if (!this.watchSubscribers[key]) {
            this.watchSubscribers[key] = [];
        }

        this.watchSubscribers[key].push(subscriber);
    }



    /**
     * Published a change for a given key.  This calls any watchSubscribers
     * subscribed to a given key.
     * @param {string} key The key name of the property in which a change was
     *     detected.
     */
    protected publishChangeFor(key: string) {
        if (!this.watchSubscribers[key]) {
            return;
        }

        // Call all subscriber to the given key.
        this.watchSubscribers[key].forEach((subscriber: Function) => {
            subscriber(this);
        })
    }


    /**
     * Sets up a base to watch any changes that happen on an object property by
     * modifying the getters and setters of an object to internally call
     * publishChangeFor when the object property has been modified.
     * @param {Object} object The object to modify.  Defaults to this, the current
     *     object.
     * @param {string} key The key in the object to modify.
     */
    protected markObservable(key: string, object: Object = this) {
        let value = object[key];
        let context = this;

        Object.defineProperty(object, key, {
            get() {
                return value
            },
            set(newVal) {
                value = newVal;
                // Prevent updates during freeze.
                if (!context.isFrozen) {
                    context.publishChangeFor(key);
                    context.publish();
                } else {
                    // Add this to the freeze cache.
                    context.changedKeysDuringFreeze.add(key);
                }
            }
        })
    }


    /**
     * Adds a subscription to observe ANY change on the observable properties.
     */
    public change(callback: Function) {
        this.changeSubscribers.push(callback);
    }


    /**
     * Triggers all change subscribers to be called.  Run this method if you
     * want to notify change subscribers.
     */
    public publish() {
        this.changeSubscribers.forEach((subscriber) => {
            subscriber(this);
        })
    }


    /**
     * Allows a bulk data update at the end of which any key watchers are notified
     * and the change watchers are notified once.
     *
     * ```ts
     *
     * // Updates the data.  name, age watchers will be called once and
     * // change subscribers will be called once.
     * myStream.update({
     *    name: 'Scott'
     *    age:58
     * })
     * ```
     *
     * @param data
     */
    public update(data: Object) {
        if (!is.object(data)) {
            throw new Error('You must pass an object to update');
        }

        this.freeze();
        // Make changes.
        Object.keys(data).forEach((key) => {
            this[key] = data[key];
        })
        this.unfreeze();
    }


    /**
     * Freezes this stream preventing it from notifying any changes
     * until it is unfrozen.
     */
    public freeze() {
        this.isFrozen = true;
    }


    /**
     * Unfreezes the stream.  Any data changes that
     * happened during the freeze were monitored and at the point of
     * unfreezing, the key watchers are notified.  Change monitor is notified
     * once after unfreeze if there were changes during the freeze.
     */
    public unfreeze() {
        this.isFrozen = false;
        // Now start notifying changes.
        this.changedKeysDuringFreeze.forEach((key) => {
            this.publishChangeFor(key);
        })

        // Publish if there are some keys that were changed.
        this.changedKeysDuringFreeze.size &&
            this.publish();

        this.changedKeysDuringFreeze.clear();
    }

}
