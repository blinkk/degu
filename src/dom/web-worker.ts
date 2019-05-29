/**
 * A class that makes it really easy to work with web workers.
 * Inpiration from https://gist.github.com/wmalara/6eb0e307424bc56350b658405034ced9
 *
 * This implementation limits your workers to just 1 parameter so it recommended
 * to use an object as your parameter.
 *
 * Your worker function should return some result (any type).
 *
 * Every time you call [[WebWorker.run]], it will create a new ONE time worker that
 * self terminates upon completion.
 *
 * Example:
 * ```ts
 *
 * // Create a webworker with a single "params" object as your params.
 * var worker = new WebWorker((params)=> {
 *    return params.a + params.b;
 * });
 *
 * var paramsToSend = {
 *   a: 2,
 *   b: 3
 * }
 *
 * // Create self terminating one time worker.
 * worker.run(paramsToSend).then((result)=> {
 *   console.log(result); // 5
 * })
 *
 * // Create self terminating one time worker.
 * worker.run({ a: 5, b: 5}).then((result)=> {
 *   console.log(result); // 10
 * })
 *
 *
 * // ES2017
 * await result = worker(params);
 * console.log(result);
 * ```
 */
export class WebWorker {
    /**
     * The function that the web worker should run.
     * @type {Function}
     */
    private workerTask: Function;

    /**
     * A stringified version of the worker task to execute.
     */
    private workerTaskAsString: string;
    /**
     *
     * A stringified version of the final worker.
     */
    private codeToRun: string;


    constructor(workerTask: Function) {
        // Prepare the worker code as a string.
        this.workerTask = workerTask;
        this.workerTaskAsString = this.workerTask.toString();
        this.workerTaskAsString = this.formatTask(this.workerTaskAsString);
        this.codeToRun = `
            self.addEventListener('message', function(event) {
                let params = event.data;
                let result = 'No result was generated.';
                result = function(params) { ${this.workerTaskAsString} }(params);
                self.postMessage({ result: result });
                close();
            })
         `;

        // The raw string of the actual code this is going to run.
        // console.log(this.codeToRun);
    }

    /**
     * Strip out the start and end of the function string.  This formats
     * a stringified function so it's ready to be a web worker.
     * @param task
     */
    private formatTask(task: string): string {
        return task.substring(task.indexOf("{") + 1, task.lastIndexOf("}"));
    }


    /**
     * Create an instance of a Worker and sends out the message with the
     * params. Resolves the promise when results come in.
     *
     * Note that each time you call this method, a new Worker is created.
     * The Worker is terminated as soon as it resolves so it can be considered
     * a one time worker..
     * @param paramsToSend
     */
    run(paramsToSend: Object): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            var blob = new Blob([this.codeToRun],
                { type: "application/javascript" });
            const blobUrl = URL.createObjectURL(blob);
            const worker = new Worker(blobUrl);

            URL.revokeObjectURL(blobUrl);
            worker.postMessage(paramsToSend);
            worker.onerror = (event: Object) => {
                reject(event);
                worker.terminate();
            }
            worker.onmessage = (event: Object) => {
                resolve(event['data']['result']);
                worker.terminate();
            }
        });
    }

}