import * as is from '../../is/is';
import {ScriptLoader} from '../../loader/script-loader';

const YOUTUBE_IFRAME_API = 'https://www.youtube.com/iframe_api?trustedtypes=1';

declare global {
  interface Window {
    YT: {
      loaded: number;
    };
  }
}

/**
 * Configuration options for {@link YouTubeModal}.
 */
interface YouTubeModalConfig {
  /**
   * The base namespace to use for attributes and CSS class names.
   */
  namespace?: string;

  /**
   * Whether to open the full-screen modal on mobile devices. If set to `false`,
   * users will be redirected to the YouTube URL instead.
   */
  useHandlerOnMobile?: boolean;

  /**
   * Time in ms for the modal's open/close CSS transitions.
   */
  transitionDuration?: number;

  /**
   * A query selector for the parent element which the modal's DOM element will
   * be appended to.
   */
  parentSelector?: string;

  /**
   * Callback triggered when the modal is opened.
   */
  onModalOpen?: (ytModal: YouTubeModal) => void;

  /**
   * Callback triggered when the modal is closed.
   */
  onModalClose?: (ytModal: YouTubeModal) => void;

  /**
   * Extra options passed to `YT.Player`.
   */
  playerVars?: YT.PlayerVars;

  /**
   * A {@link ScriptLoader} object used for loading the YouTube IFrame API.
   */
  scriptLoader?: ScriptLoader;
}

/**
 * Options for the {@link YouTubeModal#play} method.
 */
interface PlayOptions {
  /**
   * An attribution string to be appended to the modal.
   */
  attribution?: string;

  /**
   * The time in seconds to offset the video when the video plays.
   */
  startTime?: number;
}

// Default configuration.
const defaultConfig: YouTubeModalConfig = {
  namespace: 'degu-youtube-modal',
  useHandlerOnMobile: true,
  transitionDuration: 300,
  parentSelector: 'body',
  playerVars: {
    autohide: 1,
    autoplay: 1,
    fs: 1,
    modestbranding: 1,
    rel: 0,
    showinfo: 0,
    iv_load_policy: 3,
  },
  scriptLoader: new ScriptLoader(),
};

const Key = {
  ENTER: 'Enter',
  ESC: 'Escape',
  SPACE: ' ',
};

/**
 * YouTubeModal is a full-screen modal player.
 *
 * Example usage:
 *
 * 1) Create a button that'll launch the modal:
 *
 * ```
 * <button data-degu-youtube-modal-video-id="5qap5aO4i9A">Watch now</button>
 * ```
 *
 * 2) Initialize the YouTubeModal:
 *
 * ```
 * const options = {...};
 * const ytModal = new YouTubeModal(options);
 * ```
 *
 * When the button is clicked (or triggered via keyboard), a full-screen modal
 * should appear and the YouTube video should automatically play.
 *
 * 3) Add SASS:
 *
 * ```
 * $ytmodal-button-height: 50px !default
 * $ytmodal-color-black: #000 !default
 * $ytmodal-color-white: #fff !default
 * $ytmodal-z-index: 2000 !default
 *
 * [data-degu-youtube-modal-video-id]
 *   cursor: pointer
 *
 * .degu-youtube-modal
 *   display: none
 *   height: 100%
 *   left: 0
 *   opacity: 0
 *   position: fixed
 *   top: 0
 *   transform: scale(1.15)
 *   transition: all 0.3s cubic-bezier(.4,0,.2,1)
 *   visibility: hidden
 *   width: 100%
 *   z-index: $ytmodal-z-index
 *
 *   &--enabled
 *     display: block
 *
 *   &--visible
 *     opacity: 1
 *     transform: scale(1)
 *     visibility: visible
 *
 * .degu-youtube-modal__x
 *   align-items: center
 *   background: $ytmodal-color-black
 *   border: 2px solid rgba(99, 96, 96, 0.6)
 *   border-radius: 50%
 *   color: $ytmodal-color-white
 *   cursor: pointer
 *   display: flex
 *   font-size: $ytmodal-button-height
 *   height: $ytmodal-button-height
 *   justify-content: center
 *   line-height: $ytmodal-button-height
 *   opacity: 0.8
 *   overflow: hidden
 *   position: absolute
 *   right: 3.69853vw
 *   text-align: center
 *   top: 3.69853vw
 *   transition: all 0.3s
 *   width: $ytmodal-button-height
 *   z-index: $ytmodal-z-index + 3
 *
 *   &:before
 *     content: "\00D7"
 *     display: block
 *     font-family: 'arial', sans-serif
 *     font-size: $ytmodal-button-height - 10px
 *     height: $ytmodal-button-height - 10px
 *     line-height: 1
 *     text-align: center
 *     margin-top: 2px
 *     width: $ytmodal-button-height - 10px
 *
 *   &:hover
 *     color: $ytmodal-color-black
 *     background: $ytmodal-color-white
 *
 * .degu-youtube-modal__mask
 *   background: $ytmodal-color-black
 *   height: 100%
 *   left: 0
 *   position: absolute
 *   top: 0
 *   width: 100%
 *   z-index: $ytmodal-z-index + 1
 *
 * .degu-youtube-modal__player
 *   height: calc(100vh - 7.39707vw)
 *   left: 50%
 *   // Use max-height and max-width to fix the player to 16:9.
 *   max-height: calc((100vw - 22.19121vw) * 9/16)
 *   max-width: calc((100vh - 7.39707vw) * 16/9)
 *   position: absolute
 *   top: 50%
 *   transform: translateX(-50%) translateY(-50%)
 *   width: calc(100vw - 22.19121vw)
 *   z-index: $ytmodal-z-index + 2
 * ```
 */
