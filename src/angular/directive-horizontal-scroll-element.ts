import { HorizontalScrollElement } from '../dom/horizontal-scroll-element';
import { INgDisposable } from "./i-ng-disposable";

class HorizontalScrollElementController implements INgDisposable {

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


/**
 *
 * ```
 * import { horizontalScrollElementDirective} from 'yano-js/lib/angular/directive-horizontal-scroll-element';
 *
 * app.directive('horizontalScrollElement', horizontalScrollElementDirective);
 *
 * ```
 */
export const horizontalScrollElementDirective = () => {
    return {
        restrict: 'A',
        controller: HorizontalScrollElementController
    };
};