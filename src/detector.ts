/**
 * A class that helps with device feature dectection.
 */
export class detector {

    static deviceOrientationSupport(): boolean {
        return !!window.DeviceOrientationEvent;
    }

    static touchSupport() {
        return (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
    }

    /**
     * Since many desktops have device orientation support, we assume
     * if touch and device orientation are both enabled, then this device
     * is not mouse driven and allow device orientation.
     * In short, this is a way for testing if this is a mobile device
     * that suppports touch.
     */
    static allowDeviceOrientation() {
        return this.deviceOrientationSupport() && this.touchSupport();
    }

}
