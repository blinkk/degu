
import { DomWatcher } from '../dom/dom-watcher';
import { func } from '../func/func';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { mathf } from '../mathf/mathf';


const InviewClassNames = {
    IN: 'in',
    DOWN: 'down',
    UP: 'up',
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
    private scrollDirection:number;
    private scrollY:number;
    private upDownEnabled: boolean = false;

    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.element = $element[0];
        this.targetElements = [this.element];

        this.upDownEnabled = this.element.hasAttribute('inview-up-down') || false;

        const selector = this.element.getAttribute('inview-selector');
        if(selector) {
            this.targetElements = Array.from(this.element.querySelectorAll(selector)) as Array<HTMLElement>;

            this.targetElements.forEach((target:HTMLElement, i:number)=> {
                target.setAttribute('inview-number', i + '');
            })
        }

        this.inOffset = +this.element.getAttribute('inview-offset') || 0;

        this.ev = elementVisibility.inview(this.element, {
            threshold: +this.inOffset || 0
        }, (element: any, changes:any) => {
            if (changes.isIntersecting) {
                this.inview();
            }
        });

        if(this.upDownEnabled) {
            this.scrollY = window.scrollY;

            this.watcher = new DomWatcher();
            this.watcher.add({
                element: window,
                on: 'scroll',
                callback: this.onWindowScroll.bind(this),
                eventOptions: { passive: true }
            })
            this.onWindowScroll();
        }


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


    private onWindowScroll():void {
        this.scrollDirection = mathf.direction(this.scrollY, window.scrollY);
        this.scrollY = window.scrollY;

    }

    private inview(): void {
        this.targetElements.forEach((el)=> {
            el.classList.remove(InviewClassNames.OUT);
            el.classList.add(InviewClassNames.IN);
            if(this.upDownEnabled) {
              el.classList.remove(InviewClassNames.UP);
              el.classList.remove(InviewClassNames.DOWN);
              el.classList.add(this.scrollDirection == -1 ? InviewClassNames.UP : InviewClassNames.DOWN);
            }
        })
    }

    private outview(): void {
        this.targetElements.forEach((el)=> {
            el.classList.add(InviewClassNames.OUT);
            el.classList.remove(InviewClassNames.IN);
            if(this.upDownEnabled) {
              el.classList.remove(InviewClassNames.UP);
              el.classList.remove(InviewClassNames.DOWN);
              el.classList.add(this.scrollDirection == -1 ? InviewClassNames.UP : InviewClassNames.DOWN);
            }
        })
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
 *   <div add-inview class="in" inview-number="0">my title</div>
 *   <div add-inview class="in" inview-number="1">body</div>
 * </div>
 * ```
 *
 * Note how it adds the inview-number which you can use to add
 * stagger effects.
 *
 * # Add down and up classes
 * <div inview inview-up-down></div>
 *
 * # Add an offset
 * <div inview inview-offset="0.2"> --> Triggers the inview when 20% of the element is visible.
 * <div inview inview-offset="0.5> --> Triggers the inview when 50% of the element is visible.
 *
 * # My inview keeps flickering, in and out classes toggle.
 * The likely problem is that your inview effect has a translateY
 * that moves the position of the element itself.  This ends up
 * toggling the intersection observer.
 *
 * The solution is to add the inview to a parent element and then
 * apply your effect to your desired element.
 *
 * Or just use the target selector feature.
 *
 */
export const inviewDirective = function () {
    return {
        restrict: 'A',
        controller: InviewController,
    };
}


