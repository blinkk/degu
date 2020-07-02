
import * as lottie from 'lottie-web';
import { RafProgress } from '../raf/raf-progress';
import { DomWatcher } from '../dom/dom-watcher';
import { dom } from '../dom/dom';
import { mathf } from '../mathf/mathf';
import { func } from '../func/func';
import { cssUnit, CssUnitObject } from '../string/css-unit';


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
    // The aspect ratio sizing settings to use for lottie.
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
    // Defaults to xMidYMid slice.
    preserveAspectRatio: string,

    // The starting frame.
    startFrame: number,
    // The end frame.
    endFrame: number,

    // The lottie instance added once it is created.
    lottieInstance: any,
}


export default class LottieController {
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

        // Run window resize once.
        this.onWindowResize();

        // Set the immediate progress at load.
        this.rafProgress.setCurrentProgress(this.getPercent());


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
            const lottieInstance = lottie['loadAnimation']({
                container: this.element.querySelector(lottieObject.container_selector),
                loop: false,
                autoplay: false,
                renderer: lottieObject.renderer as any,
                rendererSettings: {
                    preserveAspectRatio: lottieObject.preserveAspectRatio
                },
                path: lottieObject.json_path,
                assetsPath: lottieObject.image_path,
            })

            this.lottieObjects[i].lottieInstance = lottieInstance;

            // Also update the end frame if it hasn't been specified.
            lottieInstance.addEventListener('DOMLoaded', () => {
                if (this.lottieObjects[i].endFrame == 0) {
                    this.lottieObjects[i].endFrame = lottieInstance.totalFrames;
                }
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

        this.currentProgress = easedProgress;

        this.lottieObjects.forEach((lottieObject) => {
            if (lottieObject.lottieInstance && lottieObject.lottieInstance.isLoaded) {
                let frame = mathf.lerp(
                    lottieObject.startFrame,
                    lottieObject.endFrame, easedProgress);

                if (lottieObject.debugFrame) {
                    console.log("Frame", frame);
                }


                lottieObject.lottieInstance['goToAndStop'](frame, true);
            }
        })
    }


    getPercent(): number {
        let percent = dom.getElementScrolledPercent(this.scrollEl,
            this.progressTopOffset, this.progressBottomOffset);
        return percent;
    }


    protected dispose(): void {
        this.lottieObjects.forEach((lottieInstance) => {
            lottieInstance.lottieInstance.destroy();
        })
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
 * ```
 * .mymodule
 *    height: 300vh
 * .mymodule__lottie
 *    position: sticky
 *    height: 300vh
 *    top: 0px
 *
 *   <div class="mymodule" {% if partial.lottie_scrolls %} lottie-scroll="{{partial.lottie_scrolls|jsonify}}{% endif %">
 *       <div class="mymodule__lottie" lottie-desktop></div>
 *   </div>
 * ```
 */
export const lottieScrollDirective = function () {
    return {
        restrict: 'A',
        controller: LottieController
    }
}