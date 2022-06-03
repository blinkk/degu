import * as dom from '../dom/dom';
import * as func from '../func/func';

import {
  ElementVisibilityObject,
  elementVisibility,
} from '../dom/element-visibility';
import {DomWatcher} from '../dom/dom-watcher';
import {LitElement, html} from 'lit';
import {Raf} from '../raf/raf';
import {Vector} from '../mathf/vector';
import {domCanvas} from '../dom/dom-canvas';
import {ifDefined} from 'lit/directives/if-defined.js';
import {query, property} from 'lit/decorators.js';

/**
 * Degu Video Component
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
 *     width: 100%;
 *   }
 *
 *   degu-video .degu-video {
 *     position: relative;
 *   }
 *
 *    degu-video video {
 *        width: 100%;
 *    }
 *
 *    degu-video[canvas="true"] video {
 *      visibility: hidden;
 *    }
 *
 *    degu-video canvas {
 *        width: 100%;
 *        position: absolute;
 *        height: 100%;
 *        top: 0;
 *        left: 0%;
 *        z-index: 1;
 *    }
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

  // Whether to render out to a canvas instead of video.  The main advantage
  // of this is it normalizes color discoloration across browsers.
  @property({type: Boolean, attribute: 'canvas'})
  canvas: boolean;

  @query('canvas')
  canvasElement: HTMLCanvasElement;

  @query('video')
  videoElement: HTMLCanvasElement;

  ev: ElementVisibilityObject;
  private inviewEv: ElementVisibilityObject;
  private watcher: DomWatcher;
  private hasStartedLoad = false;
  private raf: Raf;

  video: HTMLVideoElement;

  static CmsOptions: Record<string, string> = {
    LOOP: 'loop',
  };

  static Events: Record<string, string> = {
    LOAD_START: 'LOAD_START',
    LOAD_LOADED: 'LOAD_LOADED',
    FORCE_LOAD: 'FORCE_LOAD',
    RUN_UPDATE: 'RUN_UPDATE',
    CANVAS_READY: 'CANVAS_READY',
  };

  connectedCallback() {
    super.connectedCallback();
    this.canvas = !!this.getAttribute('canvas');
  }

  firstUpdated() {
    this.video = this.querySelector('video');
    this.video.crossOrigin = 'Anonymous';
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

    this.watcher.add({
      element: this,
      on: DeguVideo.Events.RUN_UPDATE,
      callback: () => {
        this.runUpdate();
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

    this.raf = new Raf(this.onRaf.bind(this));
    if (this.canvas && this.canvasElement) {
      this.raf.start();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.raf.dispose();
    this.watcher && this.watcher.dispose();
    this.ev && this.ev.dispose();
    this.inviewEv && this.inviewEv.dispose();
  }

  onRaf() {
    if (this.canvas && this.canvasElement) {
      this.canvasElement
        .getContext('2d')
        .drawImage(
          this.videoElement,
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );
    }
  }

  /**
   * Given that degu-video is using canvas mode, gets the hex value of the video
   * at a given coordinate.
   * @param x
   * @param y
   * @returns
   */
  getHexColorAt(x: number, y: number, seconds = undefined): string {
    if (!this.canvas) {
      throw new Error('Video must be set to canvas mode to extract color');
    }

    const timeBeforeStop = this.video.currentTime;
    const isPlaying = dom.testVideoIsPlaying(this.video);

    if (seconds !== undefined) {
      this.video.currentTime = seconds;
    }

    const v = new Vector(x, y);
    const color = domCanvas.getColorAtPointAsHex(
      this.canvasElement.getContext('2d'),
      v
    );

    if (isPlaying) {
      this.video.currentTime = timeBeforeStop;
      this.play();
    }

    return color;
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

  private updateCanvasSize() {
    if (this.canvasElement) {
      this.canvasElement.width = this.videoElement.offsetWidth;
      this.canvasElement.height = this.videoElement.offsetHeight;
    }
  }

  runUpdate(force = false) {
    // If the video hasn't been loaded yet.
    if ((this.isPainted() && !this.hasStartedLoad) || force) {
      this.hasStartedLoad = true;
      this.video.querySelector('source').setAttribute('src', this.src);
      dom.whenVideosLoaded([this.video]).then(() => {
        // Fire an event on the root.

        this.updateCanvasSize();
        dom.event(this, DeguVideo.Events.LOAD_LOADED, {});

        // Play the video if we opted to play on inview.
        this.autoplayInview && this.play();

        // Run onRaf once so the canvas is in sync with the video.
        this.onRaf();
        dom.event(this, DeguVideo.Events.CANVAS_READY, {});
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
      this.updateCanvasSize();

      if (!this.isPainted() && !this.inviewEv.state().inview) {
        this.reset();
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

  reset() {
    this.video.currentTime = 0;
    this.video.pause();
  }

  pause() {
    this.video.pause();
  }

  createRenderRoot() {
    return this;
  }

  renderVideo() {
    return html`<video
        ?loop="${this.loop}"
        aria-hidden=${ifDefined(this.ariaLabel ? true : null)}
        disableRemotePlayback
        muted
        playsinline
      >
         <source type="video/mp4"></source>
      </video>
      ${this.canvas ? html`<canvas></canvas>` : ''}
      `;
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
      ${this.canvas
        ? html`<div class="degu-video">${this.renderVideo()}</div>`
        : this.renderVideo()}
    `;
  }
}
