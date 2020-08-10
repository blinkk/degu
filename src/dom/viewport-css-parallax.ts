
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { func } from '../func/func';
import { interpolateSettings } from '../interpolate/multi-interpolate';
import { DomWatcher } from '../dom/dom-watcher';
import { CssVarInterpolate } from '../interpolate/css-var-interpolate';
import { Raf } from '../raf/raf';
import { dom } from '../dom/dom';
import { mathf } from '../mathf/mathf';
import { stringf } from '../string/stringf';
import { is } from '../is/is';

export interface ViewportCssParallaxSettings {
    debug: boolean,
    // http://yano-js.surge.sh/classes/mathf.mathf-1.html#damp
    lerp: number,
    damp: number,
    // Whether to force clamp the progress to 0-1 range.  Defaults to true.
    clamp?: boolean,

    // The precision rounding on the lerp.  Used to cull / avoid layout thrashes.
    precision?: number,

    // The element baseline is the location in which we should use to
    // check the current element position.  Since we want to check
    // where in a viewport an element is, we need to know what point to use
    // in the element.  Should we use the top (0), middle (0.5) or bottom of the
    // element.
    elementBaseline?: number,

    // Options to basically a setting where by, it shifts the
    // elementBaseline as the scroll progresses.
    // The element top is used at the bottom of the screen and element
    // bottom is used for the top of the screen.
    // Using this option, overrides the settings of elementBaseline.
    elementBaselineFromTopToBottom?: boolean,

    // The rafEvOptions so that you can add rootMargin etc to the base raf.
    rafEvOptions?: Object
}

export interface ViewportCssParallaxConfig {
    settings: ViewportCssParallaxSettings,
}



/**
 * A class that creat a viewport css parallax.  This is the base controller for
 * viewport-css-parallax so check documentation there.
 * ```
 *
 * // Create the instance and set the root element
 * const parallaxer = new ViewportCssParallaxer(element);
 *
 *
 * // Add your settings.
 * const settings = {
 *    debug: false,
 *    lerp: 0.18,
 *    damp: 0.18,
 *    elmenentBaseline: 0
 * }
 *
 * parallaxer.init(settings,
 *   [
 *     {
 *       id: '--x',
 *       progress: [
 *          {from: 0, to: 1, start: '0px', end: '0px'}
 *      ]
 *     }
 *   ]
 * )
 *
 *
 * // Later Dispose.
 * parallaxer.dispose();
 * ```
 *
 */
export class ViewportCssParallax{
    /**
     * The root element to observe the current viewport position.
     */
    private rootElement: HTMLElement;

    /**
     * The element to write out the css variables to.  Defaults to the rootElement
     */
    private css_write_element: HTMLElement;
    private domWatcher: DomWatcher;
    private rafEv: ElementVisibilityObject;
    private raf: Raf;
    private id: string;
    private interpolator: CssVarInterpolate;

    /**
     * The css parallax settings.
     */
    private parallaxData: ViewportCssParallaxConfig;
    private settingsData: ViewportCssParallaxSettings;
    private interpolationsData: Array<interpolateSettings>;


    private currentProgress: number = 0;
    public initialized: boolean = false;



    constructor(element: HTMLElement, css_write_element?: HTMLElement) {
        this.rootElement = element;
        this.css_write_element = css_write_element ? css_write_element: this.rootElement;

        this.id = stringf.uuid();

        this.raf = new Raf(this.onRaf.bind(this));
        this.parallaxData = JSON.parse(this.rootElement.getAttribute('viewport-css-parallax'));
        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: () => this.onWindowResize(),
        });
    }


    public init(settings:ViewportCssParallaxSettings, interpolations?: Array<interpolateSettings>) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.updateSettings(settings);


        this.interpolator = new CssVarInterpolate(
            this.rootElement,
            {
                interpolations: interpolations || [],
            }
        );
        this.interpolator.useBatchUpdate(true);
        this.interpolator.useSubPixelRendering(false);
        // Use no write mode as we will use interpolator to just calculate values.
        this.interpolator.useNoWrite(true);

        // On load, we need to initially, bring the animation to
        // start position.
        this.updateImmediately();

        this.rootElement.classList.add('viewport-css-parallax-ready');

        // Start and stop raf when the element comes into view.
        this.rafEv = elementVisibility.inview(this.rootElement, this.settingsData.rafEvOptions,
            (element: any, changes: any) => {
                if (changes.isIntersecting) {
                    this.raf.start();
                } else {
                    this.raf.stop();
                    this.updateImmediately();
                }
            });
    }



    public updateInterpolations(interpolations: Array<interpolateSettings>) {
        if(!this.initialized) {
            throw new Error("You must initialize viewport-css-parallax first before calling updateInterpolations");
            return;
        }

        this.interpolator.setInterpolations({ interpolations: interpolations});
    }


    public updateSettings(settings?: ViewportCssParallaxSettings) {

        // If we haven't set the setting data yet, apply defaults.
        if(!this.settingsData) {
            this.settingsData = {
                ...{
                    debug: false,
                    clamp: true,
                    lerp: 1,
                    damp: 1,
                    // Default to top of element.
                    elementBaseline: 0,
                    elementBaselineFromTopToBottom: false,
                    precision: 3,
                    rafEvOptions: {
                        rootMargin: '300px 0px 300px 0px'
                    }
                },
                ...settings || {}
            };
        } else {
            // If we have already set once.
            this.settingsData = {
                ...this.settingsData,
                ...settings || {}
            };
        }
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
            base = this.rootElement.offsetHeight;
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
        let elementBaseline =
            this.rootElement.getBoundingClientRect().top +
            (this.settingsData.elementBaseline * this.rootElement.offsetHeight);

        let percent = mathf.inverseLerp(0, window.innerHeight,
            elementBaseline
        )


        // From top to bottom is basically a setting where by, it shifts the
        // elementBaseline as the scroll progresses.
        // The element top is used at the bottom of the screen and element
        // bottom is used for the top of the screen.
        if(
            this.settingsData.elementBaselineFromTopToBottom
        ) {
            let elementBaselineTop = this.rootElement.getBoundingClientRect().top;
            percent = mathf.inverseLerp(
                -this.rootElement.offsetHeight, window.innerHeight + this.rootElement.offsetHeight,
                elementBaselineTop
            )
        }

        // Invert it so that 0 is considered bottom.
        percent = 1 - percent;

        if(lerp == 1 && damp == 1) {
            this.currentProgress = percent;
        } else {
            this.currentProgress =
                mathf.damp(
                    this.currentProgress,
                    percent,
                    lerp, damp
                );
        }


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

        this.raf.read(()=> {
          this.updateProgress(this.settingsData.lerp, this.settingsData.damp);
        })


        this.raf.write(()=> {
            // Use a rounded progress to pass to css var interpolate which
            // will cull updates that are repetitive.
            const roundedProgress =
                mathf.roundToPrecision(this.currentProgress, this.settingsData.precision);
            this.interpolator.update(
                roundedProgress
            );


            // Write values.
            const values = this.interpolator.getValues();
            dom.setCssVariables(this.css_write_element, values);
        });
    }


    protected onWindowResize() { }


    public dispose(): void {
        this.rafEv.dispose();
        this.raf.dispose();
        this.domWatcher.dispose();
    }
}

