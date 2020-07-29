
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';

/**
 * A directive used to immediately toggle visibility of elements when it goes out of view.
 */
export class VisibilityOptimizeController {
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }
    private element: HTMLElement;
    private ev: ElementVisibilityObject;

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.element = $element[0];
        this.ev = elementVisibility.inview(this.element, {
            rootMargin:  '500px 0px 500px 0px'
        }, (element: any, changes:any) => {
            if (changes.isIntersecting) {
                this.element.style.visibility = '';
            } else {
                this.element.style.visibility = 'hidden';
            }
        });
    }
}




/**
 * Usage.
 * ```ts
 *   import { visibilityOptimizeDirective } from 'yano-js/lib/angular/directive-visibility-optimize';
 *
 *   const app = angular.module('myApp', []);
 *   app.directive('visibilityOptimize', visibilityOptimizeDirective);
 *   <div visibilility-optimize>
 * ```
 *
 */
export const visibilityOptimizeDirective = function() {
    return {
        restrict: 'A',
        controller: VisibilityOptimizeController,
    };
}