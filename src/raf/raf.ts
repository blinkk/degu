import {
  elementVisibility,
  ElementVisibilityObject,
} from '../dom/element-visibility';

declare global {
  interface Window {
    DEGU_RAF_REGISTRY: RafRegistry;
    DEGU_RAF_REGISTRY_DEBUG: boolean;
  }
}

/**
 * A class that creates a RAF loop and calls a specific callback.  Setting the
 * frame rate will throttle the animation.
 *
 * Example usage;
 * ```ts
 * var raf = new Raf((frame, lastUpdateTime, stop)=> {
 *   console.log('this runs on request animation frame');
 *   // The current FPS.
 *   console.log(raf.getCurrentFps());
 * });
 * raf.start();
 *
 * // Later to stop raf.
 * raf.stop();
 *
 * // Set the FPS
 * raf.setFps(30);
 * raf.start();
 *
 *
 * // Add or remove listeners
 * var onRaf = ()=> {
 *   console.log('hello')
 * }
 * raf.watch(onRaf);
 * raf.unwatch(onRaf);
 *
 * // Clock functions: Delta and elapsed time.
 * var raf2 = new Raf((frame, lastUpdateTime, stop)=> {
 *   // Gets the time when raf started.
 *   const startTime = raf.getStartTime();
 *   // Gets the delta between the last update
 *   const delta = raf.getDelta();
 *   // Time elapsed
 *   const elapsedTime = raf.getElapsedTime();
 * }).start();
 *
 * ```
 *
 * RunWhen option.
 * You can pass a run condition to limit raf only when the condition resolve
 * to true.  This is useful to cull unncessary requests.
 * An example is to use elementVisility to only run RAF when an element is
 * in view and stop raf when it goes out of view.
 *
 *
 * ```ts
 *
 * // Runs only when the window is small.
 * var raf = new Raf(()=> {
 *   console.log('this runs when scren size is less than 1000');
 * });
 * raf.runWhen(()=> { window.innerWidth < 1000});
 * raf.start();
 *
 *
 *
 * // Runs only when myElement is in view.
 * // Option 1: You can use runWhen condition
 *
 *
 * let ev = elementVisibility.inview(myElement);
 * var raf = new Raf(() => {
 *    console.log('a raf that runs when element is in view.');
 * });
 * raf.runWhen(() => {
 *    return ev.state().inview;
 * });
 *
 * // This normally works fine but elementVisibility has a split second to
 * // boot up.
 * raf.start();
 *
 * // if you want to be sure to only run RAF when ev is ready do this:
 * ev.readyPromise.then(()=> {
 *   raf.start();
 * })
 *
 * ```
 *
 * // Runs only when myElement is in view.
 * // Option 2: You can use runWhenElementIsInview option.
 *
 * ```
 * var raf = new Raf(()=> {
 *   ...
 * })
 *
 *
 * // Set element and run when it's ready.
 * raf.runWhenElementIsInview(
 *    document.getElementById("myelement"),
 *    {
 *      rootMargin: '500px 0px 500px 0px'
 *    }
 * ).then(()=> {
 *    raf.start();
 * })
 *
 *
 * ```
 *
 *
 *
 * # Batch read / write.
 * Batch write / read.  To batch write and read, wrap your methods in
 * read and write calls.  Read / Write calls uses the degu raf registry
 * so your reads or writes can get delayed by one raf cycle.
 * ```
 * var raf = new Raf(()=> {
 *    raf.read(()=> {
 *        this.height = element.offsetHeight;
 *    })
 *
 *    raf.write(()=> {
 *        element.style.height = this.height + 20 + 'px';
 *    })
 * })
 *
 * ```
 *
 * You can also create a read / write only raf by passing
 * no rafLoop to the constructor.
 *
 * ```
 * var raf = new Raf();
 *    raf.read(()=> {
 *        this.height = element.offsetHeight;
 *    })
 *
 *    raf.write(()=> {
 *        element.style.height = this.height + 20 + 'px';
 *    })
 *
 * ```
 *
 *
 * If you want read / writes to NOT cull, you can set the
 * read write mode.    This is needed if you pass a rafLoop
 * to the constructor but additionally, want to use the read
 * write outside your loop even when your raf is stopped.
 * ```
 * var raf = new Raf(()=> {
 *    raf.read(()=> {
 *        this.height = element.offsetHeight;
 *    })
 *
 *    raf.write(()=> {
 *        element.style.height = this.height + 20 + 'px';
 *    })
 * })
 *
 * // Raf is stopped.
 * raf.stop();
 *
 * // This won't work.
 * raf.write(()=> {
 * ...
 * })
 *
 *
 * raf.setReadWriteMode(true);
 * // Now it will work even when raf is stopped.
 * raf.write(()=> {
 * ...
 * })
 *
 * ```
 *
 *
 * @noInheritDoc
 * @class
 */
