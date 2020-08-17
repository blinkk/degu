
import * as lottie from 'lottie-web';
import { DomWatcher } from '../dom/dom-watcher';
import { elementVisibility, ElementVisibilityObject } from './element-visibility';
import { Raf } from '../raf/raf';

export interface LottieButtonRange {
    start: number,
    end: number
}


export const LottieButtonCssClasses = {
    INVIEW: 'in',
    OUTVIEW: 'out',
    HOVER: 'hover',
    CLICK: 'click',
}

export interface LottieButtonConfig {
    /**
     * The root element.  This is the root element in which this class
     * attaches click, mouseover etc listeners.
     */
    rootElement: HTMLElement,

    /**
     * The root wrapping element for lottie.  This can be the same as rootElement.
     */
    lottieElement: HTMLElement,


    /**
     * Optional settings for the lottie aspect ratio settings.
     *  Defaults to 'xMidYMid slice',
     */
    preserveAspectRatio?: string,

    /**
     * The path to the lottie json.
     */
    lottieJson: string,
    inview?: LottieButtonRange,
    mouseover?: LottieButtonRange,
    mouseleave?: LottieButtonRange,
    click?: LottieButtonRange,
}

export interface LottieButtonMouseState {
    hovering: boolean,
    clicked: boolean
}


export const LottieButtonState = {
    INVIEW: 'inview',
    MOUSEOVER: 'mouseover',
    MOUSELEAVE: 'mouseleave',
    CLICK: 'click',
}


/**
 *
 * Creates an interactable lottie button.
 *
 * ```
 *
 * <div id="mylottiebutton">
 *      <div id="lottie"></div>
 *
 * </div>
 * ```
 *
 *  Settings for lottie-button.  Specify the frame ranges from mouseover, mouseleave and click.
 *
 * The lottie file should be structured in the following order:
 * inview
 * mouseover
 * mouseleave
 * click
 *
 * For the transitions to work, certain frames should be the same:
 *
 * inview endFrame == mouseover startFrame
 * mouseover endFrame == mouseleave startFrame
 * mouseover endFrame == click startFrame
 *
 *
 * ``
 * const config = {
 *    rootElement: document.getElementById("mylottiebutton"),
 *    lottieElement: document.getElementById("lottie"),
 *    lottieJson: '/source/my-lottie.json',
 *    inview: {
 *       start: 0,
 *       end: 96,
 *    },
 *    mouseover: {
 *       start: 72,
 *       end: 96,
 *    },
 *    mouseleave: {
 *       start: 156,
 *       end: 180,
 *   },
 *    click: {
 *       start: 196,
 *       end: 216,
 *   },
 * }
 *
 *
 * ```
 *
 *
 *
 */
export class LottieButton {
    private config: LottieButtonConfig;
    private watcher: DomWatcher;
    private lottieInstance: any;
    private mouseState: LottieButtonMouseState;
    private lottieLoaded: boolean;
    private currentFrame: number;
    private stopFrame: number;
    private ev: ElementVisibilityObject;
    private raf: Raf;
    private isPlaying: boolean = false;

    private currentState: string;

    constructor(config: LottieButtonConfig) {
        this.config = config;

        // console.log("lottie button.", this.config);
        this.watcher = new DomWatcher();
        this.raf = new Raf();
        this.isPlaying = false;

        this.mouseState = {
            hovering: false,
            clicked: false,
        }


        this.createLottie();


        this.watcher.add({
            element: this.config.rootElement,
            on: 'click',
            callback:  this.handleClick.bind(this)
        });
        this.watcher.add({
            element: this.config.rootElement,
            on: 'mouseup',
            callback:  this.handleMouseUp.bind(this)
        });

        this.watcher.add({
            element: this.config.rootElement,
            on: 'mouseleave',
            callback:  this.handleMouseLeave.bind(this)
        });

        this.watcher.add({
            element: this.config.rootElement,
            on: 'mouseover',
            callback:  this.handleMouseOver.bind(this)
        });
    }


