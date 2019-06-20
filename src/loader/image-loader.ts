

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
 * await results = myImageLoader.load();
 *
 * // The source of the image is the key.
 * results['http://mydomain.com/dog.png']; // DOG HTML Image element.
 * results['http://mydomain.com/cat.png']; // Cat HTML Image element.
 *
 * ```
 */
export class ImageLoader {
    private imageSources: Array<string>;
    /**
     * An object with the key as the URL of the image and the loaded
     * image element.
     */
    private images: Object;

    /**
     * The number of times to refetch an image if unsuccessful.
     */
    public maxRetries: number;


    constructor(imageSources: Array<string>) {
        this.imageSources = imageSources;
        this.images = {};
        this.maxRetries = 3;
    }

    /**
     * Begins loading all images.
     */
    load(): Promise<Object> {
        return new Promise(resolve => {
            const promises = this.imageSources.map((source) => {
                return this.fetchImage(source);
            })

            Promise.all(promises).then(() => {
                resolve(this.images);
            })
        });
    }


    /**
     * Fetches and creates an image element when successful.
     * @param source The image source
     * @param retryCount The current retry count.
     */
    fetchImage(source: string, retryCount: number = 0): Promise<void> {
        return new Promise(resolve => {
            fetch(source)
                .then((response) => {
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
                .then((response) => {
                    const blob = response;
                    const img = document.createElement('img');
                    img.onload = () => {
                        URL.revokeObjectURL(img.src);
                        this.images[source] = img;
                        resolve();
                    };
                    img.src = URL.createObjectURL(blob);
                })


        })
    }

}