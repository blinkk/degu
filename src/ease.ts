/**
 * Basis eases functions.
 */
export class EASE {

    /**
    * Eases the value in with a Sine curve.
    * @param {number} t Input between 0 and 1.
    * @return {number} Output between 0 and 1.
    */
    static easeInSine(t: number) {
        return (t == 0 || t == 1) ? t : 1 - Math.cos(t * (Math.PI / 2));
    };

    /**
     * Eases the value out with a Sine curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     */
    static easeOutSine(t: number) {
        return (t == 0 || t == 1) ? t : Math.sin(t * (Math.PI / 2));
    };

    /**
     * Eases the value in and out with a Sine curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     */
    static easeInOutSine(t: number) {
        return (t == 0 || t == 1) ? t : -0.5 * (Math.cos(Math.PI * t) - 1);
    };

    /**
     * Eases the value in with a quadratic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     */
    static easeInQuad(t: number) {
        return (t == 0 || t == 1) ? t : t * t;
    };

    /**
     * Eases the value out with a quadratic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     */
    static easeOutQuad(t: number) {
        return (t == 0 || t == 1) ? t : t * (2 - t);
    };

    /**
     * Eases the value in with a cubic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInCubic(t: number) {
        return (t == 0 || t == 1) ? t : t * t * t;
    };

    /**
     * Eases the value in and out with a quadratic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     */
    static easeInOutQuad(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return 2 * t * t;
        } else {
            return -1 + (4 - 2 * t) * t;
        }
    };

    /**
     * Eases the value out with a cubic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutCubic(t: number) {
        return (t == 0 || t == 1) ? t : (--t) * t * t + 1;
    };

    /**
     * Eases the value in and out with a cubic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     */
    static easeInOutCubic(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return 4 * t * t * t;
        } else {
            return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
    };



    /**
     * Eases the value in with a quartic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInQuart(t: number) {
        return (t == 0 || t == 1) ? t : t * t * t * t;
    };


    /**
     * Eases the value out with a quartic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutQuart(t: number) {
        return (t == 0 || t == 1) ? t : 1 - (--t) * t * t * t;
    };


    /**
     * Eases the value in and out with a quartic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutQuart(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return 8 * t * t * t * t;
        } else {
            return 1 - 8 * (--t) * t * t * t;
        }
    };


    /**
     * Eases the value in with a quintic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInQuint(t: number) {
        return (t == 0 || t == 1) ? t : t * t * t * t * t;
    };

    /**
     * Eases the value out with a quintic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutQuint(t: number) {
        return (t == 0 || t == 1) ? t : 1 + (--t) * t * t * t * t;
    };

    /**
     * Eases the value in and out with a quintic curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutQuint(t: number) {
        return (t == 0 || t == 1) ? t : t < .5 ? 16 * t * t * t * t * t : 1 + 16 *
            (--t) * t * t * t * t;
    };

    /**
     * Eases the value in with an exponential curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInExpo(t: number) {
        return (t == 0 || t == 1) ? t : Math.pow(2, 10 * (t - 1));
    };

    /**
     * Eases the value out with an exponential curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutExpo(t: number) {
        return (t == 0 || t == 1) ? t : (1 - Math.pow(2, -10 * t));
    };

    /**
     * Eases the value in and out with an exponential curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutExpo(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return .5 * Math.pow(2, 10 * (t * 2 - 1));
        } else {
            return .5 * (2 - Math.pow(2, -10 * (t * 2 - 1)));
        }
    };

    /**
     * Eases the value in with a circular curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInCirc(t: number) {
        return (t == 0 || t == 1) ? t : 1 - Math.sqrt(1 - (t * t));
    };


    /**
     * Eases the value out with a circular curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutCirc(t: number) {
        return (t == 0 || t == 1) ? t : Math.sqrt(1 - (t - 1) * (t - 1));
    };


    /**
     * Eases the value in and out with a circular curve.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutCirc(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return -.5 * (Math.sqrt(1 - t * t * 4) - 1);
        } else {
            return .5 * (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1);
        }
    };


    /**
     * Eases the value in after bounding backwards at the beginning.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInBack(t: number) {
        return (t == 0 || t == 1) ? t : t * t * (2.70158 * t - 1.70158);
    };


    /**
     * Eases the value out after bounding past the end point and back.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutBack(t: number) {
        return (t == 0 || t == 1) ?
            t :
            (t - 1) * (t - 1) * (2.70158 * (t - 1) + 1.70158) + 1;
    };


    /**
     * Eases the value in and out with an initial and ending movement beyond the
     * full range.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutBack(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return .5 * (t * 2) * (t * 2) * (3.5949095 * (t * 2) - 2.5949095);
        } else {
            return .5 * ((t * 2 - 2) * (t * 2 - 2) *
                (3.5949095 * (t * 2 - 2) + 2.5949095) + 2);
        }
    };


    /**
     * Eases the value in with an elastic springy motion.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInElastic(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else {
            return -1 * (
                Math.pow(2, 10 * (t - 1)) *
                Math.sin((t - 1.075) * (2 * Math.PI) / .3)
            );
        }
    };


    /**
     * Eases the value out with an elastic springy motion.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutElastic(t: number) {
        return (t == 0 || t == 1) ? t : Math.pow(2, -10 * t) *
            Math.sin((t - .075) * (2 * Math.PI) / .3) + 1;
    };


    /**
     * Eases the value in and out with an elastic springy motion.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutElastic(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return -.5 * (Math.pow(2, 10 * ((t * 2) - 1)) *
                Math.sin((t * 2 - 1.1125) * 2 * Math.PI / .45));
        } else {
            return .5 * Math.pow(2, -10 * (t * 2 - 1)) *
                Math.sin((t * 2 - 1.1125) * 2 * Math.PI / .45) + 1;
        }
    };


    /**
     * Eases the value in with a simple physics bounce.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInBounce(t: number) {
        return (t == 0 || t == 1) ? t : 1 - this.easeOutBounce(1 - t);
    };


    /**
     * Eases the value out with a simple physics bounce.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeOutBounce(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t - 1.5 / 2.75) * (t - 1.5 / 2.75) + .75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t - 2.25 / 2.75) * (t - 2.25 / 2.75) + .9375;
        } else {
            return 7.5625 * (t - 2.625 / 2.75) * (t - 2.625 / 2.75) + .984375;
        }
    };


    /**
     * Eases the value in and out with starting and ending bounces.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static easeInOutBounce(t: number) {
        if (t == 0 || t == 1) {
            return t;
        } else if (t < .5) {
            return this.easeInBounce(t * 2) * .5;
        } else {
            return this.easeOutBounce(t * 2 - 1) * .5 + .5;
        }
    };


    /**
     * Returns the value without any easing. This is only useful if a script is
     * expecting an easing method, but one isn't needed in that instance.
     * @param {number} t Input between 0 and 1.
     * @return {number} Output between 0 and 1.
     *
     */
    static linear(t: number) {
        return t;
    };

}
