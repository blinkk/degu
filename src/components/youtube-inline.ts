import {LitElement, css, html} from 'lit';
import {query, property} from 'lit/decorators.js';

import {ScriptLoader} from '../loader/script-loader';
const YOUTUBE_IFRAME_API = 'https://www.youtube.com/iframe_api?trustedtypes=1';

/**
 * # Degu Youtube Inline Component
 * Automatically adds an youtube iframe to your page.
 *
 * Usage:
 *
 * ```ts
 * import { DeguYouTubeInline} from '@blinkk/degu/lib/components/youtube-inline';
 *
 * window.customElements.define('degu-youtube-inline', DeguYouTubeInline);
 * ```
 *
 * ```html
 *  <degu-youtube-inline
 *    video-id="5qap5aO4i9A"
 *    style="aspect-ratio: 16/9"></degu-youtube-inline>
 * ```
 *
 *
 * Advanced Example:
 * Here is an example of programmatically updating the youtube video.
 *
 * ```html
 *  <degu-youtube-inline id="myVideo"
 *    style="aspect-ratio: 16/9"></degu-youtube-inline>
 *
 *   <button id="change-youtube-video">Change Video</button>
 * ```
 *
 * ```ts
 * import { DeguYouTubeInline} from '@blinkk/degu/lib/components/youtube-inline';
 * window.customElements.define('degu-youtube-inline', DeguYouTubeInline);
 *
 *   // Initially load a video
 *   const youtubeInlineTest = document.getElementById('myVideo');
 *   youtubeInlineTest.load('t_cKM_JYtbs')
 *
 *    let index = 0;
 *    const youtubeIds = [
 *      '_tV5LEBDs7w',
 *      'hGIW2fDb0jg',
 *      '4pcNRDx6KrE',
 *      'UtWaBEn_x8c'
 *    ]
 *
 *    // On button clicks change the youtube video.
 *    document.getElementById('change-youtube-video').addEventListener('click', ()=> {
 *      index++;
 *      if(index >= youtubeIds.length - 1) {
 *        index = 0;
 *      }
 *      youtubeInlineTest.load(youtubeIds[index], true)
 *    })
 * ```
 *
 *
 * ### Custom Script Loaders
 * You can set your own custom script loader (subclass degu ScriptLoader)
 *
 * ```ts
 * import { DeguYouTubeInline} from '@blinkk/degu/lib/components/youtube-inline';
 * window.customElements.define('degu-youtube-inline', DeguYouTubeInline);
 * DeguYouTubeInline.scriptLoader = new MyLoader();
 * ```
 */
export class DeguYouTubeInline extends LitElement {
  static scriptLoader = new ScriptLoader();

  @property({type: String, attribute: 'video-id', reflect: true})
  private videoId: string;

  @property({type: Boolean, attribute: 'enable-js-api', reflect: true})
  enableJsApi? = false;

  @query('.container__player')
  playerElement: HTMLElement;

  private player?: YT.Player;

  connectedCallback() {
    super.connectedCallback();
  }

  static styles = css`
    :host {
      height: 100%;
      width: 100%;
      display: block;
    }
    .container {
      align-items: center;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .container__player {
      bottom: 0;
      height: 100%;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      width: 100%;
      z-index: 1;
    }
  `;

  pause() {
    this.player && this.player.pauseVideo && this.player.pauseVideo();
  }

  private play() {
    this.player && this.player.playVideo && this.player.playVideo();
  }

  /**
   * Loads and attempt to play a youtube video.
   *
   * Note about tryPlay.
   * This is an "attempted play".  Without prior browser interaction the video
   * will only load and therefore, the playing is not guaranteed to work without
   * prior interaction.  Defaults to false.
   */
  async load(videoId: string, tryPlay = false) {
    this.videoId = videoId;
    if (this.player) {
      this.player.loadVideoById(this.videoId);
      if (tryPlay) {
        this.play();
      } else {
        this.pause();
      }
      return;
    }
    await DeguYouTubeInline.scriptLoader.load(YOUTUBE_IFRAME_API, {
      test: () => !!window.YT && window.YT['loaded'] === 1,
    });

    const config = {
      autohide: 1,
      autoplay: 0,
      fs: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      enablejsapi: this.enableJsApi ? 1 : 0,
    };

    const playerVars = Object.assign({}, config);
    const playerOptions = {
      videoId: this.videoId,
      playerVars: playerVars,
      events: {
        onReady: (e: any) => {
          this.player = e.target;
          if (tryPlay) {
            e.target.playVideo();
            this.play();
          } else {
            this.pause();
          }
        },
      },
    };
    new YT.Player(this.playerElement, playerOptions);
  }

  render() {
    if (this.videoId) {
      this.load(this.videoId);
    }

    return html`<div class="container">
      <div class="container__player"></div>
    </div>`;
  }
}
