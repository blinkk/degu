import {assert, expect, fixture, html, aTimeout} from '@open-wc/testing';
import {DeguVideo} from './video';
import * as dom from '../dom/dom';
import * as func from '../func/func';

// Define it.
!window.customElements.get('degu-video') &&
  window.customElements.define('degu-video', DeguVideo);

const addStylesToPage = func.runOnlyOnce(() => {
  dom.addStylesToPage(`
    degu-video {
      display: inline-block;
      line-height: 0;
      width: 100%;
    }
    video {
        width: 100%;
    }
`);
});

describe('Mqn3Video', () => {
  let root: HTMLElement;
  let deguVideo: DeguVideo;
  let video: HTMLVideoElement;

  beforeEach(async () => {
    addStylesToPage();
    root = await fixture(
      html`<div id="root" style="width: 500px">
        <degu-video
          src="https://storage.googleapis.com/googwebreview.appspot.com/grow-ext-file-upload/1638127354399989/PXL_20211127_042647380.mp4"
          width="640"
          height="640"
          style="aspect-ratio: 1"
          a11y-label="Video Aria Label"
          class=""
        ></degu-video>
      </div>`
    );

    deguVideo = root.querySelector('degu-video');
    video = root.querySelector('video');
  });

  it('is defined', () => {
    assert.instanceOf(deguVideo, DeguVideo);
    assert.instanceOf(video, HTMLVideoElement);
  });

  it('renders an video with the correct attributes', async () => {
    expect(video.getAttribute('aria-label')).to.equal('Video Aria Label');
    expect(video.getAttribute('role')).to.equal('img');
    expect(video.hasAttribute('disableRemotePlayback')).to.equal(true);
    expect(video.hasAttribute('muted')).to.equal(true);
    expect(video.hasAttribute('playsinline')).to.equal(true);
  });

  it('should not play the video by default', async () => {
    await aTimeout(10);
    expect(dom.testVideoIsPlaying(video)).to.equal(false);
  });
});
