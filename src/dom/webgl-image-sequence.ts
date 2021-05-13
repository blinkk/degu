import * as dom from '../dom/dom';
import * as is from '../is/is';
import {func} from '../func/func';
import {Defer} from '../func/defer';
import {BlobLoader} from '../loader/blob-loader';
import * as mathf from '../mathf/mathf';
import {DomWatcher} from '../dom/dom-watcher';
import {
  MultiInterpolate,
  rangedProgress,
  interpolateSettings,
} from '../interpolate/multi-interpolate';
import {RafTimer} from '../raf/raf-timer';
import {Fps} from '../time/fps';
import {webgl} from '../dom/webgl';

export const fragShader = `
    precision mediump float;
    uniform sampler2D u_image;
    // texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;
    void main() {
      gl_FragColor = texture2D(u_image, v_texCoord);
    }
`;

export const vertShader = `
    attribute vec2 a_position;
    uniform mat3 u_matrix;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);
      v_texCoord = a_position;
    }
`;

export interface WebGlImageSequenceImageSet {
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

export interface WebGlImageSequenceOptions {
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

export const WebGlImageSequenceErrors = {
  NO_ELEMENT: 'An element is required for webgl image sequence',
  NO_IMAGE_SETS: 'Image sets are required for webgl image sequence',
  NO_IMAGES:
    'There are no images defined in your webgl image sequence image set',
};

export interface WebGlImageSequenceClipInterpolationConfig {
  type: string;
  interpolations: Array<interpolateSettings>;
}

/**
 * A class that allows you to play through an image sequence (sprite) based on
 * progress.  This class is similar to canvas-image-sequence but only implements
 * a subset of the features in preferences for better memory management.
 * Compared to canvas-image-sequence, this class has better VRAM management.
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
 * let sequence = new WebGlImageSequence(
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
 * sequence.load();
 *
 * // At a later time.  If images aren't loaded yet, render will get ignored.
 * sequence.renderByProgress(0);  // Renders frame at progress 0.
 * sequence.renderByProgress(0.5);  // Renders frame at progress 0.5
 * sequence.renderByProgress(1);  // Renders frame at progress 1
 *
 * // When done.
 * sequence.dispose();
 *
 * ```
 *
 * ### Sizing options.
 * WebGlImageSequence has two render modes, contain (default) and cover.
 * Contain will by default vertically center your image but you can offset this
 * by providing a bottom value.
 *
 *
 * ```ts
 * let sequence = new WebGlImageSequence(
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
 * WebGL Image Sequence has multiinterpolation built in to make it easier to
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
 * sequence.setMultiInterpolation(progressPoints);
 * sequence.load();
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
 * sequence.setMultiInterpolation(progressPoints);
 * // Now load the images.
 * sequence.load().then(()=> {
 *    // Now play the image sequence from progress 0 - 1 over a span of 3000 ms.
 *    sequence.play(0, 1, 3000).then(()=> {
 *       console.log('done');
 *    })
 * })
 *
 *
 * // Use stop if you need to stop the animation.
 * sequence.stop();
 *
 * ```
 *
 * ### Lerp Towards Capability
 * By setting a lerp value, webGlImageSequence will automatically "lerp" towards
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
 *  sequence.lerpAmount = 0.12;
 *  sequence.renderByProgress(0);
 *  sequence.renderByProgress(1);
 * ```
 *
 *
 * Another usecase for setting lerp is to handle resolving state after playing
 * a sequence. See webgl-image-sequence4 for more on this.
 *
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
 *  let sequence = new WebGlImageSequence(
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
 *  let sequence = new WebGLImageSequence(
 *   document.querySelector('.my-element'),
 *   [
 *   {
 *     when: ()=> { return window.innerWidth < 768},
 *     images: myMobileImages
 *   }]
 * );
 *
 * ```
 * Here we specify WebGLImageSequence with an imageSet for only mobile.  This
 * means the images will only load on mobile and canvasImageSequence won't
 * do anything on desktop (nothing will show since there are no images).
 *
 *
 *
 * ############# Dev Notes ####################
 * Read the Dev Notes in canvas-image-sequence as this class has the same
 * foundation as canvas-image-sequence.  The primary difference is that
 * this class implements webGL instead of canvas2D as the renderer.
 *
 * In order to keep image-cache down, we still want to utilize the
 * cacheImage technique and generate objectURL and revoke them per drawCall.
 * You also want to avoid image.decode and imageBitmaps (for now).
 *
 * WebGL is primary is better over the canvas2d version because in the
 * canvas2D version, the VRAM (gpu memory) gets very large as it each image
 * gets composited.  The same thing happens in webGL but there is finer
 * control over the memory since we can destory textures.
 *
 * ```
 *   var texture = webgl.createTextureFromImage(gl, image);
 *   // Draw out
 *   ...
 *
 *   // Clear VRAM memory by deleting the texture after render.
 *   webgl.deleteTexture(gl, texture);
 *
 * ```
 *
 * TODO (uxder): Possibly upgrade to compressed textures.
 *           https://blog.playcanvas.com/webgl-texture-compression-made-easy/
 *
 * @unstable
 */
export class WebGlImageSequence {
  /**
   * The main element to add canvas to.
   */
  private element: HTMLElement;

  /**
   * A list canvas image sets.
   */
  private imageSets: Array<WebGlImageSequenceImageSet>;

  /**
   * The last known progress value passed to renderByProgress
   */
  private progress: number | null;

  /**
   * The currently loaded / active image set.
   */
  private activeImageSet: WebGlImageSequenceImageSet | null;

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
  private blobCache: Record<string, Blob>;

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
  private gl: WebGLRenderingContext | null;
  private program: WebGLProgram;
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
   * Options for CanvasImageSequence.
   */
  private options: WebGlImageSequenceOptions | undefined;

