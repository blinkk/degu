
import { DomWatcher } from '../dom/dom-watcher';
import { func } from '../func/func';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { mathf } from '../mathf/mathf';
import { Raf } from '../raf/raf';
import { Inview } from '../dom/inview';



export class InviewController {
    // The root element to determine visibility.
    private element: HTMLElement;
    private inview: Inview;
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAugmentedJQuery, $attrs: ng.IAttributes) {
        this.element = $element[0];

        this.inview = new Inview({
            element: this.element,
            childSelector: this.element.getAttribute('inview-selector') || undefined,
            elementBaseline: +this.element.getAttribute('inview-element-baseline')! || undefined,
            viewportOffset: +this.element.getAttribute('inview-viewport-offset')! || undefined,
            // outviewOnlyOnElementExit: true
            downOnlyMode: true
        });

        $scope.$on('$destroy', () => {
            this.dispose();
        });

    }

    dispose() {
        this.inview && this.inview.dispose();
    }
}


/**
 * A simple inview directive.  This is based on dom/Inview.
 *
 *
 * # Basic inview
 * ```
 * <div inview></div>
 *
 * when inview:
 * <div inview class="in"></div>
 * ```
 *
 *
 * # Settings
 * Shifting position.
 * <div inview inview-element-baseline="0" inview-viewport-offset="0.25"></div>
 *
 *
 * # Child Selectors
 * Use target selectors to add inview to child elements.
 * Note that the element used to determine inview state is still
 * the root inview directive element.
 * ```
 * <div inview inview-selector="[add-inview]">
 *   <div add-inview>my title</div>
 *   <div add-inview>body</div>
 * </div>
 *
 * when inview:
 *
 * <div inview inview-selector="[add-inview]">
 *   <div add-inview class="in" inview-number="0">my title</div>
 *   <div add-inview class="in" inview-number="1">body</div>
 * </div>
 * ```
 *
 *
 */
export const inviewDirective = function () {
    return {
        restrict: 'A',
        controller: InviewController,
    };
}


