
import { func } from '../func/func';
import { Defer } from '../func/defer';
import { ImageLoader } from '../loader/image-loader';
import { mathf } from '../mathf/mathf';


/**
 * A class that allows you to play through an image sequence (sprite) based on
 * progress.
 *
 *
 * Usage:
 *
 * HTML / SASS
 * ```
 * <div class="my-element"></div>
 *
 *
 * .my-element
 *   width: 100vw
 *   height: 100vh
 * ```
 *
 * Then in your JS:
 *
 * ```ts
 *
 * let myImages = [
 *   'image-1.jpg',
 *   'image-2.jpg',
 *   'image-3.jpg',
 *   'image-4.jpg',
 *    ...
 *   'image-100.jpg',
 * ]
 *
 * let canvasImageSequence = new CanvasImageSequence(
 *   document.querySelector('.my-element')
 * );
 * // Load
 * canvasImageSequence.load();
 *
 * // At a later time.  If images aren't loaded yet, render will get ignored.
 *  canvasImageSequence.renderByProgress(0);  // Renders frame at progress 0.
 *  canvasImageSequence.renderByProgress(0.5);  // Renders frame at progress 0.5
 *  canvasImageSequence.renderByProgress(1);  // Renders frame at progress 1
 *
 * // When done.
 * canvasImageSequence.dispose();
 *
 * ```
 * The above would add a canvas to myElement.  The image that gets rendered
 * in the canvas, will be fitted would an algo similar to background:contain
 * so that the image is fully visible.  If the image different aspect ratio
 * than the contain, the image will be both vertically and horizontally centered
 * with contain (maximizing the scale without bleeding out).
 *
 *
 * You can also listen load completion.  Typically, loading frames takes a
 * while so you may want to add a loading indicator and on load completion,
 * render teh canvasImageSequence to the current frame.
 * ```ts
 *
 * // Use image load promise to ensure images are ready.
 * canvasImageSequence.load().then(()=> {
 *    // On load complete render the frame that maps to the current progress.
 *    canvasImageSequence.renderByProgress(myCurrentProgress);
 * })
 *
 *
 * ```
 *
 * @unstable
 */
export class CanvasImageSequence {
    /**
     * The main element to add canvas to.
     */
    private element: HTMLElement;

    /**
     * A list of image URLS to load.
     */
    private sources: Array<string>;

    /**
     * Internal instance of ImageLoader.
     */
    private imageLoader: ImageLoader;

    /**
     * A deferred promised that completes when all images have been loaded.
     */
    private readyPromise: Defer;


    private images: Object;

    private canvasElement: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private dpr: number;
    private width: number;
    private height: number;

    constructor(element: HTMLElement, sources: Array<string>) {
        this.element = element;
        this.sources = sources;


        // Create canvas.
        this.canvasElement = document.createElement('canvas');
        this.context = this.canvasElement.getContext('2d')!;
        this.dpr = window.devicePixelRatio || 1;
        this.width = 0;
        this.height = 0;
        this.resize();

        this.element.appendChild(this.canvasElement);

        this.readyPromise = new Defer();
        this.imageLoader = new ImageLoader(sources);
        this.imageLoader.decodeAfterFetch = true;
        // The loaded images.
        this.images = [];

        // Cull unncessary update
        this.draw =
            func.runOnceOnChange(this.draw.bind(this));
    }


    resize() {
        this.dpr = window.devicePixelRatio || 1;
        this.canvasElement.width = this.element.offsetWidth;
        this.canvasElement.height = this.element.offsetHeight;
        this.width = this.element.offsetWidth * this.dpr;
        this.height = this.element.offsetHeight * this.dpr;
    }

    /**
     * Starts loading the images.
     */
    load(): Promise<any> {
        this.imageLoader.load().then((results) => {
            this.images = results;
            this.readyPromise.resolve(results);
        })
        return this.readyPromise.getPromise();
    }

    /**
     * Renders by progress.  0 would mean the very first frame and the 1 would
     * mean the last.
     */
    renderByProgress(n: number) {
        let total = this.sources.length;
        let progress = mathf.clamp01(n);
        let targetFrame = Math.ceil(
            mathf.lerp(0, total, progress));
        console.log(targetFrame);
        this.renderFrame(targetFrame);
    }

    /**
     * Renders a given frame on to the html element.
     * @param i
     */
    renderFrame(i: number) {
        // If images aren't loaded yet, skip drawing.
        if (!this.readyPromise.complete) {
            return;
        }


        let imageSource = this.sources[i];
        this.draw(imageSource)
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    draw(imageSource: string): void {
        // Prevent invalid draws
        if (!imageSource) {
            return;
        }

        this.clear();

        let image = this.images[imageSource];
        let imageBox = {
            width: image.naturalWidth,
            height: image.naturalHeight
        }
        let containerBox = {
            width: this.canvasElement.offsetWidth,
            height: this.canvasElement.offsetHeight,
        }

        let containScale =
            mathf.calculateBackgroundContain(containerBox, imageBox);

        let diffX = containerBox.width - (imageBox.width * containScale);
        let diffY = containerBox.height - (imageBox.height * containScale);
        this.context.drawImage(
            image,
            diffX / 2, diffY / 2,
            imageBox.width * containScale,
            imageBox.height * containScale,
        );
    }


}