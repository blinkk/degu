import {DomWatcher} from './dom-watcher';
import * as mathf from '../mathf/mathf';
import * as func from '../func/func';
import {EventDispatcher, EventCallback, EventManager} from '../ui/events';
import {AnimationItem, LottiePlayer} from '../third-party/lottie';

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

  // Required.  Pass lottie instance.
  lottie: LottiePlayer;
}

/**
 * Lottie progress player class.
 *
 *
 * The lottie progress player is designed to play a lottie based on progress
 * or frame.
 *
 *
 * # Required - loading Lottie
 * Prior to using lottieProgressPlayer, you must load lottie first.
 * You can do this using degu script loader.
 *
 * ```
 *
 *   import {ScriptLoader} from '@blinkk/degu/lib/loader/script-loader';
 *   this.scriptLoader
 *     .load(
 *       'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.14/lottie.min.js',
 *       {
 *         test: () => window['lottie'],
 *       }
 *     )
 *     .then(() => {
 *       this.lottieProgressPlayer = new LottieProgressPlayer(
 *         this.lottieElement,
 *         {
 *          jsonPath: ..,
 *          startFrame: 0,
 *          ...
 *          lottie: window['lottie']
 *         }
 *       );
 *
 *   }
 * ```
 *
 * # General Usage
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
 *
 * # Lottie player events.
 *
 * If you need to hook into lottie events, these are available on lottie progress
 * player.
 *
 *
 * Example: Immediately update the lottie-progress-player to the last frame on
 * load.
 * ```
 *   this.lottieProgressPlayer.on(LottieProgressPlayerEvents.DOMLOADED, ()=> {
 *       this.lottieProgressPlayer.setProgress(1);
 *    })
 * ```
 */
export class LottieProgressPlayer implements EventDispatcher {
  private containerElement: HTMLElement;
  private domWatcher: DomWatcher;
  private eventManager: EventManager;
  private settings: LottieProgressPlayerSettings;
  private lottieInstance: AnimationItem | null = null;
  private currentProgress = 0;
  private lottie: LottiePlayer;

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

    this.lottie = this.settings.lottie;

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
      this.lottie.loadAnimation(lottieSettings as any)
    );

    // Supposed lottie optimization.
    this.lottieInstance.setSubframe(false);
    this.lottieInstance.addEventListener('DOMLoaded', () => {
      this.setProgress(0);
      this.eventManager.dispatch(LottieProgressPlayerEvents.DOMLOADED);
    });
  }

  /**
   * Update the lottie by progress
   */
  public setProgress(progress: number) {
    this.currentProgress = progress;
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

  public resize() {
    this.lottieInstance && this.lottieInstance.resize();
  }

  public getProgress() {
    return this.currentProgress;
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

  public dispose(): void {
    this.domWatcher && this.domWatcher.dispose();
  }
}
