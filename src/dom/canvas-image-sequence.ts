
import { is } from '../is/is';
import { func } from '../func/func';
import { Defer } from '../func/defer';
import { ImageLoader } from '../loader/image-loader';
import { mathf } from '../mathf/mathf';
import { DomWatcher } from '../dom/dom-watcher';
import { MultiInterpolate, rangedProgress, interpolateSettings } from '../interpolate/multi-interpolate';
import { RafTimer } from '../raf/raf-timer';
import { networkSpeed } from './network-speed';
import { domCanvas } from '../dom/dom-canvas';
import { Vector } from '../mathf/vector';


export interface CanvasImageSequenceImageSet {
    /**
     * A list of image sources.
     */
    images: Array<string>,

    /**
     * An optional condition for when this image set should be loaded.
     * Note that this only gets evaluated when the window resizes.
     */
    when?: Function
}

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
     * Example: bottom: 0.2 ---> the bottom of the image should align from the
     *                         bottom 20% of the canvas element.
     */
    bottom: number,

    /**
     * When calculating the bottom, whether to allow the image clip.   Basically,
     * says, move this from the top from 0-1 without clipping the image and
     * alters the position algo.
     *
     * By default, position calculation will allow clipping and the specified
     * percentage is based on the size of the canvas.  Using this option,
     * will alter the values to never clip.
     *
     * Use by setting to false.
     * bottomClipping: false
     *
     * Example: bottom: 0 ---> the bottom of the image should align to the
     *                         bottom of the canvas.
     * Example: bottom: 0.5 ---> the bottom of the image should move up 50%
     *                         from the bottom without clipping the top of the
     *                         image.
     * Example: bottom: 1 ---> the bottom of the image should move up 100%
     *                         from the bottom without clipping the top of the
     *                         image.
     */
    bottomNoClip: boolean,


    /**
     * When using "contain" mode, the amount to position FROM the vertical top.
     * By default, contain mode will vertically center your image.  Setting this
     * option will adjust the vertical position of the image.
     *
     * Example: top: 0 ---> the top of the image should align with the
     *                         top of the canvas element.
     * Example: top: 0.2 ---> the top of the image should align from the
     *                         top 20% of the canvas element.
     */
    top: number,

    /**
     * When calculating the top, whether to allow the image clip.   Basically,
     * says, move this from the top from 0-1 without clipping the image and
     * alters the position algo.
     *
     * By default, position calculation will allow clipping and the specified
     * percentage is based on the size of the canvas.  Using this option,
     * will alter the values to never clip.
     *
     *
     * Example: top: 0 ---> the top of the image should align to the
     *                         top of the canvas.
     * Example: top: 0.5 ---> the bottom of the image should move up 50%
     *                         from the bottom without clipping the top of the
     *                         image.
     * Example: top: 1 ---> the top of the image should move down 100%
     *                         from the top without clipping the bottom of the
     *                         image.
     */
    topNoClip: boolean,

    /**
     * When using "contain" mode, the amount to position FROM the horizontal left.
     * By default, contain mode will horizontall center your image.  Setting this
     * option will adjust the horizontal position of the image.
     *
     * Example: left: 0 ---> the left of the image should align with the
     *                         left of the canvas element.
     * Example: left: 0.2 ---> the left of the image should align from the
     *                         top left% of the canvas element.
     */
    left: number,

    /**
     * When calculating the left, whether to allow the image clip.   Basically,
     * says, move this from the left from 0-1 without clipping the image and
     * alters the position algo.
     *
     * By default, position calculation will allow clipping and the specified
     * percentage is based on the size of the canvas.  Using this option,
     * will alter the values to never clip.
     *
     *
     * Example: left: 0 ---> the left of the image should align to the
     *                         left of the canvas.
     * Example: left: 0.5 ---> the left of the image should move right 50%
     *                         from the left without clipping the right of the
     *                         image.
     * Example: left: 1 ---> the left of the image should move right 100%
     *                         from the left without clipping the right of the
     *                         image.
     */
    leftNoClip: boolean,


    /**
     * When using "contain" mode, the amount to position FROM the horizontal right.
     * By default, contain mode will horizontall center your image.  Setting this
     * option will adjust the horizontal position of the image.
     *
     * Example: right: 0 ---> the right of the image should align with the
     *                         right of the canvas element.
     * Example: right: 0.2 ---> the right of the image should align from the
     *                         top right% of the canvas element.
     */
    right: number

    /**
     * When calculating the right, whether to allow the image clip.   Basically,
     * says, move this from the right from 0-1 without clipping the image and
     * alters the position algo.
     *
     * By default, position calculation will allow clipping and the specified
     * percentage is based on the size of the canvas.  Using this option,
     * will alter the values to never clip.
     *
     *
     * Example: right: 0 ---> the right of the image should align to the
     *                         left of the canvas.
     * Example: right: 0.5 ---> the right of the image should move right 50%
     *                         from the right without clipping the left of the
     *                         image.
     * Example: right: 1 ---> the right of the image should move right 100%
     *                         from the right without clipping the left of the
     *                         image.
     */
    rightNoClip: boolean,

}

