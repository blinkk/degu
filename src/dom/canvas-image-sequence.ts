
import { is } from '../is/is';
import { func } from '../func/func';
import { Defer } from '../func/defer';
import { ImageLoader } from '../loader/image-loader';
import { mathf } from '../mathf/mathf';
import { DomWatcher } from '../dom/dom-watcher';
import { MultiInterpolate, rangedProgress } from '../interpolate/multi-interpolate';
import { RafTimer } from '../raf/raf-timer';
import { networkSpeed } from './network-speed';

export interface CanvasImageSequenceSizingOptions {
    /**
     * Whether the sizing should use cover insted of contain.
     */
    cover: boolean,
    /**
     * When using "contain" mode, the amount to position FROM the vertical bottom.
     * By default, contain mode will vertically center your image.  Setting this
     * option will adjust the vertical position of the image.
     *
     * Example: bottom: 0 ---> the bottom of the image should align with the
     *                         bottom of the canvas element.
     * Example: bottom: 20 ---> the bottom of the image should align from the
     *                         bottom 20% of the canvas element.
     */
    bottom: number
}

export const canvasImageSequenceErrors = {
    NO_ELEMENT: 'An element is required for canvas image sequence',
    NO_SOURCES: 'Image sources are required for canvas image sequence',
}

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
 * // All images are assumed to be the same dimensions.
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
 *   document.querySelector('.my-element'),
 *   myImages
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
 *
 * ## MultiInterpolate capabilities.
 * Canvas Image Sequence has multiinterpolation built in to make it easier to
 * manage more complex sequences.
 * Normally, you may want to map an image sequence to just play from start to
 * end.  But what if you wanted more flexiblity?  You can do things like:
 *
 *
 * ```ts
 *
 * let progressPoints = [
 *       {
 *         from: 0, to: 0.5, start: 0, end: 1,
 *       },
 *       {
 *         from: 0.5, to: 1, start: 1, end: 0,
 *       },
 * ];
 * canvasImageSequence.setMultiInterpolation(progressPoints);
 * canvasImageSequence.load();
 *
 * ```
 * In the above, now the image sequence will play from start to end and back to
 * the start.  You can define your own progress points to have full control over
 * how you want your image sequence sprite to play out.
 *
 *
 * ## Playback capability
 * You can also play your canvas image sequence with a timer.
 * The playback also provides a completion promise.
 *
 * ```ts
 * // Create a complicated playback.
 * let progressPoints = [
 *       {
 *         from: 0, to: 0.5, start: 0, end: 1,
 *       },
 *       {
 *         from: 0.5, to: 1, start: 1, end: 0,
 *       },
 * ];
 * canvasImageSequence.setMultiInterpolation(progressPoints);
 * // Now load the images.
 * canvasImageSequence.load().then(()=> {
 *    // Now play the image sequence from progress 0 - 1 over a span of 3000 ms.
 *    canvasImageSequence.play(0, 1, 3000).then(()=> {
 *       console.log('done');
 *    })
 * })
 *
 *
 * ```
 *
 * ### Lerp Towards Capability
 * By setting a lerp value, canvasImageSequence will automatically "lerp" towards
 * frames if the delta between the currently rendered frame and the requested
 * progress is large.
 *
 * This is useful to "smooth" out movement between frames.
 *
 *
 * To use this feature, simply set the lerp value.
 *
 * As an exmaple we initially set the progress to 0 but immediately, change it to 1.
 * You will see that the progress value will lerp.   Internally, this happens
 * by running raf until the frame value delta is less than 1 and stable.
 *
 * ```ts
 *  canvasImageSequence.lerpAmount = 0.12;
 *  canvasImageSequence.renderByProgress(0);
 *  canvasImageSequence.renderByProgress(1);
 * ```
 *
 *
 * Another usecase for setting lerp is to handle resolving state after playing
 * a sequence. See canvas-image-sequence4 for more on this.
 *
 *
 * ### Fallback Image Feature
 * Since loading a series of images can take sometime, you can tell
 * CanvasImageSequence to load a single image first and test the network speed.
 * If the network speed is slow (based on the thresdhold you set),
 * CanvasImageSequence will abort loading the entire set of images and simply
 * display the single image.  When loading the image sequence is aborted,
 * all calls to renderByProgress will simply get ignore and just your fallback
 * image will be displayed onto the canvas.
 *
 * Therefore for fallback image to be effective, you really only want to use
 * this feature if the design of your module allows for a single image fallback.
 *
 *
 * Usage of fallback feature.
 *
 * ```ts
 * let myImages = [
 *   'image-1.jpg',
 *    ...
 *   'image-100.jpg',
 * ]
 * let canvasImageSequence = new CanvasImageSequence(
 *   document.querySelector('.my-element'),
 *   myImages
 * );
 *
 * // Important - set your fallback image PRIOR to calling load.
 * // Here we tell to fallback to image-1.jpg and use that image
 * // if the network speed is less than 10mbsp (very roughly).
 * canvasImageSequence.setFallback('image-1.jpg', 10);
 *
 * // Load
 * canvasImageSequence.load();
 *
 *
 * ```
 *
 *
 * @see https://github.com/uxder/yano-js/blob/master/examples/canvas-image-sequence.js
 * @see https://github.com/uxder/yano-js/blob/master/examples/canvas-image-sequence2.js
 * @see https://github.com/uxder/yano-js/blob/master/examples/canvas-image-sequence3.js
 * @see https://github.com/uxder/yano-js/blob/master/examples/canvas-image-sequence4.js
 * @see https://github.com/uxder/yano-js/blob/master/examples/canvas-image-sequence5.js
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
    private domWatcher: DomWatcher;
    private images: Object;
    /**
     * The current frame that is rendered on the screen.
     */
    private currentFrame: number;
    /**
     * The target frame to be rendered.  This can have a delta between
     * currentFrame (especially when lerp is used).
     */
    private targetFrame: number;
    /**
     * Allows you to lerp the frame updates.  This defaults to 1 where by
     * update to the frames are immediate.
     */
    private rafTimer: RafTimer | null;

    /**
     * The lerp amount when there is a delta between target and current frame
     * greater than 1.  This defaults to 1 (meaning no lerp).  Change this value
     * if you want canvasImageSequennce to smoothly interpolate between large
     * deltas between the target and current frames.
     */
    public lerpAmount = 1;

    /**
     * A flag to note whether the canvas-image-sequence is being "played" using
     * the play method.
     */
    public isPlaying: boolean;

    private canvasElement: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private dpr: number;
    private width: number;
    private height: number;
    private canvasWidth: number;
    private canvasHeight: number;
    private imageNaturalWidth: number;
    private imageNaturalHeight: number;

    private lastRenderSource: string | null;
    private multiInterpolate: MultiInterpolate | null;

    /**
     * An optional fallbackImageSource.
     */
    private fallbackImageSource: string | null;
    private fallbackMbspCutoff: number;

    /**
     * Sizing options for CanvasImageSequence.
     */
    private sizingOptions: CanvasImageSequenceSizingOptions | undefined;

    constructor(element: HTMLElement, sources: Array<string>,
        sizingOptions?: CanvasImageSequenceSizingOptions) {
        this.element = element;
        if (!element) {
            throw new Error(canvasImageSequenceErrors.NO_ELEMENT);
        }

        this.sources = sources;
        if (!sources) {
            throw new Error(canvasImageSequenceErrors.NO_SOURCES);
        }

        this.sizingOptions = sizingOptions;

        this.isPlaying = false;

        // Create canvas.
        this.canvasElement = document.createElement('canvas');
        this.context = this.canvasElement.getContext('2d')!;
        this.dpr = window.devicePixelRatio || 1;
        this.width = 0;
        this.height = 0;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.imageNaturalHeight = 0;
        this.imageNaturalWidth = 0;
        this.currentFrame = 0;
        this.targetFrame = 0;

        this.rafTimer = null;
        this.multiInterpolate = null;
        this.fallbackImageSource = null;
        this.fallbackMbspCutoff = 0;


        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: () => {
                this.resize();
                // Rerender the last known image.
                this.draw(''); // Make a empty call to clear the memoize cache.
                this.lastRenderSource && this.draw(this.lastRenderSource);
            },
            id: 'resize',
            eventOptions: { passive: true }
        });
        this.resize();
        this.domWatcher.run('resize');


        this.element.appendChild(this.canvasElement);

        this.readyPromise = new Defer();
        this.imageLoader = new ImageLoader(sources);
        this.imageLoader.decodeAfterFetch = true;

        // The loaded images.
        this.images = [];
        this.lastRenderSource = null;

        // Cull unncessary update
        this.draw =
            func.runOnceOnChange(this.draw.bind(this));
    }


    /**
     * Sets an optional multiinterpolations.  This allows you to define
     * more complex play sequences on your image sequence.
     *
     * Here is an example of playing the image sequence from start to end
     * and back to end.
     *
     * ```ts
     * let progressPoints = [
     *       {
     *         from: 0, to: 0.5, start: 0, end: 1,
     *       },
     *       {
     *         from: 0.5, to: 1, start: 1, end: 0,
     *       },
     * ];
     * canvasImageSequence.setMultiInterpolation(progressPoints);
     *
     * ```
     */
    setMultiInterpolation(interpolations: Array<rangedProgress>) {
        this.multiInterpolate = new MultiInterpolate({
            interpolations: [
                {
                    id: 'sequence',
                    progress: interpolations
                }
            ]
        })

    }


    /**
     * Sets an optional fallback image source.  If the fallback image source
     * is set, CanvasImageSequence will load it first and then attempt to
     * determine the approximate network speed.  If the network speed falls
     * below the threshold, CanvasImageSequence will not load the remaining
     * images and simply display out the fallback image.
     *
     * @param {string} fallbackImageSource The fallback image source.
     * @param {number} networkSpeedMbpsCutoff The cutoff network speed in
     *     Megabytes per second.  For exmaple 10, would means if we determine
     *     that the network speed is less than 10MBPS, fallback to the image.
     *     Note network speed is not going to be exact and is an approximation.
     */
    setFallback(fallbackImageSource: string, networkSpeedMbpsCutoff: number) {
        this.fallbackImageSource = fallbackImageSource;
        this.fallbackMbspCutoff = networkSpeedMbpsCutoff;
    }

    resize() {
        this.dpr = window.devicePixelRatio || 1;
        this.canvasElement.width = this.element.offsetWidth;
        this.canvasElement.height = this.element.offsetHeight;
        this.width = this.element.offsetWidth * this.dpr;
        this.height = this.element.offsetHeight * this.dpr;
        this.canvasWidth = this.element.offsetWidth;
        this.canvasHeight = this.element.offsetHeight;
    }

    /**
     * Starts loading the images.
     */
    load(): Promise<any> {
        let loadAllImages = () => {
            this.imageLoader.load().then((results) => {
                this.images = results;
                this.setImageDimensions();
                this.readyPromise.resolve(results);
            })
        }

        if (this.fallbackImageSource) {
            networkSpeed.test(this.fallbackImageSource)
                .then((speed) => {
                    // If the speed is not fast enough
                    if (speed <= this.fallbackMbspCutoff) {
                        // Load the fallback image and use it
                        // as the result.
                        let fallbackLoader = new ImageLoader(
                            [this.fallbackImageSource!])
                            .load().then((results) => {
                                this.images = results;
                                this.setImageDimensions();
                                // Overrides the imageSources.
                                this.sources = [this.fallbackImageSource!];
                                this.readyPromise.resolve(results);
                            })
                    } else {
                        loadAllImages();
                    }
                })

        } else {
            loadAllImages();
        }

        return this.readyPromise.getPromise();
    }


    /**
     * Sets the images dimensions used internally based on the first image.
     * Assumes all images are uniform size.
     */
    private setImageDimensions() {
        let firstKey = Object.keys(this.images)[0];
        this.imageNaturalHeight =
            this.images[firstKey].naturalHeight;
        this.imageNaturalWidth =
            this.images[firstKey].naturalWidth;
    }


    /**
     * Sets the internal images and resolves the readyPromise.  This is useful
     * for rare cases in which you want to use canvas-image-sequence with images
     * that have already loaded and way to bypass the internal loading mechanism
     * and set the images yourself.
     *
     * Usage:
     * ```ts
     *
     * // Get the list of images that are already loaded.
     * let myImages = Array.from(document.querySelector('.myImages'));
     *
     * let canvasImageSequence = new CanvasImageSequence(
     *   document.querySelector('.my-element'),
     *   [] // Just pass an empty array.
     * );
     *
     * // Set the images instead of loading
     * canvasImageSequence.setImages(myImages);
     *
     * ```
     */
    setImages(images: Array<HTMLImageElement>) {
        this.images = images;
        this.setImageDimensions();
        return this.readyPromise.resolve(this.images);
    }


    /**
     * Gets the internally stored images.  This could be empty if you haven't
     * loaded images yet.
     */
    getImages(): any {
        return this.images;
    }


    /**
     * Renders by progress.  0 would mean the very first frame and the 1 would
     * mean the last.
     * @param {number} n A progress value between 0 and 1.
     * @param {noMultiInterpolate} An option to force evaluation without
     *   multiInterpolation.  This is useful in cases where you have
     *   multiInterpolation enabled but you want to manually update the
     *   position of the frame without it using multiInterpolation.  Simply,
     *   being able to say, I want to render the image sequnce at 0.9 for example.
     */
    renderByProgress(n: number, noMultiInterpolate: boolean = false) {
        !this.isPlaying && this.renderProgress(n, noMultiInterpolate);
    }

    /**
     * Internal render by progress value.
     * @param {number} n A progress value between 0 and 1.
     * @param {noMultiInterpolate} An option to force evaluation without
     *   multiInterpolation.  This is useful in cases where you have
     *   multiInterpolation enabled but you want to manually update the
     *   position of the frame without it using multiInterpolation.  Simply,
     *   being able to say, I want to render the image sequnce at 0.9 for example.
     */
    private renderProgress(n: number, noMultiInterpolate: boolean = false) {
        let total = this.sources.length - 1;
        let progress = mathf.clamp01(n);

        // If the optional multiinterpolate is set, then use multiInterpolate
        // to figure out what the correct frame should be.
        if (this.multiInterpolate && !noMultiInterpolate) {
            let interpolateMap = this.multiInterpolate.calculate(progress);
            progress = mathf.clamp01(interpolateMap['sequence']);
        }



        // Figure out the correct frame to render based on the number of
        // frames in the sequence.
        let targetFrame = Math.ceil(mathf.lerp(0, total, progress));

        this.renderFrame(targetFrame);
    }


    /**
     * Renders a given frame on to the html element.
     * @param i
     */
    private renderFrame(i: number) {
        // If images aren't loaded yet, skip drawing.
        if (!this.readyPromise.complete) {
            return;
        }

        this.targetFrame = i;

        // If the delta between target and current frame is greater than
        // 1 and there is a lerp value set, lerp towards the target frame.
        // Otherwise, just set the currentFrame
        // to the target for immediate updates.
        // Note that by default, the lerp amount is set to 1 (meaning no lerp),
        let diff = Math.abs(this.targetFrame - this.currentFrame);
        if (diff > 1 && !this.isPlaying && this.lerpAmount < 1) {
            this.currentFrame =
                mathf.lerp(this.currentFrame, this.targetFrame, this.lerpAmount);

            // If there is a delta, keep updating with RAF until it gets resolved.
            diff = Math.abs(this.targetFrame - this.currentFrame);
            let precision = 0.001
            if (diff >= precision) {
                window.requestAnimationFrame(() => {
                    this.renderFrame(this.targetFrame);
                });
            }
        } else {
            this.currentFrame = this.targetFrame;
        }


        let imageSource = this.sources[Math.round(this.currentFrame)];
        this.draw(imageSource)
    }

    private clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    private draw(imageSource: string): void {
        // Prevent invalid draws
        if (!imageSource) {
            return;
        }

        this.clear();

        let image = this.images[imageSource];
        let imageBox = {
            width: this.imageNaturalWidth,
            height: this.imageNaturalHeight
        }
        let containerBox = {
            width: this.canvasWidth,
            height: this.canvasHeight,
        }

        if (this.sizingOptions && this.sizingOptions.cover) {
            // Background "cover" sizing.
            let cover =
                mathf.calculateBackgroundCover(containerBox, imageBox);
            this.context.drawImage(
                image,
                -cover.xOffset >> 0, -cover.yOffset >> 0,
                imageBox.width * cover.scalar >> 0,
                imageBox.height * cover.scalar >> 0,
            );
        } else {
            // Default to contain sizing algo.
            let containScale =
                mathf.calculateBackgroundContain(containerBox, imageBox);

            // Default center algo.
            let diffX =
                (containerBox.width - (imageBox.width * containScale)) / 2;
            let diffY =
                (containerBox.height - (imageBox.height * containScale)) / 2;

            // Sizing option logic.
            if (this.sizingOptions && is.number(this.sizingOptions.bottom)) {
                // Bottom align it.
                diffY = containerBox.height - (imageBox.height * containScale);
                // Add the percentage amount specified.
                diffY -= containerBox.height * this.sizingOptions.bottom;
            }

            this.context.drawImage(
                image,
                diffX >> 0, diffY >> 0,
                imageBox.width * containScale >> 0,
                imageBox.height * containScale >> 0,
            );
        }

        this.lastRenderSource = imageSource;
    }



    /**
     * Plays the canvas image sequence with a timer. Playing will "hijack" the
     * progress events while playing.   For example:
     *
     * ```ts
     *    canvasImageSequence.play(0, 1, 3000).then(() => {
     *       console.log('play complete');
     *   });
     * ```
     *
     * Here we tell the canvasImageSequence to play from start to end over
     * a 3000ms period.  During this 3000ms period, any calls other to
     * calls "renderByProgress" will get ignored since they can conflict with
     * the playback.
     *
     *
     * @param from A number between 0 - 1
     * @param to A number between 0 - 1
     * @param duration The duration in ms.
     * @return Promise A promise that completes when done.
     */
    play(from: number, to: number, duration: number): Promise<void> {
        this.rafTimer = new RafTimer((progress: number) => {
            let interpolatedProgress = mathf.interpolateRange(
                progress, 0, 1,
                from, to
            );
            this.renderProgress(interpolatedProgress);
        })
        this.rafTimer.setDuration(duration);
        let defer = new Defer();
        this.rafTimer.onComplete(() => {
            this.isPlaying = false;
            defer.resolve();
            this.rafTimer!.dispose();
        });
        this.rafTimer.play();
        this.isPlaying = true;
        return defer.getPromise();
    }

    dispose() {
        this.domWatcher.dispose();
        this.rafTimer && this.rafTimer.dispose();
    }

}