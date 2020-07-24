import { DomWatcher } from './dom-watcher';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { elementVisibility, ElementVisibilityObject } from './element-visibility';
import { dom } from './dom';
import { mathf } from '../mathf/mathf';
import { Raf } from '../raf/raf';
import { func } from '../func/func';
import { CssVarInterpolate } from '../interpolate/css-var-interpolate';
import { is } from '../is/is';
import { interpolateSettings } from '../interpolate/multi-interpolate';


export interface CssParallaxSettings {
    // debug: false (boolean, optional) True outputs progress in the dev console.
    debug?: boolean,
    //  top: '0px' (string) A css number to offset where the progress begins.  Accepts %, px, vh.
    top: string,
    //  bottom: '0px' (string) A css number to offset the progress ends.  Accepts %, px, vh.
    bottom: string,
    //  height: '100px' (string) Optional.  An absolute height to use to calculate the percent.  Accepts %, px, vh.  In most cases you won't need this.
    height?: string,
    // http://yano-js.surge.sh/classes/mathf.mathf-1.html#damp
    //  lerp: 0.18 Optional lerp.  Defaults to 1 assuming no asymptotic averaging.
    lerp?: number,
    //  damp: 0.18 Optional damp.  Defaults to 1 assuming no damping.
    damp?: number,
    // Whether to force clamp the progress to 0-1 range.  Defaults to true.
    clamp?: boolean,

    // The precision rounding on the lerp.  Used to cull / avoid layout thrashes.
    //  precision: (number) Defaults to 3.  Lower precision means less dom updates but less accuracy.
    precision?: number,

    // The rafEvOptions so that you can add rootMargin etc to the base raf.
    //  rafEvOptions:
    //   rootMargin: '0px 0px 0px 0px'
    rafEvOptions?: Object
}

/**
 * A class that creates a css var parallaxer.  This is the base controller for
 * directive-css-parallax.  See documentation there for more on usage.
 *
 * ```
 *
 * // Create the instance and set the root element
 * const parallaxer = new CssParallaxer(element);
 *
 *
 * // Add your settings.
 * const settings = {
 *    debug: false,
 *    top: '0px'
 *    bottom: '10px'
 * }
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
 */
export class CssParallaxer {
    private element: HTMLElement;
    private rafEv: ElementVisibilityObject;
    private domWatcher: DomWatcher;
    private interpolator: CssVarInterpolate;
    private raf: Raf;
    private initialized: boolean = false;
    private settingsData: CssParallaxSettings;
    private currentProgress: number = 0;
    /**
     * The top offset for progress
     */
    private topOffset: number;
    /**
     * The bottom offset for progress
     */
    private bottomOffset: number;

    /**
     * The height value if specified.
     */
    private height: number;


    constructor(element: HTMLElement) {
        this.element = element;
        this.raf = new Raf(this.onRaf.bind(this));
        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: func.debounce(() => {
                this.onWindowResize();
            }, 300)
        });
    }


    /**
     * Initializes module.
     * @param settings
     */
    public init(settings?: CssParallaxSettings, interpolations?: Array<interpolateSettings>) {
        if(this.initialized) {
            return;
        }
        this.initialized = true;

        this.settingsData = {
            ...{
                debug: false,
                clamp: true,
                top: '0px',
                bottom: '0px',
                height: null,
                lerp: 1,
                damp: 1,
                precision: 3,
                rafEvOptions: {
                    rootMargin: '300px 0px 300px 0px'
                }
            },
            ...settings || {}
        };

        this.calculateProgressOffsets();

        // Create interpolator.
        this.interpolator = new CssVarInterpolate(
            this.element, { interpolations: interpolations || [] }
        );
        this.interpolator.useBatchUpdate(true);

        // On load, we need to initially, bring the animation to
        // start position.
        this.updateImmediately();

        this.rafEv = elementVisibility.inview(this.element, this.settingsData.rafEvOptions,
            (element: any, changes: any) => {
                if (changes.isIntersecting) {
                    this.raf.start();
                } else {
                    this.raf.stop();
                    this.updateImmediately();
                }
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
        this.currentProgress =
            mathf.damp(
                this.currentProgress,
                dom.getElementScrolledPercent(this.element, this.topOffset, this.bottomOffset, true),
                lerp, damp
            );


        if (this.settingsData.clamp) {
            this.currentProgress = mathf.clamp01(this.currentProgress);
        }

        if (this.settingsData.debug) {
            console.log(this.currentProgress, this.topOffset, this.bottomOffset);
        }

        return this.currentProgress;
    }


    protected updateImmediately() {
        this.updateProgress(1, 1);
        this.interpolator.update(
            this.currentProgress
        );
    }


    protected calculateProgressOffsets() {
        this.topOffset = func.setDefault(
            this.getPixelValue(this.settingsData.top), 0
        )

        this.bottomOffset = func.setDefault(
            this.getPixelValue(this.settingsData.bottom), 0
        )
        this.height = is.string(this.settingsData.height) ? this.getPixelValue(this.settingsData.height) : null;

        // If height is specified, we basically want to "shorten" the element
        // by the delta amount.
        // Example: el.offsetHeight = 500px, height: 100px.
        //        so bottomOffset should be el.offsetHeight - height = 400px
        requestAnimationFrame(()=> {
            if (this.height) {
                this.bottomOffset = -(this.element.offsetHeight - this.height);
            }
        })
    }

    protected onWindowResize() {
        this.calculateProgressOffsets();
        this.updateImmediately();
    }


    protected onRaf() {
        this.updateProgress(this.settingsData.lerp, this.settingsData.damp);
        // Use a rounded progress to pass to css var interpolate which
        // will cull updates that are repetitive.
        const roundedProgress =
            mathf.roundToPrecision(this.currentProgress, this.settingsData.precision);
        this.interpolator.update(
            roundedProgress
        );
    }


    public dispose() {
        this.raf && this.raf.stop();
        this.domWatcher.dispose();
        this.rafEv.dispose();
    }
}
