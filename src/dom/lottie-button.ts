
import * as lottie from 'lottie-web';
import { DomWatcher } from '../dom/dom-watcher';
import { elementVisibility, ElementVisibilityObject } from './element-visibility';
import { Raf } from '../raf/raf';
import { dom } from '../dom/dom';

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
    mouseenter?: LottieButtonRange,
    mouseleave?: LottieButtonRange,
    click?: LottieButtonRange,
    outview?: LottieButtonRange,


    /**
     * Normally, the lottie button automatically setsup listeners but setting this to true,
     * will skip this process allowing you to control lottie button to your needs by changing
     * mousestate.
     */
    noListeners?: boolean,
}

export interface LottieButtonMouseState {
    hovering: boolean,
    clicked: boolean
}


export const LottieButtonState = {
    INVIEW: 'inview',
    MOUSEENTER: 'mouseenter',
    MOUSELEAVE: 'mouseleave',
    CLICK: 'click',
    OUTVIEW: 'outview',
}


export interface LottieButtonPlayQueueItem {
    state: string,
    callback: Function
}


/**
 *
 * Creates an interactable lottie button.
 *
 *
 * Note that I don't consider this to be stable.
 * I don't recommend directly using this class and instead for now,
 * copy it and use it as a base in your project.
 *
 * ```
 *
 * <div id="mylottiebutton">
 *      <div id="lottie"></div>
 *
 * </div>
 * ```
 *
 *  Settings for lottie-button.  Specify the frame ranges from mouseenter, mouseleave and click.
 *
 * The lottie file should have these states usually in this order:
 * inview
 * mouseenter
 * mouseleave
 * click
 *
 * For the transitions to work, certain frames should be the same:
 *
 * inview endFrame == mouseenter startFrame
 * mouseenter endFrame == mouseleave startFrame
 * mouseenter endFrame == click startFrame
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
 *    mouseenter: {
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
 * const lb = new LottieButton(config);
 *
 * ```
 *
 *
 * # Play Queuing
 * This option ensures that the previous animation state is resolved
 * prior to the next playing but it can cause delays in animation.
 *
 * ```
 * lb.enablePlayQueue(true);
 * ```
 *
 *
 * # Using angular controllers to pass states.
 * Sometimes, you want to control the state of the button not based on whether the
 * user click or moused over.  You control specific states first disabling
 * the mouseover, click etc listeners and opting to take control over this.
 *
 *
 * To do this, set the noListeners option to true.
 * ```
 * const config = {
 *    rootElement: document.getElementById("mylottiebutton"),
 *    lottieElement: document.getElementById("lottie"),
 *    lottieJson: '/source/my-lottie.json',
 *    inview: {
 *       start: 0,
 *       end: 96,
 *    },
 *    ...
 *    noListeners: true
 * }
 * const lb = new LottieButton(config);
 * ```
 *
 * Now call specific methods on lb to set the state.
 *
 * ```
 * lb.inview(); == inview
 * lb.outview(); == outview
 * lb.mousedown(); == click
 * lb.mouseup(); == unclick
 * lb.mouseenter(); == hover
 * lb.mouseleave(); == unhover
 *
 * ```
 *
 * Usually, it is expected that you go from hover -> click.
 * But certain state like click -> unhover (mouseleave) won't work.
 * However, you can force it by tricking lb to think it is in a hover
 * state and then run mouseleave.
 *
 *
 * ```
 *   this.lottieButton.setMouseState({
 *      clicked: false,
 *      hovering: true
 *   })
 *   this.lottieButton.mouseleave();
 * ``
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
    private isInview: boolean = false;
    private raf: Raf;
    private isPlaying: boolean = false;
    private hasStartedLoading: boolean = false;

    private playQueue: Array<LottieButtonPlayQueueItem>;
    /**
     * The play queue allows you to keep a one time memory and ensure that the previous state
     * is resolved before the current one is played.  This allows you to create a seamless
     * transition but with mouseenter states, it can cause delays.
     */
    private usePlayQueue: boolean = false;;
    private currentState: string;

    constructor(config: LottieButtonConfig) {
        this.config = config;

        this.playQueue = [];
        this.watcher = new DomWatcher();
        this.raf = new Raf();
        this.isPlaying = false;
        this.isInview = false;

        this.mouseState = {
            hovering: false,
            clicked: false,
        }


        dom.runAfterWindowLoad(()=> {
          this.hasStartedLoading = true;
          this.createLottie();
        })


        if (!this.config.noListeners) {
            this.watcher.add({
                element: this.config.rootElement,
                on: 'mousedown',
                callback: this.handleClick.bind(this)
            });
            this.watcher.add({
                element: this.config.rootElement,
                on: 'mouseup',
                callback: this.handleMouseUp.bind(this)
            });

            this.watcher.add({
                element: this.config.rootElement,
                on: 'mouseleave',
                callback: this.handleMouseLeave.bind(this)
            });

            this.watcher.add({
                element: this.config.rootElement,
                on: 'mouseenter',
                callback: this.handleMouseEnter.bind(this)
            });
        }
    }



    /**
     * Enables play queue system which ensures that the previous state is resolved
     * prior to the next state playing.  This can cause delays in animations.
     * @param value
     */
    public enablePlayQueue(value: boolean) {
        this.usePlayQueue = value;
    }




    private createLottie() {
        if (!this.config.lottieElement) {
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
            callback: () => {
                if (!this.config.noListeners) {
                    this.ev = elementVisibility.inview(this.config.rootElement, {}, (element: any, changes: any) => {
                        if (changes.isIntersecting) {
                            this.inview();
                        } else {
                            this.outview();
                        }
                    });
                }
            }
        });

        this.watcher.add({
            element: this.lottieInstance as HTMLElement,
            on: 'enterFrame',
            callback: (a: any, b: any) => {
                this.currentFrame = this.lottieInstance.currentFrame;
                if (this.currentFrame >= this.stopFrame) {
                    this.isPlaying = false;

                    if (this.currentState == 'outview') {
                        this.lottieInstance['stop']();
                    } else {
                        this.lottieInstance['pause']();
                    }

                    // Once we reach the end, play whatever is on the play queue.
                    if (this.playQueue.length >= 1) {
                        this.playQueue[this.playQueue.length - 1].callback();
                        this.playQueue = [];
                    }
                }

            }
        });

    }

    private play(state: string, start: number, end: number) {
        if(!this.hasStartedLoading) {
            return;
        }


        const prevState = this.currentState;
        this.currentState = state;
        this.isPlaying = true;
        this.stopFrame = end;
        this.lottieInstance['goToAndPlay'](start, true);
        this.updateCssClass();
    }


    private schedule(state: string, start: number, end: number) {
        if (this.usePlayQueue) {
            // If there is nothing in the queue, just play this.
            if (!this.isPlaying) {
                this.play(state, start, end);
            } else {
                // If there is something in the queue, wait.
                this.playQueue.push({
                    'state': state,
                    'callback': () => {
                        this.play(state, start, end);
                    }
                })
            }
        } else {
            this.play(state, start, end);
        }
    }


    public inview(): void {
        if (this.config.inview) {
            this.isInview = true;
            this.playQueue = [];
            //   this.lottieInstance['playSegments']([this.config.click.start, this.config.click.end], true);
            this.schedule(LottieButtonState.INVIEW, this.config.inview.start, this.config.inview.end);
        }
        this.updateCssClass();
    }


    public outview(): void {
        if (this.config.outview && this.isInview) {
            this.schedule(LottieButtonState.OUTVIEW, this.config.outview.start, this.config.outview.end);
        } else {
            this.isInview = false;
            this.isPlaying = false;
            this.playQueue = [];
            this.updateCssClass();
        }
    }



    private handleClick(): void {
        this.mouseState.clicked = true;
        if (this.config.click) {
            //   this.lottieInstance['playSegments']([this.config.click.start, this.config.click.end], true);
            this.schedule(LottieButtonState.CLICK, this.config.click.start, this.config.click.end);
        }

    }


    private handleMouseUp(): void {
        this.mouseState.clicked = false;
    }

    public mousedown(): void {
        this.handleClick();
    }

    public mouseup(): void {
        this.handleMouseUp();
    }


    private handleMouseLeave(): void {
        if(!this.mouseState.hovering) {
            return;
        }
        this.mouseState.hovering = false;
        if (this.config.mouseleave) {
            //   this.lottieInstance['playSegments']([this.config.mouseleave.start, this.config.mouseleave.end], true);
            this.schedule(LottieButtonState.MOUSELEAVE, this.config.mouseleave.start, this.config.mouseleave.end);
        }
    }

    public mouseleave(): void {
        this.handleMouseLeave();
    }


    public mouseenter(): void {
        this.handleMouseEnter();
    }

    private handleMouseEnter(): void {
        if (this.mouseState.hovering) {
            return;
        }
        this.mouseState.hovering = true;

        if (this.config.mouseenter) {
            //   this.lottieInstance['playSegments']([this.config.mouseover.start, this.config.mouseover.end], true);
            this.schedule(LottieButtonState.MOUSEENTER, this.config.mouseenter.start, this.config.mouseenter.end);
        }
    }


    private updateCssClass() {
        this.raf.write(() => {
            this.config.rootElement.classList.remove(LottieButtonCssClasses.CLICK);
            this.config.rootElement.classList.remove(LottieButtonCssClasses.HOVER);

            if (this.currentState == 'click') {
                this.config.rootElement.classList.add(LottieButtonCssClasses.CLICK);
            }

            if (this.currentState == 'mouseenter') {
                this.config.rootElement.classList.add(LottieButtonCssClasses.HOVER);
            }

            if (this.isInview) {
                this.config.rootElement.classList.add(LottieButtonCssClasses.INVIEW);
                this.config.rootElement.classList.remove(LottieButtonCssClasses.OUTVIEW);
            } else {
                this.config.rootElement.classList.add(LottieButtonCssClasses.OUTVIEW);
                this.config.rootElement.classList.remove(LottieButtonCssClasses.INVIEW);
            }

        })
    }


    public getMouseState(): LottieButtonMouseState {
        return this.mouseState;
    }

    public setMouseState(state:LottieButtonMouseState): LottieButtonMouseState {
        return this.mouseState = state;
    }


    public dispose(): void {
        this.watcher && this.watcher.dispose();
        this.ev && this.ev.dispose();
        this.raf && this.raf.dispose();
    }

}
