import {Defer} from '../func/defer';
import * as func from '../func/func';
import * as mathf from '../mathf/mathf';
import {Fps} from '../time/fps';

/**
 * VideoProgress is a class that allows you to quick seek videos.
 * Note that this is a HIGHLY experimental class and it generally only works
 * well for small size mp4 on Chrome and Safari (desktop).  It totally janks on Firefox.
 * See /examples/playground video progress for a sample.
 *
 * @experimental
 * @unstable
 * @hidden
 */
export class VideoProgress {
  private video: HTMLVideoElement;
  private videoReady: Defer;
  private fps: Fps;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.fps = new Fps(30);
    // Ensure we don't run into autoplay issues.
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.autoplay = false;

    this.videoReady = new Defer();
  }

  /**
   * Sets the FPS.
   */
  setFps(fps: number) {
    this.fps.setFps(fps);
  }

  /**
   * Loads the video competely first.
   * TODO (uxder): Look for a better way to check completely readyState of video
   *     besides polling.
   */
  load(): Promise<void> {
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

  setProgress(progress: number) {
    if (this.fps.canRun()) {
      const interpolatedTime = mathf.lerp(0, this.video.duration, progress);
      // this.video.pause();
      // if (this.video['fastSeek']) {
      // this.video['fastSeek'](interpolatedTime);
      // } else {
      if (interpolatedTime) {
        this.video.currentTime = interpolatedTime;
      }
      // }
    }
  }
}