  /**
   * Whether the instance has been disposed or not.
   */
  private disposed: boolean;

  private cacheImage: HTMLImageElement;

  constructor(
    element: HTMLElement,
    imageSets: Array<WebGlImageSequenceImageSet>,
    options?: WebGlImageSequenceOptions,
    dpr?: number
  ) {
    this.element = element;
    if (!element) {
      throw new Error(WebGlImageSequenceErrors.NO_ELEMENT);
    }

    if (!imageSets) {
      throw new Error(WebGlImageSequenceErrors.NO_IMAGE_SETS);
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

    this.gl = this.canvasElement.getContext('webgl', {
      antialias: false,
      depth: false,
    });
    this.program = webgl.createProgram(this.gl!, vertShader, fragShader);

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
    this.canvasWidth = this.element.offsetWidth;
    this.canvasHeight = this.element.offsetHeight;
    this.canvasElement.width = this.element.offsetWidth * this.dpr;
    this.canvasElement.height = this.element.offsetHeight * this.dpr;
    this.canvasElement.style.width = this.canvasElement.width / this.dpr + 'px';
    this.canvasElement.style.height =
      this.canvasElement.height / this.dpr + 'px';
  }

  /**
   * Starts loading the images.
   */
  load(): Promise<Record<string, Blob>> {
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
          this.blobLoader = null;
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
  loadNewSet(imageSets: Array<WebGlImageSequenceImageSet>) {
    // Release memory of current set.
    this.blobLoader && this.blobLoader.dispose();

    // Save the image sources.
    this.imageSets = imageSets;
    this.activeImageSet = this.getSourceThatShouldLoad(this.imageSets);

    if (this.activeImageSet && !is.array(this.activeImageSet.images)) {
      throw new Error(WebGlImageSequenceErrors.NO_IMAGES);
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
    sources: Array<WebGlImageSequenceImageSet>
  ): WebGlImageSequenceImageSet {
    const matchingSouces: Array<WebGlImageSequenceImageSet> = [];
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
      if (!source || !this.blobCache[source]) {
        resolve(null);
        return;
      }

      // Remove the objectURL Blob from locale cache.
      URL.revokeObjectURL(this.cacheImage.src);
      this.cacheImage.onload = () => {
        resolve(this.cacheImage);
      };

      // Create a new temporary ObjectURl to store.
      this.cacheImage.src = URL.createObjectURL(this.blobCache[source]);
    });
  }

  /**
   * Sets the images dimensions used internally based on the first image.
   * Assumes all images are uniform size.
   */
  private setImageDimensions(): Promise<void> {
    return new Promise(resolve => {
      const source = this.activeImageSet!.images[0];
      const blob = this.blobCache[source];

      // Generate an image from teh first blob.
      dom.makeImageFromBlob(blob).then(image => {
        const bitMapsLoaded = !image.naturalWidth;
        this.imageNaturalHeight = bitMapsLoaded
          ? image.height
          : image.naturalHeight;
        this.imageNaturalWidth = bitMapsLoaded
          ? image.width
          : image.naturalWidth;

        // Release it from memory.
        dom.deleteImage(image);
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
      progress = mathf.clamp01(interpolateMap['sequence'] as number);
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

  private async draw(imageSource: string | null) {
    // Prevent invalid draws
    if (!imageSource || this.disposed) {
      return;
    }

    if (imageSource === this.lastDrawSource) {
      return;
    }

    // Can't draw on a 0 area canvas
    if (!this.canvasWidth || !this.canvasHeight) {
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

    let x;
    let y;
    let width;
    let height;

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

      x = -cover.xOffset >> 0;
      y = -cover.yOffset >> 0;
      width = (imageBox.width * cover.scalar) >> 0;
      height = (imageBox.height * cover.scalar) >> 0;
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

      x = diffX >> 0;
      y = diffY >> 0;
      width = (imageBox.width * this.containScale) >> 0;
      height = (imageBox.height * this.containScale) >> 0;
    }

    // WebGL Draw.
    const gl = this.gl!;
    const program = this.program;

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const uMatrix = gl.getUniformLocation(program, 'u_matrix');

    gl.useProgram(this.program);
    gl.viewport(
      0,
      0,
      this.canvasWidth * this.dpr,
      this.canvasHeight * this.dpr
    );

    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    webgl.createVbo(gl, [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0,
      1.0,
    ]);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const texture = webgl.createTextureFromImage(gl, image);

    // Convert pixel coords to gl coords based on the x, y, width and height
    // values calculated above.
    const clipX = (x / this.canvasWidth) * 2 - 1;
    const clipY = (y / this.canvasHeight) * -2 + 1;
    const clipWidth = (width / this.canvasWidth) * 2;
    const clipHeight = (height / this.canvasHeight) * -2;

    // Stretch out unit quad.
    gl.uniformMatrix3fv(uMatrix, false, [
      clipWidth,
      0,
      0,
      0,
      clipHeight,
      0,
      clipX,
      clipY,
      1,
    ]);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Clear VRAM memory by deleting the texture after render.
    webgl.deleteTexture(gl, texture!);

    this.lastRenderSource = imageSource;
  }

  /**
   * Updates the internal sizing options.
   * @param options
   */
  setSizingOptions(options: WebGlImageSequenceOptions) {
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
    // this.element = null;
    // this.blobCache = null;
    // this.canvasElement = null;
    dom.deleteImage(this.cacheImage);
    // this.cacheImage = null;
    this.gl = null;
  }
}
