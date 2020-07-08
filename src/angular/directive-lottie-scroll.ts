
import * as lottie from 'lottie-web';
import { RafProgress } from '../raf/raf-progress';
import { DomWatcher } from '../dom/dom-watcher';
import { dom } from '../dom/dom';
import { mathf } from '../mathf/mathf';
import { func } from '../func/func';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { interpolateSettings } from '../interpolate/multi-interpolate';
import { CssVarInterpolate } from '../interpolate/css-var-interpolate';


export const LottieScrollEvents = {
    INIT: 'INIT',
    PROGRESS_UPDATE: 'LOTTIE_SCROLL_EVENT'
}

export interface LottieScrollInitPayload {
    controller: LottieController,
}

export interface LottieScrollEventPayload {
    controller: LottieController,
    progress: number,
    direction: number,
}


export interface LottieScrollSettings {
    // Whether to display progress information in the dev console.
    // Defaults to false.
    debug: boolean,

    // The lerp to apply to the scroll progress.
    // Defaults to 1.
    lerp: number

    // Top and bottom offsets for progress calculation.
    top: string,
    bottom: string,
}

export interface LottieObject {
    // Whether to display the "frame"  in the dev console.
    // Defaults to false.
    debugFrame: boolean,
    // The json path to the lottie json file.
    json_path: string | null,
    // If images are not embedded in the json file, the image path to the image directory.
    image_path: string | null,
    // The query selector to the lottie container.
    container_selector: string,
    // The renderer to use 'canvas', 'svg'
    renderer: string
    // The aspect ratio sizing settings to use for lottie. // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
    // Defaults to xMidYMid slice.
    preserveAspectRatio: string,

    // The starting frame.
    startFrame: number,
    // The end frame.
    endFrame: number,

    // Css var interpolations associated with this lottie scroll.
    interpolations: Array<interpolateSettings>,

    // The lottie instance added once it is created.
    lottieInstance: any,

    // Instance of css var interpolate associated.  This is added once
    // lottie is created.
    cssInterpolatorInstance: CssVarInterpolate

    // Whether the lottie container associated to this LottieObject is
    // currently on the screen.  This is determined based on whether the
    // container or it's ancestors has "display: none".  By adding
    // display: none you can cull paints.
    isOnScreen: boolean
}


export class LottieController {
    private element: HTMLElement;
    /**
     * The element to which the scroll progress is measured.  This currently defaults to the
     * directive root.
     */
    private scrollEl: HTMLElement;
    private rafProgress: RafProgress;
    private domWatcher: DomWatcher;
    private lottieObjects: Array<LottieObject> = [];
    private lottieScrollSettings: LottieScrollSettings;
    private currentProgress: number = 0;

    // The top and bottom offsets in pixel number values.
    private progressTopOffset: number;
    private progressBottomOffset: number;


    static get $inject() {
        return ['$element', '$scope', '$attrs'];
    }


