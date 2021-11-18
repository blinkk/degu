import {LitElement, html} from 'lit';
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
 * import { DeguImage} from '@blinkk/degu/lib/lit/image';
 *
 * window.customElements.define('degu-image', DeguImage);
 * ```
 *
 * ```html
 * <degu-image src="xxx" a11y-label=""></degu-image>
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
 *     max-width: 100%
 *     height: auto
 *   }
 * ```
 *
 * ## AutoWidth
 * DeguImage will automatically look at your image source and if it is
 * FIFE like, apply autowidth where it fetches the right size image based
 * on your image render width.
 *
 *
 */
export class DeguImage extends LitElement {
  @property({type: String, attribute: 'src'})
  src: string;

  @property({type: String, attribute: 'a11y-label'})
  private a11yLabel: string;

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

  @property() autoRenderWidth = 0;

  /**
   * Whether this should use responsive source set.  Applied to FIFE enabled
   * images.
   */
  private isDynamicSourceSet: boolean;

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

  connectedCallback() {
    super.connectedCallback();

    this.watcher = new DomWatcher();

    this.isDynamicSourceSet =
      !this.src.endsWith('.svg') &&
      this.src.startsWith('https://lh3.googleusercontent.com') &&
      // Skip cases where a FIFE parameter has already been appended.
      !this.src.includes('=');

    this.setBreakPointsMaxWidth(
      this.mobileWidth,
      this.tabletWidth,
      this.laptopWidth,
      this.desktopWidth
    );

    if (this.isDynamicSourceSet) {
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
    const width = Math.ceil(this.offsetWidth / 50) * 50;

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
    return html`
      <source type="image/webp"
        srcset="
          ${this.src}=rw-e365-w${renderWidth},
          ${this.src}=rw-e365-w${renderWidth * 2} 2x"
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
        loading="lazy"
        src="${src}"
        width="${this.aspectRatioWidth}"
        height="${this.aspectRatioHeight}"
        alt="${this.a11yLabel}"
      />
    `;
  }

  render() {
    return html`
      ${this.isDynamicSourceSet
        ? this.renderImage(this.src + '=rw-e365-w' + this.autoRenderWidth)
        : this.renderDynamicSourceSetImage()}
    `;
  }
}