export class Raf {
  private raf_: number | null;
  private frame: number | null;
  private lastUpdateTime: number;
  private delta: number;
  private fps: number;
  private currentFps: number;
  public isPlaying: boolean;
  public isReadWriteOnly = false;
  private callbacks: Array<Function> = [];
  private runCondition: Function | null;
  private isRunningRaf: boolean;
  private elaspedTime: number;
  public isDisposed = false;
  private startTime: number;

  /**
   * Internal element visibility object used to track element visibility
   * when runWhenElementIsInview option is used.
   */
  private ev?: ElementVisibilityObject;

  /**
   * @param {Function} rafLoop  Optional function to be called on each
   *     request animation frame.
   * @constructor
   */
  constructor(rafLoop?: Function | null) {
    /**
     * The internal reference to request animation frame.
     * @type {private}
     */
    this.raf_ = null;

    /**
     * The current animation frame.
     * @type {number}
     * @public
     */
    this.frame = null;

    /**
     * The last updated time.
     * @type {number}
     * @public
     */
    this.lastUpdateTime = 0;

    /**
     * The frame rate. Defaults to 0 in which case RAF is not throttled.
     * @type {number}
     */
    this.fps = 0;

    /**
     * The current frame rate.
     * @type {number}
     */
    this.currentFps = 0;

    /**
     * Whether raf is looping.
     * @type {boolean}
     */
    this.isPlaying = false;

    /**
     * Whether we are already running raf.
     */
    this.isRunningRaf = false;

    /**
     * A collection of callbacks to be called on raf.
     * @type {Array<Function>}
     */
    this.callbacks = [];

    /**
     * An optional condition in which if set and resolved to false,
     * the raf loop gets cull.ed
     * @type {Function}
     */
    this.runCondition = null;

    /**
     * The delta time in ms between the last frame update.
     */
    this.delta = 0;

    /**
     * The elapsed time instantiation.  This serves as a clock.
     * Note this is based on seconds not ms.
     */
    this.elaspedTime = 0;

    /**
     * The last known start time of raf.
     */
    this.startTime = 0;

    if (rafLoop) {
      this.watch(rafLoop);
    } else {
      // If no rafLoop was defined, this raf is being
      // used for readWrites only.
      this.isReadWriteOnly = true;
    }

    // Register self to global registry.
    if (window.DEGU_RAF_REGISTRY) {
      window.DEGU_RAF_REGISTRY.register(this);
    }
  }

  /**
   * Adds a raf listener
   * @param
   */
  watch(callback: Function) {
    this.callbacks.push(callback);
  }

  /**
   * Sets the read write mode.
   * @param value
   */
  setReadWriteMode(value: boolean) {
    this.isReadWriteOnly = value;
  }

  /**
   * Adds a one time read callback executed by the global degu raf registry.
   * This allows you to batch read calls.
   * @param callback
   */
  preRead(callback: Function) {
    window.DEGU_RAF_REGISTRY &&
      window.DEGU_RAF_REGISTRY.addOneTimePreRead({
        callback: callback,
        raf: this,
      });
  }

  /**
   * Adds a one time read callback executed by the global degu raf registry.
   * This allows you to batch read calls.
   * @param callback
   */
  read(callback: Function) {
    window.DEGU_RAF_REGISTRY &&
      window.DEGU_RAF_REGISTRY.addOneTimeRead({
        callback: callback,
        raf: this,
      });
  }

  /**
   * Adds a one time write callback executed by the global degu raf registry.
   * This allows you to batch write calls.
   * @param callback
   */
  write(callback: Function) {
    window.DEGU_RAF_REGISTRY &&
      window.DEGU_RAF_REGISTRY.addOneTimeWrite({
        callback: callback,
        raf: this,
      });
  }

  /**
   * Adds a one time post write callback executed by the global degu raf registry.
   * This allows you to batch post write calls.
   * @param callback
   */
  postWrite(callback: Function) {
    window.DEGU_RAF_REGISTRY &&
      window.DEGU_RAF_REGISTRY.addOneTimePostWrite({
        callback: callback,
        raf: this,
      });
  }

  /**
   * Removes a progress listener.
   * @param {Function}
   */
  unwatch(callbackToRemove: Function) {
    this.callbacks = this.callbacks.filter(callback => {
      return callback === callbackToRemove;
    });
  }

  /**
   * Sets a function to execute on each raf loop.  If the condition resolves
   * to true, the raf loop callbacks will be executed.  If false, the raf
   * loop is culled.
   * @param callbackCondition
   */
  runWhen(callbackCondition: Function) {
    this.runCondition = callbackCondition;
  }