export const canvasImageSequenceErrors = {
    NO_ELEMENT: 'An element is required for canvas image sequence',
    NO_IMAGE_SETS: 'Image sets are required for canvas image sequence',
    NO_IMAGES: 'There are no images defined in your canvas image sequence image set',
}


export interface CanvasImageSequenceClipInterpolationConfig {
    type: string,
    interpolations: Array<interpolateSettings>
}

interface rectConfig {
    top: number,
    bottom: number,
    right: number,
    left: number,
    radius: number
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
 *   // Pass in your imageSet.  You can specific multiple (see below).
 *   [{images: myImages}],
 *    // Optional sizing.
 *   {
 *      cover: false, // Use cover mode.  Defaults to false.
 *      bottom: 0 // Align to the bottom.
 *      left: 0.2 // Align to the left
 *      leftNoClip: true // When aligning to left, use the no clip algo.
 *   }
 * );
 * // Loads the images.
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
 * ### Sizing options.
 * CanvasImageSequence has two render modes, contain (default) and cover.
 * Contain will by default vertically center your image but you can offset this
 * by providing a bottom value.
 *
 * ```ts
 * let canvasImageSequence = new CanvasImageSequence(
 *   document.querySelector('.my-element'),
 *   [{images: myImages}],
 *   {
 *     cover: true
 *   }
 * );
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
 * // Use stop if you need to stop the aniamtion.
 * canvasImageSequence.stop();
 *
 * ```
 *
 * ### Lerp Towards Capability
 * By setting a lerp value, canvasImageSequence will automatically "lerp" towards
 * frames if the delta between the currently rendered frame and the requested
 * progress is large.
 * * This is useful to "smooth" out movement between frames.
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
 *   [{images: myImages}],
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
 * ### Clipping Feature
 * Similar to css clip-path, you can pass clip-path-ish shapes to canvasImageSequence
 * which will then be applied when the canvas paints / renders.
 *
 * The clipping currently supports, inset type only.
 *
 * ```ts
 *
 * canvasImageSequence.setClipInterpolations({
 *   type: 'inset',
 *   interpolations: [
 *     {
 *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
 *       id: 'top'
 *     },
 *     {
 *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
 *       id: 'right'
 *     },
 *     {
 *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
 *       id: 'bottom'
 *     },
 *     {
 *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
 *       id: 'left'
 *     },
 *     {
 *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
 *       id: 'border-radius'
 *     }
 *   ]
 * })
 *
 *
 * canvasImageSequence.renderByProgress(0.5); // The clipping at 0.5 progress is rendered.
 *
 * ```
 *
 *
 * ## Selectively loading different sets of images.
 *
 * You can pass different sets of images to use.   Use the when condition
 * to modify your set.   Note that the when condition is only evaluated
 * upon resize.  If a new image set is matched, loading of that image
 * set will automatically happen in the background and render when complete.
 *
 * ````
 *
 * let myImages = [
 *   'image-1.jpg',
 *    ...
 *   'image-100.jpg',
 * ];
 *
 * let myMobileImages = [
 *   'image-mobile-1.jpg',
 *   'image-mobile-100.jpg',
 * ];
 *  let canvasImageSequence = new CanvasImageSequence(
 *   document.querySelector('.my-element'),
 *   [{
 *     when: ()=> { return window.innerWidth >= 768},
 *     images: myImages
 *   },
 *   {
 *     when: ()=> { return window.innerWidth < 768},
 *     images: myMobileImages
 *   }]
 * );
 *
 * ````
 *
 * Can I have imageSets for only desktop or mobile?  Yes you can!
 *
 * ```
 *  let canvasImageSequence = new CanvasImageSequence(
 *   document.querySelector('.my-element'),
 *   [
 *   {
 *     when: ()=> { return window.innerWidth < 768},
 *     images: myMobileImages
 *   }]
 * );
 *
 * ```
 * Here we specify canvasImageSequence with an imageSet for only mobile.  This
 * means the images will only load on mobile and canvasImageSequence won't
 * do anything on desktop (nothing will show since there are no images).
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
     * A list canvas image sets.
     */
    private imageSets: Array<CanvasImageSequenceImageSet>;

    /**
     * The last known progress value passed to renderByProgress
     */
    private progress: number | null;

    /**
     * The currently loaded / active image set.
     */
    private activeImageSet: CanvasImageSequenceImageSet | null;

    /**
     * Internal instance of ImageLoader.
     */
    private imageLoader: ImageLoader | null;

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

    /**
     * When using the play feature of the canvasImageSequence the instance
     * of defer that needs to be resolved.
     */
    private playDefer: Defer | null;

    private canvasElement: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private dpr: number;
    private canvasWidth: number;
    private canvasHeight: number;
    private imageNaturalWidth: number;
    private imageNaturalHeight: number;


    /**
     * When using contain mode, the amount of scale that
     * was applied to the image in order to make it fit.
     */
    private containScale: number | null;

    private lastRenderSource: string | null;
    private multiInterpolate: MultiInterpolate | null;

    /**
     * MultiInterpolations if using the clip option.
     */
    private clipMultiInterpolate: MultiInterpolate | null;

    /**
     * The type of clip path rendering.  Currently 'inset' or null (default).
     */
    private clipPathType: string | null;

    /**
     * If possible, ImageBitmaps are loaded for faster speed.  This flag
     * notes whether imageBitmaps were loaded or not.  If could be null,
     * at which point, the state is undetermined because loaded hasn't started
     * yet.
     */
    private imageBitmapsLoaded: boolean | null;

    /**
     * Whether to use BitmapImage if possible.  This helps with loading
     * faster since it is already decoded but turning this to false,
     * will load an image normally.  Defaults to true.
     */
    private useBitmapImageIfPossible: boolean;

    /**
     * An optional fallbackImageSource.
     */
    private fallbackImageSource: string | null;
    private fallbackMbspCutoff: number;

    /**
     * Sizing options for CanvasImageSequence.
     */
    private sizingOptions: CanvasImageSequenceSizingOptions | undefined;

    /**
     * Whether the instance has been disposed or not.
     */
    private disposed: boolean;

    constructor(element: HTMLElement,
        imageSets: Array<CanvasImageSequenceImageSet>,
        sizingOptions?: CanvasImageSequenceSizingOptions) {
        this.element = element;
        if (!element) {
            throw new Error(canvasImageSequenceErrors.NO_ELEMENT);
        }

        if (!imageSets) {
            throw new Error(canvasImageSequenceErrors.NO_IMAGE_SETS);
        }


        this.imageSets = imageSets;
        this.activeImageSet = null;

        this.sizingOptions = sizingOptions;

        this.isPlaying = false;
        this.imageBitmapsLoaded = null;
        this.useBitmapImageIfPossible = true;

        // Create canvas.
        this.canvasElement = document.createElement('canvas');
        this.context = this.canvasElement.getContext('2d')!;
        this.dpr = window.devicePixelRatio || 1;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.imageNaturalHeight = 0;
        this.imageNaturalWidth = 0;
        this.currentFrame = 0;
        this.targetFrame = 0;
        this.containScale = null;
        this.disposed = false;

        this.rafTimer = null;
        this.multiInterpolate = null;
        this.clipMultiInterpolate = null;
        this.clipPathType = null;
        this.fallbackImageSource = null;
        this.fallbackMbspCutoff = 0;
        this.imageLoader = null;
        this.progress = null;

        this.playDefer = null;

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

        // Another resize watcher dedicated to checking to checking if a new
        // image set should be loaded.
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: () => {
                // Evaluate if we need to load a different image set.
                let newSet = this.getSourceThatShouldLoad(this.imageSets);
                if (newSet !== this.activeImageSet) {
                    this.loadNewSet(this.imageSets);
                    // Autoload the content.
                    this.load().then(() => {
                        this.renderByProgress(this.progress || 0);
                    })
                }
            },
            id: 'image-set-resize',
            eventOptions: { passive: true }
        });

        this.element.appendChild(this.canvasElement);

        this.readyPromise = new Defer();

        this.loadNewSet(imageSets);

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
     * Sets whether to try to load bitmapImages if possible.  BitmapImages
     * are faster but you can optionally turn this off.  Note that
     * bitMapImages are not supported in browsers like Safari
     * and calling this method will only affect browers like
     * Chrome that support BitmapImages.  By default this is already turned
     * on.
     */
    useBitmapImages(value: boolean) {
        this.useBitmapImageIfPossible = value;
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


        this.canvasWidth = this.element.offsetWidth;
        this.canvasHeight = this.element.offsetHeight;

        // Set canvas to high dpr, the actual width to the size.
        // @see https://gist.github.com/callumlocke/cc258a193839691f60dd
        // for inspiration.
        this.canvasElement.width = this.element.offsetWidth * this.dpr;
        this.canvasElement.height = this.element.offsetHeight * this.dpr;
        this.canvasElement.style.width = this.canvasWidth + 'px';
        this.canvasElement.style.height = this.canvasHeight + 'px';

        // Scale up the canvas to compensate DPR.
        this.context.scale(this.dpr, this.dpr);
    }

    /**
     * Starts loading the images.
     */
    load(): Promise<any> {

        // If there is no matching imageSet there is nothing to load.
        if (!this.imageLoader || !this.activeImageSet) {
            // Defer resolution.
            window.setTimeout(() => {
                this.readyPromise.resolve();
            })
            return this.readyPromise.getPromise();
        }

        let loadAllImages = () => {
            let loadMethod = this.useBitmapImageIfPossible ?
                this.imageLoader!.loadBitmapOrImage :
                this.imageLoader!.load;
            loadMethod.apply(this.imageLoader!).then((results: any) => {
                this.images = results;

                // Check the first image to see if it is an image or bitmap.
                // We make this determinations by checking for the naturalWidth
                // property which is not available on ImageBitmpas.
                let firstKey = Object.keys(this.images)[0];
                let image = this.images[firstKey];
                this.imageBitmapsLoaded = !image.naturalWidth;
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
                                // Overrides the activeImageSet
                                this.activeImageSet = {
                                    images:
                                        [this.fallbackImageSource!]
                                };
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
     * Allows you to set new imageSets.
     *
     * @param imageSource
     */
    loadNewSet(imageSets: Array<CanvasImageSequenceImageSet>) {
        // Release memory of current set.
        this.imageLoader && this.imageLoader.dispose();


        // Save the image sources.
        this.imageSets = imageSets;
        this.activeImageSet = this.getSourceThatShouldLoad(this.imageSets);

        if (this.activeImageSet && !is.array(this.activeImageSet.images)) {
            throw new Error(canvasImageSequenceErrors.NO_IMAGES);
        }

        // Set the active image set if one is available.
        if (this.activeImageSet) {
            this.imageLoader = new ImageLoader(this.activeImageSet.images);
            this.imageLoader.setDecodeAfterFetch(true);
        } else {
            this.imageLoader = null;
        }

        this.images = [];
        this.lastRenderSource = null;
        // Reset the readyPromise.
        this.readyPromise = new Defer();
    }


    /**
     * Given a list of CanvasImageSequenceImageSets evaluates which set should
     * be used to load into the canvas.  The criteria is that any
     * imageSet without when is used or if when condition is specified the
     * when condition is evaluated and if true, it is used.  If multiple imageSets
     * are found, the the first one is used.
     */
    private getSourceThatShouldLoad(sources: Array<CanvasImageSequenceImageSet>):
        CanvasImageSequenceImageSet {
        let matchingSouces: Array<CanvasImageSequenceImageSet> = [];
        sources.forEach((source) => {
            if (!source.when) {
                matchingSouces.push(source);
            } else {
                source.when() && matchingSouces.push(source);
            }
        })

        return matchingSouces[0];
    }


    /**
     * Sets the images dimensions used internally based on the first image.
     * Assumes all images are uniform size.
     */
    private setImageDimensions() {
        let firstKey = Object.keys(this.images)[0];
        let image = this.images[firstKey];
        this.imageNaturalHeight =
            this.imageBitmapsLoaded ? image.height : image.naturalHeight;
        this.imageNaturalWidth =
            this.imageBitmapsLoaded ? image.width : image.naturalWidth;
    }


    /**
     * Sets the internal images and resolves the readyPromise.  This is useful
     * for rare cases in which you want to use canvas-image-sequence with images
     * that have already loaded (perhaps in a different module) and way to bypass
     * the internal loading mechanism and set the images yourself.
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
     * Sets an clip path type interpolation on the canvas drawing.
     * Currently only supports inset type.
     *
     * ```ts
     *
     * canvasImageSequence.setClipInterpolations({
     *   type: 'inset',
     *   interpolations: [
     *     {
     *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
     *       id: 'top'
     *     },
     *     {
     *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
     *       id: 'right'
     *     },
     *     {
     *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
     *       id: 'bottom'
     *     },
     *     {
     *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
     *       id: 'left'
     *     },
     *     {
     *       progress: [{ from: 0, to: 1, start: 0, end: 0.5}],
     *       id: 'border-radius'
     *     }
     *   ]
     * })
     *
     *
     * canvasImageSequence.renderByProgress(0.5); // The clipping at 0.5 progress is rendered.
     *
     * ```
     *
     */
    setClipInterpolations(config: CanvasImageSequenceClipInterpolationConfig) {
        this.clipPathType = config.type;
        this.clipMultiInterpolate = new MultiInterpolate({
            interpolations: config.interpolations
        })
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
        this.progress = mathf.clamp01(n);
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
        let progress = mathf.clamp01(n);

        // If the optional multiinterpolate is set, then use multiInterpolate
        // to figure out what the correct frame should be.
        if (this.multiInterpolate && !noMultiInterpolate) {
            let interpolateMap = this.multiInterpolate.calculate(progress);
            progress = mathf.clamp01(interpolateMap['sequence']);
        }

        // Update clip path multli interpolate.
        if (this.clipMultiInterpolate) {
            this.clipMultiInterpolate.calculate(progress);
        }

        // Flush cache if progress is 0 or 1 to ensure final frame is always
        // played.
        if (progress >= 0.95 || progress <= 0.05) {
            this.flush();
        }

        // Figure out the correct frame to render based on the number of
        // frames in the sequence.
        if (this.activeImageSet) {
            const total = this.activeImageSet.images.length - 1;
            const targetFrame = Math.ceil(mathf.lerp(0, total, progress));
            this.renderFrame(targetFrame);
        }
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


        let imageSource = this.activeImageSet!.images[Math.round(this.currentFrame)];
        this.draw(imageSource);
    }

    /**
     * Flush the draw cache.
     */
    flush() {
        this.draw(null);
    }

    /**
     * Draws a rectangle on the canvas.
     */
    private drawRectangle(config: rectConfig) {
        // let radiusPercent = config.radius;
        // let height = config.top - config.bottom;
        // let width = config.left - config.right;
        // Calculate border radius as a percentage.
        let radius = {
            tl: config.radius,
            tr: config.radius,
            br: config.radius,
            bl: config.radius,
        };

        this.context.beginPath();
        this.context.moveTo(config.left + radius.tl, config.top);
        this.context.lineTo(config.right - radius.tr, config.top);
        this.context.quadraticCurveTo(config.right,
            config.top, config.right, config.top + radius.tr);

        this.context.lineTo(config.right, config.bottom - radius.br);
        this.context.quadraticCurveTo(config.right,
            config.bottom,
            config.right - radius.br,
            config.bottom);

        this.context.lineTo(config.left + radius.bl, config.bottom);
        this.context.quadraticCurveTo(
            config.left, config.bottom, config.left, config.bottom - radius.bl);

        this.context.lineTo(config.left, config.top + radius.tl);
        this.context.quadraticCurveTo(
            config.left, config.top, config.left + radius.tl, config.top);
        this.context.closePath();
        this.context.fill();
    }

    /**
     * Applies clipping to the canvas prior to drawing.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Path2D
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip
     */
    private applyCanvasClipping() {
        let context = this.context;

        // Make a similar algo as inset done in css clip-path.
        //
        // clip-path: inset(var(--clip-top) var(--clip-right) var(--clip-bottom) var(--clip-left) round var(--clip-radius))
        //
        // Since it's an inset algo, 0% would mean it is fully show.
        // - top: 50% would mean the top half is missing
        // - bottom: 50% would mean the bottom half is missing
        // - right: 50% would mean the right half is missing
        // - left: 50% would mean the left half is missing
        if (this.clipPathType == 'inset') {
            let results = this.clipMultiInterpolate!.getCalculations() || {};
            let top = results['top'] || 0;
            let bottom = results['bottom'] || 0;
            let left = results['left'] || 0;
            let right = results['right'] || 0;
            let borderRadius = results['border-radius'] || 0;
            this.drawRectangle({
                top: this.canvasHeight - ((1 - top) * this.canvasHeight),
                left: this.canvasWidth - ((1 - left) * this.canvasWidth),
                right: (1 - right) * this.canvasWidth,
                bottom: (1 - bottom) * this.canvasHeight,
                radius: borderRadius,
            });
            this.context.clip();
        }
    }

    private clear() {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    private draw(imageSource: string | null): void {
        // Prevent invalid draws
        if (!imageSource || this.disposed) {
            return;
        }

        this.clear();
        this.context.save();
        if (!is.null(this.clipPathType)) {
            this.applyCanvasClipping();
        }

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
            this.containScale =
                mathf.calculateBackgroundContain(containerBox, imageBox);

            // Default center algo.
            let diffX =
                (containerBox.width - (imageBox.width * this.containScale)) / 2;
            let diffY =
                (containerBox.height - (imageBox.height * this.containScale)) / 2;

            // Sizing option logic.
            if (this.sizingOptions && is.number(this.sizingOptions.bottom)) {
                // Bottom align it.
                diffY = containerBox.height - (imageBox.height * this.containScale);

                // Easy way to test this is to set bottom: 1 and
                // bottomClipping: false which would top align the image.
                if (this.sizingOptions.bottomNoClip) {
                    diffY -=
                        (containerBox.height - (imageBox.height * this.containScale))
                        * this.sizingOptions.bottom
                } else {
                    // Clipping Bottom algo.
                    // Add the percentage amount specified.
                    diffY -= containerBox.height * this.sizingOptions.bottom;
                }
            }

            if (this.sizingOptions && is.number(this.sizingOptions.right)) {
                // Right align it.
                diffX = containerBox.width - (imageBox.width * this.containScale);

                // Easy way to test this is to set right: 1 and
                // rightClipping: false which would left align the image.
                if (this.sizingOptions.rightNoClip) {
                    diffX -=
                        (containerBox.width - (imageBox.width * this.containScale))
                        * this.sizingOptions.right
                } else {
                    // Clipping right algo.
                    // Add the percentage amount specified.
                    diffX -= containerBox.width * this.sizingOptions.right;
                }
            }

            if (this.sizingOptions && is.number(this.sizingOptions.top)) {
                // Top align it.
                diffY = 0;
                // Easy way to test this is to set top: 1 and
                // topClipping: false which would bottom aligned the image.
                if (this.sizingOptions.topNoClip) {
                    diffY =
                        (containerBox.height - (imageBox.height * this.containScale))
                        * this.sizingOptions.top
                } else {
                    // Clipping Top algo.
                    // Add the percentage amount specified.
                    diffY += this.sizingOptions.top * containerBox.height
                }
            }


            if (this.sizingOptions && is.number(this.sizingOptions.left)) {
                // Left align it.
                diffX = 0;
                // Easy way to test this is to set left: 1 and
                // leftClipping: false which would right aligned the image.
                if (this.sizingOptions.leftNoClip) {
                    diffX =
                        (containerBox.width - (imageBox.width * this.containScale))
                        * this.sizingOptions.left
                } else {
                    // Clipping left algo.
                    // Add the percentage amount specified.
                    diffX += this.sizingOptions.left * containerBox.width
                }
            }


            this.context.drawImage(
                image,
                diffX >> 0, diffY >> 0,
                imageBox.width * this.containScale >> 0,
                imageBox.height * this.containScale >> 0,
            );
        }

        this.context.restore();
        this.lastRenderSource = imageSource;
    }


    /**
     * Updates the internal sizing options.
     * @param options
     */
    setSizingOptions(options: CanvasImageSequenceSizingOptions) {
        this.sizingOptions = options;
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
        this.stop();
        this.rafTimer = new RafTimer((progress: number) => {
            let interpolatedProgress = mathf.interpolateRange(
                progress, 0, 1,
                from, to
            );
            this.renderProgress(interpolatedProgress);
        })
        this.rafTimer.setDuration(duration);
        this.playDefer = new Defer();
        this.rafTimer.onComplete(() => {
            this.isPlaying = false;
            this.playDefer!.resolve();
            this.rafTimer!.dispose();
        });
        this.rafTimer.play();
        this.isPlaying = true;
        return this.playDefer!.getPromise();
    }

    /**
     * Gets the hex color at the given coordinates of the canvas as it is
     * renders at the moment.
     * @param coords
     */
    getHexColorAtPoint(coords:Vector) {
        return domCanvas.getColorAtPointAsHex(this.context, coords);
    }

    /**
     * Immediately stops the canvas animation playing.
     * (that happens with play method).
     */
    stop() {
        this.rafTimer && this.rafTimer.pause();
        this.rafTimer && this.rafTimer.dispose();
        this.playDefer && this.playDefer!.resolve();
    }

    dispose() {
        this.disposed = true;
        this.stop();
        this.domWatcher.dispose();
        this.rafTimer && this.rafTimer.dispose();
        this.imageLoader && this.imageLoader.dispose();
    }

}