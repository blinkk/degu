import * as dom from '../dom/dom';
import {is} from '../is/is';
import {func} from '../func/func';
import {Defer} from '../func/defer';
import {BlobLoader} from '../loader/blob-loader';
import {mathf} from '../mathf/mathf';
import {DomWatcher} from '../dom/dom-watcher';
import {
  MultiInterpolate,
  rangedProgress,
  interpolateSettings,
} from '../interpolate/multi-interpolate';
import {RafTimer} from '../raf/raf-timer';
import {Fps} from '../time/fps';
import {domCanvas} from '../dom/dom-canvas';
import {Vector} from '../mathf/vector';

export interface CanvasImageSequenceImageSet {
  /**
   * A list of image sources.
   */
  images: Array<string>;

  /**
   * An optional condition for when this image set should be loaded.
   * Note that this only gets evaluated when the window resizes.
   */
  when?: Function;
}

export interface CanvasImageSequenceOptions {
  /**
   * Whether the sizing should use cover insted of contain.
   */
  cover: boolean;
  /**
   * When using "contain" or "cover" mode, the amount to position FROM the vertical bottom.
   * By default, contain mode will vertically center your image.  Setting this
   * option will adjust the vertical position of the image.
   *
   * This is designed to mimic behavior of background-position as much as possible.
   *
   * Example: bottom: 0 ---> the bottom of the image should align with the
   *                         bottom of the canvas element.
   * Example: bottom: 0.2 ---> the bottom of the image should align from the
   *                         bottom 20% of the canvas element.
   */
  bottom: number;

  /**
   * When calculating the bottom, whether to allow the image clip.   Basically,
   * says, move this from the top from 0-1 without clipping the image and
   * alters the position algo.
   *
   * By default, position calculation will allow clipping and the specified
   * percentage is based on the size of the canvas.  Using this option,
   * will alter the values to never clip.
   *
   * This option is NOT available when using cover mode.
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
  bottomNoClip: boolean;

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
  top: number;

  /**
   * When calculating the top, whether to allow the image clip.   Basically,
   * says, move this from the top from 0-1 without clipping the image and
   * alters the position algo.
   *
   * By default, position calculation will allow clipping and the specified
   * percentage is based on the size of the canvas.  Using this option,
   * will alter the values to never clip.
   *
   * This option is NOT available when using cover mode.
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
  topNoClip: boolean;

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
  left: number;

  /**
   * When calculating the left, whether to allow the image clip.   Basically,
   * says, move this from the left from 0-1 without clipping the image and
   * alters the position algo.
   *
   * By default, position calculation will allow clipping and the specified
   * percentage is based on the size of the canvas.  Using this option,
   * will alter the values to never clip.
   *
   * This option is NOT available when using cover mode.
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
  leftNoClip: boolean;

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
  right: number;

  /**
   * When calculating the right, whether to allow the image clip.   Basically,
   * says, move this from the right from 0-1 without clipping the image and
   * alters the position algo.
   *
   * By default, position calculation will allow clipping and the specified
   * percentage is based on the size of the canvas.  Using this option,
   * will alter the values to never clip.
   *
   * This option is NOT available when using cover mode.
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
  rightNoClip: boolean;

  /**
   * Optional aria label to add to the generated canvas.
   */
  ariaLabel: string;
}

export const canvasImageSequenceErrors = {
  NO_ELEMENT: 'An element is required for canvas image sequence',
  NO_IMAGE_SETS: 'Image sets are required for canvas image sequence',
  NO_IMAGES:
    'There are no images defined in your canvas image sequence image set',
};

export interface CanvasImageSequenceClipInterpolationConfig {
  type: string;
  interpolations: Array<interpolateSettings>;
}

