import { ViewportCssParallax } from '../dom/viewport-css-parallax';



export class ViewportCssParallaxController {
    private element: HTMLElement;
    private viewportCssParallax: ViewportCssParallax;

    static get $inject() {
        return ['$element', '$scope', '$attrs'];
    }

    constructor($element: ng.IRootElementService, $scope: ng.IScope, $attrs: ng.IAttributes) {
        this.element = $element[0];
        const parallaxData = JSON.parse(this.element.getAttribute('viewport-css-parallax'));
        this.viewportCssParallax = new ViewportCssParallax();

        // Add the root element.
        parallaxData['settings']['rootElement'] = this.element;

        this.viewportCssParallax.init(
            parallaxData['settings'], parallaxData['interpolations']
        );


        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }


    protected dispose(): void {
        this.viewportCssParallax.dispose();
    }
}


/**
 *
 * A directive to run css var interpolations from yaml or json.
 *
 * This is different from css-parallax in that the progress value is NOT how
 * much an element is shown but rather, WHERE on the viewport it resides.
 *
 * Progress is calculates from the top of the screen (1) to the bottom
 * of the screen (0).
 *
 * This allows you to specify effects as the user scrolls.
 *
 * In yaml:
 *
 * ```
 * partial: myPartial
 * css_parallax:
 *   settings:
 *     debug: false (boolean, optional) True outputs progress in the dev console.
 *     lerp: 0.18 Optional lerp.  Defaults to 1 assuming no asymptotic averaging.
 *     damp: 0.18 Optional damp.  Defaults to 1 assuming no damping.
 *     clamp: false (boolean)  Defaults to true where by progress is clamped to 0 and 1.
 *     precision: (number) Defaults to 3.  Lower precision means less dom updates but less accuracy.
 *     elementBaseline: 0 (number) defaults to 0 Should we use the top (0), middle (0.5), bottom(1) or bottom of the element to determine where on the viewport it resides.
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
 * It might be more common to inline the settings:
 * ```
 *           {% set parallax_settings = {
 *             'settings': {
 *               'debug': true,
 *               'lerp': 0.2,
 *               'damp': 0.6,
 *               'clamp': false,
 *               'elementBaseline': 0
 *             },
 *             'interpolations': [
 *               {
 *                   'id': '--opacity',
 *                   'progress': [
 *                       {
 *                           'from': 0,
 *                           'to': 0.5,
 *                           'start': 0,
 *                           'end': 1,
 *                       }
 *                   ]
 *               }
 *             ]
 *           } %}
 *
 *        <div class="sup" viewport-css-parallax="{{parallax_settings|jsonify}}">
 *            Hello this is a test.
 *        </div>
 *
 *
 * ```
 *
 *
 * In your app:
 *
 * ```ts
 *   import { viewportCssParallaxDirective } from 'yano-js/lib/angular/directive-viewport-css-parallax';
 *
 *   const app = angular.module('myApp', []);
 *   app.directive('viewportCssParallax', viewportCssParallaxDirective);
 * ```
 *
 *
 * In the module, you want to use this:
 *
 * ```
 * <div {% if partial.viewport_css_parallax %} viewport-css-parallax="{{partial.viewport_css_parallax|jsonify}}{% endif %"></div>
 * ```
 *
 *
 *
 *
 */
export const viewportCssParallaxDirective = function () {
    return {
        restrict: 'A',
        controller: ViewportCssParallaxController
    }
}
