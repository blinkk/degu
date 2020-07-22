
import * as lottie from 'lottie-web';
import { RafProgress } from '../raf/raf-progress';
import { DomWatcher } from '../dom/dom-watcher';
import { dom } from '../dom/dom';
import { mathf } from '../mathf/mathf';
import { func } from '../func/func';
import { cssUnit, CssUnitObject } from '../string/css-unit';
import { interpolateSettings } from '../interpolate/multi-interpolate';
import { CssVarInterpolate } from '../interpolate/css-var-interpolate';
import { RafTimer } from '../raf/raf-timer';
import { is } from '../is/is';
import { CubicBezier } from '../mathf/cubic-bezier';


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


export interface LottieAutoPlay {
    fromFrame: number,
    toFrame: number
    // Whether to trigger this on a down scroll
    down: boolean,
    // Whether to trigger this on a up scroll
    up: boolean,


    // If you want it to keep looping.
    loopStartFrame?: number,
    loopEndFrame?: number,
}


export interface LottieScrollSettings {
    // Whether to display progress information in the dev console.
    // Defaults to false.
    debug: boolean,

    // The lerp to apply to the scroll progress.
    // Defaults to 1.
    lerp: number,

    // Damp to apply.  Defaults to 1 (no damp)
    damp?: number,

    // Top and bottom offsets for progress calculation.
    top: string,
    bottom: string,
}

export interface LottieClassTrigger {
    class: string,
    fromFrame: number,
    toFrame: number
    from: number,
    to: number
}


export interface LottieScrollIntro {
    startFrame: number,
    duration: number,
    interpolations: Array<interpolateSettings>
}