  /**
   * Allows you to pass an option to tell this raf to execute only when the
   * given element is in the viewport.  Optionally pass intersection observer
   * options.
   *
   * Note that this still requires you to start the raf.  You can do this
   * with the promise that the method returns (resolved when ev is ready)
   * or at a later time.
   *
   * Note it's recommended that you add a rootMargin to your ev settings
   * if need to do offscreen processing.
   *
   * ```
   * var raf = new Raf(()=> {
   *   ...
   * })
   *
   *
   * // Set element and run when it's ready.
   * raf.runWhenElementIsInview(
   *    document.getElementById("myelement"),
   *    {
   *      rootMargin: '300px 0px 300px 0px'
   *    }
   * ).then(()=> {
   *    raf.start();
   * })
   *
   *
   * ```
   *
   */
  runWhenElementIsInview(
    element: HTMLElement,
    intersectionObserverOptions?: Object
  ): Promise<void> {
    // Dispose of any previous instances if this is being called a second
    // time.
    this.ev && this.ev.dispose();
    this.runCondition = null;

    this.ev = elementVisibility.inview(
      element,
      intersectionObserverOptions || {}
    );

    // Set the run when condition.
    this.runWhen(() => {
      return this.ev && this.ev.state().inview;
    });

    return this.ev.readyPromise;
  }

  /**
   * Sets the fps .
   */
  setFps(fps: number) {
    this.fps = fps;
  }

  /**
   * Starts the RAF animation loop.
   * @param {boolean} Whether to force a start.
   */
  start(force = false) {
    if (!force && this.isPlaying) {
      return;
    }
    this.startTime = (
      typeof performance === 'undefined' ? Date : performance
    ).now();
    this.animationLoop_();
    this.isPlaying = true;
  }

  /**
   * Stops the RAF animation loop.
   */
  stop() {
    this.isPlaying = false;
    window.cancelAnimationFrame(this.raf_!);
    this.isRunningRaf = false;
  }

  dispose() {
    this.ev && this.ev.dispose();
    this.callbacks = [];
    this.isDisposed = true;
    this.stop();
    // Deregister self to global registry.
    window.DEGU_RAF_REGISTRY && window.DEGU_RAF_REGISTRY.unregister(this);
  }

  /**
   * Gets the delta in ms between the last executed raf update.
   * @param inSeconds Whether to acquire the delta time in seconds.  Defaults
   *   to ms.
   */
  getDelta(inSeconds: boolean) {
    if (inSeconds) {
      return this.delta / 1000;
    } else {
      return this.delta;
    }
  }

  /**
   * Gets the elasped time since raf started.
   */
  getElapsedTime() {
    return this.elaspedTime;
  }

  /**
   * Gets the time (Date) when raf started.
   */
  getStartTime() {
    return this.startTime;
  }

  /**
   * Gets the current frame rate that raf is running at.  Useful for debugging.
   */
  getCurrentFps() {
    return this.currentFps;
  }

  /**
   * The internal animation loop.
   */
  private animationLoop_() {
    if (this.isRunningRaf) {
      return;
    }

    this.raf_ = window.requestAnimationFrame((frame: number) => {
      this.frame = frame;
      this.isRunningRaf = false;
      this.animationLoop_();
    });

    this.isRunningRaf = true;

    if (this.lastUpdateTime) {
      const current = Date.now();
      const elapsed = current - this.lastUpdateTime;
      this.delta = elapsed;
      this.elaspedTime += elapsed / 1000;
      const fps = this.fps === 0 ? 0 : 1000 / this.fps;
      this.currentFps = 1000 / elapsed;
      if (elapsed > fps) {
        this.callbacks &&
          this.callbacks.forEach(callback => {
            const callCallback = () => {
              callback(this.frame, this.lastUpdateTime, elapsed, () => {
                this.stop();
              });
            };
            if (this.runCondition) {
              this.runCondition() && callCallback();
            } else {
              callCallback();
            }
          });

        this.lastUpdateTime = Date.now();
      }
    }

    if (!this.lastUpdateTime) {
      this.lastUpdateTime = Date.now();
    }
  }
}

export interface RafRegistryObject {
  callback: Function;
  raf: Raf;
}

