import * as dom from '../dom/dom';
import * as func from '../func/func';

import {
  ElementVisibilityObject,
  elementVisibility,
} from '../dom/element-visibility';
import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {DomWatcher} from '../dom/dom-watcher';

/**
 * # Degu Video Component
 *
 * Usage:
 *
 * ```ts
 * import { DeguVideo} from '@blinkk/degu/lib/components/video';
 *
 * window.customElements.define('degu-video', DeguVideo);
 * ```
 *
 * ```html
 *   <degu-video
 *     src="https://storage.googleapis.com/mannequin/blobs/7b0c13d7-e9cc-4efa-93c1-9db323d7283b.mp4"
 *     width="640"
 *     height="640"
 *     style="aspect-ratio: 1"
 *     aria-label="Video Aria Label"
 *     autoplayinview="true"
 *   ></degu-video>
 * ```
 *
 * ```css
 *
 *   degu-video {
 *     display: inline-block;
 *     line-height: 0;
 *     width: 100%
 *   }
 *
 *   degu-video video {
 *       width: 100%;
 *   }
 * ```
 */
export class DeguVideo extends LitElement {
  @property({type: String, attribute: 'src'})
  src: string;

  @property({type: String, attribute: 'aria-label'})
  ariaLabel: string;

  @property({type: String, attribute: 'width'})
  private width: number;

  @property({type: String, attribute: 'height'})
  private height: number;

  @property({type: String, attribute: 'load-scalar'})
  private loadScalar = 2;

  // Set `autoplayinview="true" to play video on inview.
  // Video gets reset on outview and plays again on the next inview.
  @property({type: Boolean, attribute: 'autoplayinview'})
  private autoplayInview = false;

  @property({type: Boolean, attribute: 'loop'})
  loop: boolean;

  ev: ElementVisibilityObject;
  private inviewEv: ElementVisibilityObject;
  private watcher: DomWatcher;
  private hasStartedLoad = false;

  private video: HTMLVideoElement;

  static CmsOptions: Record<string, string> = {
    LOOP: 'loop',
  };

  static Events: Record<string, string> = {
    LOAD_START: 'LOAD_START',
    LOAD_LOADED: 'LOAD_LOADED',
    FORCE_LOAD: 'FORCE_LOAD',
  };

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this.video = this.querySelector('video');
    this.watcher = new DomWatcher();
    this.watcher.add({
      element: this,
      on: 'resize',
      callback: func.debounce(this.onResize.bind(this), 500),
    });

    this.watcher.add({
      element: this,
      on: DeguVideo.Events.FORCE_LOAD,
      callback: () => {
        this.runUpdate(true);
      },
    });

    this.ev = elementVisibility.inview(
      this.video,
      {rootMargin: window.innerHeight * this.loadScalar + 'px'},
      () => this.runUpdate.bind(this)
    );

    this.inviewEv = elementVisibility.inview(this.video, {}, () => {
      this.runUpdate();
    });

    // // If we are in range, try loading the video.
    this.ev.readyPromise.then(() => {
      this.runUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.watcher && this.watcher.dispose();
    this.ev && this.ev.dispose();
    this.inviewEv && this.inviewEv.dispose();
  }

  onResize() {
    if (!this.hasStartedLoad) {
      this.runUpdate();
    }
  }

  /**
   * Determines whether this element was painted (displayed on the screen). An
   * element is "painted" if it doesn't have display: none in its ancestors and
   * is in range of inview criteria.
   */
  isPainted() {
    return !dom.isDisplayNoneWithAncestors(this) && this.ev.state().inview;
  }

  runUpdate(force = false) {
    // If the video hasn't been loaded yet.
    if ((this.isPainted() && !this.hasStartedLoad) || force) {
      this.hasStartedLoad = true;
      this.video.querySelector('source').setAttribute('src', this.src);
      dom.whenVideosLoaded([this.video]).then(() => {
        // Fire an event on the root.
        dom.event(this, DeguVideo.Events.LOAD_LOADED, {});

        // Play the video if we opted to play on inview.
        this.autoplayInview && this.play();
      });

      // Tell the parent element (video) to load.
      this.video.load();
      this.video.setAttribute('load', 'true');
      this.video.pause();

      dom.event(this, DeguVideo.Events.LOAD_START, {});
    }

    // If we have already loaded this, then reset the video on outview,
    // replay on inview.
    if (this.hasStartedLoad && this.autoplayInview) {
      if (!this.isPainted() && !this.inviewEv.state().inview) {
        this.video.currentTime = 0;
        this.video.pause();
      } else {
        this.play();
      }
    }
  }

  /**
   * Plays the video if it isn't already playing.
   */
  play() {
    if (!dom.testVideoIsPlaying(this.video)) {
      const playPromise = this.video.play();
      playPromise.then(() => {}).catch();
    }
  }

  createRenderRoot() {
    return this;
  }

  /**
   * If aria-label is set, the root gets role="img" and the inner video
   * should be hidden.
   */
  render() {
    if (this.ariaLabel) {
      this.setAttribute('role', 'img');
    } else {
      this.removeAttribute('role');
    }

    return html`
      <video
        ?loop="${this.loop}"
        aria-hidden=${ifDefined(this.ariaLabel ? true : null)}
        disableRemotePlayback
        muted
        playsinline
      >
         <source type="video/mp4"></source>
      </video>
    `;
  }
}
