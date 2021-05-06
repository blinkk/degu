import { CssParallaxer } from '../dom/css-parallaxer';

export class CssParallaxController {
    private element: HTMLElement;
    private cssParallaxer: CssParallaxer;

    static get $inject() {
        return ['$element', '$scope', '$attrs'];
    }

    constructor($element: ng.IRootElementService, $scope: ng.IScope, $attrs: ng.IAttributes) {
        this.element = $element[0];
        const parallaxData = JSON.parse(this.element.getAttribute('css-parallax')!);
        this.cssParallaxer = new CssParallaxer(this.element);
        this.cssParallaxer.init(
            parallaxData['settings'], parallaxData['interpolations']
        );


        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }



    protected dispose(): void {
        this.cssParallaxer.dispose();
    }
}



/**
 *
 * A directive to run css var interpolations from yaml or json.
 *
 * In yaml:
 *
 * ```
 * partial: myPartial
 * css_parallax:
 *   settings:
 *     debug: false (boolean, optional) True outputs progress in the dev console.
 *     top: '0px' (string) A css number to offset where the progress begins.  Accepts %, px, vh.
 *     bottom: '0px' (string) A css number to offset the progress ends.  Accepts %, px, vh.
 *     height: '100px' (string) Optional.  An absolute height to use to calculate the percent.  Accepts %, px, vh.  In most cases you won't need this.
 *     lerp: 0.18 Optional lerp.  Defaults to 1 assuming no asymptotic averaging.
 *     damp: 0.18 Optional damp.  Defaults to 1 assuming no damping.
 *     clamp: false (boolean)  Defaults to true where by progress is clamped to 0 and 1.
 *     precision: (number) Defaults to 3.  Lower precision means less dom updates but less accuracy.
 *
 *     // Allows you to pass through option to intersection observer controlling
 *     // start and stop of raf.
 *     rafEvOptions:
 *         rootMargin: '0px 0px 0px 0px'
 *
 *   interpolations:
 *     - id: '--x'
 *       progress:
 *       - from: 0.5
 *         to: 1
 *         start: '0px'
 *         end: '20px'
 *     - id: '--opacity'
 *       progress:
 *       - from: 0
 *         to: 0.5
 *         start: 0
 *         end: 1
 *       - from: 0.5
 *         to: 1
 *         start: 0
 *         end: 1
 * ```
 *
 *
 * In your app:
 *
 * ```ts
 *   import { cssParallaxDirective } from 'degu/lib/angular/directive-css-parallax';
 *
 *   const app = angular.module('myApp', []);
 *   app.directive('cssParallax', cssParallaxDirective);
 * ```
 *
 *
 * In the module, you want to use this:
 *
 * ```
 * <div {% if partial.css_parallax %} css-parallax="{{partial.css_parallax|jsonify}}{% endif %"></div>
 * ```
 *
 *
 *
 * ## Height Settings
 *
 * In rare instances, you might want to calculate a scroll percent from when an
 * element enters the viewport but not based on the height of the element itself.
 *
 * Imagine a <div> with 500vh.
 *
 * If you applied this settings:
 * ```
 *   setting:
 *     top: '0px'
 *     height: '100vw'
 * ```
 * Now the progress will start when that div comes in but end (1) when 100vw worth
 * of scroll has been completed.
 *
 */
export const cssParallaxDirective = function () {
    return {
        restrict: 'A',
        controller: CssParallaxController
    }
}