/**
 * The idea behind the rafRegistry is to be able to batch read and write
 * raf calls similar to fastDom or toolBox mutate.
 *
 * In order to achieve this performance boosts, read and write calls need
 * to be executed in order and therefore, we need a registry to maintain
 * all raf instances on the page.
 *
 * When instantiated, each RAF adds itself to the registry and can be run / stopped
 * normally.
 *
 * Within it's raf loop, it can call a raf.read(callback); raf.write(callback);
 * which ends up getting executed on the RafRegistry event loop.
 *
 * raf.read(callback) and raf.write(callback) are ONE-time so must be recalled
 * on each raf loop.  It is basically saying, read this on the next raf loop once
 * or write it on the next raf loop.
 *
 * To use this system, simply use add read and write calls in your raf loop.
 *
 *
 * Life cycle:
 * - preread
 * - read
 * - write
 * - postWrite
 *
 * ```
 * var raf = new Raf(()=> {
 *    raf.preRead(()=> {
 *        this.height = element.offsetHeight;
 *    })
 *
 *    raf.read(()=> {
 *        this.height = element.offsetHeight;
 *    })
 *
 *    raf.write(()=> {
 *        element.style.height = this.height + 20 + 'px';
 *    })
 *
 *    // Somewhat rare but executed after all writes.
 *    raf.postWrite(()=> {
 *        element.style.height = this.height + 20 + 'px';
 *    })
 * })
 * ```
 *
 *
 * You may also to use raf.write and raf.read outside a
 * rafLoop.  In this case, you can just pass a null to the constructor.
 *
 * ```
 * var raf = new Raf();
 *
 * // Somewhere
 *  raf.read(()=> {
 *      this.height = element.offsetHeight;
 *  })
 *
 *
 *  raf.write(()=> {
 *      element.style.height = this.height + 20 + 'px';
 *  })
 *
 *
 * ```
 *
 */
class RafRegistry {
  private static runRafCallbacks(callbacks: RafRegistryObject[]) {
    // Keep consistent arrays so that scheduled function can schedule
    // another function in the same step.
    // Important so that a read function can call another function that
    // protects itself in its own read function, in case it is called
    // through another code execution path.
    while (callbacks.length) {
      const registryObject = callbacks.splice(0, 1)[0];
      if (
        !registryObject.raf.isDisposed &&
        (registryObject.raf.isPlaying || registryObject.raf.isReadWriteOnly)
      ) {
        registryObject.callback();
      }
    }
  }

  private rafs: Array<Raf>;
  private flushScheduled = false;
  private readonly preReads: Array<RafRegistryObject> = [];
  private readonly reads: Array<RafRegistryObject> = [];
  private readonly writes: Array<RafRegistryObject> = [];
  private readonly postWrites: Array<RafRegistryObject> = [];

  constructor() {
    this.rafs = [];
  }

  public start() {
    if (this.flushScheduled) {
      return;
    }
    this.flushScheduled = true;
    requestAnimationFrame(() => {
      this.runRaf();
    });
  }

  private runRaf() {
    // Open console and add:
    //
    // DEGU_RAF_REGISTRY_DEBUG = true;
    //
    if (window.DEGU_RAF_REGISTRY_DEBUG) {
      console.log('Running raf', this.reads.length, this.writes.length);
    }

    // Execute preReads.
    RafRegistry.runRafCallbacks(this.preReads);

    // Execute reads.
    RafRegistry.runRafCallbacks(this.reads);

    // Execute writes.
    RafRegistry.runRafCallbacks(this.writes);

    // Execute postWrites.
    RafRegistry.runRafCallbacks(this.postWrites);

    this.flushScheduled = false;

    if (
      this.preReads.length ||
      this.reads.length ||
      this.writes.length ||
      this.postWrites.length
    ) {
      this.start();
    }
  }

  /**
   * Add a single addOneTimePreRead to the batch read / write system.
   * @param read
   */
  addOneTimePreRead(read: RafRegistryObject) {
    this.preReads.push(read);
    this.start();
  }

  /**
   * Add a single addOneTimeRead to the batch read / write system.
   * @param read
   */
  addOneTimeRead(read: RafRegistryObject) {
    this.reads.push(read);
    this.start();
  }

  /**
   * Add a single addOneTimeWrite to the batch read / write system.
   * @param read
   */
  addOneTimeWrite(write: RafRegistryObject) {
    this.writes.push(write);
    this.start();
  }

  /**
   * Add a single addOneTimeWrite to the batch read / write system.
   * @param read
   */
  addOneTimePostWrite(postWrite: RafRegistryObject) {
    this.postWrites.push(postWrite);
    this.start();
  }

  /**
   * Gets the count of all active rafs.
   *
   * In dev console:
   * ```
   * DEGU_RAF_REGISTRY.getActiveRafCount();
   * ```
   */
  public getActiveRafCount(): number {
    return this.rafs.filter(r => {
      return r.isPlaying;
    }).length;
  }

  /**
   * Gets the count of rafs.
   *
   * In dev console:
   * ```
   * DEGU_RAF_REGISTRY.getRafCount();
   * ```
   */
  public getRafCount(): number {
    return this.rafs.length;
  }

  public register(raf: Raf) {
    this.rafs.push(raf);
  }

  public unregister(raf: Raf) {
    this.rafs = this.rafs.filter(r => {
      return r === raf;
    });
  }
}

// Create raf registry as a global.
if (window && !window.DEGU_RAF_REGISTRY) {
  window.DEGU_RAF_REGISTRY = new RafRegistry();
}
