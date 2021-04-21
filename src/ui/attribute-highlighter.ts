
import { dom, is } from '..';
import { DomWatcher } from '../dom/dom-watcher';
import { func } from '../func/func';
import { urlParams } from '../dom/url-params';

export interface HighlightAttributePairs {
  highlighterEl: HTMLElement;
  attributeEl: HTMLElement;
}

export interface AttributeScopeConfig {
  attribute: string,
  querySelector: string
}

export interface AttributeHighlighterConfig {
  /**
   * The name of the css class to attached to each generated aria highlighter item.
   */
  cssClassName: string

  /**
   * A query selector to scope your scan to specific elements and its
   * children.
   */
  scopeQuerySelector: string

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
  attributes: (string | AttributeScopeConfig)[],


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
  warnMissingAttributes?: (AttributeScopeConfig)[],

  /**
   * Specify an option url to enable attribute specification via url params.
   */
  urlParamName?: string,

  /**
   * Upon every mutation change,  refresh is called repeatedly for a set
   * period.
   *
   * Normally this is set to 500ms but you can change it depending on
   * your application.  A common case to change this might be say having
   * a carousel that changes slides and the slide transition is longer than
   * 500ms.
   */
  refreshPeriod?: number,
}

/**
 * A class that will visibly highlight element attribute on your page.
 *
 *
 * Setup:
 *
 * 1) Create your highlighter css class.
 * .my-highlighter
 *  align-items: left
 *  color: #FFF
 *  background: rgba(#000, 0.8)
 *  border-radius: 3px
 *  box-shadow: none !important
 *  display: flex
 *  font-size: 12px
 *  height: var(--height)
 *  justify-content: center
 *  left: var(--left)
 *  margin: 0 !important
 *  padding: 0px 8px
 *  //pointer-events: none
 *  position: fixed !important
 *  top: var(--top)
 *  transform: translateX(-50%) translateY(100%)
 *  z-index: 9
 *  &:hover
 *     z-index: 100
 *     transform: translateX(-50%) translateY(100%) scale(1.2)
 *  &:after
 *    content: ''
 *    position: fixed !important
 *    transform: translateX(0%) translateY(-100%)
 *    width: 0
 *    height: 0
 *    border-left: 5px solid transparent
 *    border-right: 5px solid transparent
 *    border-bottom: 5px solid rgba(#000, 0.8)
 *
 *
 *  // If text is missing, the highlighter gets a missing-text class
 *  &.missing-text
 *   background: rgba(red, 0.8)
 *   &:after
 *     border-bottom: 5px solid rgba(red, 0.8)
 *
 *  // To use a different color per attribute just do:
 *  &.alt
 *    background: rgba(red, 0.8)
 *    &:after
 *      background: rgba(red, 0.8)
 *  &.aria-label
 *    background: rgba(blue, 0.8)
 *    &:after
 *      background: rgba(blue, 0.8)
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
  private observer: MutationObserver;

  // A list of all highlighters on the page.
  private highlighters: HighlightAttributePairs[] = [];

  constructor(config: AttributeHighlighterConfig) {
    this.config = config;

    if (!this.config.refreshPeriod) {
      this.config.refreshPeriod == 500;
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
      callback: func.debounce(this.refresh.bind(this), 1)
    })

    // Dedicated watcher for attributes.
    this.attributeWatcher = new DomWatcher();


    const callback = func.debounce(() => {
      // We call this twice with a 500 ms delay.
      this.refresh();
      const startY = window.scrollY;
      func.repeatUntil(() => {
        if (startY == window.scrollY) {
          this.refresh();
        }
      }, () => { return false; },
        this.config.refreshPeriod, 50);

    }, 1) as MutationCallback;
    this.observer = new MutationObserver(callback);
    this.startMutationObservation();

    this.refresh();
  }

  private startMutationObservation() {
    this.observer.observe(
      document.documentElement,
      {
        attributes: true, childList: false, subtree: true
      }
    )
  }


  private stopMutationObservation() {
    this.observer && this.observer.disconnect();
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

    const rect = attributeEl.getBoundingClientRect();
    let text = attributeEl.getAttribute(attribute);

    if (text == 'None' || text == '' || !text) {
      isMissingText = true;
    }

    // We were looking to see if the attribute was missing or not, but this
    // one passed.
    if (isTypeMissing && attributeEl.hasAttribute(attribute)) {
      return;
    }

    const top = `${(rect.top + rect.bottom) / 2}px`;
    const left = (rect.left + rect.right) / 2;

    const spacerEl = document.createElement('div');

    spacerEl.classList.add(this.config.cssClassName);
    spacerEl.classList.add(attribute);
    if (isMissingText) {
      spacerEl.classList.add('missing-text');
    }

    if (isTypeMissing) {
      spacerEl.classList.add('missing');
    }

    spacerEl.style.setProperty('--left', `${left}px`);
    spacerEl.style.setProperty('--top', top);

    if (isTypeMissing) {
      spacerEl.innerText = `Missing: ${attribute}`;
    } else {
      spacerEl.innerText = `${attribute}: ${text}`;
    }
    el.parentElement.appendChild(spacerEl);


    // On hovering this spacerEl, we should highlight the associated
    // element.
    this.attributeWatcher.add({
      element: spacerEl,
      on: ['mousedown'],
      callback: () => {
        this.stopMutationObservation();
        attributeEl.classList.add('attribute-highlighter-active');
      }
    })


    this.attributeWatcher.add({
      element: spacerEl,
      on: ['mouseup'],
      callback: () => {
        this.startMutationObservation();
        attributeEl.classList.remove('attribute-highlighter-active');
      }
    })

    this.highlighters.push({
      highlighterEl: spacerEl,
      attributeEl: attributeEl,
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
                this.createHighlighter(
                  el,
                  attributeEl,
                  attr,
                  false
                );
              })
          } else {

            // If this is a AttributeHighlighterConfig
            const attr = attribute as AttributeScopeConfig;
            const attrValue = attr.attribute;
            const query = attr.querySelector;
            [].forEach.call(
              el.querySelectorAll(`${query}`),
              (attributeEl: HTMLDivElement) => {
                this.createHighlighter(
                  el,
                  attributeEl,
                  attrValue,
                  false
                );
              })
          }
        })

        if (this.config.warnMissingAttributes) {
          this.config.warnMissingAttributes.forEach(attribute => {
            // Highlights missing attributes
            const attr = attribute as AttributeScopeConfig;
            const attrValue = attr.attribute;
            const query = attr.querySelector;
            [].forEach.call(
              el.querySelectorAll(`${query}`),
              (attributeEl: HTMLDivElement) => {
                this.createHighlighter(
                  el,
                  attributeEl,
                  attrValue,
                  true
                );
              })
          });
        }

      })

  }




  private removeHighlighters() {
    this.highlighters.forEach((highlighter) => {
      dom.removeElement(highlighter.highlighterEl);
    })
    this.highlighters = [];
  }



  public dispose() {
    this.watcher && this.watcher.dispose();
    this.attributeWatcher && this.attributeWatcher.dispose();
    this.stopMutationObservation();
  }
}