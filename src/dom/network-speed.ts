import {func} from '../func/func';

/**
 * A class that helps with determining network speed.
 */
export class networkSpeed {
  static mbsp: number;

  /**
   * This method loads an image to try to determine the network speed.
   * There are several issues with it.  Safari doesn't report times very precisely
   * so it can be wildely off.  Generally, small loads result in horrible
   * accuracy.
   *
   * This method is a still being tested and can change.
   * @param testImageSource
   */
  static getMbspFromImage(testImageSource: string): Promise<number> {
    return new Promise(resolve => {
      // First load the fallback image and approximate the
      // network speed.
      const startTime = Date.now();
      fetch(testImageSource)
        .then(response => {
          return response.blob();
        })
        .then(blob => {
          let speed = 0;

          // Get the performance.
          let entries = performance.getEntriesByType('resource');
          entries = entries.filter(entry => {
            return entry.name == testImageSource;
          });
          const matchedEntry = entries[0];
          // Use blob.size since Safari doesn't contain byte size info
          // in entry.
          const fileSizeMb = blob.size / 1000000;
          const responseTime = matchedEntry.duration / 1000;
          console.log(matchedEntry);
          speed = fileSizeMb / responseTime;
          // Account for being off by a factor of 10 for some reason.
          speed *= 100;
          resolve(speed);
        });
    });
  }

  /**
   * Measures the time the root document (HTML) took to be sent from server.
   * This is fairly consistent across each reload of a given page (assuming)
   * your server is stable.
   *
   * Return the MBSP or null.  Null represents cases in which a value can't
   * be determined.
   *
   * LIMITED SUPPORT:
   * Note that on safari, due to feature limitations, this will return null.
   *
   * @see https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript
   * @see https://w3c.github.io/navigation-timing/
   * @see https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript
   */
  static getMbsp(): number | null {
    // Guard against old browsers.
    if (!performance || !performance.getEntriesByType) {
      return null;
    }

    // Run just once.
    if (networkSpeed.mbsp) {
      return networkSpeed.mbsp;
    }
    const responseTime =
      performance.timing.domContentLoadedEventStart -
      performance.timing.requestStart;
    const duration = responseTime;
    const durationSeconds = duration / 1000;
    const amountOfDataMb = networkSpeed.getDataTransfer() / 1000000;

    // If the amount of data coudn't be comprehended.  This happens
    // on safari where
    if (!amountOfDataMb) {
      return null;
    }

    let approxSpeed = amountOfDataMb / durationSeconds;
    // Account for being off by a factor of 10 for some reason.
    approxSpeed *= 10;
    // Save results.
    networkSpeed.mbsp = approxSpeed;
    return approxSpeed;
  }

  /**
   * Gets the total amount of transferred resources on the page.
   * LIMITED SUPPORT:
   * Note that this method does not work on Safari since safari doesn't return
   * data size info.
   */
  static getDataTransfer() {
    const entries = performance.getEntriesByType('resource');
    let size = 0;
    entries.forEach(entry => {
      size += entry['transferSize'];
    });
    return size;
  }
}
