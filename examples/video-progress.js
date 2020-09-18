
import {VideoProgress} from '../lib/dom/video-progress';
import {RafProgress} from '../lib/raf/raf-progress';
import {dom} from '../lib/dom/dom';
import {ScrollRenderFix} from '../lib/dom/scroll-render-fix';
import {EASE} from '../lib/ease/ease';

/**
 * Experimental class that ties updates an html5 video with progress.
 * The problem with this approach is that the video is updated via,
 * currentTime which fires very slowly depending on video size
 * and browser.
 *
 * Currently, this seems to only work on Safari and Chrome if the video
 * file is compressed and small enough.
 *
 * Not recommended this for production use.
 *
 * ffmpeg -i video-test.mp4 -r 30 -g 1 -an -loglevel panic -vcodec copy -acodec copy video-test2.mp4
 * -r sets frame rate
 * -g sets a keyframe every frame.
 *
 * @experimental
 */
export default class VideoProgressSample {
  constructor() {
    let wrapper = document.getElementById('wrapper');
    let video = document.getElementById('video');

    const rafProgress = new RafProgress();
    this.videoProgress = new VideoProgress(video);


    // Update rafProgress when the window scrolls.
    window.addEventListener('scroll', () => {
      // Set the progress of the video.
      let progress = dom.getElementScrolledPercent(wrapper);
      rafProgress.easeTo(progress, 0.25, EASE.easeInOutQuad);
    });

    // When the rafProgress updates, update the videoProgress
    // with the latest.
    rafProgress.watch((easedProgress, direction) => {
      this.videoProgress.setProgress(easedProgress);
    });

    // When the video loads.
    this.videoProgress.load().then(() => {
      console.log('video loaded');
      // Update the current progress.
      let progress = dom.getElementScrolledPercent(wrapper);
      rafProgress.setCurrentProgress(progress);
    });
  }
}
