import {is} from '../is/is';
import * as dom from '../dom/dom';

/**
 * A class the loads a given set of images.
 *
 *
 * TODO (uxder): Needs more work.  Needs error and fetch fail handling.
 *
 * ```ts
 *
 * const myImages = [
 *  'http://mydomain.com/dog.png',
 *  'http://mydomain.com/cat.png'
 *  'http://mydomain.com/cow.jpg'
 * ];
 * const myImageLoader = new ImageLoader(myImages);
 *
 * // Optional - decodes the image as well.
 * // However, this uses image.decode() which will move the image memory
 * // to native memory.  It is not recommended unless you know what you are
 * // doing.
 * // @see dom.fetchAndMakeImage for more on the issues around
 * // image.decode().
 * myImageLoader.setDecodeAfterFetch(true);
 *
 *
 * // Loads images.
 * await results = myImageLoader.load();
 *
 * // The source of the image is the key.
 * results['http://mydomain.com/dog.png']; // DOG HTML Image element.
 * results['http://mydomain.com/cat.png']; // Cat HTML Image element.
 *
 * ```
 *
 *
 * You can alternatively fetch for just blobs.
 * ```ts
 * const myImages = [
 *  'http://mydomain.com/dog.png',
 *  'http://mydomain.com/cat.png'
 *  'http://mydomain.com/cow.jpg'
 * ];
 * const myImageLoader = new ImageLoader(myImages);
 *
 * await results = myImageLoader.loadBlobs();
 * results['http://mydomain.com/dog.png']; // DOG image blob.
 * ```
 */
export class ImageLoader {
  public imageSources: Array<string>;

  /**
   * An object with the key as the URL of the image or blob.
   */
  private images: Record<string, HTMLImageElement | ImageBitmap | string>;

  /**
   * The number of times to refetch an image if unsuccessful.
   */
  public maxRetries: number;

  /**
   * Whether to immediately image decode after a fetch (available to limited browsers).
   */
  private decodeAfterFetch: boolean;

  /**
   * An optional callback for each load event.
   */
  private onEachImageLoaded: Function | null;

  constructor(imageSources: Array<string>) {
    this.imageSources = imageSources;
    this.images = {};
    this.maxRetries = 3;
    this.decodeAfterFetch = false;
    this.onEachImageLoaded = null;
  }

  /**
   * Allows you to hook into each load event of image.
   * This should be called prior to calling load.
   *
   * ```
   * const myImages = [
   *  'http://mydomain.com/dog.png',
   *  'http://mydomain.com/cat.png'
   *  'http://mydomain.com/cow.jpg'
   * ];
   * const myImageLoader = new ImageLoader(myImages);
   *
   * myImageLoader.loadCallback((source, img)=> {
   *   console.log(source) // The image url that was just loaded.
   *   console.log(img); // The image itself.
   * })
   *
   * // Loads images.
   * await results = myImageLoader.load();
   *
   * ```
   * @param value
   */
  setLoadCallback(callback: Function) {
    this.onEachImageLoaded = callback;
  }

  /**
   * Gets the internal cached images.
   */
  getImages(): Object {
    return this.images;
  }

  /**
   * Sets to decodeAfterFetching.  Setting true on firefox causes failures
   * so we test for firefox.
   * @param value
   */
  setDecodeAfterFetch(value: boolean) {
    this.decodeAfterFetch = is.firefox() ? false : value;
  }

  /**
   * Begins loading all images.
   */
  load(): Promise<Object> {
    return new Promise(resolve => {
      const promises = this.imageSources.map(source => {
        return this.fetchImage(source);
      });

      Promise.all(promises).then(() => {
        resolve(this.images);
      });
    });
  }

  /**
   * Pings / Fetches all images.   This can be used as an alternative
   * to load().  Unlike load that ends up storing ImageBitmap or images
   * in memory (resulting in higher RAM usage),
   * this will simply make an XHR request so the response is
   * help in browser cache.
   *
   * Once cached, you can pair this with dom.fetchAndMakeImage and dom.deleteImage
   * to give you better control of releasing image memory from RAM on a per image
   * basis.
   *
   * ```
   *  const myImages = [
   *  'http://mydomain.com/dog.png',
   *  'http://mydomain.com/cat.png'
   *  'http://mydomain.com/cow.jpg'
   * ];
   *  const imageLoader = new ImageLoader();
   *
   *  // Ping images.
   * await results = myImageLoader.ping();
   *
   * // Images have been fetched and are in browser memory.
   * // You can construct it now.
   * const image = dom.fetchAndMakeImage(results[0]);
   *
   * // Do something with the image.
   * canvas.drawImage(image);
   *
   * // Now manually delete it when you don't need it.
   * dom.deleteImage(image);
   *
   *
   *
   * ```
   *
   * @param source
   * @param retryCount
   */
  ping(): Promise<Array<string>> {
    return new Promise(resolve => {
      const promises = this.imageSources.map(source => {
        return this.pingSource(source);
      });

      Promise.all(promises).then(() => {
        resolve(this.imageSources);
      });
    });
  }