export class YouTubeModal {
  private readonly config: YouTubeModalConfig;
  private container: HTMLElement;
  private modalEl: HTMLElement;
  private closeEl: HTMLElement;
  private attributionEl: HTMLElement;
  private playerEl: HTMLElement;
  private player?: YT.Player;
  private activeVideoId?: string;
  private lastScrollY?: number;
  private lastFocusedEl?: HTMLElement;
  private isVisible = false;

  constructor(config: YouTubeModalConfig) {
    this.config = Object.assign({}, defaultConfig, config);

    this.container = document.querySelector(
      this.config.parentSelector!
    ) as HTMLElement;

    const el = this.createDom('div', this.config.namespace!);
    el.setAttribute('aria-model', 'true');
    el.setAttribute('role', 'dialog');

    const closeEl = this.createDom('button', `${this.config.namespace}__x`);
    closeEl.setAttribute('aria-label', 'Close video player');
    closeEl.setAttribute('tabindex', '0');
    closeEl.addEventListener('click', () => {
      this.setActive(false);
    });
    this.closeEl = closeEl;

    const attributionEl = this.createDom(
      'div',
      `${this.config.namespace}__attribution`
    );
    this.attributionEl = attributionEl;

    const playerEl = this.createDom('div', `${this.config.namespace}__player`);
    this.playerEl = playerEl;

    const maskEl = this.createDom('div', `${this.config.namespace}__mask`);

    el.appendChild(closeEl);
    el.appendChild(attributionEl);
    el.appendChild(playerEl);
    el.appendChild(maskEl);
    this.modalEl = el;

    this.container.appendChild(el);

    document.addEventListener('click', this.handleEvent.bind(this));
    document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
  }

  /**
   * Plays a YouTube video in the modal player.
   */
  async play(videoId: string, playOptions?: PlayOptions) {
    const options = playOptions || {};
    if (this.config.useHandlerOnMobile && (is.ios() || is.android())) {
      let redirectUrl = `https://m.youtube.com/watch?v=${videoId}`;
      if (options.startTime) {
        redirectUrl = `${redirectUrl}&t=${options.startTime}s`;
      }
      window.location.href = redirectUrl;
      return;
    }

    // Ensure the YT API is loaded. This is safe to call multiple times.
    await this.config.scriptLoader!.load(YOUTUBE_IFRAME_API, {
      test: () => window.YT && window.YT.loaded === 1,
    });

    if (options.attribution) {
      this.attributionEl.textContent = options.attribution;
    }

    this.setActive(true);
    if (this.player) {
      if (videoId === this.activeVideoId) {
        return;
      }
      this.player.loadVideoById(videoId, options.startTime || 0, 'large');
      this.activeVideoId = videoId;
    } else {
      const playerVars = Object.assign({}, this.config.playerVars);
      if (options.startTime) {
        playerVars.start = options.startTime;
      }
      playerVars.origin = location.protocol + '//' + location.host;

      const playerOptions = {
        videoId,
        playerVars,
        events: {
          onReady: (e: YT.PlayerEvent) => {
            e.target.playVideo();
          },
        },
      };
      this.player = new YT.Player(this.playerEl, playerOptions);
    }
  }

