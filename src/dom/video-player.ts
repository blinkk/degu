import {Defer} from '../func/defer';
import {func} from '../func/func';
import {mathf} from '../mathf/mathf';
import {dom} from '../dom/dom';
import {DomWatcher} from './dom-watcher';
import {Raf} from '../raf/raf';

export interface VideoPlayOptions {
  // Whether you prefer the video to loop or not.
  loop: boolean;
  // Optional raf callback you can hook into.
  rafCallback: Function;
}

/**
 * Utility class to handle playing / stopping / playing segments of
 * a given video element.
 *
 * ```ts
 * let video = document.getElementById('video');
 * let videoPlayer = new VideoPlayer(video, {
 *       rafCallback: ()=> {
 *           console.log(videoPlayer.getTime());
 *       }
 * });
 *
 * videoPlayer.load().then(()=> {
 *   console.log("loaded");
 * })
 *
 *
 * videoPlayer.setPointer(1.2);
 * videoPlayer.play();
 * videoPlayer.pause();
 * videoPlayer.playToAndStop(4);
 * videoPlayer.playFrom(5,6);
 *
 * ```
 */
export class VideoPlayer {
  /**
   * video: HTMLVideoElement;
   */
  private video: HTMLVideoElement;
  private videoReady: Defer;

  private raf: Raf;
  private settingsData: VideoPlayOptions;

  /**
   * A stop queue.
   */
  private stopQueue: number;

  constructor(video: HTMLVideoElement, options: VideoPlayOptions) {
    this.video = video;

    if (!this.video) {
      throw new Error('Oops, video is not found');
    }

    this.raf = new Raf(this.onRaf.bind(this));
    this.raf
      .runWhenElementIsInview(this.video, {
        rootMargin: '500px 0px 500px 0px',
      })
      .then(() => {
        this.raf.start();
      });

    // Ensure we don't run into autoplay issues.
    this.video.muted = true;
    this.video['playsinline'] = true;
    this.video.autoplay = false;
    this.settingsData = {
      ...{
        loop: false,
        rafCallback: null,
      },
      ...(options || {}),
    };

    this.videoReady = new Defer();
  }

  /**
   * Loads the video competely first.
   * TODO (uxder): Look for a better way to check completely readyState of video
   *     besides polling.
   */
  public load(): Promise<any> {
    this.video.load();
    if (this.video.readyState === 4) {
      this.videoReady.resolve();
    } else {
      func
        .waitUntil(() => this.video.readyState === 4)
        .then(() => {
          this.videoReady.resolve();
        });
    }
    return this.videoReady.getPromise();
  }

  /**
   * Tests whether the video is currently playing.
   */
  public isPlaying() {
    return dom.testVideoIsPlaying(this.video);
  }

  /**
   * Pauses a video.  Does not reset the pointer.
   *
   * ```
   * // Pause where it at.
   * videoPlayer.pause();
   *
   * // Pauses and resets pointer to 0 mark.
   * videoPlayer.pause();
   * videoPlayer.reset();
   * ```
   */
  public pause() {
    this.video.pause();
  }

  /**
   * Resets the video to the start.
   */
  public reset() {
    this.video.currentTime = 0;
  }

  /**
   * Plays a video from the current pointer.
   */
  public play(): void {
    if (!this.isPlaying()) {
      const playPromise = this.video.play();
      playPromise.then(() => {}).catch(e => {});
    }
  }

  /**
   * Sets the video currentTime to a specific position.
   * @param seconds
   */
  public setPointer(seconds: number) {
    this.video.currentTime = seconds;
  }

  /**
   * Starts playing from the current pointer and stops at a specific time.
   * If the current time
   */
  public playToAndStop(seconds: number) {
    this.stopQueue = seconds;
    this.play();
  }

  /**
   * Plays a specific segment of the video.
   * @param seconds
   */
  public playFromTo(fromSeconds: number, toSeconds: number) {
    this.setPointer(fromSeconds);
    this.playToAndStop(toSeconds);
  }

  /**
   * Gets the video element.
   */
  public getVideo(): HTMLVideoElement {
    return this.video;
  }

  /**
   * Gets the current time.
   */
  public getTime(): number {
    return this.video.currentTime;
  }

  /**
   * Internal clock to check status of video.  We could use
   * timeupdate event on the video but it seems to be slow.
   */
  private onRaf() {
    this.settingsData.rafCallback && this.settingsData.rafCallback();

    if (this.stopQueue && this.getTime() >= this.stopQueue) {
      this.pause();
      this.stopQueue = null;
    }
  }

  /**
   * Disposes the class.
   */
  public dispose() {
    this.raf.dispose();
  }
}