//
// TODO (uxder): Break out lottie object as it's own class.
//
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

    // The starting frame for the scroll.
    startFrame: number,
    // The end frame.
    endFrame: number,

    fromProgress: number,
    toProgress: number,

    // The intro sequence.
    intro: LottieScrollIntro,
    // Whether the intro sequence has completed.
    introCompleted: boolean,

    classTriggers: Array<LottieClassTrigger>,
    activeTriggerClasses: Array<string>,

    // Css var interpolations associated with this lottie scroll.
    interpolations: Array<interpolateSettings>,

    // The lottie instance added once it is created.
    lottieInstance: any,

    lottieInDom: boolean,

    // Instance of css var interpolate associated.  This is added once
    // lottie is created.
    cssInterpolatorInstance: CssVarInterpolate

    // Whether the lottie container associated to this LottieObject is
    // currently on the screen.  This is determined based on whether the
    // container or it's ancestors has "display: none".  By adding
    // display: none you can cull paints.
    isOnScreen: boolean,

    autoplay: LottieAutoPlay,
    isAutoPlaying: boolean,

    loopListener: Function
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


        this.rafProgress = new RafProgress(this.progressUpdate.bind(this));
        this.rafProgress.setPrecision(5);


        // Adds a way to update lerp, damp via chrome dev tools.
        // This can be fired on the document OR the element.  Document
        // firing will update all instances.
        this.domWatcher.add({
            element: document as any,
            on: 'yano-lottie-scroll-update',
            callback: this.handleLottieScrollUpdateEvent.bind(this),
            eventOptions: { passive: true }
        })
        this.domWatcher.add({
            element: this.element,
            on: 'yano-lottie-scroll-update',
            callback: this.handleLottieScrollUpdateEvent.bind(this),
            eventOptions: { passive: true }
        })

        const configData = JSON.parse(this.element.getAttribute('lottie-scroll'));

        const settings = configData.settings || {}
        this.lottieScrollSettings = {
            ...{
                debug: false,
                lerp: 1,
                damp: 1,
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
                        intro: null,
                        introCompleted: false,
                        fromProgress: null,
                        toProgress: null,
                        classTriggers: null,
                        activeTriggerClasses: [],
                        autoplay: null,
                        // This will get updated once the lottie instance is loaded.
                        // Unless the user specifically set an endframe.
                        endFrame: 0,
                        lottieInDom: false,
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


        this.lottieObjects.forEach((lottieObject) => {
            if (lottieObject.lottieInDom) {
                lottieObject.lottieInstance.resize();
            }
        })


        // Lottie doesn't "redraw" itself on size.  Most likely
        // because it culls two consecutive calls to drawing the
        // same frame.
        // To get around this, on each window resize, what we
        // must do is first tell lottie to draw some other
        // frame.  Then redraw the current frame.
        const progress = this.currentProgress;
        this.progressUpdate(progress - 2, 0);
        this.progressUpdate(progress, 0);
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
                loop: true,
                autoplay: false,
                renderer: lottieObject.renderer as any,
                rendererSettings: {
                    // https://github.com/airbnb/lottie-web/issues/1860
                    // https://github.com/airbnb/lottie-web/wiki/Renderer-Settings
                    // For svg.
                    // progressiveLoad: true,

                    preserveAspectRatio: lottieObject.preserveAspectRatio
                },
                path: lottieObject.json_path
            }

            if (lottieObject.image_path) {
                settings['assetsPath'] = lottieObject.image_path;
            }


            const lottieInstance = lottie['loadAnimation'](settings)

            // Supposed lottie optimization.
            lottieInstance.setSubframe(false);

            this.lottieObjects[i].lottieInstance = lottieInstance;

            // Also update the end frame if it hasn't been specified.
            lottieInstance.addEventListener('DOMLoaded', () => {
                if (this.lottieObjects[i].endFrame == 0) {
                    this.lottieObjects[i].endFrame = lottieInstance.totalFrames;
                }

                if (this.lottieObjects[i].classTriggers) {
                    const startFrame = this.lottieObjects[i].startFrame;
                    const endFrame = this.lottieObjects[i].endFrame;
                    this.lottieObjects[i].classTriggers.map((trigger) => {
                        // TODO (uxder): Technically this a type violation.
                        if (is.defined(trigger['fromFrame'])) {
                            trigger.from = mathf.inverseLerp(startFrame, endFrame, trigger['fromFrame'], true);
                        }
                        if (is.defined(trigger['toFrame'])) {
                            trigger.to = mathf.inverseLerp(startFrame, endFrame, trigger['toFrame'], true);
                        }

                    });
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
                            if (is.defined(progress['fromFrame'])) {
                                progress.from = mathf.inverseLerp(startFrame, endFrame, progress['fromFrame'], true);
                            }
                            if (is.defined(progress['toFrame'])) {
                                progress.to = mathf.inverseLerp(startFrame, endFrame, progress['toFrame'], true);
                            }

                            if (is.defined(progress['cubic_ease'])) {
                                const ease = progress['cubic_ease'].split(',');
                                progress.easingFunction = CubicBezier.makeEasingFunction(
                                    ease[0], ease[1], ease[2], ease[3]
                                );
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

                    this.lottieObjects[i].lottieInDom = true;


                    // Run window resize once.
                    this.onWindowResize();


                    // If we have an intro, then play out the intro.
                    if (this.lottieObjects[i].intro) {
                        this.playIntro(this.lottieObjects[i]);
                    }


                    // Add loaded class to mark it is ready.
                    // Put to bottom of event queue for intro sequence to startup.
                    window.setTimeout(() => {
                        this.element.classList.add('lottie-scroll-loaded');
                    })
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
        this.rafProgress.dampTo(this.getPercent(), this.lottieScrollSettings.lerp, this.lottieScrollSettings.damp);
    }


    protected playIntro(lottieObject: LottieObject) {
        const startProgress = this.getPercent();

        // If we are starting with a progress greater than 0, then we shouldn't
        // playout the intro.
        if (startProgress > 0) {
            lottieObject.introCompleted = true;
            return;
        }

        // Create a raf timer that will tick from 0-1 for a set duration.
        const rafTimer = new RafTimer((progress: number) => {

            const currentScrollProgress = this.getPercent();

            let endFrame = mathf.lerp(
                lottieObject.startFrame,
                lottieObject.endFrame, currentScrollProgress);

            // So as the intro plays, the user can scroll so we need to remap
            // the end frame as needed.

            // If child progress is defined.
            if (!is.null(lottieObject.fromProgress) && !is.null(lottieObject.toProgress)) {
                progress = mathf.childProgress(progress, lottieObject.fromProgress, lottieObject.toProgress);
            }

            const frame = mathf.lerp(lottieObject.intro.startFrame, endFrame, progress)
            lottieObject.lottieInstance['goToAndStop'](frame, true);


            // This would end up being negative progress.
            const adjustedProgress = mathf.inverseLerp(
                lottieObject.startFrame, lottieObject.endFrame, frame, true);

            // Also update the regular css interpolations.
            lottieObject.cssInterpolatorInstance &&
                lottieObject.cssInterpolatorInstance.update(adjustedProgress);

        })
        rafTimer.setDuration(lottieObject.intro.duration || 300);
        rafTimer.onComplete(() => {
            lottieObject.introCompleted = true;
            rafTimer.dispose();
        });
        rafTimer.play();
    }


    /**
     * Checks if autoplay is set on the lottieObject in which case,
     * we check the frame to start at and see we have reached that point.
     *
     * @param lottieObject
     * @param currentFrame
     */
    protected drawOrLoop(lottieObject: LottieObject, currentFrame: number) {
        const direction = this.rafProgress.getScrollDirection();

        // Case when autoplay is defined and the current scroll is in range
        // of the autoplay trigger.
        if (
            lottieObject.autoplay &&
            !lottieObject.isAutoPlaying &&
            (
                (lottieObject.autoplay.down && direction == 1) ||
                (lottieObject.autoplay.up && direction == -1)
            ) &&
            (mathf.isBetween(this.currentProgress, lottieObject.fromProgress,
                lottieObject.toProgress, true))) {

            lottieObject.isAutoPlaying = true;

            // If we want to loop
            if (lottieObject.autoplay.loopStartFrame) {
                lottieObject.lottieInstance.playSegments([
                    [
                    lottieObject.autoplay['fromFrame'], lottieObject.autoplay['toFrame']],
                    [lottieObject.autoplay['loopStartFrame'], lottieObject.autoplay['loopEndFrame']]
                ], true);
            } else {
                lottieObject.lottieInstance.loop = false;
                lottieObject.lottieInstance['goToAndStop'](lottieObject.autoplay['fromFrame'], true);
                lottieObject.lottieInstance.playSegments([
                    [lottieObject.autoplay['fromFrame'], lottieObject.autoplay['toFrame']]
                ], true);
            }
        } else {
            if (lottieObject.autoplay) {
                if (!mathf.isBetween(this.currentProgress, lottieObject.fromProgress,
                    lottieObject.toProgress, true)) {
                 lottieObject.isAutoPlaying = false;
                 // Force lottie to draw an empty frame by drawing an non-existent frame.
                 lottieObject.lottieInstance['goToAndStop'](100000, true);
                }
            } else {
                // For all other cases, just go to the frame and draw it.
                lottieObject.isAutoPlaying = false;
                lottieObject.lottieInstance['goToAndStop'](currentFrame, true);
            }
        }
    }



    protected progressUpdate(easedProgress: number, direction: number): void {

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
            let progress = easedProgress;

            // If we have an intro and haven't completed the playback.
            const hasIntroAndNotCompleted = lottieObject.intro && !lottieObject.introCompleted;
            if (hasIntroAndNotCompleted) {
                return;
            }

            if (!lottieObject.isOnScreen) {
                if (lottieObject.debugFrame) {
                    console.log("lottie is not on screen");
                }
                return;
            }

            if (lottieObject.lottieInstance && lottieObject.lottieInstance.isLoaded) {

                // If child progress is defined.
                if (!is.null(lottieObject.fromProgress) && !is.null(lottieObject.toProgress)) {
                    progress = mathf.childProgress(progress, lottieObject.fromProgress, lottieObject.toProgress);
                }

                let frame = mathf.lerp(
                    lottieObject.startFrame,
                    lottieObject.endFrame, progress);

                if (lottieObject.debugFrame) {
                    console.log("Frame", frame, easedProgress, window.scrollY);
                }


                // lottieObject.lottieInstance['goToAndStop'](frame, true);
                this.drawOrLoop(lottieObject, frame);
            }
        })



        // Update css var interpolations and class triggers
        this.lottieObjects.forEach((lottieObject) => {
            // If we have an intro and haven't completed the playback.
            const hasIntroAndNotCompleted = lottieObject.intro && !lottieObject.introCompleted;
            if (hasIntroAndNotCompleted) {
                return;
            }

            if (!lottieObject.isOnScreen) {
                return;
            }

            lottieObject.cssInterpolatorInstance &&
                lottieObject.cssInterpolatorInstance.update(easedProgress);
        })


        this.updateClassTriggers(easedProgress);
    }


    protected updateClassTriggers(progress: number) {
        this.lottieObjects.forEach((lottieObject) => {
            if (!lottieObject.isOnScreen) {
                return;
            }

            let classesToBeAdded: Array<string> = [];
            let classesToBeRemoved: Array<string> = [];
            if (lottieObject.classTriggers) {
                lottieObject.classTriggers.forEach((trigger: LottieClassTrigger) => {

                    if (mathf.isBetween(progress, +trigger.from,
                        +trigger.to, true)) {
                        classesToBeAdded.push(trigger.class);
                    } else {
                        classesToBeRemoved.push(trigger.class);
                    }
                })
            }

            classesToBeAdded.forEach((className) => {
                if (!lottieObject.activeTriggerClasses.includes(className)) {
                    this.element.classList.add(className);
                }
            });
            classesToBeRemoved.forEach((className) => {
                if (lottieObject.activeTriggerClasses.includes(className)) {
                    this.element.classList.remove(className);
                }
            });
            lottieObject.activeTriggerClasses = classesToBeAdded;

        });

    }


    protected updateImmediately() {
        // Set the immediate progress at load.
        const percent = this.getPercent();
        this.rafProgress.setCurrentProgress(percent);
        this.lottieObjects.forEach((lottieObject) => {
            const hasIntroAndNotCompleted = lottieObject.intro && !lottieObject.introCompleted;
            if (!lottieObject.isOnScreen || hasIntroAndNotCompleted) {
                return;
            }
            lottieObject.cssInterpolatorInstance &&
                lottieObject.cssInterpolatorInstance.update(percent);
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


    /**
     * Gets all lottie objects.
     */
    public getLottieObjects(): Array<LottieObject> {
        return this.lottieObjects;
    }


    /**
     * Updates the lottie settings via document or events on the root element.
     *
     *   var event = new CustomEvent('yano-lottie-scroll-update', { detail: { lerp: 0.2, damp: 0.3} });
     *   document.dispatchEvent(event)
     *
     *  // Scope to lottie instance
     *   element.dispatchEvent(event)
     *
     * @param e
     */
    private handleLottieScrollUpdateEvent(e:any):void  {
        const payload = e.detail;
        if(payload.lerp) {
            this.lottieScrollSettings.lerp = +payload.lerp;
        }
        if(payload.damp) {
            this.lottieScrollSettings.damp = +payload.damp;
        }
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
 *       # This is the starting frame from which your "scroll" experience begins.
 *       # If you have an intro, it should not include the intro frames.
 *       # Example:
 *       # lottie is from 0-100 frames.
 *       # intro is from 0-10.
 *       # startFrame should be set to 10.
 *       # Optional - number.  Defaults to 0.
 *       startFrame: 50
 *
 *       # The ending frame.
 *       # Optional - number.  Defaults to the last frame.
 *       endFrame: 200
 *
 *       # Optional:
 *       # Normally the lottie animation is tied between the 0-1 progress
 *       # your whole module.  You can define it so that this lottie
 *       # instance will run under a child progress instead.
 *       fromProgress: 0.5
 *       toProgress: 1
 *
 *
 *       # Autoplay is used for lottie animations that does not scrub with the scroll
 *       # but instead play at a specific point.  Imagine this more like
 *       # an inview effect where when the scroll is between the defined
 *       # fromProgress and toProgress points, this lottie will start playing
 *       # automatically.  If you define a loopStartFrom and loopEndFrame
 *       # it will loop in that range.
 *       autoplay:
 *          fromFrame: 0
 *          toFrame: 150
 *          # Whether to trigger this when scrolling down
 *          down: true
 *          # Whether to trigger this when scrolling up
 *          up: true
 *          # Optional start and end to loop segments.
 *          loopStartFrame: 150
 *          loopEndFrame: 300
 *
 *
 *       # Class triggers
 *       # Trigger css class on your element at specific points.
 *       classTriggers:
 *       - class: 'inview'
 *         fromFrame: 300
 *         toFrame: 500
 *       - class: 'inview-2'
 *         fromFrame: 400
 *         toFrame: 600
 *
 *       # Intro
 *       # The intro will play an intro IF the current progress value is at 0.
 *       #
 *       # The intro.startFrame is where the intro should being.
 *       # Why is there not endFrame?  It's because the end frame is your startFrame
 *       # (where the scroll starts) above.
 *       intro:
 *          startFrame: 0
 *          # The duration in ms.
 *          duration: 1000
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
 *           cubic_ease: 0.27,0.06,0.3,1
 *         - fromFrame: 300
 *           toFrame: 500
 *           start: 1
 *           end: 0
 * ```
 *
 * In your app:
 *
 *
 * Make sure lottie-web is installed.
 * ```
 * npm install lottie-web@5.7.0 --save
 * ```
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
 * # Fouc control -  Loaded class
 *
 * A css class "lottie-scroll-loaded" gets appended to the directive element.
 * This can be used to hide the element during loading.
 *
 * .mymodule
 *   visibility: hidden
 * .mymodule.lottie-scroll-loaded
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