import { func } from '../func/func';

enum AccessibleOutlineInputTypes {
    MOUSE = 'mouse',
    KEYBOARD = 'keyboard'
}

/**
 * A class that helps with enabling outline on a page ONLY when the user
 * is interacting with the keyboard.
 *
 * It is common to do outline: none to disable button or inputs for
 * aesthetic reasons but this not good for accessibility.  To address the
 * issue, this class will apply outline: none only in the event,
 * the user is interacting with the keyboard.
 *
 *
 * Common usage is to instantiate this class with the body element.
 * This will add a data-current-input to the body element will indicates whether
 * the user is engaged in mouse or keyboard mode.
 *
 * ```ts
 *
 * new AccessibleOutline(document.body);
 * ```
 *
 * ```sass
 * [data-current-input='mouse'] *:focus
 *    outline: none
 * ```
 *
 *
 */
export class AccessibleOutline {

    public element: HTMLElement;
    private listenerDisposers: Array<Function>;

    constructor(element: HTMLElement) {
        this.element = element;

        this.listenerDisposers = [];

        // Set it so that we only run the setCurrentInput when param properties
        // change from previous to avoid layout thrashing.
        this.setCurrentInput = func.runOnceOnChange(
            this.setCurrentInput.bind(this));

        // Mouse related events.
        this.addEvents('mousemove', this.setMouse.bind(this));
        this.addEvents('mousedown', this.setMouse.bind(this));
        this.addEvents('mouseup', this.setMouse.bind(this));
        this.addEvents('touchmove', this.setMouse.bind(this));
        this.addEvents('touchstart', this.setMouse.bind(this));
        this.addEvents('touchend', this.setMouse.bind(this));

        // Keyboard
        this.addEvents('keyup', this.setKeyboard.bind(this));
        this.addEvents('keydown', this.setKeyboard.bind(this));
    }

    setKeyboard() {
        this.setCurrentInput(AccessibleOutlineInputTypes.KEYBOARD);
    }

    setMouse() {
        this.setCurrentInput(AccessibleOutlineInputTypes.MOUSE);
    }

    addEvents(name: string, callback: EventListener) {
        document.addEventListener(name, callback);
        this.listenerDisposers.push(() => {
            document.removeEventListener(name, callback);
        })
    }

    /**
     * Sets the current input type by updating the data attribute on the
     * root element.
     * @param type
     */
    setCurrentInput(type: AccessibleOutlineInputTypes) {
        this.element.setAttribute('data-current-input', type);
    }

    dispose() {
        this.listenerDisposers.forEach((disposer) => {
            disposer();
        })
    }
}