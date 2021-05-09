/**
 * A class that makes it really easy to work with web workers.
 *
 * This implementation limits your workers to just 1 parameter so it recommended
 * to use an object as your parameter.
 *
 * Your worker function should return some result (any type).
 *
 * You can create one time workers or work with the same worker.
 *
 * 1) One time workers
 *
 * Every time you call [[WebWorker.runOneTimeThrowAwayWorker]], it will create a
 * new ONE time worker that self terminates upon completion.
 *
 * This is very useful in spawning multiple processes that all work at once.
 * Each worker will run async and will resolve a promise when done.
 *
 * If you want to do many different calculations at once, a one time worker
 * might be the way.
 *
 * 2) Use the same worker.
 *
 * Calling [[WebWorker.run]] will run a webworker.
 * Calling it again, will run the same worker.  Note that if you make
 * make two calls to the same worker in sequence before the webworker can
 * resolve the first call, it will only response to the second call.
 *
 *
 *
 * There are some limitations / conventions in using this class.   Please
 * see the below.
 * ```ts
 *
 * // Create a web worker task function.
 * //
 * // Limitation 1:
 * // Note that task functon, actually ends up getting stringified
 * // (important), bundled and sent to a separate thread.  Trying to execute
 * // imported clases won't work. Consider the function being sandboxed in it's
 * // own world.
 * //
 * // Limitaton 2:
 * // It's a web worker function.  Workers have limitations like not being
 * // able to access the DOM.
 * // See https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#Web_Workers_concepts_and_usage for more.
 * //
 * // Limitation 3:
 * // The function should accept only 1 parameter AND it must be named "params"
 * // by convention.  You can send any parameters up as an object.  This is done
 * // as a convention and to make it easier to wrap up.  See [[WebWorker]] for
 * // more.
 * var task = (params)=> {
 *    return params.a + params.b;
 * }
 *
 *
 * // Now create an instance of WebWorker and set the task.
 * var worker = new WebWorker(task);
 *
 *
 * // Create two one time workers that run in parallel.
 * worker.runOneTimeThrowAwayWorker({a: 2, b: 3}).then((result)=> {
 *   console.log(result); // 5
 * })
 * worker.runOneTimeThrowAwayWorker({ a: 5, b: 5}).then((result)=> {
 *   console.log(result); // 10
 * })
 *
 *
 * // Reusing the same worker.
 * await worker.run({a: 6, b:10});
 * await worker.run({a:4, b:10});
 *
 * // Kill the worker
 * worker.terminate();
 * ```
 *
 * @unstable
 * @experimental
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

  /**
   * Internal cached instance of worker.
   */
  private worker: Worker | null;

  constructor(workerTask: Function) {
    // Prepare the worker code as a string.
    this.worker = null;
    this.workerTask = workerTask;
    this.workerTaskAsString = this.workerTask.toString();
    this.workerTaskAsString = this.formatTask(this.workerTaskAsString);
    this.codeToRun = `
            self.addEventListener('message', function(event) {
                let params = event.data;
                let result = 'No result was generated.';
                result = function(params) { ${this.workerTaskAsString} }(params);
                self.postMessage({ result: result });
                // close();
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
    return task.substring(task.indexOf('{') + 1, task.lastIndexOf('}'));
  }

  /**
   * Create an instance of a Worker and sends out the message with the
   * params. Resolves the promise when results come in.
   *
   * Note that each time you call this method, a new Worker is created.
   * The Worker is terminated as soon as it resolves so it can be considered
   * a one time worker..
   * @param paramsToSend
   * @param transfer.  An optional array of transferable objects.
   *     https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
   *     for more.
   */
  runOneTimeThrowAwayWorker(
    paramsToSend: Object,
    transfer?: Array<any>
  ): Promise<Object> {
    return new Promise<Object>((resolve, reject) => {
      var blob = new Blob([this.codeToRun], {type: 'application/javascript'});
      const blobUrl = URL.createObjectURL(blob);
      const worker = new Worker(blobUrl);

      URL.revokeObjectURL(blobUrl);
      worker.postMessage(paramsToSend, transfer as Array<any>);
      worker.onerror = (event: Object) => {
        reject(event);
        worker.terminate();
      };
      worker.onmessage = (event: Object) => {
        resolve(event['data']['result']);
        worker.terminate();
      };
    });
  }

  run(paramsToSend: Object, transfer?: Array<any>): Promise<Object> {
    return new Promise<Object>((resolve, reject) => {
      if (!this.worker) {
        var blob = new Blob([this.codeToRun], {type: 'application/javascript'});
        const blobUrl = URL.createObjectURL(blob);
        this.worker = new Worker(blobUrl);
      }

      // URL.revokeObjectURL(blobUrl);
      this.worker.postMessage(paramsToSend, transfer as Array<any>);
      this.worker.onerror = (event: Object) => {
        reject(event);
      };
      this.worker.onmessage = (event: Object) => {
        resolve(event['data']['result']);
      };
    });
  }

  terminate() {
    this.worker && this.worker.terminate();
  }
}