  /**
   * Only fetches images without generating it.
   * This is useful for cases in which you want to
   * "preload" images into the browser cache but not hold the image data in
   * memory.
   */
  pingSource(source: string, retryCount = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(source).then(response => {
        // If status was not okay retry.
        if (!response.ok) {
          retryCount++;
          if (retryCount >= this.maxRetries) {
            reject(`failed after ${retryCount} tries`);
          } else {
            resolve(this.pingSource(source, retryCount));
          }
        } else {
          resolve(source);
        }
      });
    });
  }

  /**
   * Fetches and creates an image element when successful.
   * @param source The image source
   * @param retryCount The current retry count.
   */
  fetchImage(source: string, retryCount = 0): Promise<void> {
    return new Promise(resolve => {
      fetch(source)
        .then(response => {
          // If status was not okay retry.
          if (!response.ok) {
            retryCount++;
            if (retryCount >= this.maxRetries) {
              resolve();
            } else {
              this.fetchImage(source, retryCount);
            }
          }
          return response.blob();
        })
        .then(response => {
          const blob = response;
          const img = document.createElement('img');

          // Note watch out with using image.decode();
          // image.decode() images are moved to native memory where
          // it can't be flushed even with image = null;
          if (this.decodeAfterFetch && 'decode' in img) {
            img.src = URL.createObjectURL(blob);
            img.decoding = 'async';
            img
              .decode()
              .then(() => {
                this.images[source] = img;
                this.onEachImageLoaded && this.onEachImageLoaded(source, img);
                resolve();
              })
              .catch(() => {
                // console.log('error', Error);, then later,
                // throw new Error(error);
                // Usually when there is an error thrown it's
                // because this image couldn't be decoded
                // in a regular manner so we fall back again
                // to loading it normally.
                img.onload = () => {
                  this.images[source] = img;
                  this.onEachImageLoaded && this.onEachImageLoaded(source, img);
                  resolve();
                };
                img.src = URL.createObjectURL(blob);
              });
          } else {
            img.onload = () => {
              this.images[source] = img;
              this.onEachImageLoaded && this.onEachImageLoaded(source, img);
              resolve();
            };
            img.src = URL.createObjectURL(blob);
          }
        });
    });
  }

  /**
   * Begins loading imageBitMaps. Alternate to load method but ImageBitmap
   * has only partial support at the moment.
   */
  loadImageBitmaps() {
    return new Promise(resolve => {
      const promises = this.imageSources.map(source => {
        return this.fetchImageBitmap(source);
      });

      Promise.all(promises).then(() => {
        resolve(this.images);
      });
    });
  }

  /**
   * Fetches image bitmap.   Image bitmaps are faster in rendering images on
   * canvas because they don't do image decoding on each draw.  However,
   * they are not fully supported across all browsers so use wisely.
   *
   * Also note that at the current time usage of ImageBitmap seems to bloat the
   * native memory that can't be released.
   *
   * @see https://aerotwist.com/blog/the-hack-is-back/
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap
   */
  fetchImageBitmap(source: string, retryCount = 0): Promise<void> {
    return new Promise(resolve => {
      fetch(source)
        .then(response => {
          // If status was not okay retry.
          if (!response.ok) {
            retryCount++;
            if (retryCount >= this.maxRetries) {
              resolve();
            } else {
              this.fetchImageBitmap(source, retryCount);
            }
          }
          return response.blob();
        })
        .then(blobData => createImageBitmap(blobData))
        .then(response => {
          const blob = response;
          this.images[source] = blob;
          this.onEachImageLoaded && this.onEachImageLoaded(source, blob);
          resolve();
        });
    });
  }

  /**
   * Loads bitmap or image.   If browser supports bitmaps, it will
   * load bitmaps instead of an image.
   */
  loadBitmapOrImage() {
    return is.supportingCreateImageBitmap()
      ? this.loadImageBitmaps()
      : this.load();
  }

  dispose() {
    for (const key in this.images) {
      if (!this.images[key]) {
        return;
      }

      // If we loaded bitmaps and we can dispose.
      // https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap/close
      const item = this.images[key];
      if (item instanceof ImageBitmap) {
        item.close();
      } else if (typeof item === 'string') {
        URL.revokeObjectURL(item);
      } else if (item instanceof HTMLImageElement) {
        dom.deleteImage(item);
      }
    }

    this.images = {};
  }
}
