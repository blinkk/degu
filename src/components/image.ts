import {LitElement, html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import {DomWatcher} from '../dom/dom-watcher';
import * as func from '../func/func';
import * as dom from '../dom/dom';
import {
  elementVisibility,
  ElementVisibilityObject,
} from '../dom/element-visibility';

/**
 *
 * # DeguImage Component.
 *
 *
 * Usage:
 *
 * ```ts
 * import { DeguImage} from '@blinkk/degu/lib/components/image';
 *
 * window.customElements.define('degu-image', DeguImage);
 * ```
 *
 * ```html
 * <degu-image src="xxx" alt=""></degu-image>
 * ```
 *
 * ```css
 *   degu-image {
 *      display: inline-block;
 *      line-height: 0;
 *       width: 100%;
 *   }
 *
 *   degu-image img {
 *     max-width: 100%;
 *     height: auto;
 *   }
 * ```
 *
 * ## Google Image Service Images - automatically autowidthed
 * DeguImage will automatically look at your image source and if it is google
 * image service like, apply autowidth where it fetches the right size image
 * based on your image render width.
 */
export class DeguImage extends LitElement {
  @property({type: String, attribute: 'src'})
  src: string;

  @property({type: String, attribute: 'alt'})
  private alt: string;

  @property({type: String, attribute: 'loading'})
  private loading: string;

  @property({type: String, attribute: 'width'})
  private aspectRatioWidth: number;

  @property({type: String, attribute: 'height'})
  private aspectRatioHeight: number;

  @property({type: String, attribute: 'google-params'})
  private googleParams: string;

  /**
   * When enabled prevents eager loading of images when they are already
   * visible on the screen.
   */
  @property({type: Boolean, attribute: 'disable-eager'})
  private disableEager = false;

  @property() autoRenderWidth = 0;

  /**
   * Specify a scalar to force increase the size of the google image.
   * Note that an alternative to this is to pass a width parameter via
   * googleParams.
   */
  @property({type: String, attribute: 'google-image-scalar'})
  private googleImageScalar: number;

  /**
   * Whether this is a google service like image.
   */
  private isGoogleImage: boolean;

  private watcher: DomWatcher;

  constructor() {
    super();
    this.loading = 'lazy';
  }

  connectedCallback() {
    super.connectedCallback();

    this.watcher = new DomWatcher();

    this.googleParams = this.googleParams ? '-' + this.googleParams : '';
    this.disableEager = this.getAttribute('disable-eager') === 'true';

    this.isGoogleImage =
      this.src &&
      !this.src.includes('.svg') &&
      this.src.startsWith('https://lh3.googleusercontent.com') &&
      // Skip cases where a google image service parameter has already been
      // appended.
      !this.src.includes('=');

    if (this.isGoogleImage) {
      this.watcher.add({
        element: this as HTMLElement,
        on: 'resize',
        callback: func.debounce(this.onResize.bind(this), 100),
      });
      this.onResize();
    }

    // One time element visibility check to see if this image is already
    // on the screen in which case we don't use lazy image loading.
    elementVisibility.inview(
      this,
      {threshold: 0},
      (element, changes, dispose) => {
        if (changes.isIntersecting) {
          const isPainted = !dom.isDisplayNoneWithAncestors(this);
          if (isPainted && !this.disableEager) {
            this.loading = 'eager';
          }
        }
        dispose();
      }
    );
  }

  private onResize() {
    // Calculate the width to the nearest 50 pixel.
    // Example: 420 --> 450, 451 --> 500
    const image = this.querySelector('img');
    const width =
      Math.ceil(
        Math.max(this.offsetWidth, image ? image.offsetWidth : 0) / 50
      ) * 50;

    const height =
      Math.ceil(
        Math.max(this.offsetHeight, image ? image.offsetHeight : 0) / 50
      ) * 50;

    // Calculate the autowidth render size and take the historical maximum.
    this.autoRenderWidth = Math.max(
      this.autoRenderWidth,
      Math.ceil(
        Math.max(width, height) *
          (this.googleImageScalar || 1) *
          window.devicePixelRatio
      )
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.watcher && this.watcher.dispose();
  }

  createRenderRoot() {
    return this;
  }

  private renderImage(src: string) {
    return html`
      <img
        loading="${this.loading}"
        width=${ifDefined(this.aspectRatioWidth ? this.aspectRatioWidth : null)}
        height=${ifDefined(
          this.aspectRatioHeight ? this.aspectRatioHeight : null
        )}
        src="${src}"
        alt="${this.alt}"
      />
    `;
  }

  render() {
    return html`
      ${this.isGoogleImage
        ? this.autoRenderWidth === 0
          ? nothing
          : this.renderImage(
              this.src + `=rw-e365-w${this.autoRenderWidth}${this.googleParams}`
            )
        : this.renderImage(this.src)}
    `;
  }
}
