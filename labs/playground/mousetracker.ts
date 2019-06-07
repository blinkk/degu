import { mathf } from '../mathf/mathf';
import { detector } from './detector';

/**
 * Class that helps with mouse tracking.
 * @hidden
 */
export class MouseTracker {
    /**
     * The root element to calculate the center position of the effect.
     */
    private rootElement_: Element;

    /**
     * The basic dimensions of the root element.
     * @type {Object}
     */
    private dimensions_: any;

    /**
     * The callback for when there is mouse movement.
     */
    private moveCallBack_: Function;

    /**
     * The current mouse position data.
     */
    private mousePosition_: Object;

    /**
     * @constructor
     */
    constructor(rootElement: Element, moveCallBack: Function, disableMobile: boolean) {
        this.rootElement_ = rootElement;
        this.dimensions_ = null;
        this.moveCallBack_ = moveCallBack;
        this.mousePosition_ = {};

        this.calculateRootElementDimensions_();

        window.addEventListener('resize', () => {
            this.calculateRootElementDimensions_();
        });

        if (!disableMobile && detector.allowDeviceOrientation()) {
            window.addEventListener('deviceorientation', (e) => {
                this.onDeviceOrientation_(e);
            });
        }

        document.body.addEventListener('mousemove', (e) => {
            this.onMouseMove_(e);
        }, false);
    }

    /**
     * Calculates the base dimensions of the rootElement.
     */
    calculateRootElementDimensions_() {
        const docRect = document.body.getBoundingClientRect();
        const rect = this.rootElement_.getBoundingClientRect();

        // Calculate the center point.
        const xCenter = rect.left + rect.width / 2;
        const yCenter = rect.top + rect.height / 2;

        this.dimensions_ = {
            width: rect.width,
            height: rect.height,
            halfWidth: rect.width / 2,
            halfHeight: rect.height / 2,
            top: rect.top,
            left: rect.left,
            xCenter,
            yCenter,
            docWidth: docRect.width,
            docHeight: docRect.height
        };
    }

    /**
     * Handles the mouseRootElement move.
     * @type {MouseEvent}
     */
    onMouseMove_(e: any) {
        const x = e.pageX || e.clientX;
        const y = e.pageY || e.clientY;

        this.mousePosition_ = {
            x,
            y,
            deltaX: x - this.dimensions_.xCenter,
            deltaY: y - this.dimensions_.yCenter,
            percentageX: (x - this.dimensions_.xCenter) /
                (this.dimensions_.docWidth) * 100,
            percentageY: (y - this.dimensions_.yCenter) /
                (this.dimensions_.docHeight) * 100
        };
        this.moveCallBack_(this.mousePosition_);
    }

    /**
     * Handles the device orientation.
     * @type {MouseEvent}
     */
    onDeviceOrientation_(event: any) {
        const x = mathf.clamp(-50, 50, event.gamma);
        const y = mathf.clamp(-50, 50, event.beta);

        this.mousePosition_ = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            percentageX: x,
            percentageY: y
        };
        this.moveCallBack_(this.mousePosition_);
    }
}
