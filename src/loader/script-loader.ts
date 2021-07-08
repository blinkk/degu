export interface ScriptLoaderConfig {
  /**
   * A function used to verify the script has successfully loaded.
   */
  test: () => boolean;

  /**
   * Attributes to be added to the <script> tag.
   */
  attrs?: Record<string, string>;

  /**
   * Timeout, in ms. Defaults to 5000ms.
   */
  timeout?: number;
}

/**
 * A script loader that checks to verify if the script has loaded by repeatedly
 * calling a test method using RAF.
 *
 * Example loading the YT API:
 *
 * ```
 * const scriptLoader = new RAFScriptLoader();
 * scriptLoader.load('https://www.youtube.com/iframe_api', {
 *   test: () => window.YT && window.YT['loaded'] === 1,
 * }).then(() => {
 *   // The YT API should be loaded now.
 *   const player = new YT.Player(...);
 * });
 * ```
 */
export class ScriptLoader {
  private loadedScripts: Record<string, Promise<void>> = {};
  private disposed = false;

  /**
   * Loads a script element onto the page.
   *
   * @param url The script src.
   * @param test A function used to verify the script has successfully loaded.
   * @param options Config options for loading the script.
   */
  public load(url: string, options: ScriptLoaderConfig): Promise<void> {
    // Avoid repeated calls to the same URL by returning the previous promise.
    const previousPromise = this.loadedScripts[url];
    if (previousPromise) {
      return previousPromise;
    }

    const promise: Promise<void> = new Promise((resolve, reject) => {
      // Avoid adding the script to the page if the test fn already passes.
      if (options.test()) {
        resolve();
        return;
      }

      // Render the <script> tag to the DOM.
      this.renderScriptTag(url, options);

      // Using RAF, repeatedly check if the script has been loaded.
      const startTime = Date.now();
      const timeout = options.timeout || 5000;
      const callback = () => {
        if (this.disposed) {
          reject('script loader is disposed');
          return;
        }
        if (options.test()) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        if (elapsed > timeout) {
          reject(`failed to load ${url} due to timeout`);
          return;
        }
        window.requestAnimationFrame(callback);
      };
      window.requestAnimationFrame(callback);
    });

    this.loadedScripts[url] = promise;
    promise.catch(err => {
      console.error(`failed to load ${url}`);
      console.error(err);
      delete this.loadedScripts[url];
    });
    return promise;
  }

  /**
   * Renders the DOM for the script element. Subclasses should override this
   * method for more complex script renderings.
   */
  protected renderScriptTag(url: string, options?: ScriptLoaderConfig): void {
    const script = document.createElement('script');
    if (options?.attrs) {
      for (const key in options.attrs) {
        const val = options.attrs[key];
        script.setAttribute(key, val);
      }
    }
    script.src = url;
    document.body.appendChild(script);
  }

  /** @deprecated */
  protected renderDom(url: string): void {
    // Deprecated. To be removed in a future version.
    this.renderScriptTag(url);
  }

  dispose() {
    this.loadedScripts = {};
    this.disposed = true;
  }
}