    private createLottie() {
        if(!this.config.lottieElement) {
            this.config.lottieElement = this.config.rootElement;
        }
        const settings = {
            container: this.config.lottieElement,
            loop: false,
            autoplay: false,
            rendererSettings: {
                // https://github.com/airbnb/lottie-web/issues/1860
                // https://github.com/airbnb/lottie-web/wiki/Renderer-Settings
                // For svg.
                progressiveLoad: true,
                preserveAspectRatio: this.config.preserveAspectRatio || 'xMidYMid slice',
            },
            path: this.config.lottieJson
        }


        this.lottieInstance = lottie['loadAnimation'](settings);

        this.watcher.add({
            element: this.lottieInstance as HTMLElement,
            on: 'DOMLoaded',
            callback:  () => {
                // console.log("loaded");
                // console.log(this.lottieInstance);
                this.ev = elementVisibility.inview(this.config.rootElement, {}, (element: any, changes: any)=> {
                    if(changes.isIntersecting) {
                        this.inview();
                    } else {
                        this.outview();
                    }
                });
            }
        });

        this.watcher.add({
            element: this.lottieInstance as HTMLElement,
            on: 'enterFrame',
            callback:  (a:any,b:any) => {
                this.currentFrame = this.lottieInstance.currentFrame;
                console.log("play", this.currentFrame >= this.stopFrame, this.currentState, this.stopFrame);
                if(this.currentFrame >= this.stopFrame) {
                    this.isPlaying = false;
                    this.lottieInstance['pause']();
                }

            }
        });

    }

    private play(state: string, start:number, end:number) {
        const prevState = this.currentState;
        this.currentState = state;
        this.isPlaying = true;
        this.stopFrame = end;
        this.lottieInstance['goToAndPlay'](start, true);
    }


    private schedule(state: string, start:number, end:number) {
        this.play(state, start, end);
    }


    private inview():void {
        // console.log(this.config);
        if(this.config.inview) {
        //   this.lottieInstance['playSegments']([this.config.click.start, this.config.click.end], true);
          this.schedule(LottieButtonState.INVIEW, this.config.inview.start, this.config.inview.end);
        }
        this.updateCssClass();
    }


    private outview():void {
        this.lottieInstance['stop']();
        this.updateCssClass();
    }



    private handleClick():void {
        this.mouseState.clicked = true;
        if(this.config.click) {
        //   this.lottieInstance['playSegments']([this.config.click.start, this.config.click.end], true);
          this.schedule(LottieButtonState.CLICK, this.config.click.start, this.config.click.end);
        }

        this.updateCssClass();
    }


    private handleMouseUp():void {
        this.mouseState.clicked = false;
        this.updateCssClass();
    }



    private handleMouseLeave():void {
        this.mouseState.hovering = false;
        if(this.config.mouseleave) {
        //   this.lottieInstance['playSegments']([this.config.mouseleave.start, this.config.mouseleave.end], true);
          this.schedule(LottieButtonState.MOUSELEAVE, this.config.mouseleave.start, this.config.mouseleave.end);
        }
        this.updateCssClass();
    }


    private handleMouseOver():void {
        if(this.mouseState.hovering) {
            return;
        }
        this.mouseState.hovering = true;

        // console.log('mouseover');
        if(this.config.mouseover) {
        //   this.lottieInstance['playSegments']([this.config.mouseover.start, this.config.mouseover.end], true);
          this.schedule(LottieButtonState.MOUSEOVER, this.config.mouseover.start, this.config.mouseover.end);
        }

        this.updateCssClass();
    }


    private updateCssClass() {
        this.raf.write(()=> {
            if(this.mouseState.clicked) {
                this.config.rootElement.classList.add(LottieButtonCssClasses.CLICK);
            } else {
                this.config.rootElement.classList.remove(LottieButtonCssClasses.CLICK);
            }

            if(this.mouseState.hovering) {
                this.config.rootElement.classList.add(LottieButtonCssClasses.HOVER);
            } else {
                this.config.rootElement.classList.remove(LottieButtonCssClasses.HOVER);
            }

            if(this.ev.state().inview) {
                this.config.rootElement.classList.add(LottieButtonCssClasses.INVIEW);
                this.config.rootElement.classList.remove(LottieButtonCssClasses.OUTVIEW);
            } else {
                this.config.rootElement.classList.add(LottieButtonCssClasses.OUTVIEW);
                this.config.rootElement.classList.remove(LottieButtonCssClasses.INVIEW);
            }

        })
    }



    private dispose():void {
        this.watcher && this.watcher.dispose();
        this.ev && this.ev.dispose();
        this.raf && this.raf.dispose();
    }

}
