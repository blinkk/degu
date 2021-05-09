import {dom, is, Raf} from '..';
import {DomWatcher} from '../dom/dom-watcher';
import {func} from '../func/func';
import {urlParams} from '../dom/url-params';

export interface HighlightElementGroup {
  highlighterEl: HTMLElement;
  attributeEls: HTMLElement[];
}

export interface AttributeScopeConfig {
  attribute: string;
  querySelector: string;
}

export interface AttributeHighlighterConfig {
  /**
   * The name of the css class to attached to each generated aria highlighter item.
   */
  cssClassName: string;

  /**
   * A query selector to scope your scan to specific elements and its
   * children.
   */
  scopeQuerySelector: string;

  /**
   * A list of all attributes you want to highlight on the page.
   *
   * Typically this would be:
   *
   * ```
   * attributes: ['alt', 'aria-label']
   * ```
   *
   * You can also pass in a AttributeScopeConfig.
   * This is useful if you want to scope your search to specific elements.
   * For example, let's say you want to highlight, aria-labels ONLY on
   * video elements.
   *
   * You can do:
   *
   * attributes: [{
   *  attribute: 'aria-label',
   *  querySelector: 'video'
   * }]
   *
   * or perhaps you want to show aria-label only on buttons.
   *
   * attributes: [{
   *  attribute: 'aria-label',
   *  querySelector: '.button'
   * }]
   *
   *
   */
  attributes: (string | AttributeScopeConfig)[];

  /**
   * Allows you to search and highlight cases in which an attribute is missing
   * or empty.
   *
   *
   * Here is an example of where we would want to highlight a case in which
   * we scan for all <img> that are missing alts and any videos that
   * are missing the aria-label.
   * ```
   * warnMissingAttributes: [
   *  {
   *    attribute: 'alt',
   *    querySelector: 'img'
   *  },
   *  {
   *    attribute: 'aria-label',
   *    querySelector: 'video'
   *  },
   * ]
   * ```
   */
  warnMissingAttributes?: AttributeScopeConfig[];

  /**
   * Specify an option url to enable attribute specification via url params.
   */
  urlParamName?: string;

  /**
   * This classes uses Raf to continously update the attributes.
   * Set the raf FPS.
   */
  rafFps?: number;
}

/**
 * A class that will visibly highlight element attribute on your page.
 *
 *
 * Setup:
 *
 * 1) Create your highlighter css class.
 *.my-highlighter
 *  align-items: left
 *  color: #FFF
 *  background: rgba(#000, 0.8)
 *  border-radius: 3px
 *  box-shadow: none !important
 *  display: flex
 *  flex-direction: column
 *  font-size: 11px
 *  height: auto
 *  justify-content: center
 *  left: var(--left)
 *  margin: 0 !important
 *  max-width: var(--max-width)
 *  padding: 0px 8px
 *  position: fixed !important
 *  // Slight off center.
 *  top: calc(var(--center) + 10px)
 *  transform: translateX(-50%) translateY(0%)
 *  transition: transform 0.3s ease
 *  transform-origin: top center
 *  z-index: 9999
 *  cursor: pointer
 *  span
 *    display: block
 *  &.active,
 *   transform: translateX(-50%) translateY(0%) scale(1.2)
 *  &:hover,
 *    cursor: pointer
 *    z-index: 10000
 *  &:active
 *    z-index: 10000
 *    transform: translateX(-50%) translateY(10px) scale(1.2)
 *
 *  &.up
 *    top: calc(var(--center) - 10px + (var(--height)  * -1))
 *
 *
 *
 * // When clicking on a highlighter, it can highlight the associated
 * // element.  The element gets .attribute-highlighter-active
 * .attribute-highlighter-active
 *   border: 3px solid red !important
 *   transition: border 0s ease !important
 *
 * 2) Instantiate attributeHighlighter.
 *  const attributeHighlighter = new AttributeHighlighter({
 *    cssClassName: '.my-highlighter',
 *    scopeQuerySelector: '.my-module',
 *    attributes: [
 *       'alt',
 *       'aria-label'
 *    ]
 *  })
 *
 * Scoped Search:
 * Attributes accepts AttributeScopedConfig so you can do more complex
 * queries.
 *
 *
 * ```
 *    attributes: [
 *       'alt',
 *       {
 *          attribute: 'aria-label',
 *          querySelector: '.button'
 *       }
 *    ]
 * ```
 * Now all 'alt' and only aria-labels of classes with .button will be
 * highlighted on the page.
 *
 *
 * Optional url param:
 *
 * You can optionally, configure it so that a url param
 * populates the attributes list.
 *
 * ```
 *  const attributeHighlighter = new AttributeHighlighter({
 *    cssClassName: '.my-highlighter',
 *    scopeQuerySelector: '.my-module',
 *    attributes: [],
 *    urlParamName: 'attributeHighlight'
 *  })
 * ```
 *
 * Now you can do the following.  Use comma separation for multiple.
 * ```
 * xxx.com?attributeHightlight=alt
 * xxx.com?attributeHightlight=alt,aria-label
 * ```
 * If no url param is specified, it defaults to the attributes originally
 * specified in the config.
 *
 */