interface rectConfig {
  top: number;
  bottom: number;
  right: number;
  left: number;
  radius: number;
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
 *   },
 *   is.ipad() : 1 : undefined // Force dpr 1 on ipad that has less memory.
 * );
 *
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
 *
 *
 * ### Sizing options.
 * CanvasImageSequence has two render modes, contain (default) and cover.
 * Contain will by default vertically center your image but you can offset this
 * by providing a bottom value.
 *
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
 * ```ts
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
 * ```
 *
 * Can I have imageSets for only desktop or mobile?  Yes you can!
 *
 * ```ts
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
 *
 * ############# Dev Notes ####################
 *
 * # Memory management (dev notes)
 * When working on this class, you have to be very careful about memory management
 * since we are dealing with a lot of images.
 *
 * There is native memory and image cache that need to be particularly looked at.
 * You can go to Chrome -> Task manager and monitor the usage.
 * Make sure to enable the memory footprint and image cache columns.
 *
 * For Safari, the best place is to open Activity Monitor. Open safari and
 * open the site.  Within Activity Monitor, look for your process (it will be the
 * name of the page).  Double click on it to get real memory usage.  You can
 * also use the Safari WebTools memory and CPU profile.
 *
 *
 * 1) image.decode() and ImageBitmaps
 * If you run image.decode() or load ImageBitmaps, this data appears to get stored
 * over in native memory.  canvas.drawImage stores in image cache which is
 * separate.
 *
 * The issue is the when you run image.decode() or use ImageBitmaps, the native
 * memory space they occupy, won't get flushed.  It seems to get flushed only
 * when the canvas or document is unloaded.
 *
 * For example:
 *
 * ```
 * const image = new Image();
 * image.src = 'hohoho.jpg';
 * image.decode(()=> { // This pushes it to native memory.
 *   image = null; // This won't get removed even with GC.
 * })
 * ```
 *
 * This removes the reference to the image but even with GC won't flush the native
 * memory.
 *
 * It's best to avoid this and instead just load images normally OR
 * use ObjectUrl to make a local blob.
 *
 *
 * 2) Problem 2
 * canvas.drawImage(image) memory issues and also Safari DataURI (base64)
 *
 * canvas.drawImage, essentially copies the decoded image data over to the image cache.
 * Therefore, even doing:
 *
 * ```
 * canvas.drawImage(image);  // decoded copy stored to image cache.
 * canvas.drawImage(image);  // decoded copy stored to image cache
 * canvas.drawImage(image);  // decoded copy stored to image cache.
 * ```
 * Quickly results in the imageCache growing.  While this is usually fine since
 * the image cache gets cleared pretty quickly, with a class like this, if you have
 * 100 images, that cache with that data decoded ends up being very large.
 *
 * To avoid this, you need to delete the image from reference.
 *
 * ```
 * canvas.drawImage(image);  // decoded copy stored to image cache.
 * image.src = null; // reference removed.  image cache gets cleared.
 * image = null;
 * ```
 *
 * This essentially means, that if we don't want the image cache to grow, we
 * need to delete the image that was just drawn after the draw call.
 *
 *
 * 3) Problem 3
 * Safari Canvas Issues:
 * Note that Safari also has some issues with memory management.
 * In general, Safari doesn't do a great job offloading base64 images from cache.
 *
 * The best way to manage is:
 * 1) don't use base64Images and draw to canvas (since Safari doesn't release memory)
 * 2) delete image data to offload memory after drawImage calls.
 *
 *
 * Overall best practice:
 * The solution take to avoid these problems are:
 * - don't use image.decode()
 * - don't use ImageBitmaps
 * - don't use base64uri image Safari can't offload them.
 * - always remove the image after using drawImage().  Best way to do this is
 *   to use a temporary image and assign it a local objectURI.
 * - when you resize a canvas it clears it out.  You need to resize with smartResize
 *   to avoid flashes on ios mobile where the document height changes as you resize
 *   firing resize events.
 *
 *
 * Approach to solving the above:
 * 1) Make XHR calls to all image urls and save the blobs in memory (blobCache).
 * 2) Create a single cacheImage (Image) that will temporarily hold data while it gets
 *    drawn to canvas (cacheImage)
 * 3) On each draw call, use ObjectURIs to locally generate a temporary blob image.
 *    Set that to the cacheImage then canvas.drawImage(cacheImage) and following that
 *    then revoke the ObjectURI (to release it from memory).
 *
 * This can be roughly illustrated as:
 * ```ts
 *
 * this.blobCache = xxx.getBlobsDataFromServer();
 *
 * // Create an image that will temporarily hold data.
 * this.cacheImage = new Image();
 *
 * draw(source) {
 *
 *   img.onload = () => {
 *     this.drawImage(this.cacheImage);
 *     // Remove it from memory.
 *     URL.revokeObjectURL(image.src);
 *   }
 *
 *    // Create a local objectURI and apply it as the image source.
 *    this.cacheImage.src = URL.createObjectURL(this.blobCache[source]);
 * }
 *
 * dispose() {
 *   // Delete all blobs help in memory.
 *   this.blobCache = null;
 * }
 *
 * ```
 *
 * With the solution above, generally, the encoded size of all images are stored
 * in native memory + one decoded image in memory cache at any given time.  If you
 * are working with pngs, this can still mean a huge memory hoge so watch out.
 *
 *
 * 4) FPS - ipad CPU
 * Since we need to decode per drawFrame, this has a higher CPU cost.
 *
 * To lower the CPU usage, internally we manage an fps rate limiter.
 * This is set to 30, which is the maximum we really need to get a smooth
 * perceived animation.
 *
 * 5) Even with the optimizations above, VRAM (GPU memory) can can be relatively
 *    high. If you just need basic features, consider webgl-image-canvas
 *    as an alternative which is more performant.
 *
 *
 *
 *
 *
 * @see https://github.com/blinkkcode/degu/blob/master/examples/canvas-image-sequence.js
 * @see https://github.com/blinkkcode/degu/blob/master/examples/canvas-image-sequence2.js
 * @see https://github.com/blinkkcode/degu/blob/master/examples/canvas-image-sequence3.js
 * @see https://github.com/blinkkcode/degu/blob/master/examples/canvas-image-sequence4.js
 * @see https://github.com/blinkkcode/degu/blob/master/examples/canvas-image-sequence5.js
 * @unstable
 */
export class CanvasImageSequence {
  /**
   * The main element to add canvas to.
   */
  private element: HTMLElement | null;

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
   * Internal instance of BlobLoader.
   */
  private blobLoader: BlobLoader | null;

  /**
   * A deferred promised that completes when all images have been loaded.
   */
  private readyPromise: Defer;
  private domWatcher: DomWatcher;

  /**
   * Blobs are stored to this dictionary.  These are
   * held in memory.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private blobCache: {[key: string]: any} | null;

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

  private canvasElement: HTMLCanvasElement | null;
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

  /**
   * An fps rate limiter.
   */
  private fps: Fps;

  /**
   *  The previously rendered image source.
   */
  private lastRenderSource: string | null;

  /**
   * The last known request to draw a specific image.  Different from
   * lastRenderSource in that, this image may not have been drawn.
   */
  private lastDrawSource: string | null;

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
   * Sizing options for CanvasImageSequence.
   */
  private options: CanvasImageSequenceOptions | undefined;

  /**
   * Whether the instance has been disposed or not.
   */
  private disposed: boolean;

  private cacheImage: HTMLImageElement | null;

  constructor(
    element: HTMLElement,
    imageSets: Array<CanvasImageSequenceImageSet>,
    options?: CanvasImageSequenceOptions,
    dpr?: number
  ) {
    this.element = element;
    if (!element) {
      throw new Error(canvasImageSequenceErrors.NO_ELEMENT);
    }

    if (!imageSets) {
      throw new Error(canvasImageSequenceErrors.NO_IMAGE_SETS);
    }

    this.imageSets = imageSets;
    this.activeImageSet = null;
    this.blobCache = {};

    this.options = options;

    this.isPlaying = false;
    // this.useBitmapImageIfPossible = false;

    // Create canvas.
    this.canvasElement = document.createElement('canvas');

    // Add aria label if available.
    if (this.options && this.options.ariaLabel) {
      this.canvasElement.setAttribute('aria-label', this.options.ariaLabel);
      this.canvasElement.setAttribute('role', 'img');
    } else {
      this.canvasElement.setAttribute('aria-hidden', 'true');
    }

    this.context = this.canvasElement.getContext('2d')!;
    this.dpr = func.setDefault(dpr, window.devicePixelRatio || 1);
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.imageNaturalHeight = 0;
    this.imageNaturalWidth = 0;
    this.currentFrame = 0;
    this.lastDrawSource = null;
    this.targetFrame = 0;
    this.containScale = null;
    this.disposed = false;
    // Set FPS to 30 for Safari to limit computation.  Safari takes a lot
    // more time to decode images so this prevents high CPU usage crashes
    // in Safari.
    this.fps = new Fps(is.safari() ? 30 : 60);
    this.cacheImage = new Image();

    this.rafTimer = null;
    this.multiInterpolate = null;
    this.clipMultiInterpolate = null;
    this.clipPathType = null;
    this.blobLoader = null;
    this.progress = null;
    this.playDefer = null;

    this.domWatcher = new DomWatcher();
    this.domWatcher.add({
      element: window,
      // Ensure we use smart resize here because resizing canvas will make
      // it flash (due to clearing the canvas).
      on: 'smartResize',
      callback: () => {
        this.resize();

        this.flush(); // Make a empty call to clear the memoize cache.
        // Rerender the last known image.
        this.lastDrawSource = null;
        this.fps.lock(false);
        this.lastRenderSource && this.draw(this.lastRenderSource);
        this.fps.lock(true);
      },
      id: 'resize',
      eventOptions: {passive: true},
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
        const newSet = this.getSourceThatShouldLoad(this.imageSets);
        if (newSet !== this.activeImageSet) {
          this.loadNewSet(this.imageSets);
          // Autoload the content.
          this.load().then(() => {
            // Set last frame to null to allow redrawing.
            this.lastDrawSource = null;
            this.fps.lock(false);
            this.renderByProgress(this.progress || 0);
            this.fps.lock(true);
          });
        }
      },
      id: 'image-set-resize',
      eventOptions: {passive: true},
    });

    this.element.appendChild(this.canvasElement);

    this.readyPromise = new Defer();

    this.loadNewSet(imageSets);

    // The previously rendered image source.
    this.lastRenderSource = null;
    this.lastDrawSource = null;

    // Cull unncessary update
    this.draw = func.runOnceOnChange(this.draw.bind(this));
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
          progress: interpolations,
        },
      ],
    });
  }

  resize() {
    this.canvasWidth = this.element!.offsetWidth;
    this.canvasHeight = this.element!.offsetHeight;

    // Set canvas to high dpr, the actual width to the size.
    // @see https://gist.github.com/callumlocke/cc258a193839691f60dd
    // for inspiration.
    this.canvasElement!.width = this.element!.offsetWidth * this.dpr;
    this.canvasElement!.height = this.element!.offsetHeight * this.dpr;
    this.canvasElement!.style.width = this.canvasWidth + 'px';
    this.canvasElement!.style.height = this.canvasHeight + 'px';

    // Scale up the canvas to compensate DPR.
    this.context.scale(this.dpr, this.dpr);
  }

  /**
   * Starts loading the images.
   */
  load(): Promise<void> {
    // If there is no matching imageSet there is nothing to load.
    if (!this.blobLoader || !this.activeImageSet) {
      // Defer resolution.
      window.setTimeout(() => {
        this.readyPromise.resolve();
      });
      return this.readyPromise.getPromise();
    }

    const loadAllBlobs = () => {
      this.blobLoader!.load().then(results => {
        this.blobCache = results;
        this.setImageDimensions().then(() => {
          this.blobLoader!.dispose();
          this.readyPromise.resolve(results);
        });
      });
    };

    loadAllBlobs();

    return this.readyPromise.getPromise();
  }

  /**
   * Allows you to set new imageSets.
   *
   * @param imageSource
   */
  loadNewSet(imageSets: Array<CanvasImageSequenceImageSet>) {
    // Release memory of current set.
    this.blobLoader && this.blobLoader.dispose();

    // Save the image sources.
    this.imageSets = imageSets;
    this.activeImageSet = this.getSourceThatShouldLoad(this.imageSets);

    if (this.activeImageSet && !is.array(this.activeImageSet.images)) {
      throw new Error(canvasImageSequenceErrors.NO_IMAGES);
    }

    // Set the active image set if one is available.
    if (this.activeImageSet) {
      this.blobLoader = new BlobLoader(this.activeImageSet.images);
    } else {
      this.blobLoader = null;
    }

    this.blobCache = {};
    this.flush();
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
  private getSourceThatShouldLoad(
    sources: Array<CanvasImageSequenceImageSet>
  ): CanvasImageSequenceImageSet {
    const matchingSouces: Array<CanvasImageSequenceImageSet> = [];
    sources.forEach(source => {
      if (!source.when) {
        matchingSouces.push(source);
      } else {
        source.when() && matchingSouces.push(source);
      }
    });
    return matchingSouces[0];
  }

  /**
   * Makes a deletable image clone.
   */
  makeImage(source: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
      if (!source || !this.blobCache![source]) {
        resolve(null);
        return;
      }

      // Remove the objectURL Blob from locale cache.
      URL.revokeObjectURL(this.cacheImage!.src);
      this.cacheImage!.onload = () => {
        resolve(this.cacheImage);
      };

      // Create a new temporary ObjectURl to store.
      this.cacheImage!.src = URL.createObjectURL(this.blobCache![source]);
    });
  }

  /**
   * Sets the images dimensions used internally based on the first image.
   * Assumes all images are uniform size.
   */
  private setImageDimensions(): Promise<void> {
    return new Promise(resolve => {
      const source = this.activeImageSet!.images[0];
      const blob = this.blobCache![source];

      // Generate an image from teh first blob.
      dom.makeImageFromBlob(blob).then((image: HTMLImageElement | null) => {
        const bitMapsLoaded = !image!.naturalWidth;
        this.imageNaturalHeight = bitMapsLoaded
          ? image!.height
          : image!.naturalHeight;
        this.imageNaturalWidth = bitMapsLoaded
          ? image!.width
          : image!.naturalWidth;

        // Release it from memory.
        dom.deleteImage(image!);
        image = null;
        resolve();
      });
    });
  }

  /**
   * Gets internally used current image seet.
   */
  getActiveImages(): Array<string> {
    return this.activeImageSet!.images;
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
      interpolations: config.interpolations,
    });
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
  renderByProgress(n: number, noMultiInterpolate = false) {
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
  private renderProgress(n: number, noMultiInterpolate = false) {
    let progress = mathf.clamp01(n);

    // If the optional multiinterpolate is set, then use multiInterpolate
    // to figure out what the correct frame should be.
    if (this.multiInterpolate && !noMultiInterpolate) {
      const interpolateMap = this.multiInterpolate.calculate(progress);
      progress = mathf.clamp01(<number>interpolateMap['sequence']);
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
      this.currentFrame = mathf.lerp(
        this.currentFrame,
        this.targetFrame,
        this.lerpAmount
      );

      // If there is a delta, keep updating with RAF until it gets resolved.
      diff = Math.abs(this.targetFrame - this.currentFrame);
      const precision = 0.001;
      if (diff >= precision) {
        window.requestAnimationFrame(() => {
          this.renderFrame(this.targetFrame);
        });
      }
    } else {
      this.currentFrame = this.targetFrame;
    }

    const imageSource = this.activeImageSet!.images[
      Math.round(this.currentFrame)
    ];
    this.draw(imageSource);
  }

  /**
   * Flush the draw cache.
   */
  flush() {
    this.draw(''); // Make a empty call to clear the memoize cache.
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
    const radius = {
      tl: config.radius,
      tr: config.radius,
      br: config.radius,
      bl: config.radius,
    };

    this.context.beginPath();
    this.context.moveTo(config.left + radius.tl, config.top);
    this.context.lineTo(config.right - radius.tr, config.top);
    this.context.quadraticCurveTo(
      config.right,
      config.top,
      config.right,
      config.top + radius.tr
    );

    this.context.lineTo(config.right, config.bottom - radius.br);
    this.context.quadraticCurveTo(
      config.right,
      config.bottom,
      config.right - radius.br,
      config.bottom
    );

    this.context.lineTo(config.left + radius.bl, config.bottom);
    this.context.quadraticCurveTo(
      config.left,
      config.bottom,
      config.left,
      config.bottom - radius.bl
    );

    this.context.lineTo(config.left, config.top + radius.tl);
    this.context.quadraticCurveTo(
      config.left,
      config.top,
      config.left + radius.tl,
      config.top
    );
    this.context.closePath();
    this.context.fill();
  }

  /**
   * Applies clipping to the canvas prior to drawing.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Path2D
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip
   */
  private applyCanvasClipping() {
    // Make a similar algo as inset done in css clip-path.
    //
    // clip-path: inset(var(--clip-top) var(--clip-right) var(--clip-bottom) var(--clip-left) round var(--clip-radius))
    //
    // Since it's an inset algo, 0% would mean it is fully show.
    // - top: 50% would mean the top half is missing
    // - bottom: 50% would mean the bottom half is missing
    // - right: 50% would mean the right half is missing
    // - left: 50% would mean the left half is missing
    if (this.clipPathType === 'inset') {
      const results = this.clipMultiInterpolate!.getCalculations() || {};
      const top = <number>results['top'] || 0;
      const bottom = <number>results['bottom'] || 0;
      const left = <number>results['left'] || 0;
      const right = <number>results['right'] || 0;
      const borderRadius = <number>results['border-radius'] || 0;
      this.drawRectangle({
        top: this.canvasHeight - (1 - top) * this.canvasHeight,
        left: this.canvasWidth - (1 - left) * this.canvasWidth,
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

  private async draw(imageSource: string | null) {
    // Prevent invalid draws
    if (!imageSource || this.disposed) {
      return;
    }

    if (imageSource === this.lastDrawSource) {
      return;
    }
    this.lastDrawSource = imageSource;

    // If this was called at a rate exceeding the fps limit.
    if (!this.fps.canRun()) {
      this.fps.schedule(() => {
        // Force a draw.  This ensures that even with FPS limiting,
        // the very last draw call is always rendered.
        this.lastDrawSource = null;
        this.draw(imageSource);
      });
      return;
    }

    const image = await this.makeImage(imageSource);

    // Decoding images in this way, we see a huge memory jump.  Avoid for now.
    // await image.decode();

    // If an image couldn't be generated for some reason.
    if (!image) {
      return;
    }

    const imageBox = {
      width: this.imageNaturalWidth,
      height: this.imageNaturalHeight,
    };
    const containerBox = {
      width: this.canvasWidth,
      height: this.canvasHeight,
    };

    this.clear();

    if (!is.null(this.clipPathType)) {
      this.context.save();
      this.applyCanvasClipping();
    }

    // Background "cover" sizing.
    // Defaults to center.
    if (this.options && this.options.cover) {
      const cover = mathf.calculateBackgroundCover(containerBox, imageBox);

      if (this.options && is.number(this.options.left)) {
        cover.xOffset =
          (containerBox.width - imageBox.width * cover.scalar) *
          -this.options.left;
      }

      if (this.options && is.number(this.options.right)) {
        // Right align first.
        cover.xOffset = -(containerBox.width - imageBox.width * cover.scalar);
        cover.xOffset +=
          (containerBox.width - imageBox.width * cover.scalar) *
          this.options.right;
      }

      if (this.options && is.number(this.options.bottom)) {
        // Set to bottom.
        cover.yOffset = -(containerBox.height - imageBox.height * cover.scalar);
        // Clipping Bottom algo.
        // Add the percentage amount specified.
        cover.yOffset +=
          (containerBox.height - imageBox.height * cover.scalar) *
          this.options.bottom;
      }

      if (this.options && is.number(this.options.top)) {
        cover.yOffset =
          (containerBox.height - imageBox.height * cover.scalar) *
          -this.options.top;
      }

      this.context!.drawImage(
        image,
        -cover.xOffset >> 0,
        -cover.yOffset >> 0,
        (imageBox.width * cover.scalar) >> 0,
        (imageBox.height * cover.scalar) >> 0
      );
    } else {
      // Default to contain sizing algo.
      this.containScale = mathf.calculateBackgroundContain(
        containerBox,
        imageBox
      );

      // Default center algo.
      let diffX = (containerBox.width - imageBox.width * this.containScale) / 2;
      let diffY =
        (containerBox.height - imageBox.height * this.containScale) / 2;

      // Sizing option logic.
      if (this.options && is.number(this.options.bottom)) {
        // Bottom align it.
        diffY = containerBox.height - imageBox.height * this.containScale;

        // Easy way to test this is to set bottom: 1 and
        // bottomClipping: false which would top align the image.
        if (this.options.bottomNoClip) {
          diffY -=
            (containerBox.height - imageBox.height * this.containScale) *
            this.options.bottom;
        } else {
          // Clipping Bottom algo.
          // Add the percentage amount specified.
          diffY -= containerBox.height * this.options.bottom;
        }
      }

      if (this.options && is.number(this.options.right)) {
        // Right align it.
        diffX = containerBox.width - imageBox.width * this.containScale;

        // Easy way to test this is to set right: 1 and
        // rightClipping: false which would left align the image.
        if (this.options.rightNoClip) {
          diffX -=
            (containerBox.width - imageBox.width * this.containScale) *
            this.options.right;
        } else {
          // Clipping right algo.
          // Add the percentage amount specified.
          diffX -= containerBox.width * this.options.right;
        }
      }

      if (this.options && is.number(this.options.top)) {
        // Top align it.
        diffY = 0;
        // Easy way to test this is to set top: 1 and
        // topClipping: false which would bottom aligned the image.
        if (this.options.topNoClip) {
          diffY =
            (containerBox.height - imageBox.height * this.containScale) *
            this.options.top;
        } else {
          // Clipping Top algo.
          // Add the percentage amount specified.
          diffY += this.options.top * containerBox.height;
        }
      }

      if (this.options && is.number(this.options.left)) {
        // Left align it.
        diffX = 0;
        // Easy way to test this is to set left: 1 and
        // leftClipping: false which would right aligned the image.
        if (this.options.leftNoClip) {
          diffX =
            (containerBox.width - imageBox.width * this.containScale) *
            this.options.left;
        } else {
          // Clipping left algo.
          // Add the percentage amount specified.
          diffX += this.options.left * containerBox.width;
        }
      }

      this.context!.drawImage(
        image,
        diffX >> 0,
        diffY >> 0,
        (imageBox.width * this.containScale) >> 0,
        (imageBox.height * this.containScale) >> 0
      );
    }

    if (!is.null(this.clipPathType)) {
      this.context!.restore();
    }

    this.lastRenderSource = imageSource;
  }

  /**
   * Updates the internal sizing options.
   * @param options
   */
  setSizingOptions(options: CanvasImageSequenceOptions) {
    this.options = options;
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
      const interpolatedProgress = mathf.interpolateRange(
        progress,
        0,
        1,
        from,
        to
      );
      this.renderProgress(interpolatedProgress);
    });
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
  getHexColorAtPoint(coords: Vector) {
    return domCanvas.getColorAtPointAsHex(this.context!, coords);
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

  /**
   * Returns the image dimension that were fetched.  This is based
   * on the "first" image in the sequence.
   * The sizes will be null if called prior to loading images.
   */
  getImageSize(): Object {
    return {
      width: this.imageNaturalWidth,
      height: this.imageNaturalHeight,
    };
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.domWatcher.dispose();
    this.rafTimer && this.rafTimer.dispose();
    this.blobLoader && this.blobLoader.dispose();
    this.element = null;
    this.blobCache = null;
    this.canvasElement = null;
    dom.deleteImage(this.cacheImage!);
    this.cacheImage = null;
  }
}