  /**
   * Converts an element's data- attrs into a config object for
   * {@link YouTubeModal#play}.
   */
  getPlayOptionsFromAttrs(el: HTMLElement): PlayOptions {
    const playOptions: PlayOptions = {};

    const startTime = +(
      el.getAttribute(`data-${this.config.namespace}-video-start-seconds`) || 0
    );
    if (startTime > 0) {
      playOptions.startTime = startTime;
    }

    const attribution = el.getAttribute(
      `data-${this.config.namespace}-attribution`
    );
    if (attribution) {
      playOptions.attribution = attribution;
    }

    return playOptions;
  }

  /**
   * Sets the active state of the modal.
   */
  setActive(active: boolean) {
    // Save the last known scroll position and focus element so that when the
    // modal is closed, we can revert back to the user's previous position.
    if (active) {
      this.lastScrollY = window.pageYOffset;
      this.lastFocusedEl = document.activeElement as HTMLElement;
      window.setTimeout(() => {
        // Focus on the "close" button so that the keyboard focus changes to
        // the modal element.
        this.closeEl.focus();
        if (this.config.onModalOpen) {
          this.config.onModalOpen(this);
        }
      }, this.config.transitionDuration! + 100);
    } else {
      window.setTimeout(() => {
        if (this.lastFocusedEl) {
          this.lastFocusedEl.focus();
          this.lastFocusedEl = undefined;
        }
        window.scrollTo({
          left: 0,
          top: this.lastScrollY,
        });
        if (this.config.onModalClose) {
          this.config.onModalClose(this);
        }
      }, this.config.transitionDuration! + 100);
    }

    // Transition the modal's visibility state.
    this.setVisible(active);
  }

  /**
   * Disposes the modal.
   */
  dispose() {
    document.removeEventListener('click', this.handleEvent.bind(this));
    document.removeEventListener(
      'keydown',
      this.handleKeyboardEvent.bind(this)
    );
    if (this.modalEl) {
      this.container.removeChild(this.modalEl);
    }
  }

  /**
   * Creates a DOM element.
   */
  private createDom(
    tag: string,
    className: string,
    ...children: HTMLElement[]
  ) {
    const el = document.createElement(tag);
    el.className = className;
    if (children && children.length) {
      children.forEach(child => el.appendChild(child));
    }
    return el;
  }

  /**
   * Delegated event listener that handles clicks and keyboard events on any
   * element marked with the `data-degu-youtube-modal-video-id` attribute.
   */
  private handleEvent(e: Event) {
    // Traverse the DOM tree until a videoId is found, if any.
    let target = e.target as HTMLElement;
    while (target) {
      const attrName = `data-${this.config.namespace}-video-id`;
      const videoId = target.getAttribute(attrName);
      if (videoId) {
        e.preventDefault();
        const playOptions = this.getPlayOptionsFromAttrs(target);
        this.play(videoId, playOptions);
        return;
      }
      target = target.parentElement as HTMLElement;
    }
  }

  /**
   * Handles all keyboard events on the page.
   */
  private handleKeyboardEvent(e: KeyboardEvent) {
    if (this.isVisible) {
      if (!this.player) {
        return;
      }
      if (e.key === Key.ESC) {
        this.setActive(false);
      } else if (e.key === Key.SPACE) {
        if (this.player.getPlayerState() === YT.PlayerState.PLAYING) {
          this.player.pauseVideo();
        } else {
          this.player.playVideo();
        }
      }
    } else {
      if (e.key === Key.ENTER || e.key === Key.SPACE) {
        this.handleEvent(e);
      }
    }
  }

  /**
   * Sets the visibility of the modal by transitioning CSS class states.
   */
  private setVisible(visible: boolean) {
    window.setTimeout(() => {
      if (this.player) {
        if (visible) {
          if (this.player.getPlayerState() !== YT.PlayerState.PLAYING) {
            this.player.playVideo();
          }
        } else {
          this.player.pauseVideo();
        }
      }
    }, 100);

    // Allow for CSS transitions by enabling the `--enabled` class then the
    // `--visible` class.
    window.setTimeout(
      () => {
        this.modalEl.classList.toggle(
          `${this.config.namespace}--enabled`,
          visible
        );
      },
      visible ? 0 : this.config.transitionDuration
    );
    window.setTimeout(
      () => {
        this.modalEl.classList.toggle(
          `${this.config.namespace}--visible`,
          visible
        );
        this.isVisible = visible;
      },
      visible ? this.config.transitionDuration : 0
    );
  }
}
