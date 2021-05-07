import { WebWorker } from "./web-worker";

/**
 * An experimental class that works with offscreen canvas and makes it
 * pretty easy to run tasks on a canvas in a separate thread.
 *
 * This works but there are some gotchas that users should be aware of.
 * As of now, offScreenCanvas is run a separate thread with
 * limitations, thisl class is best used for doing computational tasks
 * that can be wrapped in a task call.
 *
 * It may not be well suited to say try to run a huge 3D application.
 * If you want run a large app, you are probably better off making or finding
 * a different offScreenCanvas implementation.
 *
 * See the example usage in the /examples/off-screen-canvas sample.
 *
 * Read the below for the walk through.  There are several limitations.
 *
 *
 * TODO (uxder): The process of setup and be simplified.  setCanvas for example
 *     seems like an extra step.
 *
 *
 *```ts
 * import { OffScreenCanvas, is } from '@blinkk/degu';
 *
 * // Check for support and handle non-supporting browsers as you see fit.
 * if (!is.supportingOffScreenCanvas()) {
 *     throw new Error('Sorry your browser is not suppported');
 * }
 *
 * // First create an instance of OffScreenCanvas.
 * const offScreenCanvas = new OffScreenCanvas();
 *
 * // Grab the canvas element on your page (or create one).
 * const canvas = document.getElementById('canvas');
 *
 * // Now set the offscreen canvas.  This is a REQUIRED step before
 * // making calls.  It tells offScreenCanvas to prepare this canvas
 * // to be transferable via webWorkers.
 * offScreenCanvas.setCanvas(canvas);
 *
 *
 * // Create a function that will run as a web worker.  This will get executed
 * // on a different threadc.
 * //
 * // Limitation 1: Note that this  code actually ends up getting stringified
 * // (important), bundled and sent to a separate thread.
 * // Therefore, it is sandboxed in it's own world.
 * //
 * //
 * // Limitation 2:
 * // The function should accept only 1 parameter AND it must be named "params"
 * // by convention.  You can send any parameters up as an object.  This is done
 * // as a convention and to make it easier to wrap up.  See WebWorker for more.
 * //
 *  const task = (params) => {
 *       // If a command called init was sent, set the canvas
 *        if (params.command == 'init') {
 *           self.canvas = params.canvas;
 *           console.log("Hello", params.name);
 *           self.ctx = canvas.getContext('2d');
 *        }
 *
 *       // Defines an animation loop.
 *       var animate = () => {
 *           // Do something cool.
 *           // This will draw on the canvas (on your main thread)
 *           ctx.fillRect(0, 0, 150, 75);
 *           requestAnimationFrame(animate);
 *       };
 *
 *       if (params.command == 'animate') {
 *         animate();
 *         // Return a mesagge when animate is sent.
 *         return { message: 'FROM WORKER: started animation' };
 *       }
 *   };
 *
 * // Now bind and set that task to your instanfe of OffScreenCanvas.
 * // This will tell offScreenCanvas to run your task in a separate thread.
 * offScreenCanvas.setCanvasTask(task);
 *
 *
 * // Now initialize offscreen canvas.  The canvas is automatically sent
 * // and will be available in your task with params.canvas.  You can send
 * // additional key/value data.
 *  offScreenCanvas.init({
 *     command: 'init',
 *     name: 'Scott'
 *   }).then((message) => {
 *
 *            // Once initialized, send additional commands with
 *            // sendMessageToCanvas.
 *            offScreenCanvas.sendMessageToCanvas({
 *                command: 'animate',
 *                data: 'John'
 *            }).then((message) => {
 *                console.log(message); // FROM WORKER: started animation
 *            });
 *        });
 *  }
 *
 * // When you are all done, don't forget to terminate the WebWorker.
 * offScreenCanvas.terminate();
 * ```
 *
 *
 * Now assuing you had the canvas you set attached to the DOM, you should
 * see the canvas draw itself.  This is because, when you ran
 * [[OffScreenCanvas.setCanvas]], you basically set it to release control of it
 * to a separate worker.  So the manipulations to the canvas
 * (draw call on context) get updated and visible.
 *
 *
 * @unstable
 */
export class OffScreenCanvas {
    private canvas: HTMLCanvasElement | null | any;
    private offScreenHandler: Function | null;
    private worker: WebWorker | null;
    private canvasSent: boolean;
    private initialized: boolean;

    constructor() {
        this.canvas = null;
        this.offScreenHandler = null;
        this.worker = null;
        this.canvasSent = false;
        this.initialized = false;
    }

    /**
     * Sets the canvas to be used as offSetCanvas.  Save the canvas to be
     * used.
     * @param canvas
     */
    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        // Make this into an offscreen canvas.
        this.canvas = this.canvas['transferControlToOffscreen']();
    }

    /**
     * The handler for the offscreen canvas worker.
     * Note that the contents of this task are stringified and send to a separate
     * thread so the contents of the task are sandboxed.  Same limitations as
     * regular webworkers applieds (no access to DOM for exmaple)
     * @param message
     */
    setCanvasTask(task: Function) {
        this.offScreenHandler = task;
        this.worker = new WebWorker(this.offScreenHandler)
    }


    /**
     * Sends the first message to the worker with the transferable canvas
     */
    init(message: Record<string, any>) {
        if (!this.canvas) {
            throw new Error('Set your canvas first.')
        }

        if (!this.worker) {
            throw new Error('Set off screen handler first.');
        }

        this.initialized = true;
        message['canvas'] = this.canvas;
        this.canvasSent = true;
        return this.worker.run(message, [this.canvas]);
    }


    /**
     * Sends a message to the worker.
     * @param message
     */
    sendMessageToCanvas(message: Object) {
        if (!this.canvasSent || !this.worker || !this.canvas ||
            !this.initialized) {
            throw new Error('You must initialize must.')
        }
        return this.worker.run(message);
    }

    dispose() {
        this.worker && this.worker.terminate();
    }

}