    constructor($element: ng.IRootElementService, $scope: ng.IScope, $attrs: ng.IAttributes) {
        this.element = $element[0];
        this.scrollEl = this.element;

        this.domWatcher = new DomWatcher();

        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: this.onWindowScroll.bind(this),
            eventOptions: { passive: true }
        })

        this.domWatcher.add({
            element: window,
            on: 'resize',
            callback: this.onWindowResize.bind(this),
            eventOptions: { passive: true }
        })


        this.rafProgress = new RafProgress(this.onRafProgress.bind(this));
        this.rafProgress.setPrecision(5);

        const configData = JSON.parse(this.element.getAttribute('lottie-scroll'));

        const settings = configData.settings || {}
        this.lottieScrollSettings = {
            ...{
                debug: false,
                lerp: 1,
                top: '0px',
                bottom: '0px',
            },
            ...settings
        }

        if (configData.lotties) {
            configData.lotties.forEach((settings: LottieObject) => {
                const data = {
                    ...{
                        debugFrame: false,
                        json_path: null,
                        image_path: null,
                        container_selector: null,
                        renderer: 'canvas',
                        preserveAspectRatio: 'xMidYMid slice',
                        startFrame: 0,
                        // This will get updated once the lottie instance is loaded.
                        // Unless the user specifically set an endframe.
                        endFrame: 0
                    },
                    ...settings
                };

                this.lottieObjects.push(data);
            })
            this.createLottieInstances();
        }


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


    protected onWindowResize(): void {
        this.calculateProgressOffsets();

        // On each window resize, test if the root lottie element is visible.
        // If not, mark the lottieScroll to not render or paint.
        this.lottieObjects.map((lottieObject, i) => {
            const container = this.element.querySelector(lottieObject.container_selector);
            lottieObject.isOnScreen = !dom.isDisplayNoneWithAncestors(container);
            return lottieObject;
        });
    }



    protected calculateProgressOffsets() {
        // Convert the css unit into pixels for the top and bottom progress
        // offsets.
        this.progressTopOffset = func.setDefault(
            this.getPixelValue(this.lottieScrollSettings.top), 0
        )
        this.progressBottomOffset = func.setDefault(
            this.getPixelValue(this.lottieScrollSettings.bottom), 0
        )
    }




    /**
     * Creates lottie instances from the lottie scroll configs.
     */
    protected createLottieInstances(): void {
        this.lottieObjects.forEach((lottieObject, i) => {
            const settings = {
                container: this.element.querySelector(lottieObject.container_selector),
                loop: false,
                autoplay: false,
                renderer: lottieObject.renderer as any,
                rendererSettings: {
                    preserveAspectRatio: lottieObject.preserveAspectRatio
                },
                path: lottieObject.json_path
            }

            if(lottieObject.image_path) {
                settings['assetsPath'] = lottieObject.image_path;
            }


            const lottieInstance = lottie['loadAnimation'](settings)

            this.lottieObjects[i].lottieInstance = lottieInstance;

            // Also update the end frame if it hasn't been specified.
            lottieInstance.addEventListener('DOMLoaded', () => {
                if (this.lottieObjects[i].endFrame == 0) {
                    this.lottieObjects[i].endFrame = lottieInstance.totalFrames;
                }

                // If there are interpolations associated with this lottie scroll
                // then create it.
                if (this.lottieObjects[i].interpolations) {
                    // First run through the interpolations and convert the
                    // fromFrame and endFrame to progress values.
                    this.lottieObjects[i].interpolations.map((interpolation) => {
                        const startFrame = this.lottieObjects[i].startFrame;
                        const endFrame = this.lottieObjects[i].endFrame;
                        interpolation.progress.map((progress) => {
                            // TODO (uxder): Technically this a type violation.
                            if (progress['fromFrame']) {
                                progress.from = mathf.inverseLerp(startFrame, endFrame, progress['fromFrame']);
                            }
                            if (progress['toFrame']) {
                                progress.to = mathf.inverseLerp(startFrame, endFrame, progress['toFrame']);
                            }

                            return progress;
                        })


                        return interpolation;
                    })


                    // Create the css var interpolation.
                    this.lottieObjects[i].cssInterpolatorInstance = new CssVarInterpolate(
                        this.element,
                        {
                            interpolations: this.lottieObjects[i].interpolations,
                        }
                    );
                    this.lottieObjects[i].cssInterpolatorInstance.useBatchUpdate(true);


                    // Run window resize once.
                    this.onWindowResize();


                    // Add loaded class to mark it is ready.
                    this.element.classList.add('loaded');
                } else {
                    // Run window resize once.
                    this.onWindowResize();
                }

                const payload: LottieScrollInitPayload = {
                    controller: this,
                }
                dom.event(this.element, LottieScrollEvents.INIT, payload);

                // Update and render immediately after it loads.
                this.updateImmediately();
            }, { once: true });
        })
    }


    protected onWindowScroll(): void {
        this.rafProgress.easeTo(this.getPercent(), this.lottieScrollSettings.lerp);
    }


    protected onRafProgress(easedProgress: number, direction: number): void {
        // Cull unnecessary calls.
        if (this.currentProgress == easedProgress) {
            return;
        }

        if (this.lottieScrollSettings.debug) {
            console.log(this.currentProgress);
        }

        // Fire a dom event.
        const payload: LottieScrollEventPayload = {
            controller: this,
            progress: easedProgress,
            direction: direction
        }
        dom.event(this.element, LottieScrollEvents.PROGRESS_UPDATE, payload);


        this.currentProgress = easedProgress;

        this.lottieObjects.forEach((lottieObject) => {
            if (!lottieObject.isOnScreen) {
                if (lottieObject.debugFrame) {
                    console.log("lottie is not on screen");
                }
                return;
            }

            if (lottieObject.lottieInstance && lottieObject.lottieInstance.isLoaded) {
                let frame = mathf.lerp(
                    lottieObject.startFrame,
                    lottieObject.endFrame, easedProgress);

                if (lottieObject.debugFrame) {
                    console.log("Frame", frame, easedProgress, window.scrollY);
                }


                lottieObject.lottieInstance['goToAndStop'](frame, true);
            }
        })


        // Update css var interpolations.
        this.lottieObjects.forEach((lottieInstance) => {
            if (!lottieInstance.isOnScreen) {
                return;
            }

            lottieInstance.cssInterpolatorInstance &&
                lottieInstance.cssInterpolatorInstance.update(easedProgress);
        })

    }


    protected updateImmediately() {
        // Set the immediate progress at load.
        const percent = this.getPercent();
        this.rafProgress.setCurrentProgress(percent);
        this.lottieObjects.forEach((lottieInstance) => {
            if (!lottieInstance.isOnScreen) {
                return;
            }
            lottieInstance.cssInterpolatorInstance &&
                lottieInstance.cssInterpolatorInstance.update(percent);
        })
    }


    protected getPercent(): number {
        let percent = dom.getElementScrolledPercent(this.scrollEl,
            this.progressTopOffset, this.progressBottomOffset);
        return percent;
    }


    /**
     * Given a provided percent, returns the scrollY point.  Handy when you
     * have to manually update the scroll position to a given percent / progress.
     */
    public getScrollYAtPercent(percent: number): number {
        return dom.getScrollYAtPercent(
            this.scrollEl,
            this.progressTopOffset, this.progressBottomOffset,
            percent
        );
    }



    protected dispose(): void {
        this.lottieObjects.forEach((lottieInstance) => {
            lottieInstance.lottieInstance.destroy();
            lottieInstance.cssInterpolatorInstance = null;
        });
        this.domWatcher.dispose();
        this.rafProgress.dispose();
    }

}


