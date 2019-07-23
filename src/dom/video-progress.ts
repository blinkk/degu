

import { Defer } from '../func/defer';
import { func } from '../func/func';
import { mathf } from '../mathf/mathf';
import { WebWorker } from "./web-worker";

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

    constructor(video: HTMLVideoElement) {
        this.video = video;
        // Ensure we don't run into autoplay issues.
        this.video.muted = true;
        this.video['playsinline'] = true;
        this.video.autoplay = false;

        this.videoReady = new Defer();
    }

    /**
     * Loads the video competely first.
     * TODO (uxder): Look for a better way to check completely readyState of video
     *     besides polling.
     */
    load(): Promise<any> {
        this.video.load();
        if (this.video.readyState === 4) {
            this.videoReady.resolve();
        } else {
            func.waitUntil(
                () => this.video.readyState == 4
            ).then(() => {
                this.videoReady.resolve();
            })
        }
        return this.videoReady.getPromise();
    }


    setProgress(progress: number) {
        let interpolatedTime = mathf.lerp(0, this.video.duration, progress);
        this.video.pause();
        if (this.video['fastSeek']) {
            this.video['fastSeek'](interpolatedTime);
        } else {
            this.video.currentTime = interpolatedTime;
        }
    }


}