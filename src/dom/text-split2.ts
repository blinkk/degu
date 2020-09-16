import { dom } from './dom';
import { DomWatcher } from './dom-watcher';

export interface textSplit2Config {
    element: HTMLElement;
}

/**
 * This is a slightly improved version of text-split.ts.  It automatically
 * assumes you want a word by word split but also adds sentence row indexes
 * so you can add effects per sentence row.
 *
 * Splits the textContent of a given htmlElement and provides css variables
 * that can be used to add various text effects.
 *
 *
 * Here is a basic example.
 *
 * ```ts
 *
 * <div id="myElement">New York <br/>City</div>
 *
 * let splitter = new TextSplit({
 *   element: document.getElementById('myElement'),
 * });
 *
 * // Break up the text and wrap spans around it.
 * splitter.split();
 * ```
 *
 * This results in:
 *
 * ```ts
 * .only-screenreaders
 *  height: 1px
 *  width: 1px
 *  margin: -1px
 *  overflow: hidden
 *  padding: 0
 *  position: absolute
 *
 * <div class="only-screenreaders">New York City</div>
 * <div id="myElement" class="text-split-set" style="--item-total-count:3"
 * >
 *   <span aria-hidden="true" style="--item-index:0">New&nbsp;</span>
 *   <span aria-hidden="true" style="--item-index:1">York&nbsp;</span><br/>
 *   <span aria-hidden="true" style="--item-index:2">City</span>
 * </div>
 *
 * ```
 *
 *
 * Additionally, each item can received the follow:
 *
 * ```ts
 *
 * <span start="1" row="1" end="1" item="1">xxx</div>
 *
 * ```
 *
 * row: This is the row sentence number that this span resides on.
 * start: If this is the first word in the sentence.
 * end: If this is the last word in the sentence.
 * item: The overall item index of this word.
 *
 *
 * Notice that on the root element, you get the total number of items,
 * and also on each element, you get an index.
 *
 * Now you can use css variables to add various effect.
 *
 * ```ts
 *  @keyframes textIn
 *      from
 *          opacity: 0;
 *      to
 *          opacity: 1;
 *
 *  // Help fight FOUC
 *  #myElement
 *    visiblity: hidden
 *  #myElement.text-split-set
 *    visibility: visible
 *
 *  #myElement span,
 *    position: relative
 *    font-size: 20px
 *    opacity: 0
 *    animation: textIn 1.3s ease-in-out 0s 1 forwards
 *
 *    // Create a 0.2s stagger between each item.
 *    animation-delay: calc(var(--item-index) * 0.2s
 *
 *    // More advanced.  You may not know how many words or character there are
 *    // but you want to the animation to finish in Xs seconds.
 *    // Using item-total-count, you can break the subdivisions.
 *    // Here no matter how many words/characters there are, set it so that the
 *    // stagger animation always completes in 1s.
 *    animation-delay: calc(var(--item-index) * (1s / var(--item-total-count)))
 * ```
 */
export class TextSplit2 {
    private element: HTMLElement;
    public originalHTML: string;
    private domWatcher: DomWatcher;
    private words: Array<HTMLElement>;

    constructor(private config: textSplit2Config) {
        this.element = config.element;
        this.originalHTML = this.element.innerHTML;
        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: () => requestAnimationFrame(this.onSmartResize.bind(this)),
        });
    }

    /**
     * Splits the text and wraps <span> around each sub item.
     */
    split() {
        const nodes = dom.getAllTextNodes(this.element);
        this.words = [];

        let index = 0;
        nodes.forEach((node, i) => {

            let first = true;
            let previousElement = node;

            // Split this text node by space.
            var re = new RegExp(String.fromCharCode(160), "g");
            let text = node.textContent;
            text = text.replace(re, ' ');
            const texts = node.textContent.trim().split(' ');

            texts.forEach((text, i) => {
                let element = dom.createElementFromString(
                    `<span aria-hidden="true"></span>`
                );

                // if (i !== texts.length - 1) {
                //     element.innerHTML = text + '&nbsp;';
                // } else {
                //     element.innerHTML = text + '&nbsp;';
                // }
                element.innerHTML = text + '&nbsp;';

                element.classList.add('text-split__text');
                element.setAttribute('item', index + '');
                dom.setCssVariable(element, '--item-index', index + '');

                this.words.push(element);

                if (first) {
                    node.parentElement.replaceChild(element, node);
                    first = false;
                } else {
                    dom.appendAfter(element, previousElement as HTMLElement);
                }

                previousElement = element;
                index++;
            })

        })

        this.onSmartResize();
        dom.setCssVariable(this.config.element, '--item-total-count',
        this.words.length + '');

        this.config.element.classList.add('text-split-set');
    }



    /**
     * On each resize, check the position of each span and mark down which
     * row it resides on.
     */
    private onSmartResize() {
        let sentenceNumber = 0;
        let y = dom.getScrollTop(this.words[0]);
        // Clean up
        this.words.forEach((word, i) => {
            word.removeAttribute('start');
            word.removeAttribute('end');
            word.removeAttribute('row');
        });

        this.words[0].setAttribute('start', sentenceNumber + '');
        this.words.forEach((word, i) => {
            const wordY = dom.getScrollTop(word, true);

            word.className.replace(/\bbg.*?\b/g, '');

            if (wordY !== y) {
                y = wordY;
                if (this.words[i-1]) {
                  this.words[i - 1].setAttribute('end', sentenceNumber + '');
                }
                sentenceNumber++;
                word.setAttribute('start', sentenceNumber + '');
            }
            word.setAttribute('row', sentenceNumber + '');


            // Last item.
            if (i == this.words.length - 1) {
                this.words[i].setAttribute('end', sentenceNumber + '');
            }
        })
    }


    /**
     * Reverts and undoes the effects of text-split.
     */
    revert() {
        this.element.innerHTML = this.originalHTML;
    }


    dispose() {
        this.domWatcher.dispose();
    }




}