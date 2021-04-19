
import { DomWatcher } from '../dom/dom-watcher';


export interface MarginOutlinerConfig {
    /**
     * A list of margin sizes you want to highlight.
     * Example: [4,8,12,16,20,24]
     */
    sizes: number[];

    /**
     * The name of the css class to attached to each generated spacer item.
     */
    cssClassName: string

    /**
     * The query selector of all elements you want to check for margins / paddings
     * on the page.
     */
    querySelector: string
}

/**
 * A class that will visibly highlight margins on your page.
 *
 *
 * Setup:
 * 1) Create your my-spacer css class.
 *
 * .my-spacer
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
 *    &--padding
 *        background: rgba(255, 255, 0, .15)
 *
 *
 * 2) Instantiate MarginOutliner.  The query selector tells to inspect
 *    all divs on the page.  Update it to scope the marginOutliner.
 *
 * new MarginOutliner({
 *      sizes: [4,8,12,16,20,24],
 *      cssClassName: 'my-spacer',
 *      querySelector: '.my-module > div'
 * })
 *
 */
export class MarginOutliner {

    private watcher: DomWatcher;
    private config: MarginOutlinerConfig;

    constructor(config: MarginOutlinerConfig) {
        this.config = config;
        this.watcher = new DomWatcher();
        this.watcher.add({
            element: window,
            on: ['click', 'resize', 'scroll'],
            callback: this.run.bind(this)
        })
        this.run();
    }


    private createSpacer(
      el: HTMLDivElement,
      top: string,
      left: number,
      size: number,
      isPadding: boolean
    ) {
        const spacerEl = document.createElement('div');
        spacerEl.classList.add(this.config.cssClassName);

        spacerEl.style.setProperty('--left', `${left}px`);
        spacerEl.style.setProperty('--top', top);
        spacerEl.style.setProperty('--width', `${el.offsetWidth}px`);
        spacerEl.style.setProperty('--height', `${size}px`);
        if (isPadding) {
            spacerEl.classList.add(`${this.config.cssClassName}--padding`);
        }
        spacerEl.innerText = `${size}px`;
        el.parentElement.appendChild(spacerEl);
    }


    public run() {
        this.removeSpacers();
        this.createSpacers();
    }


    private createSpacers() {
      [].forEach.call(
        document.querySelectorAll(this.config.querySelector),
        (el: HTMLDivElement) => {
          this.config.sizes.forEach(size => {
            // Element is hidden, don't highlight it.
            if (!el.offsetWidth) {
              return;
            }
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (style.marginTop == `${size}px`) {
              this.createSpacer(el, `${rect.top - size}px`, rect.left, size, false);
            }
            if (style.marginBottom == `${size}px`) {
              this.createSpacer(el, `${rect.bottom}px`, rect.left, size, false);
            }
            if (style.paddingTop == `${size}px`) {
              this.createSpacer(el, `${rect.top}px`, rect.left, size, true);
            }
            if (style.paddingBottom == `${size}px`) {
              this.createSpacer(
                el,
                `${rect.bottom - size}px`,
                rect.left,
                size,
                true
              );
            }
          });
        }
      );
    }


    private removeSpacers() {
      [].forEach.call(
        document.querySelectorAll(`.${this.config.cssClassName}`),
        (el: HTMLDivElement) => {
          el.parentNode.removeChild(el);
        }
      );
    }

    public dispose() {
      this.watcher && this.watcher.dispose();
    }
}