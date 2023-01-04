import {DomWatcher} from '../dom/dom-watcher';

export interface ImageInspectorConfig {
  /**
   * The name of the css class to attached to each generated spacer item.
   */
  cssClassName: string;

  /**
   * The query selector of all elements you want to check for margins / paddings
   * on the page.
   */
  querySelector: string;
}

/**
 * A class that will visibly highlight image dimensions on your page
 *
 *
 * Setup:
 * 1) Create your image-inspector css class.
 *
 * .image-inspector
 *   align-items: center
 *   background: rgba(#1a73e8, 0.15)
 *   box-shadow: none !important
 *   display: flex
 *   font-size: 12px
 *   height: var(--height)
 *   justify-content: center
 *   left: var(--left)
 *   margin: 0 !important
 *   pointer-events: none
 *   position: fixed !important
 *   top: var(--top)
 *   width: var(--width)
 *   z-index: 9
 *
 *
 * 2) Instantiate ImageInspector.  The query selector tells to inspect
 *    all divs on the page.  Update it to scope the ImageInspector.
 *
 * new ImageInspector({
 *      cssClassName: 'image-inspector',
 *      querySelector: '.my-module > img'
 * })
 *
 */

export class ImageInspector {
  private watcher: DomWatcher;
  private config: ImageInspectorConfig;

  constructor(config: ImageInspectorConfig) {
    this.config = config;
    this.watcher = new DomWatcher();

    this.watcher.add({
      element: window,
      on: ['click', 'resize', 'scroll'],
      callback: this.run.bind(this),
    });
    this.run();
  }

  private createInspector(el: HTMLImageElement, top: string, left: number) {
    const dimensionsEl = document.createElement('div');
    dimensionsEl.classList.add(this.config.cssClassName);

    dimensionsEl.style.setProperty('--left', `${left}px`);
    dimensionsEl.style.setProperty('--top', top);
    dimensionsEl.style.setProperty('--width', `${dimensionsEl.offsetWidth}px`);

    const headingEl = document.createElement('strong');
    const renderedSizeEl = document.createElement('span');
    const intrinsicSizeEl = document.createElement('span');

    headingEl.innerText = `${el.alt || el.src}`;
    renderedSizeEl.innerText = `Rendered size: ${el.offsetWidth} x ${el.offsetHeight}`;
    intrinsicSizeEl.innerText = `Intrinsic size: ${el.naturalWidth} x ${el.naturalHeight}`;

    dimensionsEl!.appendChild(headingEl);
    dimensionsEl!.appendChild(renderedSizeEl);
    dimensionsEl!.appendChild(intrinsicSizeEl);

    el.parentElement!.appendChild(dimensionsEl);

    const rect = dimensionsEl.getBoundingClientRect();
    if (rect.width > 80) {
      dimensionsEl.style.setProperty('--max-width', `${rect.width * 1.5}px`);
    } else {
      dimensionsEl.style.setProperty('--max-width', '80px');
    }

    dimensionsEl.style.setProperty('--height', rect.height + 'px');
  }

  public run() {
    this.removeInspectors();
    this.createInspectors();
  }

  private createInspectors() {
    [].forEach.call(
      document.querySelectorAll(this.config.querySelector),
      (el: HTMLImageElement) => {
        const rect = el.getBoundingClientRect();
        this.createInspector(el, `${rect.top}px`, rect.left);
      }
    );
  }

  private removeInspectors() {
    [].forEach.call(
      document.querySelectorAll(`.${this.config.cssClassName}`),
      (el: HTMLImageElement) => {
        el.parentNode!.removeChild(el);
      }
    );
  }

  public dispose() {
    this.removeInspectors();
    this.watcher && this.watcher.dispose();
  }
}
