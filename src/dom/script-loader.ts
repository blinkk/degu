import { time } from '../time/time';

export interface ScriptLoaderConfig {
  /**
   * A function used to verify the script has successfully loaded.
   */
  test: () => boolean;

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
 *   test: () => window.YT,
 * }).then(() => {
 *   // The YT API should be loaded now.
 *   const player = new YT.Player(...);
 * });
 * ```
 */
export class ScriptLoader {
  private loadedScripts: Record<string, Promise<void>> = {};

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
      this.renderDom(url);

      // Using RAF, repeatedly check if the script has been loaded.
      const startTime = time.now();
      const timeout = options.timeout || 5000;
      const callback = () => {
        if (options.test()) {
          resolve();
          return;
        }
        const elapsed = time.now() - startTime;
        if (elapsed > timeout) {
          reject(`failed to load ${url} due to timeout`);
          return;
        }
        window.requestAnimationFrame(callback);
      };
      window.requestAnimationFrame(callback);
    });

    this.loadedScripts[url] = promise;
    return promise;
  }

  /**
   * Renders the DOM for the script element. Subclasses should override this
   * method for more complex script renderings.
   */
  protected renderDom(url: string): void {
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }
}
