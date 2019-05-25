
import { MouseTracker } from './mousetracker';

/**
 * A class that creates a parallax effect based on the mouse position.
 * @hidden
 */
export class Parallaxer {

    private animate_: boolean;
    private mousePosition_: any;
    private rotationSensitivity: any;
    private translateSensitivity: any;
    private transformValues: any;
    private pivotElement_: HTMLElement | undefined;
    private rootElement_: HTMLElement;
    private mouseTracker_: MouseTracker;

    /**
     * @param {HTMLElement} rootElement The root element to apply parallax effects to.
     * @param {Object} rotationSentivity x,y object with rotation sensitivity.
     * @param {Object} translateSentitivy x,y object with translate senstiivity.
     * @param {HTMLElement} pivotElement Optional element to make the pixot center.
     * @constructor
     * TODO(uxder) Clean this up.
     */
    constructor(rootElement: HTMLElement, rotationSensitivity: any,
        translateSensitity: any, pivotElement?: HTMLElement) {

        /**
         * Flag to allow animation.
         * @type {boolean}
         */
        this.animate_ = false;

        /**
         * The current mouse position data acquired from the mouse tracker.
         * @type {Object}
         */
        this.mousePosition_ = null;

        /**
         * The rotation sensitivity of the parallax effect.
         */
        this.rotationSensitivity = rotationSensitivity || {
            x: 0.2,
            y: 0.2
        };

        /**
         * The translate sensitivity of the parallax effect.
         */
        this.translateSensitivity = translateSensitity || {
            x: 1,
            y: 1
        };

        /**
         * The current transform values.
         */
        this.transformValues = {
            xDeg: 0,
            yDeg: 0,
            zDeg: 0,
            xTrans: 0,
            yTrans: 0
        };

        /**
         * The pivot element if defined.
         * @type {Element}
         */
        this.pivotElement_ = pivotElement;

        /**
         * The root element to manipulate.
         * @type {Element}
         */
        this.rootElement_ = rootElement;

        this.mouseTracker_ = new MouseTracker(
            this.pivotElement_ || document.body,
            (mousePosition: any) => {
                this.mousePosition_ = mousePosition;
            },
            false
        );
    }

    /**
     * Runs the animation.
     */
    run() {
        this.animate_ = true;
        this.rafLoop_();
    }

    /**
     * Stops the animation.
     */
    stop() {
        this.animate_ = false;
    }

    /**
     * Internal animation cycle.
     */
    rafLoop_() {
        if (!this.animate_) {
            return;
        }

        window.requestAnimationFrame(() => {
            this.rafLoop_();
        });

        this.render_();
    }

    /**
     * Internal render cycle.
     */
    render_() {
        if (!this.mousePosition_) {
            return;
        }
        const xDegree = (this.mousePosition_.percentageX) * this.rotationSensitivity.x;
        const yDegree = (this.mousePosition_.percentageY) * this.rotationSensitivity.y;

        const xTrans = -(this.mousePosition_.percentageX) * this.translateSensitivity.x;
        const yTrans = -(this.mousePosition_.percentageY) * this.translateSensitivity.y;

        // TODO(uxder): Add complex easing.
        this.transformValues.xDeg += (xDegree - this.transformValues.xDeg) * 0.03;
        this.transformValues.yDeg += (yDegree - this.transformValues.yDeg) * 0.03;
        this.transformValues.xTrans += (xTrans - this.transformValues.xTrans) * 0.03;
        this.transformValues.yTrans += (yTrans - this.transformValues.yTrans) * 0.03;

        const transformString =
            'rotateX(' + this.transformValues.yDeg + 'deg) rotateY(' +
            -this.transformValues.xDeg + 'deg) rotateZ(0deg)' +
            ' translate(' + -this.transformValues.xTrans + 'px, ' +
            this.transformValues.yTrans + 'px)';

        //   console.log(transformString, this.mousePosition_);
        this.rootElement_.style.perspectiveOrigin = '50% 50%';
        this.rootElement_.style.transform = transformString;
        this.rootElement_.style.transformOrigin = '50% 50%';
    }
}