export class AttributeHighlighter {
  private watcher: DomWatcher;
  private attributeWatcher: DomWatcher;

  private config: AttributeHighlighterConfig;

  // A list of all highlighters on the page.
  private highlighters: HighlightElementGroup[] = [];

  private raf: Raf;

  constructor(config: AttributeHighlighterConfig) {
    this.config = config;

    if (!this.config.rafFps) {
      this.config.rafFps = 5;
    }

    // Allow url params to specify the attributes.
    if (this.config.urlParamName) {
      const paramValue = urlParams.getValue(this.config.urlParamName);
      if (paramValue) {
        this.config.attributes = paramValue.split(',');
      }
    }

    this.watcher = new DomWatcher();
    this.watcher.add({
      element: window,
      on: ['click', 'resize', 'scroll'],
      callback: func.debounce(this.refresh.bind(this), 1),
    });

    // Dedicated watcher for attributes.
    this.attributeWatcher = new DomWatcher();

    this.raf = new Raf(this.refresh.bind(this));
    this.raf.setFps(this.config.rafFps);
    this.raf.start();
  }

  public refresh() {
    this.removeHighlighters();
    this.createHighlighters();
  }

  /**
   * Creates a highlighter element.
   * @param el  The root scope element.
   * @param attributeEl  The element in which the attribute belongs to.
   * @param attribute  The attribute name.
   * @param isTypeMissing  Whether this is "missing" attribute.
   * @returns
   */
  private createHighlighter(
    el: HTMLDivElement,
    attributeEl: HTMLDivElement,
    attribute: string,
    isTypeMissing: boolean
  ) {
    // If this element is not visible on the page,
    // then skip.
    if (!dom.isVisibleOnScreen(attributeEl) && !isTypeMissing) {
      return;
    }

    let isMissingText = false;
    let text = attributeEl.getAttribute(attribute);

    if (text == 'None' || text == '' || !text) {
      isMissingText = true;
    }

    // We were looking to see if the attribute was missing or not, but this
    // one passed.
    if (isTypeMissing && attributeEl.hasAttribute(attribute)) {
      return;
    }

    // Search for an existing highlightEl containing this attribute.
    let spacerElGroup = this.highlighters.filter(h => {
      return ~h.attributeEls.indexOf(attributeEl);
    })[0];

    let isNew: boolean = true;
    let spacerEl = document.createElement('div');
    if (spacerElGroup) {
      spacerEl = spacerElGroup.highlighterEl as HTMLDivElement;
      isNew = false;
    }

    spacerEl.classList.add(this.config.cssClassName);
    spacerEl.classList.add(attribute);
    if (isMissingText) {
      spacerEl.classList.add('missing-text');
    }

    if (isTypeMissing) {
      spacerEl.classList.add('missing');
    }

    const textEl = document.createElement('span');
    if (isTypeMissing) {
      textEl.innerText = `Missing: ${attribute}`;
    } else {
      textEl.innerText = `${attribute}: ${text}`;
    }

    spacerEl.appendChild(textEl);

    if (isNew) {
      const rect = attributeEl.getBoundingClientRect();
      const center = `${rect.top + rect.height / 2}px`;
      const bottom = `${rect.bottom}px`;
      const top = `${rect.top}px`;
      const left = (rect.left + rect.right) / 2;

      if (rect.width > 80) {
        spacerEl.style.setProperty('--max-width', `${rect.width * 1.5}px`);
      } else {
        spacerEl.style.setProperty('--max-width', `80px`);
      }
      spacerEl.style.setProperty('--left', `${left}px`);
      spacerEl.style.setProperty('--center', center);
      spacerEl.style.setProperty('--top', top);
      spacerEl.style.setProperty('--bottom', bottom);

      // On hovering this spacerEl, we should highlight the associated
      // element.
      this.attributeWatcher.add({
        element: spacerEl,
        on: ['mousedown'],
        callback: (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          this.raf.stop();
          window.setTimeout(() => {
            attributeEl.classList.add('attribute-highlighter-active');
          });
        },
      });

      this.attributeWatcher.add({
        element: spacerEl,
        on: ['mouseup'],
        callback: (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          attributeEl.classList.remove('attribute-highlighter-active');
          window.setTimeout(() => {
            this.raf.start();
          }, 100);
        },
      });

      this.highlighters.push({
        highlighterEl: spacerEl,
        attributeEls: [attributeEl],
      });

      spacerEl.classList.remove('up');
      el.parentElement!.appendChild(spacerEl);
    } else {
      // Update.
      this.highlighters.forEach(h => {
        if (~h.attributeEls.indexOf(attributeEl)) {
          h.attributeEls.push(attributeEl);
        }
      });
    }

    // Avoid overlap.
    this.highlighters.forEach(aHighlighter => {
      const a = aHighlighter.highlighterEl;
      const isOverlapping = dom.isOverlapping(a, spacerEl);
      if (isOverlapping) {
        if (a.classList.contains('up')) {
          spacerEl.classList.add('up');
          spacerEl.style.setProperty('--height', spacerEl.offsetHeight + 'px');
          spacerEl.style.setProperty('--center', a.offsetTop + 'px');
        } else {
          spacerEl.classList.add('up');
          spacerEl.style.setProperty('--height', spacerEl.offsetHeight + 'px');
        }
      }
    });
  }

