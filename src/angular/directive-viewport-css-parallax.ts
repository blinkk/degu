import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { func } from '../func/func';
import { interpolateSettings } from '../interpolate/multi-interpolate';
import { DomWatcher } from '../dom/dom-watcher';
import { CssVarInterpolate } from '../interpolate/css-var-interpolate';
import { Raf } from '../raf/raf';
import { dom } from '../dom/dom';
import { mathf } from '../mathf/mathf';
import { is } from '../is/is';

export interface ViewportCssParallaxSettings {
    debug: boolean,
    // http://yano-js.surge.sh/classes/mathf.mathf-1.html#damp
    lerp: number,
    damp: number,
    // Whether to force clamp the progress to 0-1 range.  Defaults to true.
    clamp: boolean,

    // The precision rounding on the lerp.  Used to cull / avoid layout thrashes.
    precision: number,

    // The elemeent baseline is the location in which we should use to
    // check the current element position.  Since we want to check
    // where in a viewport an element is, we need to know what point to use
    // in the element.  Should we use the top (0), middle (0.5) or bottom of the
    // element.
    elementBaseline: number,

    // The rafEvOptions so that you can add rootMargin etc to the base raf.
    rafEvOptions: Object
}

export interface ViewportCssParallaxConfig {
    settings: ViewportCssParallaxSettings,
}


export class ViewportCssParallaxController {
    private element: HTMLElement;
    private domWatcher: DomWatcher;
    private rafEv: ElementVisibilityObject;
    private raf: Raf;
    private interpolator: CssVarInterpolate;

    /**
     * The css parallax settings.
     */
    private parallaxData: ViewportCssParallaxConfig;
    private settingsData: ViewportCssParallaxSettings;
    private interpolationsData: Array<interpolateSettings>;


    private currentProgress: number = 0;


    static get $inject() {
        return ['$element', '$scope', '$attrs'];
    }

    constructor($element: ng.IRootElementService, $scope: ng.IScope, $attrs: ng.IAttributes) {

        console.log('directive viewport css parallax');

        this.element = $element[0];
        this.raf = new Raf(this.onRaf.bind(this));
        this.parallaxData = JSON.parse(this.element.getAttribute('viewport-css-parallax'));
        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: () => this.onWindowResize(),
        });


        this.settingsData = {
            ...{
                debug: false,
                clamp: true,
                lerp: 1,
                damp: 1,
                // Default to top of element.
                elementBaseline: 0,
                precision: 3,
                rafEvOptions: {
                    rootMargin: '300px 0px 300px 0px'
                }
            },
            ...this.parallaxData['settings'] || {}
        };

        this.interpolationsData = this.parallaxData['interpolations'] || [];

        this.interpolator = new CssVarInterpolate(
            this.element,
            {
                interpolations: this.interpolationsData,
            }
        );
        this.interpolator.useBatchUpdate(true);

        // On load, we need to initially, bring the animation to
        // start position.
        this.updateImmediately();


        // Start and stop raf when the element comes into view.
        this.rafEv = elementVisibility.inview(this.element, this.settingsData.rafEvOptions,
            (element: any, changes: any) => {
                if (changes.isIntersecting) {
                    this.raf.start();
                } else {
                    this.raf.stop();
                    this.updateImmediately();
                }
            });

        $scope.$on('$destroy', () => {
            this.dispose();
        });
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



    /**
     * Calculates the current progress and returns a value between 0-1.
     */
    protected updateProgress(lerp: number, damp: number): number {

        // Viewport css parallax needs to calculate where on the viewport a given
        // elemenet resides.
        //
        // Since generally, since we think in terms of scrolling down, 0 - 1 would
        // be represented as:
        // 1 ---> top of screen
        // 0.5 --> middle of screen
        // 0 --> bottom of screen
        //
        // Therefore, progress is represented as 0-1 where it goes from the bottom
        // of the screen to the top.
        //
        //
        // Additionally, we need to know, what point in the element should be
        // use to see where the element resides.  We could use the top,
        // center or bottom.
        //
        // The elementBaseline is used to factor this in.  The default state
        // is calculated from teh top of the element.
        const elementBaseline =
            this.element.getBoundingClientRect().top +
            (this.settingsData.elementBaseline * this.element.offsetHeight);

        let percent = mathf.inverseLerp(0, window.innerHeight,
            elementBaseline
        )

        // Invert it so that 0 is considered bottom.
        percent = 1 - percent;

        this.currentProgress =
            mathf.damp(
                this.currentProgress,
                percent,
                lerp, damp
            );


        if (this.settingsData.clamp) {
            this.currentProgress = mathf.clamp01(this.currentProgress);
        }

        if (this.settingsData.debug) {
            console.log(this.currentProgress);
        }

        return this.currentProgress;
    }


    /**
     * Updates the current progress immediately.
     */
    protected updateImmediately() {
        this.updateProgress(1, 1);
        this.interpolator.update(
            this.currentProgress
        );
    }


    protected onRaf(): void {
        this.updateProgress(this.settingsData.lerp, this.settingsData.damp);
        // Use a rounded progress to pass to css var interpolate which
        // will cull updates that are repetitive.
        const roundedProgress =
            mathf.roundToPrecision(this.currentProgress, this.settingsData.precision);
        this.interpolator.update(
            roundedProgress
        );
    }


    protected onWindowResize() { }


    protected dispose(): void {
        this.rafEv.dispose();
        this.raf.dispose();
        this.domWatcher.dispose();
    }
}



/**
 *
 * A directive to run css var interpolations from yaml or json.
 *
 * This is different from css-parallax in that the progress value is NOT how
 * much an element is shown but rather, WHERE on the viewport it resides.
 *
 * Progress is calculates from the top of the screen (0) to the bottom
 * of the screen (1).
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
 *     elementBaseline: 0 (number) defaults to 0 Should we use the top (0), middle (0.5) or bottom of the element to determine where on the viewport it resides.
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
