import {dom} from '..';

/**
 * A class that fetches a bunch of blobs.
 *
 * Here is an example of using the blob loader to fetch images.
 * const myImages = [
 *  'http://mydomain.com/dog.png',
 *  'http://mydomain.com/cat.png'
 *  'http://mydomain.com/cow.jpg'
 * ];
 *
 * const blobLoader = new blobLoader();
 *
 * // Loads images.
 * await results = blobLoader.load();
 *
 * // The source of the image is the key.
 * results['http://mydomain.com/dog.png']; // DOG blob.
 * results['http://mydomain.com/cat.png']; // Cat blob.
 *
 * const image = dom.makeImageFromBlob(blob);
 *
 * // Use the image.
 * canvas.drawImage(image);
 *
 * // Now delete it from memory.
 * dom.deleteImage(image);
 *
 * // Later
 * blobLoader.dispose();
 *
 * ```
 */
export class BlobLoader {
  public imageSources: Array<string>;

  /**
   * An object with the key as the source URL and value as blob.
   */
  private blobs: Record<string, Blob>;

  /**
   * An object with the key as the source URL and value as base64 images.
   */
  private images64: Record<string, HTMLImageElement>;

  /**
   * The number of times to refetch an image if unsuccessful.
   */
  public maxRetries: number;

  constructor(imageSources: Array<string>) {
    this.imageSources = imageSources;
    this.blobs = {};
    this.images64 = {};
    this.maxRetries = 3;
  }

  load(): Promise<Record<string, Blob>> {
    return new Promise(resolve => {
      if (!this.imageSources) {
        resolve(this.blobs);
      }
      const promises = this.imageSources.map(source => {
        return this.loadBlob(source);
      });

      Promise.all(promises).then(() => {
        resolve(this.blobs);
      });
    });
  }

  loadBlob(source: string, retryCount = 0): Promise<Blob | undefined> {
    return new Promise(resolve => {
      fetch(source)
        .then(response => {
          // If status was not okay retry.
          if (!response.ok) {
            retryCount++;
            if (retryCount >= this.maxRetries) {
              throw new Error(`failed after ${retryCount} tries`);
            } else {
              return this.loadBlob(source, retryCount);
            }
          } else {
            return response.blob();
          }
        })
        .then(response => {
          if (this.blobs && response) {
            this.blobs[source] = response;
          }
          resolve(response);
        });
    });
  }

  /**
   * Loads the requested images as Base64 images.
   */
  loadBase64Images() {
    return new Promise(resolve => {
      const promises = this.imageSources.map(source => {
        return this.loadBlobAsBase64Image(source);
      });

      Promise.all(promises).then(() => {
        resolve(this.images64);
      });
    });
  }

  loadBlobAsBase64Image(
    source: string,
    retryCount = 0
  ): Promise<Blob | undefined | void> {
    return new Promise((resolve, reject) => {
      fetch(source)
        .then(response => {
          // If status was not okay retry.
          if (!response.ok) {
            retryCount++;
            if (retryCount >= this.maxRetries) {
              reject(`failed after ${retryCount} tries`);
            }
            return this.loadBlobAsBase64Image(source, retryCount);
          } else {
            return response.blob();
          }
        })
        .then(response => {
          if (response) {
            dom.makeBase64ImageFromBlob(response).then(image => {
              this.images64[source] = image;
              resolve(response);
            });
          }
        });
    });
  }

  dispose() {
    this.imageSources = [];
    this.images64 = {};
    this.blobs = {};
  }
}
