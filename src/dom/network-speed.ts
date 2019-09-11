import { func } from '../func/func';

/**
 * A class that helps with determining network speed.
 */
export class networkSpeed {

    static mbsp: number;

    // /**
    //  * Measures the time the root document (HTML) took to be sent from server.
    //  * This is fairly consistent across each reload of a given page (assuming)
    //  * your server is stable.
    //  *
    //  * @see https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript
    //  * @see https://w3c.github.io/navigation-timing/
    //  * @see https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript
    //  */
    static getMbsp() {
        // Run just once.
        if (networkSpeed.mbsp) {
            return networkSpeed.mbsp;
        }
        const responseTime = (performance.timing.domContentLoadedEventStart - performance.timing.requestStart);
        const duration = responseTime;
        const durationSeconds = duration / 1000;
        const amountOfDataMb = networkSpeed.getDataTransfer() / 1000000;
        let approxSpeed = amountOfDataMb / durationSeconds;
        // Account for being off by a factor of 10 for some reason.
        approxSpeed *= 10;
        // Save results.
        networkSpeed.mbsp = approxSpeed;
        return approxSpeed;
    }


    /**
     * Gets the total amount of transferred resources on the page.
     */
    static getDataTransfer() {
        let entries = performance.getEntriesByType('resource');
        let size = 0;
        entries.forEach((entry) => {
            size += entry['transferSize'];
        });
        return size;
    }
}