/**
 * A directive to run lottie animations based on yaml or json.
 *
 * In yaml:
 * ```
 * partial: myPartial
 *
 * # Lotties is a list so that you can create multiple lottie instances (such as
 *   portriat versus landscape)
 * lottie_scrolls:
 *    settings:
 *        # Whether to output progress in the console.
 *        # Optional - boolean . Defaults to false.
 *        debug: false
 *
 *        # The lerp to apply
 *        # Optional - number.  A number between 0-1.  Defaults to 1.
 *        lerp: 0.18
 *
 *        # A css value to offset to where the progress begins.
 *        # Options - string.  Accepts %, px, vh
 *        top: '0px'
 *
 *        # A css value to offset to where the progress ends.
 *        # Options - string.  Accepts %, px, vh
 *        bottom: '0px'
 *
 *    lotties:
 *     -
 *
 *       # The query selector to select the container element of lottie
 *       # Required - string
 *       container_selector: '[lottie-desktop]'
 *
 *       # The path to lottie json.
 *       # Required - string
 *       json_path: xxx.json
 *
 *       # The image directory path.
 *       # Options - string
 *       image_path: /images/
 *
 *       # The renderer to use.  'canvas', 'svg'
 *       # Optional - string.  Defaults to canvas.
 *       renderer: canvas
 *
 *       # The aspect ratio settings
 *       # https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
 *       preserveAspectRatio: 'xMidYMin slice'
 *
 *       # The starting frame.
 *       # Optional - number.  Defaults to 0.
 *       startFrame: 0
 *
 *       # The ending frame.
 *       # Optional - number.  Defaults to the last frame.
 *       endFrame: 200
 *
 *       # Whether to display the current frame number in the dev console.
 *       # Useful for debugging.
 *       # Optional - boolean
 *       debugFrame: false
 *
 *       # Css interpolations synchronized with the lottie scroll.
 *       # Note that you can use fromFrame, toFrame and declare interpolations
 *       # based on your lottie frame.
 *       interpolations:
 *       - id: '--x'
 *         progress:
 *         - from: 0.5
 *           to: 1
 *           start: '0px'
 *           end: '20px'
 *       - id: '--opacity'
 *         progress:
 *         - fromFrame: 200
 *           toFrame: 300
 *           start: 0
 *           end: 1
 *         - fromFrame: 300
 *           toFrame: 500
 *           start: 1
 *           end: 0
 * ```
 *
 * In your app:
 *
 * ```ts
 *   import { lottieScrollDirective } from 'yano-js/lib/angular/directive-lottie-scroll';
 *
 *   const app = angular.module('myApp', []);
 *   app.directive('lottieScroll', lottieScrollDirective);
 * ```
 *
 * In the module, you want to use do the following.
 *
 * Note how we have can have two lottie instances.  By adding display: none, this
 * lottie directive will automatically cull frame updates.
 *
 * ```
 * .mymodule
 *    height: 300vh
 * .mymodule__lottie
 *    position: sticky
 *    height: 100vh
 *    width: 100%
 *    top: 0px
 * .mymodule__lottie--desktop
 *   +md-lt
 *     display: none
 * .mymodule__lottie--mobile
 *   +md
 *     display: none
 *
 *   <div class="mymodule" {% if partial.lottie_scrolls %} lottie-scroll="{{partial.lottie_scrolls|jsonify}}{% endif %">
 *       <div class="mymodule__lottie mymodule__lottie--desktop" lottie-desktop></div>
 *       <div class="mymodule__lottie mymodule__lottie--mobile" lottie-mobile></div>
 *   </div>
 * ```
 *
 *
 * # Loaded class
 *
 * A css class "loaded" gets appended to the directive element.
 * This can be used to hide the element during loading.
 *
 * .mymodule
 *   visibility: hidden
 * .mymodule.loaded
 *   visibility: visible
 *
 * Before Load:
 *   <div class="mymodule" lottie-scroll="{{partial.lottie_scrolls|jsonify}}{% endif %">..</div>
 *
 * After Load
 *   <div class="mymodule loaded" lottie-scroll="{{partial.lottie_scrolls|jsonify}}{% endif %">..</div>
 *
 * # Events
 *
 * You may have situations in which you want to extend or add additional more complicated
 * interaction.  There are a few ways to do this
 * 1) you can create your own controller
 * and setup lottie interpolations manually (so don't use this directive).
 * This is recommended if you have a lot of custom needed.
 * 2) You can extend this directive.
 * 3) Use events to listen to the progress update event.
 *
 *
 * Events are useful if you want to add some custom interaction based on the progress.
 *
 * Raf Progress events are fired on the root element of the directive.
 * Hooking into them with your own custom controller might look something
 * this:
 *
 *
 * ```
 * <div
 *   ng-controller="MyController as ctrl"
 *   lottie-scroll="{{partial.lottie_scrolls|jsonify}}">
 *       <div class="post-hero__lottie" lottie-container></div>
 * </div>
 *
 *
 *
 *   import { LottieController, LottieScrollEvents, LottieScrollEventPayload, LottieScrollInitPayload } from 'yano-js/lib/angular/directive-lottie-scroll';
 *
 *
 *   export default class MyController {
 *     static get $inject() {
 *         return ['$scope', '$element'];
 *     }
 *     private el: HTMLElement;
 *     private $scope: ng.IScope;
 *     constructor($scope: ng.IScope, $element: ng.IAngularStatic) {
 *       this.el = $element[0];
 *       this.el.addEventListener(LottieScrollEvents.INIT, (e:any)=> {
 *           const scrollEvent:LottieScrollInitPayload = e.detail;
 *           console.log(scrollEvent.controller); // The controller
 *       });
 *
 *       this.el.addEventListener(LottieScrollEvents.PROGRESS_UPDATE, (e:any)=> {
 *           const scrollEvent:LottieScrollEventPayload = e.detail;
 *           console.log(scrollEvent.progress); // current progress
 *           console.log(scrollEvent.direction); // current direction
 *       })
 *     }
 *   }
 * ```
 *
 *
 *
 * Additional Docs:
 *
 * Lottie supported Features:
 * https://github.com/airbnb/lottie/blob/master/supported-features.md
 *
 *
 *
 *
 */
export const lottieScrollDirective = function () {
    return {
        restrict: 'A',
        controller: LottieController
    }
}