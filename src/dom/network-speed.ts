/**
 * A class that helps with determining network speed.
 */
export class networkSpeed {

    /**
     * Runs a network speed test by loading an image and checking
     * the amount of time it took.
     *
     * ```ts
     *
     * networkSpeed.test('myimage.jpg').then((speed)=> {
     *   console.log(speed); // The network speed in mbsp.
     * })
     *
     * ```
     * @param testImageSource An image to load to test network speed.
     * @return {Promise} A promise with the estimated network speed in Mbsp.
     */
    static test(testImageSource: string): Promise<number> {
        return new Promise(resolve => {
            // First load the fallback image and approximate the
            // network speed.
            let startTime = Date.now();
            fetch(testImageSource)
                .then(function (response) {
                    return response.blob()
                })
                .then(function (blob) {
                    let endTime = Date.now();
                    let timeToDownloadMs = endTime - startTime;
                    let timeToDownloadSeconds = timeToDownloadMs / 1000;
                    //  Calculation the blob size in MB.
                    let sizeMb = blob.size / 1000000;
                    let networkSpeed = sizeMb / timeToDownloadSeconds;
                    // console.log(sizeMb, timeToDownloadSeconds, networkSpeed);

                    // // Not sure why but network speed seem to be off by a factor
                    // // of 10.
                    networkSpeed *= 100;
                    console.log(networkSpeed);
                    resolve(networkSpeed);
                });
        });
    }
}