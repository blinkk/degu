
import { DomWatcher } from '../dom/dom-watcher';
import { func } from '../func/func';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { cssUnit, CssUnitObject } from '../string/css-unit';


const InviewClassNames = {
    IN: 'in',
    OUT: 'out',
    READY: 'ready',
}

export class InviewController {
    // The root element to determine visibility.
    private element: HTMLElement;
    // The element in which css classes get appended to.
    private targetElements: Array<HTMLElement>;
    private ev: ElementVisibilityObject;
    private outEv: ElementVisibilityObject;
    private watcher: DomWatcher;
    private inOffset: number;
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.element = $element[0];
        this.targetElements = [this.element];


        const selector = this.element.getAttribute('inview-selector');
        if(selector) {
            this.targetElements = Array.from(this.element.querySelectorAll(selector)) as Array<HTMLElement>;
        }

        const offset = this.element.getAttribute('inview-offset') || '0px';
        this.inOffset = func.setDefault(
            this.getPixelValue(offset), 0
        );

        this.ev = elementVisibility.inview(this.element, {
            rootMargin: this.inOffset + 'px'
        }, (element: any, changes:any) => {
            if (changes.isIntersecting) {
                this.inview();
            }
        });

        this.ev.readyPromise.then(()=> {
            this.targetElements.forEach((el)=> {
                el.classList.add(InviewClassNames.READY);
            })
        })

        this.outEv = elementVisibility.inview(this.element, {}, (element: any, changes: any) => {
            if (!changes.isIntersecting) {
                this.outview();
            }
        });

        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }

    private inview(): void {
        this.targetElements.forEach((el)=> {
            el.classList.remove(InviewClassNames.OUT);
            el.classList.add(InviewClassNames.IN);
        })
    }

    private outview(): void {
        this.targetElements.forEach((el)=> {
            el.classList.add(InviewClassNames.OUT);
            el.classList.remove(InviewClassNames.IN);
        })
    }

    /**
     * Takes a css string declaration such as '100px', '100vh' or '100%'
     * and converts that into a relative pixel number.
     * @param cssUnitObject
     */
    protected getPixelValue(cssValue: string): number {
        const unit = cssUnit.parse(cssValue);
        let base = 1;
        if (unit.unit == '%') {
            base = this.element.offsetHeight;
            return base * (unit.value as number / 100);
        }
        if (unit.unit == 'vh') {
            base = window.innerHeight;
            return base * (unit.value as number / 100);
        }

        return base * (unit.value as number);
    }


    dispose() {
        this.ev.dispose();
        this.outEv.dispose();
        this.watcher.dispose();
    }
}


/**
 * A simple inview directive using intersection Observers.
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
 * # Target Selectors
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
 *   <div add-inview class="in">my title</div>
 *   <div add-inview class="in">body</div>
 * </div>
 * ```
 *
 * # Add an offset
 * One of the trickest things with inview is how to setup the offset logic.
 * This inview handles this by allows you to pass px, vh, % values as an offset which
 * gets passed over to the internal intersection observer as a rootMargin.
 *
 * By default, without any offset, inview is triggered the "exact" moment that
 * any part of the directive element enters the view port.
 *
 *
 * Pixel offset:
 * <div inview inview-offset="-100px"> --> Triggers the inview when the 100px of element is visible
 *
 * Percentage offset:
 * <div inview inview-offset="-20%> --> Triggers the inview when 20% of the element is visible.
 * <div inview inview-offset="-50%> --> Triggers the inview when 50% of the element is visible.
 *
 *
 * VH offset - this can have strange effects if you element is shorter than your offset itself.
 * For exapmle, having a 50vh offset doesn't make sense if you element is only 20vh tall.
 *
 * <div inview inview-offset="-50vh> --> Triggers the inview when 20vh worth of the element is visible.
 */
export const inviewDirective = function () {
    return {
        restrict: 'A',
        controller: InviewController,
    };
}