  private createHighlighters() {
    // // Flush attributeDom Watcher.
    this.attributeWatcher.removeAll();

    [].forEach.call(
      document.querySelectorAll(this.config.scopeQuerySelector),
      (el: HTMLDivElement) => {
        // Look for attributes.
        this.config.attributes.forEach(attribute => {
          if (is.string(attribute)) {
            const attr = attribute as string;
            [].forEach.call(
              el.querySelectorAll(`[${attribute}]`),
              (attributeEl: HTMLDivElement) => {
                this.createHighlighter(el, attributeEl, attr, false);
              }
            );
          } else {
            // If this is a AttributeHighlighterConfig
            const attr = attribute as AttributeScopeConfig;
            const attrValue = attr.attribute;
            const query = attr.querySelector;
            [].forEach.call(
              el.querySelectorAll(`${query}`),
              (attributeEl: HTMLDivElement) => {
                this.createHighlighter(el, attributeEl, attrValue, false);
              }
            );
          }
        });

        if (this.config.warnMissingAttributes) {
          this.config.warnMissingAttributes.forEach(attribute => {
            // Highlights missing attributes
            const attr = attribute as AttributeScopeConfig;
            const attrValue = attr.attribute;
            const query = attr.querySelector;
            [].forEach.call(
              el.querySelectorAll(`${query}`),
              (attributeEl: HTMLDivElement) => {
                this.createHighlighter(el, attributeEl, attrValue, true);
              }
            );
          });
        }
      }
    );
  }

  private removeHighlighters() {
    this.highlighters.forEach(highlighter => {
      dom.removeElement(highlighter.highlighterEl);
    });
    this.highlighters = [];
  }

  public dispose() {
    this.watcher && this.watcher.dispose();
    this.attributeWatcher && this.attributeWatcher.dispose();
    this.raf && this.raf.dispose();
  }
}
