import { HorizontalScrollElement } from '../dom/horizontal-scroll-element';
import { INgDisposable } from "./i-ng-disposable";


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
 * <div ng-controller="HorizontalScrollElementController as ctrl">
 *   <div class="my-scroll-area">
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
 * ```
 *
 * @see HorizontalScrollElement for docs.
 */
export class HorizontalScrollElementController implements INgDisposable {

    private el: HTMLElement;
    private $scope: ng.IScope;
    private horizontalScroll: HorizontalScrollElement;
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.$scope = $scope;
        this.el = $element[0];
        this.horizontalScroll = new HorizontalScrollElement(this.el);
        this.horizontalScroll.setUseCssVar(false);
        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }


    public dispose():void {
        this.horizontalScroll.dispose();
    }
}

