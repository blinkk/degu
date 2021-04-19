
import { dom } from '..';
import { DomWatcher } from '../dom/dom-watcher';
import { func } from '../func/func';
import { urlParams } from '../dom/url-params';

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
   */
  attributes: string[],


  /**
   * If using url params to autopopulate, the url parameter name.
   * If not using url params, omit this option.
   */
  urlParamName?: string,
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
 *
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
  private config: AttributeHighlighterConfig;
  private observer: MutationObserver;

  constructor(config: AttributeHighlighterConfig) {
    this.config = config;


    // Allow url params to specify the attributes.
    if (this.config.urlParamName) {
      const paramValue = urlParams.getValue(this.config.urlParamName);
      if(paramValue) {
        this.config.attributes = paramValue.split(',');
      }
    }


    this.watcher = new DomWatcher();
    this.watcher.add({
      element: window,
      on: ['click', 'resize', 'scroll'],
      callback: this.run.bind(this)
    })

    const callback = func.debounce(this.run.bind(this), 500) as MutationCallback;
    this.observer = new MutationObserver(callback);
    this.startMutationObservation();

    this.run();
  }

  private startMutationObservation() {
    this.observer.observe(
      document.documentElement,
      {
        attributes: true, childList: false, subtree: true
      }
    )
  }


  private stopMutationObseration() {
    this.observer && this.observer.disconnect();
  }

  public run() {
    this.removeHighlighters();
    this.createHighlighters();
  }

  private createHighlighter(
    el: HTMLDivElement,
    top: string,
    left: number,
    type: string,
    text: string,
  ) {
    const spacerEl = document.createElement('div');
    spacerEl.classList.add(this.config.cssClassName);
    spacerEl.classList.add(type);

    spacerEl.style.setProperty('--left', `${left}px`);
    spacerEl.style.setProperty('--top', top);
    spacerEl.innerText = `${type}: ${text}`;
    el.parentElement.appendChild(spacerEl);
  }



  private createHighlighters() {
    [].forEach.call(
      document.querySelectorAll(this.config.scopeQuerySelector),
      (el: HTMLDivElement) => {
        this.config.attributes.forEach(attribute => {
          [].forEach.call(
            el.querySelectorAll(`[${attribute}]`),
            (attributeEl: HTMLDivElement) => {

              // If this element is not visible on the page,
              // then skip.
              if (dom.isDisplayNoneWithAncestors(attributeEl)) {
                return;
              }

              const rect = attributeEl.getBoundingClientRect();
              const text = attributeEl.getAttribute(attribute);

              this.createHighlighter(
                el,
                `${(rect.top + rect.bottom) / 2}px`,
                (rect.left + rect.right) / 2,
                attribute,
                text
              );
            })
        })
      })

  }


  private removeHighlighters() {
    [].forEach.call(
      document.querySelectorAll(`.${this.config.cssClassName}`),
      (el: HTMLDivElement) => {
        el.parentNode.removeChild(el);
      }
    );
  }



  public dispose() {
    this.watcher && this.watcher.dispose();
    this.stopMutationObseration();
  }
}