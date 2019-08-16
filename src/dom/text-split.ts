import { dom } from './dom';

export interface textSplitConfig {
    element: HTMLElement;

    /**
     * The criteria of how to split up the text found in the element.
     * For example:
     *   '' would break it by every character.
     *   ' ' would break it up by spaces (or every word)
     */
    split: string;
}

/**
 * Splits the textContent of a given htmlElement and provides css variables
 * that can be used to add various text effects.
 *
 *
 * Here is a basic example.
 * ```ts
 *
 * <div id="myElement">New York City</div>
 *
 * let splitter = new TextSplit({
 *   element: document.getElementById('myElement'),
 *   split: ' ' // Split by spaces.  Use '' to split by character.
 * });
 *
 * // Break up the text and wrap spans around it.
 * splitter.split();
 * ```
 *
 * This results in:
 * ```ts
 * <div id="myElement" class="text-split-set" style="--item-total-count:3">
 *   <span style="--item-index:0">New&nbsp;</span>
 *   <span style="--item-index:1">York&nbsp;</span>
 *   <span style="--item-index:2">City</span>
 * </div>
 *
 * ```
 *
 * Notice that on the root element, you get the total number of items,
 * and also on each element, you get an index.
 *
 * Now you can use css variables to add various effect.
 *
 * ```
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
 *
 */
export class TextSplit {
    public originalText: string;
    public splits: Array<string>;
    public convertSpacesToNbsp: boolean;

    constructor(private config: textSplitConfig) {
        this.originalText = this.config.element.textContent!;
        this.splits = this.originalText.split(
            this.config.split
        );
        this.convertSpacesToNbsp = this.config.split == ' ';
        console.log(this.originalText, this.splits);
    }

    /**
     * Splits the text and wraps <span> around each sub item.
     */
    split() {
        this.config.element.innerHTML = '';
        this.splits.forEach((word, i) => {
            // Add spaces to the end of each word if it's not the last one.
            if (this.convertSpacesToNbsp && i !== this.splits.length - 1) {
                word += '&nbsp;';
            }

            let element = dom.createElementFromString(
                `<span>${word}</span>`
            )
            dom.setCssVariable(element, '--item-index', i + '');
            this.config.element.appendChild(element);
        })

        // Add total count to root element.
        dom.setCssVariable(this.config.element, '--item-total-count',
            this.splits.length + '');

        this.config.element.classList.add('text-split-set');
    }




}