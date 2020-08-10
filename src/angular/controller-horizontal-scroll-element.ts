import { HorizontalScrollElement } from '../dom/horizontal-scroll-element';
import { INgDisposable } from "./i-ng-disposable";


export interface HorizontalScrollElementControllerInitConfig {
    scrollSelector: string;
}

/**
 *
 * ```
 * =scroll-snap
 *   width: 100%
 *   display: flex
 *   overflow-x: scroll
 *   overflow-y: hidden
 *   -webkit-overflow-scrolling: touch
 *   transition: 0.3s all ease-in
 *   transform: scale(1.0)
 *   user-select: none
 *   user-drag: none
 *   -webkit-touch-callout: none
 *   a
 *       user-select: none
 *       user-drag: none
 *   img
 *       pointer-events: none
 *   &::-webkit-scrollbar
 *       background: transparent
 *       width: 0
 *   &.dragging
 *       transform: scale(1.015)
 *   [scroll-item]
 *       position: relative
 *       &:hover
 *       cursor: grab
 *   [scroll-inner]
 *       position: relative
 *       width: 85vw
 *       +sd-lt
 *       margin-right: 32px
 *       +md-lt
 *       margin-right: 24px
 *   [scroll-item]:first-child
 *       +sd-lt
 *       margin-left: 32px
 *       +md-lt
 *       margin-left: 24px
 *
 * .my-scroll-area
 *   +scroll-snap
 *
 * <div
 *  ng-controller="HorizontalScrollElementController as ctrl"
 *  ng-init="ctrl.init({ scrollSelector: '[scroll]'})"
 *
 * >
 *   <div class="my-scroll-area" scroll>
 *        <div scroll-item>
 *           <div scroll-inner>...</div.
 *        </div>
 *        <div scroll-item>
 *          <div scroll-inner>...</div.
 *        </div>
 *        ...
 *    </div>
 *
 *
 *
 * import { HorizontalScrollElementController } from 'yano-js/lib/angular/controller-horizontal-scroll-element';
 * app.controller('HorizontalScrollElementController', HorizontalScrollElementController);
 *
 *
 *
 * @see HorizontalScrollElement for docs.
 */
export class HorizontalScrollElementController implements INgDisposable {

    private el: HTMLElement;
    private scrollElement: HTMLElement;
    private $scope: ng.IScope;
    private horizontalScroll: HorizontalScrollElement;
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.$scope = $scope;
        this.el = $element[0];
        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }


    public init(config: HorizontalScrollElementControllerInitConfig) {
        this.scrollElement = this.el;
        if(config.scrollSelector) {
            this.scrollElement = this.el.querySelector(config.scrollSelector);
            if(!this.scrollElement) {
                throw new Error('An element with the selector ' + config.scrollSelector + ' was not found');
            }
        }

        window.setTimeout(()=> {
            this.horizontalScroll = new HorizontalScrollElement(this.scrollElement);
            this.horizontalScroll.enableSlideDeltaValues(true);

            const deltaSelector = this.el.getAttribute('add-delta-value-elements-selector');
            if(deltaSelector) {
                const group = Array.from(this.el.querySelectorAll(deltaSelector)) as Array<HTMLElement>;
                this.horizontalScroll.addSlideDeltaValuesToElements([group]);
            }

        })

    }


    public prev():void {
        this.horizontalScroll && this.horizontalScroll.prev();
    }


    public next():void {
        this.horizontalScroll && this.horizontalScroll.next();
    }


    public isFirstSlide() {
        return this.horizontalScroll && this.horizontalScroll.isFirstSlide();
    }

    public isLastSlide() {
        return this.horizontalScroll && this.horizontalScroll.isLastSlide();
    }

    public dispose():void {
        this.horizontalScroll && this.horizontalScroll.dispose();
    }
}

