import {LitElement, html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import {DomWatcher} from '../dom/dom-watcher';
import * as func from '../func/func';

interface SourceSetMediaDeclaration {
  media: string;
  renderWidth: number;
}

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
 *
 * ## Google Image Service images
 * TODO: Add documentation on <picture> srcset mode.
 *
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

  @property({type: Number, attribute: 'mobile-width'})
  private mobileWidth: number;

  @property({type: Number, attribute: 'tablet-width'})
  private tabletWidth: number;

  @property({type: Number, attribute: 'laptop-width'})
  private laptopWidth: number;

  @property({type: Number, attribute: 'desktop-width'})
  private desktopWidth: number;

  @property({type: String, attribute: 'google-params'})
  private googleParams: string;

  @property() autoRenderWidth = 0;

  /**
   * Whether this is a google service like image.
   */
  private isGoogleImage: boolean;

  /**
   * A list of source set min, max and load widths.
   */
  private breakpoints: Record<string, SourceSetMediaDeclaration> = {
    desktop: {
      media: '(min-width: 1440px)',
      renderWidth: 2880,
    },
    laptop: {
      media: '(min-width: 1024px) and (max-width: 1399px)',
      renderWidth: 1440,
    },
    tablet: {
      media: '(min-width: 768px) and (max-width: 1023px)',
      renderWidth: 1024,
    },
    mobile: {
      media: '(max-width: 767px)',
      renderWidth: 768,
    },
  };
  private watcher: DomWatcher;

  constructor() {
    super();
    this.loading = 'lazy';
  }

  connectedCallback() {
    super.connectedCallback();

    this.watcher = new DomWatcher();

    // Add default params.
    if (!this.googleParams) {
      this.googleParams = 'rw-e365';
    }

    this.isGoogleImage =
      !this.src.includes('.svg') &&
      this.src.startsWith('https://lh3.googleusercontent.com') &&
      // Skip cases where a google image service parameter has already been
      // appended.
      !this.src.includes('=');

    this.setBreakPointsMaxWidth(
      this.mobileWidth,
      this.tabletWidth,
      this.laptopWidth,
      this.desktopWidth
    );

    if (this.isGoogleImage) {
      this.watcher.add({
        element: this as HTMLElement,
        on: 'resize',
        callback: func.debounce(this.onResize.bind(this), 100),
      });
      this.onResize();
    }
  }

  private onResize() {
    // Calculate the width to the nearest 50 pixel.
    // Example: 420 --> 450, 451 --> 500
    const image = this.querySelector('img');
    const width =
      Math.ceil(
        Math.max(this.offsetWidth, image ? image.offsetWidth : 0) / 50
      ) * 50;

    // Calculate the autowidth render size and take the historical maximum.
    this.autoRenderWidth = Math.max(
      this.autoRenderWidth,
      Math.ceil(width * window.devicePixelRatio)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.watcher && this.watcher.dispose();
  }

  /**
   * Set the maximum rendering width of the image at a given viewport.
   * For example, if you know that the max size of your image is 800 (pixels)
   * on desktopWidth, you can pass 800 and the image will be capped to that size.
   */
  setBreakPointsMaxWidth(
    mobileWidth: number,
    tabletWidth: number,
    laptopWidth: number,
    desktopWidth: number
  ) {
    if (mobileWidth) {
      this.breakpoints.mobile.renderWidth = mobileWidth;
    }
    if (tabletWidth) {
      this.breakpoints.tablet.renderWidth = tabletWidth;
    }
    if (laptopWidth) {
      this.breakpoints.laptop.renderWidth = laptopWidth;
    }
    if (desktopWidth) {
      this.breakpoints.desktop.renderWidth = desktopWidth;
    }
  }

  createRenderRoot() {
    return this;
  }

  private renderSourceSet(media: string | null, renderWidth: number) {
    const srcset = this.isGoogleImage
      ? `${this.src}=${this.googleParams}-w${renderWidth},
          ${this.src}=${this.googleParams}-w${renderWidth * 2} 2x`
      : `${this.src}`;

    return html`
      <source type="image/webp"
        srcset="${srcset}"
        media="${media}"
      ></source>
    `;
  }

  private renderDynamicSourceSetImage() {
    const breakpoints: SourceSetMediaDeclaration[] = Object.values(
      this.breakpoints
    );
    return html`
      <picture>
        ${breakpoints.map(breakpoint => {
          return this.renderSourceSet(breakpoint.media, breakpoint.renderWidth);
        })}
        ${this.renderImage(this.src)}
      </picture>
    `;
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
        ? this.renderImage(
            this.src + `=${this.googleParams}-w` + this.autoRenderWidth
          )
        : this.src.includes('.svg')
        ? this.renderImage(this.src)
        : this.renderDynamicSourceSetImage()}
    `;
  }
}
