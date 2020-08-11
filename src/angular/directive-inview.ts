
import { DomWatcher } from '../dom/dom-watcher';
import { func } from '../func/func';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { mathf } from '../mathf/mathf';
import { Raf } from '../raf/raf';


const InviewClassNames = {
    IN: 'in',
    IN_ONCE: 'in-once',
    IN_FOLD: 'in-fold',
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
    private raf: Raf;
    private outEv: ElementVisibilityObject;
    private watcher: DomWatcher;
    private inOffset: number;
    private scrollDirection: number;
    private scrollY: number;
    private upDownEnabled: boolean = false;
    private isIn: boolean = false;
    // Whether the element has been inview at least once.
    private inOnce: boolean = false;

    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.element = $element[0];
        this.targetElements = [this.element];
        this.raf = new Raf();

        this.upDownEnabled = this.element.hasAttribute('inview-up-down') || false;

        const selector = this.element.getAttribute('inview-selector');
        if (selector) {
            this.targetElements = Array.from(this.element.querySelectorAll(selector)) as Array<HTMLElement>;

            this.targetElements.forEach((target: HTMLElement, i: number) => {
                target.setAttribute('inview-number', i + '');
            })
        }

        let offset = this.element.getAttribute('inview-offset');

        // Allow offsets to be defined as pixel value.
        let isDecimal = offset && offset.includes('.');

        if (isDecimal) {
            offset = +offset * 100 + '%';
        }

        if (!offset) {
            offset = '0px';
        }

        this.ev = elementVisibility.inview(this.element, {
            rootMargin: offset + ' 0px 0px 0px'
        }, (element: any, changes: any) => {
            if (this.scrollDirection == 1 || this.scrollDirection == 0 && changes.isIntersecting) {
                this.inview();
            }
        });

        this.scrollY = window.scrollY;
        this.watcher = new DomWatcher();
        this.watcher.add({
            element: window,
            on: 'scroll',
            callback: this.onWindowScroll.bind(this),
            eventOptions: { passive: true }
        })
        this.onWindowScroll();


        this.ev.readyPromise.then(() => {
            this.targetElements.forEach((el) => {
                el.classList.add(InviewClassNames.READY);
                if (this.ev.state().inview) {
                    el.classList.add(InviewClassNames.IN_FOLD);
                }
            })
        })

        this.outEv = elementVisibility.inview(this.element, {}, (element: any, changes: any) => {
            if (!changes.isIntersecting) {
                this.outview();
            }
            if (this.scrollDirection == -1 && changes.isIntersecting) {
                this.inview();
            }
        });

        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }


    private onWindowScroll(): void {
        this.raf.read(() => {
            const ws = window.scrollY;
            this.scrollDirection = mathf.direction(this.scrollY, ws);
            this.scrollY = ws;
        })
    }

    private inview(): void {
        if (this.isIn) {
            return;
        };
        this.isIn = true;

        this.raf.write(() => {
            this.targetElements.forEach((el) => {
                el.classList.remove(InviewClassNames.OUT);
                el.classList.add(InviewClassNames.IN);

                if (!this.inOnce) {
                    el.classList.add(InviewClassNames.IN_ONCE);
                    this.inOnce = true;
                }


                if (this.upDownEnabled) {
                    el.classList.remove(InviewClassNames.UP);
                    el.classList.remove(InviewClassNames.DOWN);
                    el.classList.add(this.scrollDirection == -1 ? InviewClassNames.UP : InviewClassNames.DOWN);
                }
            })
        });
    }

    private outview(): void {
        if (!this.isIn) {
            return;
        };
        this.isIn = false;
        this.raf.write(() => {
            this.targetElements.forEach((el) => {
                el.classList.add(InviewClassNames.OUT);
                el.classList.remove(InviewClassNames.IN);
                el.classList.remove(InviewClassNames.IN_FOLD);
                if (this.upDownEnabled) {
                    el.classList.remove(InviewClassNames.UP);
                    el.classList.remove(InviewClassNames.DOWN);
                    el.classList.add(this.scrollDirection == -1 ? InviewClassNames.UP : InviewClassNames.DOWN);
                }
            })
        });
    }


    dispose() {
        this.ev && this.ev.dispose();
        this.outEv && this.outEv.dispose();
        this.watcher && this.watcher.dispose();
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
 * # In Once
 * The class .in-once is attached just the first time the element comes into
 * view and is never removed.  This is useful for things like intro effects
 * or pages transitions in which you set only once.
 *
 * # Add an offset
 * <div inview inview-offset="0.2"> --> Triggers the inview when 20% of the element is visible.
 * <div inview inview-offset="0.5"> --> Triggers the inview when 50% of the element is visible.
 * <div inview inview-offset="10px"> --> Triggers the inview when 10px of the element is visible.
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
 *
 * # In first view.
 * Sometimes you might want to add a stagger effect to stuff that is above the folder.
 * In other words an intro effect but only to elements that are visible on first load.
 * Inview will add '.in-fold' to any element that is detected to be visible when the
 * inview first is instantiated.
 * `in-fold` will get removed on outview.
 *
 *
 * Here we have an element in which it gets a transition delay only when it is initially
 * in the fold.
 * ```
 *   .body
 *     +effect-body
 *   .body.in-once
 *     +effect-body-run
 *   .body.in-fold
 *     transition-delay: 0.4s
 * ```
 *
 */
export const inviewDirective = function () {
    return {
        restrict: 'A',
        controller: InviewController,
    };
}


