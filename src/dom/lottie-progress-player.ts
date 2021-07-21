import lottie, {AnimationItem} from 'lottie-web';
import {DomWatcher} from './dom-watcher';
import * as mathf from '../mathf/mathf';
import * as func from '../func/func';
import {EventDispatcher, EventCallback, EventManager} from '../ui/events';

export enum LottieProgressPlayerEvents {
  RESIZE = 'resize',
  INIT = 'init',
  DOMLOADED = 'DOMLoaded',
}

export interface LottieProgressPlayerSettings {
  // The json path to the lottie json file.
  jsonPath: string | null;

  // // If images are not embedded in the json file, the image path to the image directory.
  imagePath?: string | null;

  // The aspect ratio sizing settings to use for lottie. // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
  // Defaults to xMidYMid slice.
  preserveAspectRatio?: string;

  // The renderer to use 'canvas', 'svg'
  renderer?: string;

  // The start and end frame of the lottie
  // If you don't know this, drag your lottie file to https://lottie-tester-dot-googwebreview.appspot.com/
  // and check the console.  It will display the frame.
  startFrame: number;
  endFrame: number;
}

/**
 * Lottie progress player class.
 *
 *
 * The lottie progress player is designed to play a lottie based on progress
 * or frame.
 *
 * ```
 * const lottieProgressPlayer = new LottieProgressPlayer(myContainerElementToAddLottie,
 * {
 *    jsonPath: .. // Path to lottie
 *    startFrame: 0,
 *    endFrame: 0,
 * }
 * )
 *
 *
 * // Update the progress to 0.5.
 * lottieProgressPlayer.setProgress(0.5);
 *
 * // Update the lottie to frame 30
 * lottieProgressPlayer.setFrame(0.5);
 * ```
 *
 * The lottie progress player can go well with scrollProgress or
 * rafTimer classes.
 *
 * If you want to autoplay your lottie.
 *
 * ```
 * let rafTimer = new RafTimer((progress)=> {
 *  lottieProgressPlayer.setProgress(progress)
 * });
 * rafTimer.setDuration(300);
 * rafTimer.play();
 * ```
 *
 * Or you could setup scroll progress and update it as you need.
 *
 * ```
 * const scrollProgress = new ScrollProgress(element);
 * // Add your settings.
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px'
 * }
 * scrollProgress.init(settings);
 *
 * scrollProgress.on(ScrollProgressEvents.RAF, ()=> {
 *   lottieProgressPlayer.setProgress(
 *      this.scrollProgress.getProgress();
 *   )
 * });
 * ```
 */
export class LottieProgressPlayer implements EventDispatcher {
  private containerElement: HTMLElement;
  private domWatcher: DomWatcher;
  private eventManager: EventManager;
  private settings: LottieProgressPlayerSettings;
  private lottieInstance: AnimationItem | null = null;

  constructor(
    containerElement: HTMLElement,
    settings: LottieProgressPlayerSettings
  ) {
    this.eventManager = new EventManager();
    this.containerElement = containerElement;
    this.domWatcher = new DomWatcher();

    this.settings = {
      ...{
        jsonPath: null,
        renderer: 'canvas',
        preserveAspectRatio: 'xMidYMid slice',
        imagePath: null,
      },
      ...settings,
    };

    this.domWatcher.add({
      element: window,
      on: 'smartResize',
      callback: func.debounce(() => {
        this.onWindowResize();
      }, 300),
    });

    this.createLottie();

    this.eventManager.dispatch(LottieProgressPlayerEvents.INIT);
  }

  public createLottie() {
    const lottieSettings = {
      loop: true,
      autoplay: false,
      path: this.settings.jsonPath,
      assetsPath: this.settings.imagePath,
      renderer: this.settings.renderer,
      rendererSettings: {
        // https://github.com/airbnb/lottie-web/issues/1860
        // https://github.com/airbnb/lottie-web/wiki/Renderer-Settings
        // For svg.
        // progressiveLoad: true,
        preserveAspectRatio: this.settings.preserveAspectRatio,
      },
      container: this.containerElement,
    };

    this.lottieInstance = <AnimationItem>(
      lottie.loadAnimation(lottieSettings as any)
    );

    // Supposed lottie optimization.
    this.lottieInstance.setSubframe(false);
    this.lottieInstance.addEventListener('DOMLoaded', () => {
      this.eventManager.dispatch(LottieProgressPlayerEvents.DOMLOADED);
    });
  }

  /**
   * Update the lottie by progress
   */
  public setProgress(progress: number) {
    const frame = mathf.lerp(
      this.settings.startFrame,
      this.settings.endFrame,
      progress
    );
    this.setFrame(frame);
  }

  /**
   * Update the lottie to a specific frame.
   */
  public setFrame(frame: number) {
    this.lottieInstance && this.lottieInstance['goToAndStop'](frame, true);
  }

  public getLottieInstance() {
    return this.lottieInstance;
  }

  public on(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    this.eventManager.on(event, callback);
  }

  protected onWindowResize() {
    this.lottieInstance && this.lottieInstance.resize();
    this.eventManager.dispatch(LottieProgressPlayerEvents.RESIZE);
  }

  protected dispose(): void {
    this.domWatcher && this.domWatcher.dispose();
  }
}
